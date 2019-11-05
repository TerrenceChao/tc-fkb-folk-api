const util = require('util')
const _ = require('lodash')
const types = require('config').database.types
const Repository = require('../../../../library/repository')

const VALID_FIELDS = new Map([
  // Accounts
  ['uid', 'a.id'],
  ['region', 'a.region'],
  ['email', 'a.email'],
  ['alternateEmail', 'a.alternate_mail'],
  ['countryCode', 'a.country_code'],
  ['phone', 'a.phone'],
  ['device', 'a.device'],
  // // Auths
  // ['pwHash', 'au.pw_hash'],
  // ['pwSalt', 'au.pw_salt'],
  // ['lock', 'au.lock'],
  // ['attempt', 'au.attempt'],
  // ['verification', 'au.verification']
  // Users
  ['beSearched', 'u.be_searched'],
  ['givenName', 'u.given_name'],
  ['familyName', 'u.family_name'],
  ['gender', 'u.gender'],
  ['birth', 'u.birth'],
  ['lang', 'u.lang'],
  ['publicInfo', 'u.public_info']
])

function parseSelectFields (selectedFields) {
  if (selectedFields === null) {
    return Array.from(VALID_FIELDS.values()).join()
  }

  return selectedFields
    .reduce((accumulate, f) => {
      if (VALID_FIELDS.has(f)) {
        accumulate.push(VALID_FIELDS.get(f))
      }
      return accumulate
    }, [])
    .join()
}

const UPDATE_USER_FIELDS = new Map([
  ['beSearched', 'be_searched'],
  ['givenName', 'given_name'],
  ['familyName', 'family_name'],
  ['gender', 'gender'],
  ['birth', 'birth'],
  ['lang', 'lang'],
  ['publicInfo', 'public_info']
])

function parseUserUpdateFields (obj) {
  const fields = []
  for (const field of UPDATE_USER_FIELDS.keys()) {
    if (obj.hasOwnProperty(field)) {
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
      fields.push(`${UPDATE_USER_FIELDS.get(field)} = ${targetValue}`)
    }
  }

  return fields.join()
}

util.inherits(UserRepository, Repository)

function UserRepository (pool) {
  this.pool = pool
}

/**
 * TODO: [deprecated]
 * @param {{
 *    uid: string,
 *    givenName: string,
 *    familyName: string,
 *    gender: string,
 *    birth: string|null,
 *    lang: string,
 *    publicInfo: Object|null,
 * }} signupInfo
 */
UserRepository.prototype.createUser = async function (signupInfo) {
  const {
    uid,
    givenName,
    familyName,
    gender,
    birth,
    lang,
    publicInfo
  } = signupInfo

  let idx = 1
  return this.query(
    `
    INSERT INTO "Users (user_id, be_searched, given_name, family_name, gender, birth, lang, public_info)
    VALUES (
      $${idx++}::uuid,
      $${idx++}::boolean,
      $${idx++}::varchar,
      $${idx++}::varchar,
      $${idx++}::varchar,
      $${idx++}::timestamp,
      $${idx++}::varchar,
      $${idx++}::jsonb
    );
    `,
    [
      uid,
      true,
      givenName,
      familyName,
      gender,
      birth,
      lang,
      JSON.stringify(publicInfo)
    ],
    0)
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
      ${selectedFields}, a.id AS uid
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
 * @param {{ uid: string, region: string }} accountIdentity
 * @param {string[]|null} selectedFields
 */
UserRepository.prototype.getUser = async function (accountIdentity, selectedFields = null) {
  let idx = 1
  selectedFields = parseSelectFields(selectedFields)

  return this.query(
    `
    SELECT 
      ${selectedFields}, a.id AS uid
    FROM "Accounts" AS a
    JOIN "Users" AS u ON a.id = u.user_id
    WHERE
      a.id = $${idx++}::uuid AND
      a.region = $${idx++}::varchar;
    `,
    [
      accountIdentity.uid,
      accountIdentity.region
    ],
    0)
}

/**
 * 需要結合 Account 中的 region
 * @param {{ uid: string, region: string }} accountIdentity
 * @param {{ uid: string, region: string }} targetAccountIdentity
 * @param {string[]|null} selectedFields
 */
UserRepository.prototype.getPairUsers = async function (accountIdentity, targetAccountIdentity, selectedFields = null) {
  let idx = 1
  const order = {
    [accountIdentity.uid]: 0,
    [targetAccountIdentity.uid]: 1
  }
  selectedFields = parseSelectFields(selectedFields)

  return this.query(
    `
    SELECT 
      ${selectedFields}, a.id AS uid
    FROM "Accounts" AS a
    JOIN "Users" AS u ON a.id = u.user_id
    WHERE
      (a.id = $${idx++}::uuid AND a.region = $${idx++}::varchar) OR
      (a.id = $${idx++}::uuid AND a.region = $${idx++}::varchar);
    `,
    [
      accountIdentity.uid,
      accountIdentity.region,
      targetAccountIdentity.uid,
      targetAccountIdentity.region
    ])
}

/**
 * userRepo
 * @param {{ uid: string, region: string }} accountIdentity
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
UserRepository.prototype.updateUser = async function (accountIdentity, newUserInfo, selectedFields = null) {
  let idx = 1
  const updatedFields = parseUserUpdateFields(newUserInfo)
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
    RETURNING ${selectedFields}, a.region, a.id AS uid;
    `,
    [
      accountIdentity.uid,
      accountIdentity.region
    ],
    0)
}

module.exports = UserRepository
