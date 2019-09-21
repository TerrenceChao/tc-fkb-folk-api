const CIRCILE_CONST = require('../../domain/circle/_properties/constant')

var _ = require('lodash')
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
 * B. 以發送類型的角度，區分 email, SMS, app-push, web-push
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
NotificationService.prototype.emitVerification = function (verifyInfo) {
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

/**
 * TODO: [尚未考慮跨區域情境]
 * 不同區域的分開處理
 * 1. same region  => notification-api
 * 2. corss region => dispatch-api
 */
NotificationService.prototype.emitInvitation = function (invitation) {
  const RECEIVERS = {
    [CIRCILE_CONST.INVITE_EVENT_FRIEND_INVITE]: 'recipient',
    [CIRCILE_CONST.INVITE_EVENT_FRIEND_REPLY]: 'inviter',
  }

  const userId = invitation[RECEIVERS[invitation.header.inviteEvent]].uid
  redisEmitter.publish(userId, invitation)
}

/**
 * TODO: [尚未考慮跨區域情境]
 * packet = { requestEvent, receivers, exchanges, data }
 * 不同區域的分開處理
 * 1. same region  => notification-api
 * 2. corss region => dispatch-api
 */
NotificationService.prototype.emitEvent = function (event, packet) {
  console.log(`\n=================\nevent: ${event}\n`)
  console.log(`packet: ${JSON.stringify(packet, null, 2)}\n=================\n`)
}

NotificationService.prototype.quit = function (accountInfo) {

}

module.exports = new NotificationService()