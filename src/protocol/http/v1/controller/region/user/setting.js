var _ = require('lodash')
const {
  CATEGORIES,
  CHANNELS
} = require('../../../../../../application/notification/_properties/constant')
const CONSTANT = require('../../../../../../domain/folk/user/_properties/constant')
var notificationService = require('../../../../../../application/notification/_services/_notificationService')
var circleService = require('../../../../../../domain/circle/_services/_circleService')
var { settingService } = require('../../../../../../domain/folk/user/_services/settingServiceTemp')
var { friendService } = require('../../../../../../domain/circle/_services/friendServiceTemp')
var util = require('../../../../../../property/util')

exports.getUserInfo = async (req, res, next) => {
  var owner = req.params
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(settingService.getUserInfo(owner))
    .then(userInfo => (res.locals.data = _.assignIn(res.locals.data, userInfo)))
    .then(() => next())
    .catch(err => next(err))
}

/**
 * TODO: 跨區域的通知朋友是跑不掉的
 */
exports.updateUserInfo = async (req, res, next) => {
  var accountInfo = req.params
  var userInfo = _.assignIn(req.body, accountInfo)
  var message = {
    sender: accountInfo,
    packet: {
      event: CONSTANT.SETTING_EVENT_UPDATE_PUBLIC_INFO,
      content: _.pick(userInfo, CONSTANT.PUBLIC_USER_INFO)
    }
  }
  var updateSearchQuery = {
    // registerRegion: accountInfo.region,
    category: CATEGORIES.PERSONAL,
    channels: [CHANNELS.INTERNAL_SEARCH],
    receivers: [accountInfo]
  }
  var notifyFriend = {
    // registerRegion: accountInfo.region,
    category: CATEGORIES.FRIEND_EVENT,
    channels: CHANNELS.PUSH
  }
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(settingService.updateUserInfo(accountInfo, userInfo))
    .then(updated => updated === true ? (res.locals.data = _.assignIn(res.locals.data, userInfo)) : Promise.reject(new Error('Update user info fail')))
    .then(() => notificationService.emitEvent(_.assignIn(message, updateSearchQuery)))
    .then(() => circleService.handleNotifyAllFriendsActivity(friendService, notificationService, accountInfo, _.assignIn(message, notifyFriend)))
    .then(() => next())
    .catch(err => next(err))
}
