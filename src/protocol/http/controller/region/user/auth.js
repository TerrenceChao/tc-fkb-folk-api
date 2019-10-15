var _ = require('lodash')
var messageService = require('../../../../../application/message/_services/_messageService')
var notificationService = require('../../../../../application/notification/_services/_notificationService')
var userService = require('../../../../../domain/folk/user/_services/_userService')
var { authService } = require('../../../../../domain/folk/user/_services/authServiceTemp')
var { friendService } = require('../../../../../domain/circle/_services/friendServiceTemp')
var httpHandler = require('../../../../../library/httpHandler')
var util = require('../../../../../property/util')


/**
 * 除了在資料庫建立用戶資訊外，另外需要寄送驗證信件給用戶，以便確認身份。
 */
exports.signup = async (req, res, next) => {
  res.locals.data = util.customizedDefault(res.locals.data)

  Promise.resolve(authService.signup(req.body))
    .then(verification => Promise.all([
      res.locals.data = httpHandler.genRegistrationInfo(req, verification),
      notificationService.emitRegistration(verification)
    ]))
    .then(() => next())
    .catch(err => next(err))
}

/**
 * 用戶第一次註冊後的授權程序。
 * 除了沒有朋友以外，其他流程與[checkVerificationWithCode]無異。
 */
exports.authorized = async (req, res, next) => {
  var clientuseragent = req.headers.clientuseragent
  res.locals.data = util.customizedDefault(res.locals.data)

  Promise.resolve(httpHandler.parseReqInFields(req, ['token', 'code']))
    .then(verifyInfo => authService.getVerifiedUser(verifyInfo))
    .then(userInfo => Promise.all([
      userService.getPersonalInfo(userInfo),
      messageService.authenticate(_.assignIn(userInfo, { clientuseragent })),
      notificationService.register(_.omit(userInfo, ['auth'])),
    ]))
    .then(serviceInfoList => res.locals.data = userService.packetRegisterInfo(serviceInfoList))
    .then(() => next())
    .catch(err => next(err))
}


/**
 * login 時，
 * 1. 預設取得所有朋友的資訊 (朋友清單)，
 *  只是每個朋友只帶回最少量可供顯示的訊息
 * 2. 取得 message service 驗證資訊
 * 3. 建立 notification service 的消息通知機制
 */
exports.login = async (req, res, next) => {
  var clientuseragent = req.headers.clientuseragent
  var { friendLimit, friendSkip } = req.query
  var { email, password } = req.body  // password is encrypted 
  res.locals.data = util.customizedDefault(res.locals.data)

  Promise.resolve(authService.login(email, password)) // authService.login create session info
    .then(userInfo => Promise.all([ // *** 等三項服務的速度會太慢嗎？有必要拆開？
      userService.getPersonalInfo(userInfo),
      messageService.authenticate(_.assignIn(userInfo, { clientuseragent })),
      notificationService.init(userInfo),
      friendService.list(userInfo, friendLimit, friendSkip),
    ]))
    .then(serviceInfoList => res.locals.data = userService.packetRegisterInfo(serviceInfoList))
    .then(() => next())
    .catch(err => next(err))
}

/**
 * http method GET
 * for those users who forget their login account (search email OR phone)
 */
exports.searchAccount = async (req, res, next) => {
  var data = {
    type,
    account // 半殘的片段帳戶資訊, ex: terrence
  } = res.locals.data = req.query

  try {
    // 完整的帳戶資訊, ex: terrence.chao@gmail.com
    data.account = await authService.searchAccount(type, account)
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * http method GET
 * for those users who forget their social media account (facebook/google)
 */
exports.searchSocialAccount = async (req, res, next) => {
  // X) don't do this in this stage.....
  next(new Error('API causes errors. No social account'))
}

/**
 * http method PUT ([PUT]:'server-host/api/v1/user/verification)
 * 發送的前提是，你已經知道 account 了 (email OR phone), 所以
 * 發送 verifyInfo 時會伴隨著 email/phone 資訊 (寄信或發簡訊)，並且
 * 回應 token 資訊給前端。
 * [檢查是否有驗證資訊了？沒有才建立新的！findOrCreateVerification]
 * 
 * 這裡用 PUT 的原因是，若尚未有 verify code/token 的話才會產生新的 code/token,
 * 若已經有的話則不更新。(在第一次驗證成功後，這樣的資訊在 DB 中會保持為 null)
 * 
 * token 在這裡的用途是為了製造一個臨時的 verify-link. 一旦用戶身份驗證成功，
 * 這個 verify-link 將會失效。
 * 
 * for those users who forget their login account || password.
 * At here:
 * A. forget login account:
 *  1. seatch user's account (fuzzy search)
 *  2. create verify token & code with same email/phone in DB
 *  3. send 'verify info' (by email OR sms). The content of 'verify info' including:
 *      a. verify-link => 可有可無
 *      b. verification code (if email OR sms)
 *      c. reset password request (if email)
 *  4. response verify-link to front-end
 * 
 * B. forget password:
 *  1. create verify token & code with same email/phone in DB
 *  2. send 'verify info' (by email OR sms). The content of 'verify info' including:
 *      a. b. c. => the same as above
 *  3. response verify-link to front-end
 * 
 * At front-end, get verify-link to do 'checkVerificationWithCode':
 * ([PUT]:'server-host/api/v1/user/verification/code/:[token]')
 */
exports.sendVerifyInfo = async (req, res, next) => {
  var body = req.body

  Promise.resolve(authService.findOrCreateVerification(body.type, body.account, true))
    .then(verification => Promise.all([
      res.locals.data = httpHandler.genVerifyInfo(req, verification),
      notificationService.emitVerification(verification) // no waiting!! (no await)
    ]))
    .then(() => next())
    .catch(err => next(err))
}

/**
 * http method PUT
 * 從 'sendVerifyInfo' ([PUT]:'server-host/api/v1/user/verification) 以後，
 * front-end 得到了 verify-link ([PUT]:'server-host/api/v1/user/verification/code/:[token]')，
 * 用戶將從 email OR sms 得知 verify code。
 * 只要經過第一次驗證成功後，這樣的 verify-link 就會失效。
 * 
 * [當用戶已登入時，一定要在req帶上region,uid,token...etc等資訊避免重複驗證流程導致錯誤]
 * 
 * At front-end:
 *  1. after 'sendVerifyInfo', get verify-link ([PUT]:'server-host/api/v1/user/verification/code/:[token]')
 *  2. redirect to the [verify-page] for input verify code
 *  3. call verify-link
 * [NOTE]: front-end [verify-page] 也必須隨著 verify-link 失效。用戶回到上一頁會被導向到 landing page
 * 
 * At here:
 *  1. validate user is logged in? leave if yes.
 *  2. check the verify token and code are matched in DB [token/code->sameuser]
 *  3. delete the verify token & code from DB
 *  4. create session info (sessionID/cookie)  ( important! important! important! )
 *  5. response session info & userID to front-end
 * 
 * At front-end:
 *  1. get session info & userID if response status 200.
 *  2. user can choose (or choose not) to reset password. go step 3. if not.
 *  3. redirect to landing page or profile. ( important! important! important! )
 */
exports.checkVerificationWithCode = async (req, res, next) => {
  var clientuseragent = req.headers.clientuseragent
  res.locals.data = util.customizedDefault(res.locals.data)

  Promise.resolve(httpHandler.parseReqInFields(req, ['token', 'code']))
    .then(verifyInfo => authService.getVerifiedUser(verifyInfo))
    .then(userInfo => Promise.all([
      userService.getPersonalInfo(userInfo),
      messageService.authenticate(_.assignIn(userInfo, { clientuseragent })),
      notificationService.init(userInfo),
      friendService.list(userInfo),
    ]))
    .then(serviceInfoList => res.locals.data = userService.packetRegisterInfo(serviceInfoList))
    .then(() => next())
    .catch(err => next(err))
}

/**
 * http method PUT
 * At front-end:
 *  1. user chooses to reset password.
 *  2. call api ([PUT]:'/:[uid]/password/reset')
 * 
 * At here: (session info has created)
 *  1. [update-passowrd] in DB without checking the old one.
 * 
 * At front-end:
 *  1. redirect to landing page or profile. ( important! important! important! )
 */
exports.resetPassword = async (req, res, next) => {
  var accountInfo = _.pick(req.params, ['uid', 'region']),
    newPassword = req.body.newPassword // encrypted

  Promise.resolve(authService.resetPassword(accountInfo, newPassword))
    .then(() => next())
    .catch(err => next(err))
}

/**
 * http method PUT
 * front-end 在執行 'sendVerifyInfo' ([PUT]:'server-host/api/v1/user/verification) 以後，
 * 並不會從 response 中拿到這裡的 verify-link，而是用戶透過點擊信箱內的 [變更密碼] 而導向到 front-end 的
 * 某一個輸入密碼的頁面，其頁面會呼叫這裡的 verify-link：
 * ([PUT]:'server-host/api/v1/user/verification/password/:[token]')。
 * 只要經過第一次驗證成功後，這樣的 verify-link 就會失效。
 * 
 * [當用戶已登入時，一定要在req帶上region,uid,token...etc等資訊避免重複驗證流程導致錯誤]
 * 
 * At front-end:
 *  1. after 'sendVerifyInfo', user get the verify info including 
 *      the link of [變更密碼] (reset password request) from email.
 *  2. user clicks the link and is bringed to [reset-password-page].
 *  3. user keyin new password twice and submit.
 *  4. front-end call verify-link ([PUT]:'server-host/api/v1/user/verification/password/:[token]')
 * [NOTE]: front-end [reset-password-page] 也必須隨著 verify-link 失效。用戶回到上一頁會被導向到 landing page
 * 
 * At here:
 *  1. validate user is logged in? leave if yes.
 *  2. [check-verify-token/reset] in DB. If valid, [update-passowrd] in DB without checking the old one.
 *  3. delete the verify token & code & reset(expiredTime) from DB
 *  4. create session info (sessionID/cookie)  ( important! important! important! )
 *  5. response session info & userID to front-end
 * 
 * At front-end:
 *  1. get session info & userID if response status 200.
 *  2. redirect to landing page or profile. ( important! important! important! )
 */
exports.checkVerificationWithPassword = async (req, res, next) => {
  var clientuseragent = req.headers.clientuseragent,
    newPassword = req.body.password // encrypted
  res.locals.data = util.customizedDefault(res.locals.data)

  Promise.resolve(_.pick(req.params, ['token', 'reset']))
    .then(verifyInfo => authService.getVerifiedUserWithNewAuthorized(verifyInfo, newPassword))
    .then(userInfo => Promise.all([
      userService.getPersonalInfo(userInfo),
      messageService.authenticate(_.assignIn(userInfo, { clientuseragent })),
      notificationService.init(userInfo),
      friendService.list(userInfo),
    ]))
    .then(serviceInfoList => res.locals.data = userService.packetRegisterInfo(serviceInfoList))
    .then(() => next())
    .catch(err => next(err))
}

/**
 * [NOTE] validate session info by region/uid/token
 */
exports.isLoggedIn = async (req, res, next) => {
  Promise.resolve(httpHandler.parseReqInFields(req, ['region', 'uid', 'token']))
    .then(accountIdentify => authService.isLoggedIn(accountIdentify))
    .then(loggedIn => loggedIn === true ? next() : next(new Error(`user is NOT logged in`)))
}

exports.checkThenResetPassword = async (req, res, next) => {
  var accountInfo = _.pick(req.params, ['uid', 'region']),
    oldPassword = req.body.password // encrypted
    newPassword = req.body.newPassword // encrypted

  Promise.resolve(authService.resetPassword(accountInfo, newPassword, oldPassword))
    .then(() => next())
    .catch(err => next(err))
}

/**
 * 直接從 session 刪除用戶紀錄
 */
exports.logout = async (req, res, next) => {
  var accountInfo = req.params

  Promise.all([
      authService.logout(accountInfo),
      messageService.quit(accountInfo),
      notificationService.quit(accountInfo)
    ])
    .then(() => next())
    .catch(err => next(err))
}