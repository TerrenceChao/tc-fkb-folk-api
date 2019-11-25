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
 * NOTE:
 * secret 的長度有可能使得 Buffer 不及足夠長的長度。因此當 secret 過短時，透過';'分隔，重複 secret
 * @param {{ region: string, email: string, now: number }} userData
 * @param {string} secret
 * @param {string} algorithm
 * @returns {string}
 */
function genUniqueToken (userData, secret, algorithm = CIPHER_ALGO) {
  const { region, email, now } = userData
  const data = { region, email, now }
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
 *    encrypted: string
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
 * Consider cross-region
 * TODO: 將在 web-api 使用。
 * TODO: notify-api 的 API querystring 在註冊時機，得加上 user email 資訊
 *
 * NOTE:
 * secret 的內容會是 email (註冊時) 或者 code (已是會員時)。
 * @param {string} token
 * @param {string} secret
 * @param {string} algorithm
 * @returns {string}
 */
function parseUniqueToken (token, secret, algorithm = CIPHER_ALGO) {
  while (Buffer.from(secret).length < 32) {
    secret = `${secret};`.concat(secret)
  }

  return decrypt(token, secret, algorithm)
}

/**
 * Consider cross-region
 * TODO: 將在 web-api 使用。
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
 * NOTE:
 * 用於產生可加解密的 verify-token。
 * token 可隱含發送地點，也就是說其隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域找尋
 * (Taipei, Tokyo, Sydney ... etc)
 *
 * NOTE: secret 的內容會是 email (註冊時) 或者 code (已是會員時)
 * Q1: 為什麼在註冊時會用 email 當作 secret, 會員時用 code 當作 secret?
 * 因為無論哪類型的 token 都希望它是穩定的。從 API 介面上看：
 * 1. 新用戶註冊時，因為 token 存在 cache 中，若 secret 用 code，每次呼叫的 token 都不同，同時浪費 cache 資源；
 *    secret 必須採用 email 以保證 token 穩定不變。(email 註冊地改變時 token 才會改變)
 * 2. 已成為會員時，因為 token 存在 database 中，利用 SQL 語法使得每次呼叫的 token 在期限內為穩定，
 *    但過期後 token 需要換新，所以 secret 用 code。
 *
 * Q2: 為什麼在註冊時僅用 email 當作 secret?
 * 原本的想法是用 `email:region` 當作 secret。但試想下列情境：
 * 1. web-api 在接受 client 呼叫時，雖然可以但不會想要知道 client 從哪個區域 call API(麻煩)，事情越簡單越好。
 * 2. 當用戶透過朋友在 tw 發送驗證信 (genUniqueToken)，而用戶自己在 us 收到驗證信後點擊(parseUniqueToken)，
 *    若 secret 中包含 region 資訊，那麼用戶就只能在台灣才能透過驗證信註冊；否則 notify-api 的 API querystring 還得再加上 region 資訊...
 *
 * 為了簡化註冊流程，secret 僅用 email.
 * 為了簡化驗證流程，secret 僅用 code.
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

  let secret
  if (unique === false) { // 已成為會員時
    userInfo.now = last6digits
    secret = code
  } else { // 新用戶註冊時
    secret = userInfo.email
  }

  return {
    token: genUniqueToken(userInfo, secret),
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
