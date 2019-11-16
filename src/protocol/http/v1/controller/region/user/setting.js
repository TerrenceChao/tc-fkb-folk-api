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
  var account = req.params
  var userInfo = _.assign(req.body, account)
  var message = {
    sender: account,
    packet: {
      event: CONSTANT.SETTING_EVENT_UPDATE_PUBLIC_INFO,
      content: _.pick(userInfo, CONSTANT.USER_PUBLIC_INFO)
    }
  }
  var updateSearchQuery = {
    // registerRegion: account.region,
    category: CATEGORIES.PERSONAL,
    channels: [CHANNELS.INTERNAL_SEARCH],
    receivers: [account]
  }
  var notifyFriend = {
    // registerRegion: account.region,
    category: CATEGORIES.FRIEND_EVENT,
    channels: CHANNELS.PUSH
  }
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(settingService.updateUserInfo(account, userInfo))
    .then(updated => updated === true ? (res.locals.data = _.assign(res.locals.data, userInfo)) : Promise.reject(new Error('Update user info fail')))
    .then(() => notificationService.emitEvent(_.assign(message, updateSearchQuery)))
    .then(() => circleService.handleNotifyAllFriendsActivity(friendService, notificationService, account, _.assign(message, notifyFriend)))
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
