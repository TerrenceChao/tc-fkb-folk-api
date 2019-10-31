// TODO: for temporary
const authRepo = require('../_repositories/authRepositoryTemp')

function AuthService (authRepo) {
  this.authRepo = authRepo
  console.log(`init ${arguments.callee.name}`)
}

/**
 * for registration (new user)
 *
 * TODO: 註冊程序
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
 */
AuthService.prototype.signup = async function (signupInfo) {

}

/**
 * for registration (new user)
 *
 * TODO: 註冊程序
 * 1. 建立揮發性資料在 cache (redis): 設定 1 小時之後刪除。(除非已經寫入 DB)
 * 2. 等到 user 輸入 verify code 再真的寫入 DB
 *
 * exe in [createVerifiedUser]:
 * a. read [signupInfo-by-verifyInfo] from redis ...
 * b. write [signupInfo-by-verifyInfo] into DB.
 * c. delete temporary [signupInfo-by-verifyInfo] in redis.
 *
 * @param {{ token: string, code: string|number }} verifyInfo
 */
AuthService.prototype.createVerifiedUser = async function (verifyInfo) {

}

module.exports = {
  authService: new AuthService(authRepo),
  AuthService
}
