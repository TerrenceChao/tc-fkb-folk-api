const _ = require('lodash')
const USER_CONST = require('../../../domain/folk/user/_properties/constant')
const ACCOUT_IDENTITY = require('../../../domain/folk/user/_properties/constant').ACCOUT_IDENTITY
const {
  HTTP,
  CATEGORIES,
  CHANNELS,
  SENDERS,
  RECEIVERS,
} = require('../_properties/constant')
var format = require('../_properties/content/format')
var EmailTemplate = require('../_properties/content/email/template')
var SMSTemplate = require('../_properties/content/sms/template')
var redisEmitter = require('../../../../infrastructure/notification/RedisEmitter')
var validAccount = require('../../../domain/folk/user/_properties/util').validAccount
var delay = require('../../../property/util').delay
var util = require('../_properties/util')

const TEMPLATES = {
  email: EmailTemplate,
  phone: SMSTemplate
}
const CHANNEL_TYPES = {
  email: 'email',
  phone: 'sms'
}

/**
 * @param {NotificationService} service 
 * @param {Object} userInfo 
 */
function registerRequest(service, userInfo) {
  return util.syncPublishRequest(`first-time-to-register-search-service`, {
    category: CATEGORIES.PERSONAL,
    channels: [CHANNELS.INTERNAL_SEARCH],
    sender: null,
    receivers: [_.pick(userInfo, USER_CONST.ACCOUT_IDENTITY)],
    packet: {
      event: USER_CONST.SETTING_EVENT_UPDATE_PUBLIC_INFO,
      content: _.pick(userInfo, USER_CONST.PUBLIC_USER_INFO),
    }
  }, service.init, userInfo)
}


function NotificationService() {
  // init test
  util.syncPublishRequest(`connection testing...`, {
    category: CATEGORIES.PERSONAL,
    channels: [CHANNELS.INTERNAL_SEARCH],
    sender: null,
    receivers: [{
      uid: 'test',
      region: 'test'
    }],
    packet: {
      event: 'test',
      content: 'test',
    }
  }, this.init, null)
}

NotificationService.prototype.register = function (userInfo) {
  let timeoutMsg = {
    msgCode: 'xxxxxx',
    error: `connect ECONNREFUSED NOTIFICATION_HOST, timeout: ${HTTP.TIMEOUT}`
  }

  return Promise.race([
    registerRequest(this, userInfo),
    delay(HTTP.TIMEOUT, timeoutMsg)
  ])
    .then(response => response)
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
  if (! validAccount(userInfo)) {
    return userInfo
  }

  const msg = `notify mechanism for user: ${userInfo.uid} is created`
  // TODO: something...

  return {
    msgCode: '100000',
    msg
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
 *  packet: {...}
 * }
 */
NotificationService.prototype.emitVerification = function (verifyInfo) {
  const type = verifyInfo.type
  const lang = verifyInfo.content.lang

  notifyInfo = format.byVerifyInfo(verifyInfo)
  notifyInfo.content = TEMPLATES[type].getVerifyContent(notifyInfo.content, lang)

  // send email/SMS to user .... it tests by redis. (notifyInfo.type/to/content)
  // redisEmitter.publish(notifyInfo.to, notifyInfo.content)

  util.publishRequest(USER_CONST.ACCOUNT_EVENT_VALIDATE_ACCOUNT, {
    category: CATEGORIES.PERSONAL,
    channels: [CHANNEL_TYPES[type]],
    sender: null,
    receivers: [{[type]: notifyInfo.to}],
    packet: {
      event: USER_CONST.ACCOUNT_EVENT_VALIDATE_ACCOUNT,
      content: notifyInfo.content,
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
  
  util.publishRequest(inviteEvent, {
    category: CATEGORIES.INVITE_EVENT_FRIEND,
    channels: CHANNELS.PUSH,
    sender,
    receivers: [receiver],
    packet: {
      event: inviteEvent,
      content: invitation
    }
  })
}

/**
 * TODO: [尚未考慮跨區域情境]
 * message = { category, channels, sender, receivers, packet }
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
 *   packet: {...}
 *  }
 */
NotificationService.prototype.emitEvent = function (message) {
  util.publishRequest(message.packet.event, message)
}

NotificationService.prototype.quit = function (accountInfo) {
  return true
}

module.exports = new NotificationService()