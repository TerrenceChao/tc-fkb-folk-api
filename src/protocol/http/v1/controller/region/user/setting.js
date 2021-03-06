var _ = require('lodash')
const {
  CATEGORIES,
  CHANNELS
} = require('../../../../../../application/notification/_properties/constant')
const CONSTANT = require('../../../../../../domain/folk/user/_properties/constant')
var notificationService = require('../../../../../../application/notification/_services/_notificationService')
var circleService = require('../../../../../../domain/circle/_services/_circleService')
var { settingService } = require('../../../../../../domain/folk/user/_services/settingService')
var { friendService } = require('../../../../../../domain/circle/_services/friendService')
var util = require('../../../../../../property/util')

const PERSONAL_UPDATE_CHANNELS = CONSTANT.MESSAGING_USER_INFO_REPLICATE === true ? [CHANNELS.INTERNAL_SEARCH, CHANNELS.WEB_PUSH] : [CHANNELS.INTERNAL_SEARCH]

exports.getUserInfo = async (req, res, next) => {
  var owner = req.params
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(settingService.getUserInfo(owner))
    .then(userInfo => (res.locals.data = userInfo))
    .then(() => next())
    .catch(err => next(err))
}

/**
 * TODO: 跨區域的通知朋友是跑不掉的
 */
exports.updateUserInfo = async (req, res, next) => {
  var seq = req.headers.seq
  var account = req.params
  var userInfo = _.assign(req.body, account)
  var message = {
    sender: account,
    packet: {
      event: CONSTANT.SETTING_EVENT_UPDATE_PUBLIC_INFO,
      content: _.pick(userInfo, CONSTANT.USER_PUBLIC_INFO)
    }
  }
  var personalUpdation = {
    // registerRegion: account.region,
    category: CATEGORIES.PERSONAL,
    channels: PERSONAL_UPDATE_CHANNELS,
    receivers: [account]
  }
  var updateRecordOfFriend = {
    // registerRegion: account.region,
    category: CATEGORIES.FRIEND_EVENT,
    channels: CHANNELS.PUSH
  }
  var extra = { seq }
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(settingService.updateUserInfo(account, userInfo))
    .then(updated => updated === true ? (res.locals.data = _.assign(res.locals.data, userInfo)) : Promise.reject(new Error('Update user info fail')))
    .then(() => friendService.updatePublicInfo(account, userInfo))
    .then(() => notificationService.emitEvent(_.assign(message, personalUpdation), extra))
    .then(() => circleService.handleNotifyAllFriendsActivity(friendService, notificationService, account, _.assign(message, updateRecordOfFriend), extra))
    .then(() => next())
    .catch(err => next(err))
}

exports.getUserContact = async (req, res, next) => {
  var owner = req.params
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(settingService.getUserContact(owner))
    .then(userContact => (res.locals.data = userContact))
    .then(() => next())
    .catch(err => next(err))
}

exports.updateUserContact = async (req, res, next) => {
  var account = req.params
  var userContact = _.assign(req.body, account)

  Promise.resolve(settingService.updateUserContact(account, userContact))
    .then(updated => updated === true ? (res.locals.data = userContact) : Promise.reject(new Error('Update user contact fail')))
    .then(() => next())
    .catch(err => next(err))
}
