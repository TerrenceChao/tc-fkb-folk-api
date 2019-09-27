var request = require('request')
var _ = require('lodash')

const {
  CATEGORIES,
  CHANNELS
} = require('./_properties/constant')
const CIRCILE_CONST = require('../../domain/circle/_properties/constant')
const ACCOUT_IDENTITY = require('../../domain/folk/user/_properties/constant').ACCOUT_IDENTITY
var redisEmitter = require('../../../infrastructure/notification/RedisEmitter')
var format = require('./content/format')
var EmailTemplate = require('./content/email/template')
var SMSTemplate = require('./content/sms/template')

const PUBLISH_URL = `${process.env.NOTIFICATION_MQ_HOST}${process.env.NOTIFICATION_MQ_URL_REQUEST_PUBLISH}`

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

/**
 * notify:
 * A. 以 client 端的角度來看，又區分為線上線下
 * 線上：會 pop-up 至 client 端. 用戶明顯感受到被通知
 * 線下：client 端背景做了一些資料更新，用戶不知道
 * 
 * B. 以發送類型的角度，區分 email, SMS, app-push, web-push
 */
NotificationService.prototype.createUserChannel = function (userInfo) {
  const uid = userInfo.uid
  const msg = `pub/sub channel for user:${uid} is created`
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

  // should email/SMS to user .... it tests by redis. (notifyInfo.type/to/content)
  // redisEmitter.publish(notifyInfo.to, notifyInfo.content)

  request(
    { 
      method: 'PUT',
      uri: PUBLISH_URL,
      json: {
        category: CATEGORIES.PERSONAL,
        channels: CHANNEL_TYPES[type],
        sender: null,
        receivers: [notifyInfo.to],
        content: notifyInfo.content
      }
    },
    (error, response, body) => {
      if(!error) {
        console.log(`verification published as ${PUBLISH_URL}`)
      } else {
        console.log(`error: ${error}`)
      }
      // console.log(`response: status: ${response.statusCode}\nbody: ${JSON.stringify(body, null, 2)}`)
    }
  )
}

/**
 * TODO: [尚未考慮跨區域情境]
 * 不同區域的分開處理
 * 1. same region  => notification-api
 * 2. corss region => dispatch-api
 */
NotificationService.prototype.emitFriendInvitation = function (invitation) {
  const sender = _.pick(invitation[SENDERS[invitation.header.inviteEvent]], ACCOUT_IDENTITY)
  const receiver = _.pick(invitation[RECEIVERS[invitation.header.inviteEvent]], ACCOUT_IDENTITY)
  
  request(
    { 
      method: 'PUT',
      uri: PUBLISH_URL,
      json: {
        category: CATEGORIES.INVITE_EVENT_FRIEND,
        channels: CHANNELS.PUSH,
        sender,
        receivers: [receiver],
        content: invitation
      }
    },
    (error, response, body) => {
      if(!error) {
        console.log(`verification published as ${PUBLISH_URL}`)
      } else {
        console.log(`error: ${error}`)
      }
      // console.log(`response: status: ${response.statusCode}\nbody: ${JSON.stringify(body, null, 2)}`)
    }
  )
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
  request(
    { 
      method: 'PUT',
      uri: PUBLISH_URL,
      json: packet
    },
    (error, response, body) => {
      if(!error) {
        console.log(`verification published as ${PUBLISH_URL}`)
      } else {
        console.log(`error: ${error}`)
      }
      // console.log(`response: status: ${response.statusCode}\nbody: ${JSON.stringify(body, null, 2)}`)
    }
  )
}

NotificationService.prototype.quit = function (accountInfo) {

}

module.exports = new NotificationService()