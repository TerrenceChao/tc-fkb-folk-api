var redisEmitter = require('../../../infrastructure/notification/RedisEmitter')
var format = require('./content/format')
var EmailTemplate = require('./content/email/template')
var SMSTemplate = require('./content/sms/template')

function NotificationService() {}

/**
 * notify:
 * A. 以 client 端的角度來看，又區分為線上線下
 * 線上：會 pop-up 至 client 端. 用戶明顯感受到被通知
 * 線下：client 端背景做了一些資料更新，用戶不知道
 * 
 * B. 以發送類型的角度，區分 email, SMS, push app/web
 */
NotificationService.prototype.createUserChannel = function (userInfo) {
  var uid = userInfo.uid
  var msg = `pub/sub channel for user:${uid} is created`
  redisEmitter.publish(uid, msg)
  return {
    msg,
    code: '10000'
  }
}

/**
 * notifyInfo.type = [email, phone]
 * notifyInfo.to = [terrence@gmail.com, +886-987-654-321]
 * notifyInfo.content = [根據lang翻譯過後的內容]
 */
NotificationService.prototype.sendVerification = function (verifyInfo) {
  var type = verifyInfo.type
  var lang = verifyInfo.content.lang

  notifyInfo = format.byVerifyInfo(verifyInfo)
  var template = {
    'email': EmailTemplate,
    'phone': SMSTemplate
  }
  notifyInfo.content = template[type].getVerifyContent(notifyInfo.content, lang)

  // should email/SMS to user .... it tests by redis. (notifyInfo.type/to/content)
  redisEmitter.publish(notifyInfo.to, notifyInfo.content)
}

NotificationService.prototype.sendInvitation = function (invitation) {
  
}

NotificationService.prototype.replyInvitation = function (invitation) {

}

NotificationService.prototype.notify = function (accountInfo, packet) {

}

NotificationService.prototype.quit = function (accountInfo) {

}

module.exports = new NotificationService()