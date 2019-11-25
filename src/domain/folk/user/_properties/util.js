const _ = require('lodash')
const crypto = require('crypto')
const cryptoRandomString = require('crypto-random-string')
const { hasKeys } = require('../../../../property/util')
const { EXPIRATION_SECS, ACCOUT_IDENTITY, USER_PRIVATE_INFO, CIPHER_ALGO } = require('./constant')

/**
 * @param {Object} account
 */
function validAccount (account) {
  return hasKeys(account, ACCOUT_IDENTITY)
}

/**
 * @param {Object} user
 */
function parseAccount (user) {
  return {
    uid: user.uid || user.id || user.user_id || user.userId,
    region: user.region
  }
}

/**
 * @param {string} password
 * @param {string} salt
 */
function encryptPassword (password, salt) {
  const pwSalt = salt === undefined ? cryptoRandomString({ length: 16, type: 'url-safe' }) : salt
  const pwHash = crypto.scryptSync(password, pwSalt, 32, { N: 512 }).toString('hex')

  return {
    pwHash,
    pwSalt
  }
}

/**
 *
 * @param {Object} user
 */
function parseUserInfo (user) {
  user = _.mapKeys(user, (value, key) => _.camelCase(key))
  const publicInfo = user.publicInfo
  delete user.publicInfo

  user.expire && (user.expire = parseInt(user.expire))

  return _.assign(user, publicInfo)
}

/**
 *
 * @param {Object} user
 * @param {string} domain folk-api's domain
 */
function genProfileLink (user, domain) {
  return `${domain}/user/${user.uid}/${user.region}/profile`
}

/**
 * TODO: need a media doamin
 * @param {Object} user
 * @param {string} domain media domain
 */
function genProfilePic (user, domain) {
  domain = domain === undefined ? '404-notfound' : domain
  return `${domain}/user/${user.uid}/${user.region}/profile/pic/0`
}

function getExpiration () {
  return Date.now() + EXPIRATION_SECS * 1000
}

function getTTL () {
  return EXPIRATION_SECS
}

/**
 * @param {string} str
 */
function reverseStr (str) {
  var newStr = ''

  const strLen = str.length
  for (let i = strLen - 1; i >= 0; i--) {
    newStr = newStr.concat(str[i])
  }

  return newStr
}

/**
 * @param {{ region: string, email: string }} userData
 * @param {string} algorithm
 * @returns {string}
 */
function genUniqueToken (userData, algorithm = CIPHER_ALGO) {
  const { region, email } = userData
  const data = { region, email }
  let secret = email
  while (Buffer.from(secret).length < 32) {
    secret = `${secret};`.concat(secret)
  }

  const encryptedData = encrypt(JSON.stringify(data), secret, algorithm)

  return `${encryptedData.iv}.${encryptedData.encrypted}`
}

/**
 * Consider cross-region
 * @param {string} text
 * @param {string} secret
 * @param {string} algorithm
 * @returns {
 *    iv: string,
 *    encrypt: string
 * }
 */
function encrypt (text, secret, algorithm) {
  secret = Buffer.from(secret)
  const key = secret.slice(0, 32)
  const iv = secret.slice(8, 24)

  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])

  return { iv: iv.toString('hex'), encrypted: encrypted.toString('hex') }
}

/**
 * @param {string} token
 * @param {string} userEmail
 * @param {string} algorithm
 * @returns {string}
 */
function parseUniqueToken (token, userEmail, algorithm = CIPHER_ALGO) {
  let secret = userEmail
  while (Buffer.from(secret).length < 32) {
    secret = `${secret};`.concat(secret)
  }

  return decrypt(token, secret, algorithm)
}

/**
 * Consider cross-region
 * @param {string} text
 * @param {string} secret
 * @param {string} algorithm
 * @returns {string}
 */
function decrypt (text, secret, algorithm) {
  const key = Buffer.from(secret).slice(0, 32)

  const textInfo = text.split('.')
  const iv = Buffer.from(textInfo[0], 'hex')
  const encryptedText = Buffer.from(textInfo[1], 'hex')

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}

/**
 * TODO: 尚未實現。產生出的 token 能找出 uid, region 資訊。
 * @param {Object} userInfo
 * @param {number|null} expire
 * @param {boolean} unique 是否建立唯一性的 token (註冊時適用，因存放在 {cache} 須具唯一性)
 * @returns {
 *    token: string,
 *    code: string,
 *    expire: number
 * }
 */
function genVerification (userInfo, expire = null, unique = false) {
  const now = Date.now().toString()
  const last6digits = now.substr(-6)
  const code = reverseStr(last6digits)

  if (unique === false) {
    const hmac = crypto.createHmac('md5', now)
    const token = hmac.update(JSON.stringify(userInfo)).digest('hex')

    return {
      token,
      code,
      expire
    }
  }

  /**
   * [NOTE]:
   * 當 unique === true 時：
   * 1. 建立唯一性的 token (註冊時適用，因存放在 {cache} 須具唯一性).
   * 2. token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域找尋 => Consider cross-region
   * (Tokyo, Taipei, Sydney ...) 找尋用戶資料了
   */
  return {
    token: genUniqueToken(userInfo),
    code,
    expire
  }
}

/**
 * @param {string} type
 * @param {{ email: string}|{countryCode: string, phone: string}} accountContact
 * @param {Object} userInfo
 * @param {{ token: string, code: string, expire: number }} newVerification
 * @returns {
 *    region: string,
 *    uid: string,
 *    type: string,
 *    account: Object,
 *    content: Object,
 *    verify-token: string,
 *    code: string,
 *    expire: number
 * }
 */
function genVerificationPacket (type, accountContact, userInfo, newVerification) {
  const verification = (newVerification === undefined) ? userInfo.verification : newVerification
  verification.expire && (verification.expire = parseInt(verification.expire))

  return {
    region: userInfo.region,
    uid: userInfo.uid,
    type,
    /**
     * TODO: 這裡的 account (string OR Object?) 是否能夠和 notify-api 的資料銜接上？
     */
    account: accountContact,
    content: _.pick(userInfo, USER_PRIVATE_INFO),
    /**
     * [NOTE] 以'verify-token'命名是因為你不知道從這個 function 丟出去的結果會走向哪裡，
     * 他很有可能和 session/auth 相關的 token 搞混。因此強制性的命名。
     */
    'verify-token': verification.token,
    code: verification.code,
    expire: verification.expire
  }
}

module.exports = {
  validAccount,
  parseAccount,
  encryptPassword,
  parseUserInfo,
  genProfileLink,
  genProfilePic,
  getExpiration,
  getTTL,
  genUniqueToken,
  encrypt,
  parseUniqueToken,
  decrypt,
  genVerification,
  genVerificationPacket
}
