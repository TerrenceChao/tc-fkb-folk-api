var _ = require('lodash')
const EXCHANGES = require('../../../../application/notification/_properties/constant').EXCHANGES
const CONSTANT = require('../../../../domain/folk/user/_properties/constant')
var notificationService = require('../../../../application/notification/notificationService')
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

exports.updateUserInfo = async (req, res, next) => {
  var accountInfo = req.params,
    userInfo = req.body
  res.locals.data = op.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(settingService.updateUserInfo(accountInfo, userInfo))
    .then(userInfo => res.locals.data = _.assignIn(res.locals.data, userInfo))
    // .then(() => friendService.list())???
    .then(() => notificationService.emitEvent('friend', {
      requestEvent: CONSTANT.SETTING_EVENT_UPDATE_PUBLIC_INFO,
      exchanges: EXCHANGES.PUSH,
      // receivers: [accountInfo, targetAccountInfo],
      data: {
        // 
      }
    }))
    .then(() => next())
    .catch(err => next(err))
}