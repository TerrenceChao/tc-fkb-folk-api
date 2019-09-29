var _ = require('lodash')
var {
  request,
  cbRequest
} = require('../_properties/util')

const {
  CATEGORIES,
  CHANNELS
} = require('../_properties/constant')
const USER_CONST = require('../../../domain/folk/user/_properties/constant')
const CIRCILE_CONST = require('../../../domain/circle/_properties/constant')
const ACCOUT_IDENTITY = require('../../../domain/folk/user/_properties/constant').ACCOUT_IDENTITY
var redisEmitter = require('../../../../infrastructure/notification/RedisEmitter')
var format = require('../_properties/content/format')
var EmailTemplate = require('../_properties/content/email/template')
var SMSTemplate = require('../_properties/content/sms/template')

const TEMPLATES = {
  email: EmailTemplate,
  phone: SMSTemplate
}
const CHANNEL_TYPES = {
  email: 'email',
  phone: 'sms'
}

const SENDERS = {
  [CIRCILE_CONST.INVITE_EVENT_FRIEND_INVITE]: 'inviter',
  [CIRCILE_CONST.INVITE_EVENT_FRIEND_REPLY]: 'recipient',
}
const RECEIVERS = {
  [CIRCILE_CONST.INVITE_EVENT_FRIEND_INVITE]: 'recipient',
  [CIRCILE_CONST.INVITE_EVENT_FRIEND_REPLY]: 'inviter',
}


function NotificationService() {}

NotificationService.prototype.register = function (userInfo) {
  cbRequest(`first-time-to-register-search-engine`, {
    category: CATEGORIES.PERSONAL,
    channels: [CHANNELS.INTERNAL_SEARCH],
    sender: null,
    receivers: [userInfo],
    content: {
      event: USER_CONST.SETTING_EVENT_UPDATE_PUBLIC_INFO,
      data: _.pick(userInfo, USER_CONST.SEARCH_QUERY_RANGE),
    }
  }, this.init, userInfo)
}

/**
 * notify:
 * A. 以 client 端的角度來看，又區分為線上線下
 * 線上：會 pop-up 至 client 端. 用戶明顯感受到被通知
 * 線下：client 端背景做了一些資料更新，用戶不知道
 * 
 * B. 以發送類型的角度，區分 email, SMS, app-push, web-push
 */
NotificationService.prototype.init = function (userInfo) {
  const uid = userInfo.uid
  const msg = `pub/sub mechanism for user: ${uid} is created`
  // TODO: something...

  return {
    msg,
    code: '10000'
  }
}

/**
 * notifyInfo.type = [email, phone]
 * notifyInfo.to = [terrence@gmail.com, +886-987-654-321]
 * notifyInfo.content = [根據lang翻譯過後的內容]
 * TODO:
 * requset: {
 *  category: personal,
 *  channels: [SMS]/[email],
 *  sender: null,
 *  receivers: [
 *   { email: xxxx@mail.com/phone: +886-0987-xxx-xxx }
 *  ],
 *  content: {...}
 * }
 */
NotificationService.prototype.emitVerification = function (verifyInfo) {
  const type = verifyInfo.type
  const lang = verifyInfo.content.lang

  notifyInfo = format.byVerifyInfo(verifyInfo)
  notifyInfo.content = TEMPLATES[type].getVerifyContent(notifyInfo.content, lang)

  // send email/SMS to user .... it tests by redis. (notifyInfo.type/to/content)
  // redisEmitter.publish(notifyInfo.to, notifyInfo.content)

  request(USER_CONST.ACCOUNT_EVENT_VALIDATE_ACCOUNT, {
    category: CATEGORIES.PERSONAL,
    channels: [CHANNEL_TYPES[type]],
    sender: null,
    receivers: [{[type]: notifyInfo.to}],
    content: {
      event: USER_CONST.ACCOUNT_EVENT_VALIDATE_ACCOUNT,
      data: notifyInfo.content,
    }
  })
}

/**
 * TODO: [尚未考慮跨區域情境]
 * 不同區域的分開處理
 * 1. same region  => notification-api
 * 2. corss region => dispatch-api
 */
NotificationService.prototype.emitFriendInvitation = function (invitation) {
  const inviteEvent = invitation.header.inviteEvent
  const sender = _.pick(invitation[SENDERS[inviteEvent]], ACCOUT_IDENTITY)
  const receiver = _.pick(invitation[RECEIVERS[inviteEvent]], ACCOUT_IDENTITY)
  
  request(inviteEvent, {
    category: CATEGORIES.INVITE_EVENT_FRIEND,
    channels: CHANNELS.PUSH,
    sender,
    receivers: [receiver],
    content: {
      event: inviteEvent,
      data: invitation
    }
  })
}

/**
 * TODO: [尚未考慮跨區域情境]
 * packet = { category, channels, sender, receivers, content }
 * 不同區域的分開處理
 * 1. same region  => notification-api
 * 2. corss region => dispatch-api
 *  TODO:
 *  request: {
 *   category: xxxx,
 *   channels: xxxx/[...],
 *   sender: { region: xxx, uid: xxx },
 *   receivers: [
 *     { region: xxx, uid: xxx },
 *     { region: xxx, uid: xxx },
 *     ...
 *  ],
 *   content: {...}
 *  }
 */
NotificationService.prototype.emitEvent = function (packet) {
  request(packet.content.event, packet)
}

NotificationService.prototype.quit = function (accountInfo) {

}

module.exports = new NotificationService()