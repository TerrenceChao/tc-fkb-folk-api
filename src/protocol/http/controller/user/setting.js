var _ = require('lodash')
const {
  CATEGORIES,
  CHANNELS
} = require('../../../../application/notification/_properties/constant')
const CONSTANT = require('../../../../domain/folk/user/_properties/constant')
var notificationService = require('../../../../application/notification/notificationService')
var circleService = require('../../../../domain/circle/_services/circleService')
var { settingService } = require('../../../../domain/folk/user/setting/_services/settingServiceTemp')
var { friendService } = require('../../../../domain/circle/friend/friendServiceTemp')
var op = require('../../../../library/objOperator')

exports.getUserInfo = async (req, res, next) => {
  var owner = req.params
  res.locals.data = op.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(settingService.getUserInfo(owner))
    .then(userInfo => res.locals.data = _.assignIn(res.locals.data, userInfo))
    .then(() => next())
    .catch(err => next(err))
}

/**
 * TODO: 跨區域的通知朋友是跑不掉的
 */
exports.updateUserInfo = async (req, res, next) => {
  var accountInfo = req.params,
    userInfo = req.body,
    packet = {
      // registerRegion: accountInfo.region,
      category: CATEGORIES.FRIEND_EVENT,
      channels: CHANNELS.PUSH,
      sender: accountInfo,
      content: {
        event: CONSTANT.SETTING_EVENT_UPDATE_PUBLIC_INFO,
        data: userInfo
      }
    }
  res.locals.data = op.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(settingService.updateUserInfo(accountInfo, userInfo))
    .then(updated => updated === true ? res.locals.data = _.assignIn(res.locals.data, userInfo) : Promise.reject(new Error(`Update user info fail`)))
    .then(() => circleService.handleNotifyAllFriendsActivity(friendService, notificationService, accountInfo, packet))
    .then(() => next())
    .catch(err => next(err))
}