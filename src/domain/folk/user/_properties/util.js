const _ = require('lodash')
const crypto = require('crypto')
const cryptoRandomString = require('crypto-random-string')
const { hasKeys } = require('../../../../property/util')
const { EXPIRATION_SECS, ACCOUT_IDENTITY, USER_PRIVATE_INFO } = require('./constant')

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

/**
 * TODO: 尚未實現。產生出的 token 能找出 uid, region 資訊。
 * @param {Object} userInfo
 * @param {number|null} expire
 * @param {boolean} unique 是否建立唯一性的 token [註冊時適用，因存放在{cache}須具唯一性]
 */
function genVerification (userInfo, expire = null, unique = false) {
  const token = 'laierhgslierghULIHAsadaeri'
  var code = '123456'

  return {
    /**
     * token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域(region)
     *  (Tokyo, Taipei, Sydney ...) 找尋用戶資料了
     *
     * [NOTE] 以'verify-token'命名是因為你不知道從這個 function 丟出去的結果會走向哪裡，
     * 他很有可能和 session/auth 相關的 token 搞混。因此強制性的命名。
     */
    // 'verify-token': token,
    token,
    // token,
    // token: partialUserData.verificaiton.token,
    code, // TODO: type: string
    /**
     * for reset password directly (with expiration expiration time: 10 mins)
     */
    expire // TODO: type: number
  }
}

/**
 * @param {string} type
 * @param {{ email: string}|{countryCode: string, phone: string}} accountContact
 * @param {Object} userInfo
 * @param {{ token: string, code: string, expire: number }} newVerification
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
  genVerification,
  genVerificationPacket
}
