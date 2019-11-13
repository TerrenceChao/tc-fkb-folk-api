const util = require('util')
const pool = require('config').database.pool
const Repository = require('../../../../library/repository')

const ACCOUNT_FIELDS = [
  ['uid', 'a.id AS uid'],
  ['region', 'a.region'],
  ['email', 'a.email'],
  ['alternateEmail', 'a.alternate_email'],
  ['countryCode', 'a.country_code'],
  ['phone', 'a.phone'],
  ['device', 'a.device']
]

const USER_FIELDS = [
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

const VALID_FIELD_MAP = new Map(ACCOUNT_FIELDS.concat(USER_FIELDS))

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

util.inherits(UserRepository, Repository)

function UserRepository (pool) {
  this.pool = pool
}

/**
 * @param {string} email
 * @param {string} password
 * @param {string[]|null} selectedFields
 */
UserRepository.prototype.getAuthorizedUser = async function (email, password, selectedFields = null) {
  let idx = 1
  selectedFields = parseSelectFields(selectedFields)

  return this.query(
    `
    SELECT 
      ${selectedFields}
    FROM "Accounts" AS a
    JOIN "Users" AS u ON a.id = u.user_id
    JOIN "Auths" AS au ON a.id = au.user_id
    WHERE
      a.email = $${idx++}::varchar AND
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
 * @param {string[]|null} selectedFields
 */
UserRepository.prototype.getUser = async function (account, selectedFields = null) {
  let idx = 1
  selectedFields = parseSelectFields(selectedFields)

  return this.query(
    `
    SELECT 
      ${selectedFields}
    FROM "Accounts" AS a
    JOIN "Users" AS u ON a.id = u.user_id
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
 * @param {string[]|null} selectedFields
 */
UserRepository.prototype.getPairUsers = async function (account, targetAccount, selectedFields = null) {
  let idx = 1
  selectedFields = parseSelectFields(selectedFields)

  return this.query(
    `
    SELECT 
      ${selectedFields}
    FROM "Accounts" AS a
    JOIN "Users" AS u ON a.id = u.user_id
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
 * @param {string[]|null} selectedFields
 */
UserRepository.prototype.updateUser = async function (account, newUserInfo, selectedFields = null) {
  let idx = 1
  const updatedFields = genUserUpdateFields(newUserInfo)
  selectedFields = parseSelectFields(selectedFields)

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
    RETURNING ${selectedFields}, a.region;
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
