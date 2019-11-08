const util = require('util')
const _ = require('lodash')
const types = require('config').database.types
const Repository = require('../../../../library/repository')

const VALID_FIELDS = new Map([
  // Accounts
  ['uid', 'a.id AS uid'],
  ['region', 'a.region'],
  ['email', 'a.email'],
  ['alternateEmail', 'a.alternate_email'],
  ['countryCode', 'a.country_code'],
  ['phone', 'a.phone'],
  ['device', 'a.device'],
  // Auths
  ['pwHash', 'au.pw_hash'],
  ['pwSalt', 'au.pw_salt'],
  ['lock', 'au.lock'],
  ['attempt', 'au.attempt'],
  ['verification', 'au.verification']
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

const CONTACT_FIELDS = new Map([
  ['alternateEmail', 'alternate_email'],
  ['countryCode', 'country_code'],
  ['phone', 'phone'],
  ['device', 'device']
])

function parseContactUpdateFields (obj) {
  const fields = []
  for (const field of CONTACT_FIELDS.keys()) {
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
      fields.push(`${CONTACT_FIELDS.get(field)} = ${targetValue}`)
    }
  }

  return fields.join()
}

util.inherits(AuthRepository, Repository)

function AuthRepository (pool) {
  this.pool = pool
}

/**
 * account 原本為 string,
 * 因考量可能會由 2 個以上的欄位組成 (phone = country_code + phone)
 * 所以改為 object
 * @param {string} type
 * @param {{ email: string}|{ countryCode: string, phone: string}} account
 */
AuthRepository.prototype.searchAccount = async function (type, account) {
  const selected = {
    email: 'a.email',
    phone: 'a.country_code, a.phone'
  }

  const condition = {
    email: 'a.email = $1::varchar',
    phone: 'a.country_code = $1::varchar AND a.phone = $2::varchar'
  }
  const params = {
    email: [account.email],
    phone: [account.countryCode, account.phone]
  }

  return this.query(
    `
    SELECT ${selected[type]}
    FROM "Accounts" AS a
    WHERE
      ${condition[type]}
    `,
    params[type],
    0)
}

/**
 * TODO: [deprecated]
 * [including-table:Accounts-and-Auths]
 * @param {{
  *    uid: string,
  *    region: string,
  *    email: string,
  *    alternateEmail: string|null,
  *    countryCode: string|null,
  *    phone: string|null,
  *    device: Object|null,
  *    pwHash: string,
  *    pwSalt: string
  *  }} signupInfo
 */
AuthRepository.prototype.createAccount = async function (signupInfo) {
  const {
    uid,
    region,
    email,
    alternateEmail,
    countryCode,
    phone,
    device,
    pwHash,
    pwSalt
  } = signupInfo

  let idx = 1
  return this.query(
    `
    WITH
    data (id, region, email, alternate_email, country_code, phone, device, pw_hash, pw_salt, lock, attempt) AS (
      VALUES (
        $${idx++}::uuid,
        $${idx++}::varchar, -- region
        $${idx++}::varchar, -- email
        $${idx++}::varchar,
        $${idx++}::varchar, -- country_code
        $${idx++}::varchar,
        $${idx++}::jsonb, -- device
        $${idx++}::varchar,
        $${idx++}::varchar,
        'false'::boolean,
        0::smallint
      )
    ),
    account AS (
      INSERT INTO "Accounts" (id, region, email, alternate_email, country_code, phone, device)
      SELECT id, region, email, alternate_email, country_code, phone, device
      FROM data
      RETURNING id, region, email
    ),
    auth AS (
      INSERT INTO "Auths" (user_id, pw_hash, pw_salt, lock, attempt)
      SELECT id, pw_hash, pw_salt, lock, attempt
      FROM data
      JOIN account USING (id)
      RETURNING user_id, pw_hash, pw_salt
    )
    SELECT *, a.id AS uid FROM account AS a, auth;
    `,
    [
      uid,
      region,
      email,
      alternateEmail,
      countryCode,
      phone,
      JSON.stringify(device),
      pwHash,
      pwSalt
    ],
    0)
}

/**
 * [including-table:Accounts,Auths,and-Users]
 * @param {{
 *    uid: string,
 *    region: string,
 *    email: string,
 *    alternateEmail: string|null,
 *    countryCode: string|null,
 *    phone: string|null,
 *    device: Object|null,
 *    pwHash: string,
 *    pwSalt: string,
 *    givenName: string,
 *    familyName: string,
 *    gender: string,
 *    birth: string|null,
 *    lang: string,
 *    publicInfo: Object|null,
 *  }} signupInfo
 */
AuthRepository.prototype.createAccountUser = async function (signupInfo) {
  const {
    uid,
    region,
    email,
    alternateEmail,
    countryCode,
    phone,
    device,
    pwHash,
    pwSalt,
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
    WITH
    data (id, region, email, alternate_email, country_code, phone, device,
      pw_hash, pw_salt, lock, attempt,
      be_searched, given_name, family_name, gender, birth, lang, public_info) AS (
      VALUES (
        $${idx++}::uuid,
        $${idx++}::varchar,
        $${idx++}::varchar,
        $${idx++}::varchar,
        $${idx++}::varchar,
        $${idx++}::varchar,
        $${idx++}::jsonb,
        $${idx++}::varchar,
        $${idx++}::varchar,
        'false'::boolean,
        0::smallint,
        'true'::boolean,
        $${idx++}::varchar,
        $${idx++}::varchar,
        $${idx++}::varchar,
        $${idx++}::timestamp,
        $${idx++}::varchar,
        $${idx++}::jsonb
      )
    ),
    account AS (
      INSERT INTO "Accounts" (id, region, email, alternate_email, country_code, phone, device)
      SELECT id, region, email, alternate_email, country_code, phone, device
      FROM data
      RETURNING id, region, email
    ),
    auth AS (
      INSERT INTO "Auths" (user_id, pw_hash, pw_salt, lock, attempt)
      SELECT id, pw_hash, pw_salt, lock, attempt
      FROM data
      JOIN account USING (id)
      RETURNING pw_hash, pw_salt
    ),
    account_user AS (
      INSERT INTO "Users" (user_id, be_searched, given_name, family_name, gender, birth, lang, public_info)
      SELECT id, be_searched, given_name, family_name, gender, birth, lang, public_info
      FROM data
      JOIN account USING (id)
      RETURNING be_searched, given_name, family_name, lang, public_info
    )
    SELECT *, a.id AS uid FROM account AS a, auth, account_user;
    `,
    [
      uid,
      region,
      email,
      alternateEmail,
      countryCode,
      phone,
      JSON.stringify(device),
      pwHash,
      pwSalt,
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
 * [NOTE] email 不可變更！不像 linkedIn 可以替換信箱
 * @param {{ uid: string, region: string }} account
 * @param {{
 *    alternateEmail: string|null,
 *    countryCode: string|null,
 *    phone: string|null,
 *    device: Object|null
 * }} newContactInfo
 */
AuthRepository.prototype.updateContact = async function (account, newContactInfo) {
  const updatedFields = parseContactUpdateFields(newContactInfo)
  let idx = 1

  return this.query(
    `
    UPDATE "Accounts"
    SET
      ${updatedFields}
    WHERE
      id = $${idx++}::uuid AND
      region = $${idx++}::varchar
    RETURNING id AS uid, region, email, alternate_email, country_code, phone, device
    `,
    [
      account.uid,
      account.region
    ],
    0)
}

/**
 * @param {{ uid: string, region: string }} account
 * @param {string} newPassword
 * @param {string|null} oldPassword
 */
AuthRepository.prototype.resetPassword = async function (account, newPassword, oldPassword = null) {
  const condition = oldPassword === null ? '' : '"Auths".pw_hash = $4::varchar AND'
  const params = oldPassword === null ? [
    newPassword,
    account.uid,
    account.region
  ] : [
    newPassword,
    account.uid,
    account.region,
    oldPassword
  ]

  return this.query(
    `
    UPDATE "Auths"
    SET
      pw_hash = $1::varchar
    FROM "Accounts" AS a
    WHERE
    a.id  = $2::uuid AND
      a.region = $3::varchar AND
      ${condition}
      "Auths".user_id = a.id
    RETURNING a.id AS uid, a.region
    `,
    params,
    0)
}

/**
 * TODO:
 * [findOrCreateVerification的輸入參數變更]
 * 原本是 func(type, account, reset = null, selectedFields = null)
 * 現改為 func(type, account, verification)
 *
 * TODO: 
 * account 原本為 type: string,
 * 因考量可能會由 2 個以上的欄位組成 (phone = country_code + phone)
 * 所以改為 type: object
 *
 * TODO: 
 * 若要在 "Accounts", "Auths", "Users" 找尋同一用戶的多個欄位資料，
 * [selectedFields無法用在這裡，在這次查詢的成本太高]，需要用另一次的 query 查詢
 *
 * TODO: 
 * 需要把過期時間 (reset vs current time) 考慮進去??多加一個參數?? 過期了才重建立。沒過期不用。
 * @param {string} type
 * @param {{ email: string}|{ countryCode: string, phone: string}} account
 * @param {{ token: string, code: string, reset: number|null }} verification
 * @param {string[]|null} selectedFields
 */
AuthRepository.prototype.findOrCreateVerification = async function (type, account, verification, selectedFields = null) {
  const conditionWith = {
    email: 'a.email = $1::varchar',
    phone: 'a.country_code = $1::varchar AND a.phone = $2::varchar'
  }
  const condition = {
    email: 'a.email = $2::varchar',
    phone: 'a.country_code = $3::varchar AND a.phone = $4::varchar'
  }
  const returnedFields = {
    email: 'a.email,',
    phone: 'a.country_code, a.phone,'
  }
  const params = {
    email: [account.email, account.email],
    phone: [account.countryCode, account.phone, account.countryCode, account.phone]
  }

  return this.query(
    `
    WITH account_auth AS (
      SELECT
        au.verification
      FROM "Auths" AS au
      JOIN "Accounts" AS a ON au.user_id = a.id
      WHERE
        ${conditionWith[type]} AND
        au.user_id = a.id
    )
    UPDATE "Auths" AS au
    SET
      verification = CASE
        WHEN (au.verification->>'reset')::numeric > ${Date.now()}::numeric OR au.verification IS null 
        THEN '${JSON.stringify(verification)}'::jsonb
        ELSE (SELECT verification FROM account_auth)
        END
    FROM "Accounts" AS a
    WHERE
      ${condition[type]} AND
      au.user_id = a.id
    RETURNING user_id AS uid, a.region, ${returnedFields[type]} verification;
    `,
    params[type],
    0)
}

/**
 * TODO: 若要在 "Accounts", "Auths", "Users" 找尋同一用戶的多個欄位資料，
 * [selectedFields在AuthRepository僅能選擇"Accounts","Auths"，若加上"Users"在這次查詢的成本太高]，需要用另一次的 query 查詢
 * @param {string} token
 * @param {string} code
 * @param {string[]|null} selectedFields
 */
AuthRepository.prototype.getVerifyUserByCode = async function (token, code, selectedFields = null) {
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
      au.verification->'code' ? $${idx++}::varchar AND
      au.verification->'token' ? $${idx++}::varchar
    `,
    [
      code,
      token
    ],
    0)
}

/**
 * TODO: 若要在 "Accounts", "Auths", "Users" 找尋同一用戶的多個欄位資料，
 * [selectedFields在AuthRepository僅能選擇"Accounts","Auths"，若加上"Users"在這次查詢的成本太高]，需要用另一次的 query 查詢
 * @param {string} token
 * @param {number} reset
 * @param {string[]|null} selectedFields
 */
AuthRepository.prototype.getVerifyUserWithoutExpired = async function (token, reset, selectedFields = null) {
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
      (au.verification->>'reset')::numeric = $${idx++}::numeric AND
      au.verification->'token' ? $${idx++}::varchar
    `,
    [
      reset,
      token
    ],
    0)
}

/**
 * TODO: 若要在 "Accounts", "Auths", "Users" 找尋同一用戶的多個欄位資料，
 * [selectedFields在AuthRepository僅能選擇"Accounts","Auths"，若加上"Users"在這次查詢的成本太高]，需要用另一次的 query 查詢
 * @param {{ uid: string, region: string }} account
 * @param {string[]|null} selectedFields
 */
AuthRepository.prototype.deleteVerification = async function (account, selectedFields = null) {
  let idx = 1
  selectedFields = parseSelectFields(selectedFields)

  return this.query(
    `
    UPDATE "Auths"
    SET 
      verification = null
    FROM "Accounts" AS a
    WHERE
      a.id = $${idx++}::uuid AND
      a.region = $${idx++}::varchar AND
      "Auths".user_id = a.id
    RETURNING ${selectedFields}, user_id AS uid, a.region, verification;
    `,
    [
      account.uid,
      account.region
    ],
    0)
}

module.exports = AuthRepository
