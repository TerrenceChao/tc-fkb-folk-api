const _ = require('lodash')
const config = require('config').auth
const util = require('../_properties/util')
const cache = require('../../../../library/cacheHandler')
const authRepo = require('../_repositories/authRepositoryTemp')

const registerExpiration = config.expire.register
const verifyExpiration = config.expire.verify

function AuthService (authRepo) {
  this.authRepo = authRepo
  console.log(`init ${arguments.callee.name} (template)`)
}

/**
 * [這裡的signupInfo需要前端協助帶上region(於前端註冊時的所在地)]
 * region!region!region!region!region!region!
 */
AuthService.prototype.signup = async function (signupInfo) {
  /**
   * TODO: 註冊程序
   * 1. 建立揮發性資料在 cache (redis): 設定 1 小時之後刪除。(除非已經寫入 DB)
   * 2. 等到 user 輸入 verify code 再真的寫入 DB
   *
   * exe:
   * a. find or create verification (without saving DB).
   *  (當然有可能有其他一樣的帳號: 重複的 email/phone 註冊 (不同人？但尚未認證) 的可能，[覆蓋過去就好]。
   *   若要做到完整需要 FIFO, 不過想想實境似乎不需要，因為用戶不見得知道孰先孰後。
   *   況且[有可能是同一個用戶忘了密碼或個資之類的需要重複填寫註冊資料]。)
   * b. wirte [signupInfo-with-verification] into redis ...
   */
  var date = new Date()
  var expire = date.setMinutes(date.getMinutes() + registerExpiration)
  var verification = util.genVerification(signupInfo, expire, true)
  signupInfo.verificaiton = verification

  // TODO: cache 尚未設定 expire
  // TODO: 用 cache.pipeline() 是錯誤的用法。這裡只是實驗效果。若有錯誤將 crash!!!
  return cache.pipeline()
    .set(verification['verify-token'], Buffer.from(JSON.stringify(signupInfo)))
    .exec((err, results) => {
      if (err) {
        console.error(err)
        throw new Error('signup fail')
      }
    })
    .then(() => _.assign(verification, {
      type: 'email',
      /**
       * TODO: 將調整為 account: { email: signupInfo.emal }. notify-api 需要調整。
       */
      account: signupInfo.email,
      content: _.omit(signupInfo, ['region', 'uid', 'verificaiton'])
    }))
    .catch(err => Promise.reject(err))
}

/**
 * @param {{ token: string, code: string|number }} verifyInfo
 */
AuthService.prototype.createVerifiedUser = async function (verifyInfo) {
  /**
   * TODO: 註冊程序
   * 1. 建立揮發性資料在 cache (redis): 設定 1 小時之後刪除。(除非已經寫入 DB)
   * 2. 等到 user 輸入 verify code 再真的寫入 DB
   *
   * exe:
   * a. read [signupInfo-by-verifyInfo] from redis ...
   * b. write [signupInfo-by-verifyInfo] into DB.
   * c. delete temporary [signupInfo-by-verifyInfo] in redis.
   */
  // TODO: 用 cache.pipeline() 是錯誤的用法。這裡只是實驗效果。若有錯誤將 crash!!!
  return cache.pipeline()
    .getBuffer(verifyInfo.token, (err, buf) => {
      if (err) {
        console.error(err)
        return new Error('invalid token')
      }

      const signupInfo = JSON.parse(buf.toString())
      const verificaiton = signupInfo.verificaiton
      if (verifyInfo.token !== verificaiton['verify-token'] || verifyInfo.code !== verificaiton.code) {
        return new Error('invalid registration')
      }
    })
    .exec()
    .then(async buf => {
      const signupInfo = JSON.parse(buf[0][1].toString())
      signupInfo.verificaiton.token = signupInfo.verificaiton['verify-token']
      delete signupInfo.verificaiton['verify-token']
      var user = await this.authRepo.createAccountUser(signupInfo)
      /**
       * TODO: 記得建立 ＤＢ 記錄以後才能刪除 cache 紀錄
       */
      cache.del(verifyInfo.token)

      return user
    })
    .catch(err => Promise.reject(err))
}

/**
 * if user valid,
 * 1. create session info !!!!!!
 * 2. return user info
 */
AuthService.prototype.login = async function (email, password) {
  // var err = new Error('AuthService causes error!')
  // err.status = 501
  // throw err
  var user = await this.authRepo.getAuthorizedUser(email, password)

  var auth = await this.genAuthorization({
    region: user.region,
    uid: user.uid,
    email: user.email
  })

  return _.assignIn(user, { auth })
}

AuthService.prototype.searchAccountContact = async function (type, account) {
  if (type === 'email' || type === 'phone') {
    return await this.authRepo.getAccountUserByContact(type, account)
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
  var expire = expireTimeLimit ? date.setMinutes(date.getMinutes() + verifyExpiration) : null

  /**
   * TODO: [authRepo.findOrCreateVerification...]
   * 1. 透過 type, account 找到用戶的 [region,uid] 來建立 verification 是比較好的作法。(獨立的 function, 與 repository 無關！！)
   * 2. func 輸入參數已經變更：
   *    findOrCreateVerification = async function (type, account, verification, selectedFields)
   *
   * TODO: [findOrCreateVerification] 這裡將指為單純回傳 table: Accounts & Auths 中的資訊。實際應用時，需要其他業務邏輯結合 table: Users 中的欄位
   *
   * TODO: 請善用 findOrCreateVerification 第三個欄位: selectedFields
   */
  const partialUserData = await this.authRepo.findOrCreateVerification(type, account, expire)

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
    expire
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
  //   expire
  // }
}

/**
 * 輸入參數 verifyInfo 有兩種：
 * 1. [verifyInfo={token:xxxx,code:123456}] token & code
 * 2. [verifyInfo={token:xxxx,expire:1565022954420}] token & expire (expire 具時效性)
 * [這裡屬於第一種]
 * token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域(region)
 *  (Tokyo, Taipei, Sydney ...) 找尋用戶資料了
 */
AuthService.prototype.getVerifiedUser = async function (verifyInfo) {
  const { token, code } = verifyInfo
  const IDX_AUTH = 0

  return Promise.resolve(this.authRepo.getVerifyUserByCode(token, code))
    .then(userInfo => userInfo == null ? Promise.reject(new Error('invalid verification!')) : userInfo)
    .then(userInfo => Promise.all([
      this.genAuthorization({
        region: userInfo.region,
        uid: userInfo.uid,
        email: userInfo.email
      }),
      this.authRepo.deleteVerification(userInfo)
    ])
      .then(result => {
        userInfo.auth = result[IDX_AUTH]
        delete userInfo.verificaiton

        return userInfo
      }))

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
  //   auth: { token: 'xxxx', }
  // } || undefined
}

/**
 * 輸入參數 verifyInfo 有兩種：
 * 1. [verifyInfo={token:xxxx,code:123456}] token & code
 * 2. [verifyInfo={token:xxxx,expire:1565022954420}] token & expire (expire 具時效性)
 * [這裡屬於第二種]
 * token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域(region)
 *  (Tokyo, Taipei, Sydney ...) 找尋用戶資料了
 */
AuthService.prototype.getVerifiedUserWithNewAuthorized = async function (verifyInfo, newPassword) {
  const { token, expire } = verifyInfo
  try {
    var userInfo = await this.authRepo.getVerifyUserWithoutExpired(token, expire)
    if (userInfo == null) {
      throw new Error('invalid verification!')
    }

    /**
     * TODO: [Database.userInfo.verificaiton.expire] 這邊需要檢查是否超過現在的時間:
     * 如果認證逾時的話 (前提是 expire != null), 需要清除驗證資訊 (包括 verify-token, code, expire),
     * 讓使用者能夠再次發[新的驗證資訊]
     */
    var expiredTime = userInfo.verificaiton.expire // Database's record
    if (expiredTime != null && Date.now() > expiredTime) {
      await this.authRepo.deleteVerification(userInfo)
      throw new Error('verification expired!')
    }
  } catch (err) {
    return Promise.reject(err)
  }

  const IDX_AUTH = 0
  return Promise.all([
    this.genAuthorization({
      region: userInfo.region,
      uid: userInfo.uid,
      email: userInfo.email
    }),
    this.refreshAuthentication(userInfo, newPassword)
  ])
    .then((result) => {
      userInfo.auth = result[IDX_AUTH]
      delete userInfo.verificaiton

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
  //   auth: { token: 'xxxx', }
  // } || undefined
}

// /**
//  * [日後做資料庫sharding時可能需要除了uid以外的資訊]
//  * 所以這裡不是只輸入 uid
//  */
// AuthService.prototype.eraseVerification = async function (account) {
//   return true
// }

/**
 * [日後做資料庫sharding時可能需要除了uid以外的資訊]
 * account 至少要有 {region, uid}
 * 這裡不是只輸入 uid
 */
AuthService.prototype.resetPassword = async function (account, newPassword, oldPassword = null) {
  if (oldPassword) {
    // validate old password...
    // throw error if not matched!
  }

  return true
}

/**
 * TODO: 在同一筆紀錄上同時 resset password / delete verification
 * [日後做資料庫sharding時可能需要除了uid以外的資訊]
 * account 至少要有 {region, uid}
 */
AuthService.prototype.refreshAuthentication = async function (account, newPassword, oldPassword = null) {
  // TODO: 在同一筆紀錄上同時 resset password / delete verification
  return Promise.all([
    this.resetPassword(account, newPassword, oldPassword),
    this.authRepo.deleteVerification(account)
  ])
    .then(() => true)
}

/**
 * TODO: [若原本存在舊的session，將會被清除，重新建立一個新的]
 *
 * [日後做資料庫sharding時可能需要除了uid以外的資訊]
 * account 至少要有 {region, uid}
 * 這裡不是只輸入 uid
 */
AuthService.prototype.genAuthorization = function (account) {
  const token = 'cdrty6uijkmnbvcdxcvbnmnbvfghyuiuy656789oikjhgfh'
  account.auth = { token }
  // return new Promise(resolve => setTimeout(resolve({
  //   token
  // }), 2000))
  return account
}

/**
 * [日後做資料庫sharding時可能需要除了uid以外的資訊]
 * [accountIdentify] 至少要有 [region,uid,token]
 * 這裡不是只輸入 uid
 */
AuthService.prototype.isAuthenticated = async function (accountIdentify) {
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

/**
 * TODO:
 * 1. [必定要刪除session資訊]
 * 2. ...
 */
AuthService.prototype.logout = async function (account) {
  return true
}

module.exports = {
  authService: new AuthService(authRepo),
  AuthService
}
