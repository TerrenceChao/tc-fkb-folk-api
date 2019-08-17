var expirationMins = parseInt(process.env.EXPIRATION_TIME)

function AuthService() {
  console.log(`init ${arguments.callee.name} (template)`)
}

/**
 * [這裡的signupInfo需要前端協助帶上region(於前端註冊時的所在地)]
 * region!region!region!region!region!region!
 * [建立好資料後需要建立session資訊]
 * create session info!!!!
 */
AuthService.prototype.signup = async function (signupInfo) {
  // create record in account 

  // var err = new Error(`AuthService causes error!`)
  // err.status = 501
  // throw err

  var auth = await this.createSession({
    region: 'tw',
    uid: '4bfd676f-ce80-404d-82db-4642a6543c09',
    email: 'terrence@gmail.com',
  })

  return {
    region: 'tw',
    lang: 'zh-tw',
    uid: '4bfd676f-ce80-404d-82db-4642a6543c09',
    email: 'terrence@gmail.com',
    phone: '+886-987-654-321', // (private)
    givenName: 'terrence',
    familyName: 'chao',
    gender: 'male',
    birth: '2019-08-01',
    auth
  }
}

/**
 * if user valid,
 * 1. create session info !!!!!!
 * 2. return user info
 */
AuthService.prototype.login = async function (emailAccount, password) {

  // var err = new Error(`AuthService causes error!`)
  // err.status = 501
  // throw err

  var uid = '4bfd676f-ce80-404d-82db-4642a6543c09'

  var auth = await this.createSession({
    region: 'tw',
    uid: '4bfd676f-ce80-404d-82db-4642a6543c09',
    email: 'terrence@gmail.com',
  })
  
  return {
    region: 'tw',
    lang: 'zh-tw',
    uid: '4bfd676f-ce80-404d-82db-4642a6543c09',
    email: 'terrence@gmail.com',
    givenName: 'terrence',
    familyName: 'chao',
    gender: 'male',
    birth: '2019-08-01',
    auth
  }
}

AuthService.prototype.searchAccount = async function (type, account) {
  if (type === 'email') {
    return 'terrence@gmail.com'
  } else if (type === 'phone') {
    return '+886-987-654-321'
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
AuthService.prototype.createVerification = async function (type, account) {
  if (type !== 'email' && type !== 'phone') {
    var err = new Error('invalid verification type, [email, phone] are available types')
    err.status = 404
    throw err
  }

  var date = new Date()
  var reset = date.setMinutes(date.getMinutes() + expirationMins)

  return {
    type,
    account,
    content: {
      region: 'tw',
      
      /**
       * lang: 'zh-tw' 在 sendVerification 時,
       * notificationService(透過 redis 發送) 用中文的 template 會變成亂碼:
       * path: src/application/notification/content/sms/template.js
       */
      lang: 'en',
      givenName: 'terrence',
      familyName: 'chao',
      gender: 'male',
    },
    /**
     * token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域
     *  (Tokyo, Taiwan, Sydney ...) 找尋用戶資料了
     */
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    code: '539288',
    /**
     * for reset password directly (with expiration expiration time: 10 mins)
     */
    reset
  }
}

/**
 * 輸入參數 verificaiton 有兩種：
 * 1. [verificaiton={token:xxxx,code:123456}] token & code
 * 2. [verificaiton={token:xxxx,reset:1565022954420}] token & reset (reset 具時效性)
 * token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域
 *  (Tokyo, Taiwan, Sydney ...) 找尋用戶資料了
 */
AuthService.prototype.validateVerification = async function (verificaiton) {
  return {
    region: 'tw',
    lang: 'zh-tw',
    uid: '4bfd676f-ce80-404d-82db-4642a6543c09',
    email: 'terrence@gmail.com',
    givenName: 'terrence',
    familyName: 'chao',
    gender: 'male',
    birth: '2019-08-01'
  }
}

/**
 * [日後做資料庫sharding時可能需要除了uid以外的資訊]
 * 所以這裡不是只輸入 uid
 */
AuthService.prototype.deleteVerification = async function (accountInfo) {
  return true
}

/**
 * [日後做資料庫sharding時可能需要除了uid以外的資訊]
 * accountInfo 至少要有 {region, uid}
 * 這裡不是只輸入 uid
 */
AuthService.prototype.resetPassword = async function (accountInfo, password) {
  return true
}

/**
 * [日後做資料庫sharding時可能需要除了uid以外的資訊]
 * accountInfo 至少要有 {region, uid}
 * 這裡不是只輸入 uid
 */
AuthService.prototype.validatePassword = async function (accountInfo, password) {
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


module.exports = new AuthService()