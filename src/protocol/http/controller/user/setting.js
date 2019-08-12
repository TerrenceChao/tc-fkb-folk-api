var _ = require('lodash')
var settingService = require('../../../../domain/folk/user/setting/_services/settingServiceTemp')
var objOperator = require('../../../../library/objOperator')

exports.getUserInfo = async (req, res, next) => {
  var owner = req.params
  var data = res.locals.data = objOperator.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(settingService.getUserInfo(owner))
    .then(userInfo => {
      data = _.assignIn(data, userInfo)
      next()
    })
    .catch(err => next(err))
}

exports.updateUserInfo = async (req, res, next) => {
  var accountInfo = req.params,
    userInfo = req.body
  var data = res.locals.data = objOperator.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(settingService.updateUserInfo(accountInfo, userInfo))
    .then(userInfo => {
      data = _.assignIn(data, userInfo)
      next()
    })
    .catch(err => next(err))
}