var _ = require('lodash')
var notificationService = require('../../../../application/notification/notificationService')
var { settingService } = require('../../../../domain/folk/user/setting/_services/settingServiceTemp')
var { friendService } = require('../../../../domain/circle/friend/friendServiceTemp')
var op = require('../../../../library/objOperator')

exports.getUserInfo = async (req, res, next) => {
  var owner = req.params
  var data = res.locals.data = op.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(settingService.getUserInfo(owner))
    .then(userInfo => data = _.assignIn(data, userInfo))
    .then(() => next())
    .catch(err => next(err))
}

exports.updateUserInfo = async (req, res, next) => {
  var accountInfo = req.params,
    userInfo = req.body
  var data = res.locals.data = op.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(settingService.updateUserInfo(accountInfo, userInfo))
    .then(userInfo => data = _.assignIn(data, userInfo))
    // .then(() => friendService.list())???
    .then(() => notificationService.emitEvent(accountInfo, {
      requestEvent: 'updated_user',
      // receiver: friendList, ???
      data: accountInfo
    }))
    .then(() => next())
    .catch(err => next(err))
}