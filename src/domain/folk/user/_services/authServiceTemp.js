var _ = require('lodash')
const authRepo = require('../_repositories/authRepositoryTemp')

const expirationMins = parseInt(process.env.EXPIRATION_TIME)

function AuthService(authRepo) {
  this.authRepo = authRepo
  console.log(`init ${arguments.callee.name} (template)`)
}

/**
 * [這裡的signupInfo需要前端協助帶上region(於前端註冊時的所在地)]
 * region!region!region!region!region!region!
 */
AuthService.prototype.signup = async function (signupInfo) {
  // create record in account 

  // var err = new Error(`AuthService causes error!`)
  // err.status = 501
  // throw err

  var user = await this.authRepo.createAccountUser(signupInfo)

  // var auth = await this.createSession({
  //   region: user.region,
  //   uid: user.uid,
  //   email: user.email,
  // })

  return await this.findOrCreateVerification('email', user.email) // _.assignIn(user, { auth })
}

/**
 * if user valid,
 * 1. create session info !!!!!!
 * 2. return user info
 */
AuthService.prototype.login = async function (email, password) {

  // var err = new Error(`AuthService causes error!`)
  // err.status = 501
  // throw err
  var user = await this.authRepo.getAccountUser({ email }, password)

  var auth = await this.createSession({
    region: user.region,
    uid: user.uid,
    email: user.email,
  })
  
  return _.assignIn(user, { auth })
}

AuthService.prototype.searchAccount = async function (type, account) {
  if (type === 'email' || type === 'phone') {
    return await this.authRepo.searchAccount(type, account)
  } else {
    var err = new Error('invalid account type, [email, phone] are available types')
    err.status = 404
    throw err
  }
}

/**
 * 用戶的 verification 常態性為 null 值，
 * 當需要驗證時臨時產生；驗證過後將再次清空為 null.
 * 為了維持 verification 的有效性，
 * [當database中有token,code,reset等資訊時，不再更新。]
 */
AuthService.prototype.findOrCreateVerification = async function (type, account, expireTimeLimit = false) {
  if (type !== 'email' && type !== 'phone') {
    var err = new Error('invalid verification type, [email, phone] are available types')
    err.status = 404
    throw err
  }

  var date = new Date()
  var reset = expireTimeLimit ? date.setMinutes(date.getMinutes() + expirationMins) : null

  /**
   * TODO: [authRepo.findOrCreateVerification...]
   * 透過 type, account 找到用戶的 [region,uid] 來建立 verification 是比較好的作法。
   * 
   * TODO: 請善用 findOrCreateVerification 第三個欄位: selectedFields
   */
  const partialUserData = await this.authRepo.findOrCreateVerification(type, account, reset)

  return {
    region: partialUserData.region,
    uid: partialUserData.uid,
    type,
    account,
    /**
     * [NOTE] content 會在 notification-service 才組成[真正的email內容]
     * lang: 'zh-tw' 在 sendVerification 時,
     * notificationService(透過 redis 發送) 用中文的 template 會變成亂碼
     */
    content: _.omit(partialUserData, ['region', 'uid', 'verificaiton']),
    /**
     * token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域(region)
     *  (Tokyo, Taipei, Sydney ...) 找尋用戶資料了
     * 
     * [NOTE] 以'verify-token'命名是因為你不知道從這個 function 丟出去的結果會走向哪裡，
     * 他很有可能和 session/auth 相關的 token 搞混。因此強制性的命名。
     */
    'verify-token': partialUserData.verificaiton.token,
    // token: partialUserData.verificaiton.token,
    code: partialUserData.verificaiton.code,
    /**
     * for reset password directly (with expiration expiration time: 10 mins)
     */
    reset
  }

  // return {
  //   type,
  //   account,
  //   content: {
  //     region: 'tw',
      
  //    /**
  //      * [NOTE] content 會在 notification-service 才組成[真正的email內容]
  //      * lang: 'zh-tw' 在 sendVerification 時,
  //      * notificationService(透過 redis 發送) 用中文的 template 會變成亂碼
  //      */
  //     lang: 'en',
  //     givenName: 'terrence',
  //     familyName: 'chao',
  //     gender: 'male',
  //   },
  //   /**
  //    * token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域(region)
  //    *  (Tokyo, Taipei, Sydney ...) 找尋用戶資料了
  //    */
  //   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  //   code: '539288',
  //   /**
  //    * for reset password directly (with expiration expiration time: 10 mins)
  //    */
  //   reset
  // }
}

/**
 * 輸入參數 verifyInfo 有兩種：
 * 1. [verifyInfo={token:xxxx,code:123456}] token & code
 * 2. [verifyInfo={token:xxxx,reset:1565022954420}] token & reset (reset 具時效性)
 * [這裡屬於第一種]
 * token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域(region)
 *  (Tokyo, Taipei, Sydney ...) 找尋用戶資料了
 */
AuthService.prototype.getVerifiedUser = async function (verifyInfo) {
  const { token, code } = verifyInfo
  var userInfo = await this.authRepo.getVerifyingUserByCode(token, code)
  if (userInfo == null) {
    return false
  }

  userInfo.verificaiton = null

  const AUTH = 1
  return Promise.all([
      this.authRepo.deleteVerification(userInfo),
      this.createSession({
        region: userInfo.region,
        uid: userInfo.uid,
        email: userInfo.email,
      })
    ])
    .then((result) => {
      console.log(`\nuserInfo.auth`, result[AUTH], `\n`)
      userInfo.auth = result[AUTH]
      return userInfo
    })

  // return {
  //   region: 'tw',
  //   lang: 'zh-tw',
  //   uid: '345b1c4c-128c-4286-8431-78d16d285f38',
  //   email: 'terrence@gmail.com',
  //   profileLink: '5678iolf-tw',
  //   profilePic: '/ftyuil5678ijk/78iokkl',
  //   givenName: 'terrence',
  //   familyName: 'chao',
  //   gender: 'male',
  //   birth: '2019-08-01',
  //   auth: { token: `xxxx`, }
  // } || false
}

/**
 * 輸入參數 verifyInfo 有兩種：
 * 1. [verifyInfo={token:xxxx,code:123456}] token & code
 * 2. [verifyInfo={token:xxxx,reset:1565022954420}] token & reset (reset 具時效性)
 * [這裡屬於第二種]
 * token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域(region)
 *  (Tokyo, Taipei, Sydney ...) 找尋用戶資料了
 */
AuthService.prototype.getVerifiedUserAndResetPassowrd = async function (verifyInfo, newPassword) {
  const { token, reset } = verifyInfo
  var userInfo = await this.authRepo.getVerifyingUserWithValidPeriods(token, reset)
  if (userInfo == null) {
    return false
  }

  /**
   * TODO: [Database.userInfo.verificaiton.reset] 這邊需要檢查是否超過現在的時間:
   * 如果認證逾時的話 (前提是 reset != null), 需要清除驗證資訊 (包括 verify-token, code, reset),
   * 讓使用者能夠再次發[新的驗證資訊]
   */
  var expiredTime = userInfo.verificaiton.reset // Database's record
  if (expiredTime != null && Date.now() > expiredTime) {
    await this.authRepo.deleteVerification(userInfo)
    return false
  } 

  userInfo.verificaiton = null
  await this.resetPassword(userInfo, newPassword)

  
  const AUTH = 1
  return Promise.all([
      this.authRepo.deleteVerification(userInfo),
      this.createSession({
        region: userInfo.region,
        uid: userInfo.uid,
        email: userInfo.email,
      })
    ])
    .then((result) => {
      console.log(`\nuserInfo.auth`, result[AUTH], `\n`)
      userInfo.auth = result[AUTH]
      return userInfo
    })

  // return {
  //   region: 'tw',
  //   lang: 'zh-tw',
  //   uid: '345b1c4c-128c-4286-8431-78d16d285f38',
  //   email: 'terrence@gmail.com',
  //   profileLink: '5678iolf-tw',
  //   profilePic: '/ftyuil5678ijk/78iokkl',
  //   givenName: 'terrence',
  //   familyName: 'chao',
  //   gender: 'male',
  //   birth: '2019-08-01',
  //   auth: { token: `xxxx`, }
  // } || false
}

// /**
//  * [日後做資料庫sharding時可能需要除了uid以外的資訊]
//  * 所以這裡不是只輸入 uid
//  */
// AuthService.prototype.eraseVerification = async function (accountInfo) {
//   return true
// }

/**
 * [日後做資料庫sharding時可能需要除了uid以外的資訊]
 * accountInfo 至少要有 {region, uid}
 * 這裡不是只輸入 uid
 */
AuthService.prototype.resetPassword = async function (accountInfo, newPassword, oldPassword = null) {
  if (oldPassword) {
    // validate old password...
    // throw error if not matched!
  }

  return true
}

/**
 * [日後做資料庫sharding時可能需要除了uid以外的資訊]
 * accountInfo 至少要有 {region, uid}
 * 這裡不是只輸入 uid
 */
AuthService.prototype.createSession = async function (accountInfo) {
  return new Promise(resolve => setTimeout(resolve({
    token: 'cdrty6uijkmnbvcdxcvbnmnbvfghyuiuy656789oikjhgfh',
  }), 2000))
}

/**
 * [日後做資料庫sharding時可能需要除了uid以外的資訊]
 * [accountIdentify] 至少要有 [region,uid,token]
 * 這裡不是只輸入 uid
 */
AuthService.prototype.isLoggedIn = async function (accountIdentify) {
  return true
}

/**
 * [這個function是多餘的]
 * [這個function是多餘的]
 * [這個function是多餘的，只是用來check寄送驗證信和簡訊(by-code-or-reset-password)]
 */
AuthService.prototype.isLoggedInByMock = async function (accountIdentify) {
  return false
}

AuthService.prototype.logout = async function (accountInfo) {
  return true
}


module.exports = {
  authService: new AuthService(authRepo),
  AuthService
}