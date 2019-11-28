const _ = require('lodash')
const uuidv4 = require('uuid/v4')
const C = require('../_properties/constant')
const util = require('../_properties/util')
const cache = require('../../../../library/cacheHandler')
const authRepo = require('../_repositories/authRepository').authRepository
const userRepo = require('../_repositories/userRepository').userRepository

function AuthService (authRepo, userRepo) {
  this.authRepo = authRepo
  this.userRepo = userRepo
  console.log(`init ${arguments.callee.name}`)
}

/**
 * for registration (new user)
 *
 * 註冊程序
 * 1. 建立揮發性資料在 cache (redis): 設定 1 小時之後刪除。(除非已經寫入 DB)
 * 2. 等到 user 輸入 verify code 再真的寫入 DB
 *
 * exe in [signup]:
 * a. find or create verification (without saving DB).
 *  (當然有可能有其他一樣的帳號: 重複的 email/phone 註冊 (不同人？但尚未認證) 的可能，[覆蓋過去就好]。
 *   若要做到完整需要 FIFO, 不過想想實境似乎不需要，因為用戶不見得知道孰先孰後。
 *   況且[有可能是同一個用戶忘了密碼或個資之類的需要重複填寫註冊資料]。)
 * b. wirte [signupInfo-with-verification] into redis ...
 *
 * @param {Object} signupInfo
 * @returns {{
 *    region: string,
 *    uid: string,
 *    type: string,
 *    acount: {{ email: string }|{ countryCode: string, phone: string }},
 *    content: Object,
 *    verify-token: string,
 *    code: string,
 *    expire: number
 * }}
 */
AuthService.prototype.signup = async function (signupInfo) {
  // check database (Does it exist?)
  const email = signupInfo.email
  const account = await this.authRepo.getAccountUserByContact('email', { email })
  if (account) {
    throw new Error(`${arguments.callee.name}: the email: ${email} has been registered!`)
  }

  // check catche (Does it exist?)
  const expire = util.getExpiration()
  const newVerification = util.genVerification(signupInfo, expire, true)
  const cachedSingupData = await cache.pipeline()
    .get(newVerification.token)
    .exec()
    .then(buf => buf[0] && buf[0][1] ? JSON.parse(buf[0][1].toString()) : undefined)

  if (cachedSingupData !== undefined) {
    return util.genVerificationPacket('email', { email }, cachedSingupData)
  }

  // set catche
  signupInfo.verification = newVerification
  signupInfo.uid = signupInfo.uid || uuidv4()

  return cache.pipeline()
    .set(newVerification.token, Buffer.from(JSON.stringify(signupInfo)), 'ex', util.getTTL())
    .exec()
    .then(() => util.genVerificationPacket('email', { email }, signupInfo))
    .catch(err => {
      console.error(err)
      throw new Error(`${arguments.callee.name}: New user signups fail!`)
    })
}

/**
 * @private
 * @param {Object} signupInfo
 * @param {{ token: string, code: string }} verifyInfo
 * @returns {Object} signupInfo
 */
AuthService.prototype.checkVerification = function (signupInfo, verifyInfo) {
  const verification = signupInfo.verification
  if (verifyInfo.token !== verification.token) {
    return Promise.reject(new Error('invalid verification'))
  }

  if (verifyInfo.code !== verification.code && parseInt(verifyInfo.expire) !== parseInt(verification.expire)) {
    return Promise.reject(new Error('invalid verification'))
  }

  return signupInfo
}

/**
 * @private
 * @param {Object} userInfo
 * @param {string} localDomain
 * @param {string} mediaDomain
 * @returns {Object} userInfo
 */
AuthService.prototype.mergePublicInfo = function (userInfo, localDomain, mediaDomain) {
  userInfo.publicInfo = {
    profileLink: util.genProfileLink(userInfo, localDomain),
    profilePic: util.genProfilePic(userInfo, mediaDomain)
  }

  return userInfo
}

/**
 * for registration (new user)
 *
 * 註冊程序
 * 1. 建立揮發性資料在 cache (redis): 設定 1 小時之後刪除。(除非已經寫入 DB)
 * 2. 等到 user 輸入 verify code 再真的寫入 DB
 *
 * exe in [createVerifiedUser]:
 * a. read [signupInfo-by-verifyInfo] from redis ...
 * b. write [signupInfo-by-verifyInfo] into DB.
 * c. delete temporary [signupInfo-by-verifyInfo] in redis.
 *
 * @param {{ token: string, code: string|number }} verifyInfo
 * @param {string} domain
 * @returns {Object...} userInfo with authentication (pwHash, pwSalt, lock, attempt)
 */
AuthService.prototype.createVerifiedUser = async function (verifyInfo, domain) {
  return cache.pipeline()
    .get(verifyInfo.token)
    .exec()
    .then(buf => JSON.parse(buf[0][1].toString()))
    .then(signupInfo => this.checkVerification(signupInfo, verifyInfo))
    .then(signupInfo => _.assign(signupInfo, util.encryptPassword(signupInfo.newpass)))
    .then(signupInfo => this.mergePublicInfo(signupInfo, domain))
    .then(signupInfo => Promise.resolve(this.authRepo.createAccountUser(signupInfo))
      .then(rowdata => _.assign(signupInfo, { seq: rowdata.seq }))
      .then(() => cache.del(verifyInfo.token))
      .then(() => signupInfo)
    )
    .catch(err => {
      console.error(err)
      throw new Error(`${arguments.callee.name}: New user created fail! OR has been created`)
    })
}

/**
 * TODO: 登入錯誤次數尚未累計至 attempt
 * if user valid,
 * 1. create session info !!!!!!
 * 2. return user info
 * @param {string} email
 * @param {string} password
 * @returns {Object...} userInfo with authentication (pwHash, pwSalt, lock, attempt)
 */
AuthService.prototype.login = async function (email, password) {
  const selectedFields = C.USER_PUBLIC_INFO_AND_CONTACT.concat(C.USER_AUTHENTICATION)
  let userInfo = await this.authRepo.getAccountUserByContact('email', { email }, selectedFields)
  if (userInfo === undefined) {
    throw new Error(`${arguments.callee.name}: the email: ${email} hasn't been registered!`)
  }

  userInfo = util.parseUserInfo(userInfo)
  const hashedPassword = util.encryptPassword(password, userInfo.pwSalt).pwHash
  if (hashedPassword !== userInfo.pwHash) {
    throw new Error(`${arguments.callee.name}: invalid password!`)
  }

  userInfo = await this.genAuthorization(userInfo)

  return userInfo
}

/**
 * accountContact 原本為 string,
 * 因考量可能會由 2 個以上的欄位組成 (phone = country_code + phone)
 * 所以改為 object
 * @param {string} type email/phone
 * @param {{ email: string}|{ countryCode: string, phone: string}} accountContact
 * @returns {{ email: string}|{ countryCode: string, phone: string}}
 */
AuthService.prototype.searchAccountContact = async function (type, accountContact) {
  accountContact = await this.authRepo.getAccountUserByContact(type, accountContact)
  if (accountContact === undefined) {
    throw new Error(`${arguments.callee.name}: account's ${type} not found!`)
  }

  return accountContact
}

/**
 * 用戶的 verification 常態性為 null 值，
 * 當需要驗證時臨時產生；驗證過後將再次清空為 null.
 * 為了維持 verification 的有效性，
 * [當database中有token,code,reset等資訊時，不再更新。]
 * @param {string} type email/phone
 * @param {{ email: string}|{ countryCode: string, phone: string}} accountContact
 * @param {boolean} expireTimeLimit
 * @returns {{
 *    region: string,
 *    uid: string,
 *    type: string,
 *    acount: {{ email: string }|{ countryCode: string, phone: string }},
 *    content: Object,
 *    verify-token: string,
 *    code: string,
 *    expire: number
 * }}
 */
AuthService.prototype.findOrCreateVerification = async function (type, accountContact, expireTimeLimit = false) {
  let userInfo = await this.authRepo.getAccountUserByContact(type, accountContact, C.USER_PUBLIC_INFO_AND_CONTACT)
  if (userInfo === undefined) {
    throw new Error(`${arguments.callee.name}: user not found!`)
  }

  userInfo = util.parseUserInfo(userInfo)

  const expire = expireTimeLimit ? util.getExpiration() : null
  const verification = util.genVerification(userInfo, expire)
  const verificationRecord = await this.authRepo.findOrCreateVerification(type, accountContact, verification)
  if (verificationRecord.token === undefined) {
    throw new Error(`${arguments.callee.name}: find or creation verification fail`)
  }

  const contact = { email: ['email'], phone: ['countryCode', 'phone'] }

  return util.genVerificationPacket(type, _.pick(accountContact, contact[type]), userInfo, verificationRecord)
}

/**
 * 輸入參數 verifyInfo 有兩種：
 * 1. [verifyInfo={token:xxxx,code:123456}] token & code
 * 2. [verifyInfo={token:xxxx,expire:1565022954420}] token & expire (expire 具時效性)
 * [這裡屬於第一種]
 * token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域找尋 (region)
 *  (Tokyo, Taipei, Sydney ...) 找尋用戶資料了
 * @param {{ token: string, code: string }} verifyInfo
 * @returns {Object} userInfo
 */
AuthService.prototype.getVerifiedUser = async function (verifyInfo) {
  const { token, code } = verifyInfo

  return Promise.resolve(this.authRepo.getVerifyUserByCode(token, code, C.USER_PUBLIC_INFO))
    .then(userInfo => userInfo === undefined ? Promise.reject(new Error(`${arguments.callee.name}: invalid verification!`)) : userInfo)
    .then(userInfo => this.genAuthorization(util.parseUserInfo(userInfo)))
    .then(async userInfo => {
      await this.authRepo.deleteVerification(userInfo, C.USER_VERIFICATION)

      return userInfo
    })
}

/**
 * @private
 * @param {Object} userInfo
 * @returns {Object}
 */
AuthService.prototype.checkExpiration = function (userInfo) {
  const timestamp = userInfo.expire
  if (timestamp != null && Date.now() > timestamp) {
    return Promise.reject(new Error(`${arguments.callee.name}: verification expired!`))
  }

  return _.omit(userInfo, [C.USER_VERIFICATION])
}

/**
 * 輸入參數 verifyInfo 有兩種：
 * 1. [verifyInfo={token:xxxx,code:123456}] token & code
 * 2. [verifyInfo={token:xxxx,expire:1565022954420}] token & expire (expire 具時效性)
 * [這裡屬於第二種]
 * token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域找尋 (region)
 *  (Tokyo, Taipei, Sydney ...) 找尋用戶資料了
 * @param {{ token: string, expire: string }} verifyInfo
 * @param {string} newPassword
 * @returns {Object} userInfo
 */
AuthService.prototype.getVerifiedUserWithNewAuthorized = async function (verifyInfo, newPassword) {
  const { token, expire } = verifyInfo
  const selectedFields = C.USER_PUBLIC_INFO.concat(C.USER_AUTHENTICATION)

  return Promise.resolve(this.authRepo.getVerifyUserByExpire(token, parseInt(expire), selectedFields))
    .then(userInfo => userInfo === undefined ? Promise.reject(new Error(`${arguments.callee.name}: invalid verification!`)) : userInfo)
    .then(userInfo => this.checkExpiration(userInfo))
    .then(userInfo => this.genAuthorization(util.parseUserInfo(userInfo)))
    .then(async userInfo => {
      // Cannot use Promise.all(...). Because 'deleteVerification' & 'resetPassword' works on the same DB record.
      await this.authRepo.deleteVerification(userInfo, C.USER_VERIFICATION)
      const hashedPassword = util.encryptPassword(newPassword, userInfo.pwSalt).pwHash
      await this.authRepo.resetPassword(userInfo, hashedPassword)

      return _.omit(userInfo, C.USER_AUTHENTICATION)
    })
}

/**
 * @param {{ uid: string, region: string }} account
 * @param {string} newPassword
 * @param {string} oldPassword
 * @returns {boolean}
 */
AuthService.prototype.resetPassword = async function (account, newPassword, oldPassword) {
  const auth = await this.authRepo.getAccountUser(account, C.USER_AUTHENTICATION)
  const pwSalt = auth.pw_salt
  const hashedNewPassword = util.encryptPassword(newPassword, pwSalt).pwHash
  if (oldPassword === undefined) {
    await this.authRepo.resetPassword(account, hashedNewPassword)
    return true
  }

  const pwHash = auth.pw_hash
  const hashedPassword = util.encryptPassword(oldPassword, pwSalt).pwHash
  if (pwHash !== hashedPassword) {
    throw new Error(`${arguments.callee.name}: invalid password!`)
  }

  await this.authRepo.resetPassword(account, hashedNewPassword, hashedPassword)

  return true
}

/**
 * NOTE: 若原本存在舊的session，將會被清除，重新建立一個新的
 */
AuthService.prototype.genAuthorization = /** async */ function (account) {
  const timestamp = Date.now()
  const token = 'what-can-you-do-for-auth-token'

  account.auth = { token }

  return account
}

/**
 * [accountIdentify] 至少要有 [region,uid,token]
 */
AuthService.prototype.isAuthenticated = async function (accountIdentify) {
  const auth = accountIdentify.auth
  // if (auth.timestamp < Date.now()) {
  //   throw new Error('user is NOT authorized')
  // }

  return true
}

/**
 * 1. [必定要刪除session資訊]
 * 2. ...
 */
AuthService.prototype.logout = async function (accountIdentify) {

}

module.exports = {
  authService: new AuthService(authRepo, userRepo),
  AuthService
}
