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

// there's not 'a.alternate_email', just 'alternate_email' (no prefix: 'a.')
const ACCOUNT_UPDATE_FIELDS = [
  ['alternateEmail', 'alternate_email'],
  ['countryCode', 'country_code'],
  ['phone', 'phone'],
  ['device', 'device']
]

const AUTH_FIELDS = [
  ['pwHash', 'au.pw_hash'],
  ['pwSalt', 'au.pw_salt'],
  ['lock', 'au.lock'],
  ['attempt', 'au.attempt'],
  ['token', 'au.verify_token'],
  ['code', 'au.verify_code'],
  ['expire', 'au.verify_expire']
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

const VALID_FIELD_MAP = new Map(ACCOUNT_FIELDS.concat(AUTH_FIELDS).concat(USER_FIELDS))
const VALID_CONTACT_FIELD_MAP = new Map(ACCOUNT_FIELDS)

function parseSelectFields (selectedFields, validFields = VALID_FIELD_MAP) {
  if (selectedFields === null) {
    return Array.from(validFields.values()).join()
  }

  return selectedFields
    .reduce((accumulate, f) => {
      if (validFields.has(f)) {
        accumulate.push(validFields.get(f))
      }
      return accumulate
    }, [])
    .join()
}

const CONTACT_UPDATE_FIELD_MAP = new Map(ACCOUNT_UPDATE_FIELDS)

function genContactUpdateFields (obj) {
  const fields = []
  for (const field of CONTACT_UPDATE_FIELD_MAP.keys()) {
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
      fields.push(`${CONTACT_UPDATE_FIELD_MAP.get(field)} = ${targetValue}`)
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

util.inherits(AuthRepository, Repository)

function AuthRepository (pool) {
  this.pool = pool
}

/**
 * @param {{ uidL string, region: string }} account
 * @param {string[]|null} selectedFields
 */
AuthRepository.prototype.getAccountUser = async function (account, selectedFields = null) {
  const joinTable = selectedFields === null ? '' : genJoinedTables(selectedFields)
  const selected = parseSelectFields(selectedFields)

  return this.query(
    `
    SELECT ${selected}
    FROM "Accounts" AS a
    ${joinTable}
    WHERE
      a.id = $1::uuid AND a.region = $2::varchar
    `,
    [
      account.uid,
      account.region
    ],
    0)
}

/**
 * account 原本為 string,
 * 因考量可能會由 2 個以上的欄位組成 (phone = country_code + phone)
 * 所以改為 object
 * @param {string} type
 * @param {{ email: string}|{ countryCode: string, phone: string}} account
 * @param {string[]|null} selectedFields
 */
AuthRepository.prototype.getAccountUserByContact = async function (type, account, selectedFields = null) {
  const defaultFields = {
    email: 'a.email',
    phone: 'a.country_code, a.phone'
  }
  const joinTable = selectedFields === null ? '' : genJoinedTables(selectedFields)
  const selected = selectedFields === null ? defaultFields[type] : parseSelectFields(selectedFields)

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
    SELECT ${selected}
    FROM "Accounts" AS a
    ${joinTable}
    WHERE
      ${condition[type]}
    `,
    params[type],
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
      INSERT INTO "Auths" (id, user_id, pw_hash, pw_salt, lock, attempt)
      SELECT REVERSE(nextval('auths_id_seq')::varchar), id, pw_hash, pw_salt, lock, attempt
      FROM data
      JOIN account USING (id)
      RETURNING pw_hash, pw_salt
    ),
    account_user AS (
      INSERT INTO "Users" (id, user_id, be_searched, given_name, family_name, gender, birth, lang, public_info)
      SELECT REVERSE(nextval('users_id_seq')::varchar), id, be_searched, given_name, family_name, gender, birth, lang, public_info
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
 * @param {string[]|null} selectedFields
 */
AuthRepository.prototype.updateContact = async function (account, newContactInfo, selectedFields = null) {
  let idx = 1
  const updatedFields = genContactUpdateFields(newContactInfo)
  selectedFields = parseSelectFields(selectedFields, VALID_CONTACT_FIELD_MAP)

  return this.query(
    `
    UPDATE "Accounts" AS a
    SET
      ${updatedFields}
    WHERE
      id = $${idx++}::uuid AND
      region = $${idx++}::varchar
    RETURNING ${selectedFields}
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
 * @param {string} oldPassword
 */
AuthRepository.prototype.resetPassword = async function (account, newPassword, oldPassword) {
  const condition = oldPassword === undefined ? '' : '"Auths".pw_hash = $4::varchar AND'
  const params = oldPassword === undefined ? [
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
 * 尋找或建立驗證資訊。並回傳 "Accounts", "Auths" 的資訊
 * @param {string} type
 * @param {{ email: string}|{ countryCode: string, phone: string}} account
 * @param {{ token: string, code: string, expire: number|null }} verification
 */
AuthRepository.prototype.findOrCreateVerification = async function (type, account, verification) {
  const withCondition = {
    email: 'a.email = $1::varchar',
    phone: 'a.country_code = $1::varchar AND a.phone = $2::varchar'
  }
  const condition = {
    email: 'a.email = $2::varchar',
    phone: 'a.country_code = $3::varchar AND a.phone = $4::varchar'
  }
  const returnedFields = {
    email: 'a.email',
    phone: 'a.country_code, a.phone'
  }
  const params = {
    email: [account.email, account.email],
    phone: [account.countryCode, account.phone, account.countryCode, account.phone]
  }

  return this.query(
    `
    WITH account_auth AS (
      SELECT
        au.verify_token,
        au.verify_code,
        au.verify_expire
      FROM "Auths" AS au
      JOIN "Accounts" AS a ON au.user_id = a.id
      WHERE
        ${withCondition[type]} AND
        au.user_id = a.id
    )
    UPDATE "Auths" AS au
    SET
      verify_token = (CASE
        WHEN verify_expire::bigint < ${Date.now()}::bigint OR au.verify_token IS null
        THEN '${verification.token}'::varchar
        ELSE (SELECT verify_token FROM account_auth)::varchar
        END),

      verify_code = (CASE
        WHEN verify_expire::bigint < ${Date.now()}::bigint OR au.verify_token IS null
        THEN '${verification.code}'::varchar
        ELSE (SELECT verify_code FROM account_auth)::varchar
        END),

      verify_expire = (CASE
        WHEN verify_expire::bigint < ${Date.now()}::bigint OR au.verify_token IS null
        THEN ${verification.expire}::bigint
        ELSE (SELECT verify_expire FROM account_auth)::bigint
        END)

    FROM "Accounts" AS a
    WHERE
      ${condition[type]} AND
      au.user_id = a.id
    RETURNING
      user_id AS uid, a.region, ${returnedFields[type]},
      au.verify_token AS token, au.verify_code AS code, au.verify_expire AS expire;
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
      ${selectedFields}, a.id AS uid, a.region, au.verify_token AS token, au.verify_code AS code, au.verify_expire AS expire
    FROM "Accounts" AS a
    JOIN "Users" AS u ON a.id = u.user_id
    JOIN "Auths" AS au ON a.id = au.user_id
    WHERE
      au.verify_code = $${idx++}::varchar AND
      au.verify_token = $${idx++}::varchar
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
 * @param {number} expire
 * @param {string[]|null} selectedFields
 */
AuthRepository.prototype.getVerifyUserWithoutExpired = async function (token, expire, selectedFields = null) {
  let idx = 1
  selectedFields = parseSelectFields(selectedFields)

  return this.query(
    `
    SELECT
      ${selectedFields}, a.id AS uid, a.region,
      au.verify_token AS token, au.verify_code AS code, au.verify_expire AS expire
    FROM "Accounts" AS a
    JOIN "Users" AS u ON a.id = u.user_id
    JOIN "Auths" AS au ON a.id = au.user_id
    WHERE
      au.verify_expire = $${idx++}::bigint AND
      au.verify_token = $${idx++}::varchar
    `,
    [
      expire,
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
    UPDATE "Auths" AS au
    SET
      verify_token = null,
      verify_code = null,
      verify_expire = null
    FROM "Accounts" AS a
    WHERE
      a.id = $${idx++}::uuid AND
      a.region = $${idx++}::varchar AND
      au.user_id = a.id
    RETURNING 
      ${selectedFields}, user_id AS uid, a.region,
      verify_token AS token, verify_code AS code, verify_expire AS expire;
    `,
    [
      account.uid,
      account.region
    ],
    0)
}

module.exports = {
  authRepository: new AuthRepository(pool),
  AuthRepository
}
