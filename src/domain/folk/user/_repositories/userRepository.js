const _ = require('lodash')
const util = require('util')
const pool = require('config').database.pool
const Repository = require('../../../../library/repository')

const AUTH_FIELDS = [
  ['email', 'au.email']
]

const ACCOUNT_FIELDS = [
  ['uid', 'a.id AS uid'],
  ['region', 'a.region'],
  ['alternateEmail', 'a.alternate_email'],
  ['countryCode', 'a.country_code'],
  ['phone', 'a.phone'],
  ['device', 'a.device']
]

const USER_FIELDS = [
  ['seq', 'u.id AS seq'],
  ['beSearched', 'u.be_searched'],
  ['givenName', 'u.given_name'],
  ['familyName', 'u.family_name'],
  ['gender', 'u.gender'],
  ['birth', 'u.birth'],
  ['lang', 'u.lang'],
  ['publicInfo', 'u.public_info']
]

// there's not 'u.be_searched', just 'be_searched' (no prefix: 'u.')
const USER_UPDATE_FIELDS = [
  ['beSearched', 'be_searched'],
  ['givenName', 'given_name'],
  ['familyName', 'family_name'],
  ['gender', 'gender'],
  ['birth', 'birth'],
  ['lang', 'lang'],
  ['publicInfo', 'public_info']
]

const VALID_FIELD_MAP = new Map(AUTH_FIELDS.concat(ACCOUNT_FIELDS).concat(USER_FIELDS))

function parseSelectFields (selectedFields) {
  if (selectedFields === null) {
    return Array.from(VALID_FIELD_MAP.values()).join()
  }

  return selectedFields
    .reduce((accumulate, f) => {
      if (VALID_FIELD_MAP.has(f)) {
        accumulate.push(VALID_FIELD_MAP.get(f))
      }
      return accumulate
    }, [])
    .join()
}

const USER_UPDATE_FIELD_MAP = new Map(USER_UPDATE_FIELDS)

function genUserUpdateFields (obj) {
  const fields = []
  for (const field of USER_UPDATE_FIELD_MAP.keys()) {
    if (obj[field] !== undefined) {
      let targetValue
      switch (typeof obj[field]) {
        case 'string':
          targetValue = `'${obj[field].replace("'", "''")}'`
          break
        case 'object':
          targetValue = obj[field] === null ? null : `'${JSON.stringify(obj[field])}'`
          break
        default:
          targetValue = obj[field]
      }
      fields.push(`${USER_UPDATE_FIELD_MAP.get(field)} = ${targetValue}`)
    }
  }

  return fields.join()
}

const USER_FIELD_SET = new Set(new Map(USER_FIELDS).keys())
const AUTH_FIELD_SET = new Set(new Map(AUTH_FIELDS).keys())

/**
 * @param {string[]} selectedFields
 */
function genJoinedTables (selectedFields) {
  let str = ''
  for (let i = selectedFields.length - 1; i >= 0; i--) {
    if (USER_FIELD_SET.has(selectedFields[i])) {
      str = str.concat('JOIN "Users" AS u ON a.id = u.user_id ')
      break
    }
  }

  for (let i = selectedFields.length - 1; i >= 0; i--) {
    if (AUTH_FIELD_SET.has(selectedFields[i])) {
      str = str.concat('JOIN "Auths" AS au ON a.id = au.user_id ')
      break
    }
  }

  return str
}

util.inherits(UserRepository, Repository)

function UserRepository (pool) {
  this.pool = pool
  this.name = arguments.callee.name
}

/**
 * @param {string} email
 * @param {string} password
 * @param {string[]} selectedFields tables: "Accounts", "Auths", "Users"
 */
UserRepository.prototype.getAuthorizedUser = async function (email, password, selectedFields = []) {
  let idx = 1
  selectedFields.push('email')
  selectedFields = parseSelectFields(selectedFields)

  return this.query(
    `
    SELECT 
      ${selectedFields}
    FROM "Accounts" AS a
    JOIN "Users" AS u ON a.id = u.user_id
    JOIN "Auths" AS au ON a.id = au.user_id
    WHERE
      au.email = $${idx++}::varchar AND
      au.pw_hash = $${idx++}::varchar;
    `,
    [
      email,
      password
    ],
    0)
}

/**
 * @param {{ uid: string, region: string }} account
 * @param {string[]|null} selectedFields tables: "Accounts", "Auths", "Users"
 */
UserRepository.prototype.getUser = async function (account, selectedFields = null) {
  let idx = 1
  const joinTables = selectedFields === null ? '' : genJoinedTables(selectedFields)
  selectedFields = parseSelectFields(selectedFields)

  return this.query(
    `
    SELECT 
      ${selectedFields}
    FROM "Accounts" AS a
    ${joinTables}
    WHERE
      a.id = $${idx++}::uuid AND
      a.region = $${idx++}::varchar;
    `,
    [
      account.uid,
      account.region
    ],
    0)
}

/**
 * 需要結合 Account 中的 region
 * @param {{ uid: string, region: string }} account
 * @param {{ uid: string, region: string }} targetAccount
 * @param {string[]|null} selectedFields tables: "Accounts", "Auths", "Users"
 */
UserRepository.prototype.getPairUsers = async function (account, targetAccount, selectedFields = null) {
  let idx = 1
  const joinTables = selectedFields === null ? '' : genJoinedTables(selectedFields)
  selectedFields = parseSelectFields(selectedFields)

  return this.query(
    `
    SELECT 
      ${selectedFields}
    FROM "Accounts" AS a
    ${joinTables}
    WHERE
      (a.id = $${idx++}::uuid AND a.region = $${idx++}::varchar) OR
      (a.id = $${idx++}::uuid AND a.region = $${idx++}::varchar);
    `,
    [
      account.uid,
      account.region,
      targetAccount.uid,
      targetAccount.region
    ])
}

/**
 * @param {{ uid: string, region: string }} account
 * @param {{
 *    beSearched: boolean|null,
 *    givenName: string|null,
 *    familyName: string|null,
 *    gender: string|null,
 *    birth: Date|null,
 *    lang: string|null,
 *    publicInfo: Object|null
 * }} newUserInfo
 */
UserRepository.prototype.updateUser = async function (account, newUserInfo) {
  let idx = 1
  const updatedFields = genUserUpdateFields(newUserInfo)
  const selectedFields = parseSelectFields(_.keys(newUserInfo))

  return this.query(
    `
    UPDATE "Users" AS u
    SET 
      ${updatedFields}
    FROM "Accounts" AS a
    WHERE
      a.id = u.user_id AND
      u.user_id = $${idx++}::uuid AND
      a.region = $${idx++}::varchar
    RETURNING ${selectedFields}, a.id AS uid, a.region;
    `,
    [
      account.uid,
      account.region
    ],
    0)
}

module.exports = {
  userRepository: new UserRepository(pool),
  UserRepository
}
