var express = require('express')
var router = express.Router()
var userReq = require('../../protocol/http/request/user/userReq')
var circleReq = require('../../protocol/http/request/circle/circleReq')
var auth = require('../../protocol/http/v1/controller/region/user/auth')
var profile = require('../../protocol/http/v1/controller/region/user/profile')
var setting = require('../../protocol/http/v1/controller/region/user/setting')
var userRes = require('../../protocol/http/response/user/userRes')
var generalRes = require('../../protocol/http/response/generalRes')

/* GET user listing. */
router.get('/', function (req, res, next) {
  res.send('respond with user resource')
})

// auth

/**
 * 在 database [建立]新用戶資並寄送驗證信件
 */
router.post('/signup',
  userReq.registerInfoValidator,
  userReq.userInfoValidator,
  userReq.newPasswordValidator,
  auth.signup, // create user & send registration email
  userRes.signupSuccess
  /**
   * options to the landing page:
   * 1. front-end pop-up dialog to enter [verify-code] in the registration email,
   * 2. click [verify-link] from the registration email.
   */
)

/**
 * options to the landing page:
 * 1. 註冊後需要透過驗證信中的[verify-code]登入主畫面,
 * 2. 或是透過驗證信中點擊[verify-link]轉到主畫面.
 *
 * 雖然只能作用一次，但同樣的 url 不會使後端資源造成不同的結果 (都是清除驗證資訊，建立session) [idempotent]
 */
router.put('/newborn/code/:token',
  userReq.verificationValidator,
  auth.authorized, // 確認後刪除 registration info (token/code)
  generalRes.success
  // front-end redirect to landing page
)

router.post('/login',
  userReq.accountValidator,
  circleReq.queryListValidator,
  auth.login,
  generalRes.createdSuccess
)

/**
 * for those users who forget their login account
 * type = email/phone,
 * account = 'xxx@gmail.com/+886987654321'
 * [將來帳戶的資料庫sharding時得做額外處理]
 */
router.get('/search',
  userReq.accountValidator,
  auth.searchAccount,
  generalRes.success
)

/**
 * for those users who forget their social account (facebook/google)
 * account = 'xxx@gmail.com'
 * X) don't do this in this stage.....
 * [將來帳戶的資料庫sharding時得做額外處理]
 */
router.get('/search/social',
  userReq.accountValidator,
  auth.searchSocialAccount,
  generalRes.success
)

/**
 * send verify info (through email or sms)
 * 在驗證資訊尚未被清除前 (驗證時清除)，不論作用幾次結果都相同。[idempotent]
 */
router.put('/verification/send',
  userReq.accountValidator,
  auth.sendVerifyInfo,
  userRes.sendVerifySuccess
)

/**
 * 當透過[驗證碼]登入時，['/verification/code/:token', '/:uid/:region/password/reset']是一組的：
 * 1. ['/verification/code/:token']
 * 2. ['/password/reset'] (已透過 step 1 登入)
 * 雖然只能作用一次，但同樣的 url 不會使後端資源造成不同的結果 (都是清除驗證資訊，建立session) [idempotent]
 */
router.put('/verification/code/:token',
  userReq.verificationValidator,
  auth.checkVerificationWithCode, // 確認後刪除 verification info (token/code)
  generalRes.success
  // front-end redirect to landing page
)

/**
 * 當透過[驗證碼]登入時，['/verification/code/:token', '/:uid/:region/password/reset']是一組的：
 * 1. ['/verification/code/:token']
 * 2. ['/password/reset'] (已透過 step 1 登入)
 *
 * 如果用戶在前端要回到上一頁？
 * 沒辦法了，因為 [checkVerificationWithCode] 階段已經刪除 token/code, 無法回上一頁
 * session info (sessionID/cookie) has registered after [POST]:'/verification/code/:token'
 */
router.put('/:uid/:region/password/reset',
  userReq.accountIdentifyValidator,
  userReq.newPasswordValidator, // 檢查兩次輸入的新密碼是否相同
  auth.isLoggedIn, // 已登入狀態 => validate session info by uid (req.params.uid)
  auth.resetPassword, // 直接變更新密碼
  generalRes.success
  // front-end redirect to landing page
)

/**
 * 當透過[重設密碼]登入時，只會進行以下一個步驟：
 * check by reset password
 * 雖然只能作用一次，但同樣的 url 不會使後端資源造成不同的結果 (都是清除驗證資訊，建立session) [idempotent]
 */
router.put('/verification/password/:token/:expire',
  userReq.verificationValidator,
  userReq.newPasswordValidator, // 檢查兩次輸入的新密碼是否相同
  auth.checkVerificationWithPassword, /** 檢查 verify token 後，直接變更新密碼，然後刪除 verification info (token/code) */
  generalRes.success
  // front-end redirect to landing page
)

router.get('/:uid/:region/logout',
  userReq.accountIdentifyValidator,
  auth.isLoggedIn, // validate session info by uid (req.params.uid)
  auth.logout,
  generalRes.success
)

// -------------------------------------------------------------

// profile (get someone's profile, not only userself)
router.get('/:uid/:region/profile',
  userReq.accountIdentifyValidator,
  userReq.visitorAccountValidator,
  auth.isLoggedIn, // validate session info by uid (req.params.uid)
  profile.getHeader,
  generalRes.success
)

// setting
router.get('/:uid/:region/setting/info',
  userReq.accountIdentifyValidator,
  auth.isLoggedIn, // validate session info by uid (req.params.uid)
  setting.getUserInfo,
  generalRes.success
)

router.put('/:uid/:region/setting/info',
  userReq.accountIdentifyValidator,
  userReq.userInfoValidator,
  auth.isLoggedIn, // validate session info by uid (req.params.uid)
  setting.updateUserInfo,
  generalRes.success
)

router.get('/:uid/:region/setting/contact',
  userReq.accountIdentifyValidator,
  auth.isLoggedIn, // validate session info by uid (req.params.uid)
  setting.getUserContact,
  generalRes.success
)

router.put('/:uid/:region/setting/contact',
  userReq.accountIdentifyValidator,
  auth.isLoggedIn, // validate session info by uid (req.params.uid)
  setting.updateUserContact,
  generalRes.success
)

router.put('/:uid/:region/setting/password',
  userReq.accountIdentifyValidator,
  userReq.passwordValidator,
  userReq.newPasswordValidator, // 檢查兩次輸入的新密碼是否相同
  auth.isLoggedIn, // 已登入狀態 => validate session info by uid (req.params.uid)
  auth.resetPassword, // 先檢查舊密碼是否正確, 再變更新密碼
  generalRes.success
)

module.exports = router
