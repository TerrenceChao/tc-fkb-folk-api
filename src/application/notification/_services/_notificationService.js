const _ = require('lodash')
const USER_CONST = require('../../../domain/folk/user/_properties/constant')
const ACCOUT_IDENTITY = require('../../../domain/folk/user/_properties/constant').ACCOUT_IDENTITY
const {
  HTTP,
  CATEGORIES,
  CHANNELS,
  SENDERS,
  RECEIVERS
} = require('../_properties/constant')
var form = require('../_properties/content/format')
var validAccount = require('../../../domain/folk/user/_properties/util').validAccount
var delay = require('../../../property/util').delay
var util = require('../_properties/util')

const CHANNEL_TYPES = {
  email: 'email',
  phone: 'sms'
}

/**
 * @param {NotificationService} service
 * @param {Object} userInfo
 */
function registerRequest (service, userInfo) {
  return util.syncPublishRequest(USER_CONST.ACCOUNT_EVENT_REGISTRATION, {
    category: CATEGORIES.PERSONAL,
    channels: [CHANNELS.INTERNAL_SEARCH],
    sender: null,
    receivers: [_.pick(userInfo, USER_CONST.ACCOUT_IDENTITY)],
    packet: {
      event: USER_CONST.ACCOUNT_EVENT_REGISTRATION,
      content: _.pick(userInfo, USER_CONST.USER_PUBLIC_INFO)
    }
  }, service.init, userInfo)
}

function NotificationService () {
  // init test
  util.syncPublishRequestTest('publish connection testing...', this.init, null)
}

NotificationService.prototype.register = function (userInfo) {
  return Promise.race([
    registerRequest(this, userInfo),
    delay(HTTP.TIMEOUT, HTTP.TIMEOUT_MSG)
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
  if (!validAccount(userInfo)) {
    return userInfo
  }

  const msg = `notify mechanism for user: ${userInfo.uid} is created`
  // TODO: something...

  return {
    msgCode: '100000',
    msg
  }
}

NotificationService.prototype.emitRegistration = function (verification) {
  var notifyInfo = form.genVerifyFormat(verification)

  util.publishRequest(USER_CONST.ACCOUNT_EVENT_REGISTRATION, {
    category: CATEGORIES.PERSONAL,
    channels: [CHANNELS.EMAIL],
    sender: null,
    receivers: [{ email: notifyInfo.to }],
    packet: {
      event: USER_CONST.ACCOUNT_EVENT_REGISTRATION,
      content: notifyInfo.content
    }
  })
}

/**
 * notifyInfo.type = [email, phone]
 * notifyInfo.to = [terrence@gmail.com, +886-987-654-321]
 * notifyInfo.content = [verification.content]
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
NotificationService.prototype.emitVerification = function (verification) {
  const type = verification.type
  var notifyInfo = form.genVerifyFormat(verification)

  // send email/SMS to user .... it tests by redis. (notifyInfo.type/to/content)
  // redisEmitter.publish(notifyInfo.to, notifyInfo.content)

  util.publishRequest(USER_CONST.ACCOUNT_EVENT_VALIDATE_ACCOUNT, {
    category: CATEGORIES.PERSONAL,
    channels: [CHANNEL_TYPES[type]],
    sender: null,
    receivers: [{ [type]: notifyInfo.to }],
    packet: {
      event: USER_CONST.ACCOUNT_EVENT_VALIDATE_ACCOUNT,
      content: notifyInfo.content
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

NotificationService.prototype.quit = function (account) {
  return true
}

module.exports = new NotificationService()
