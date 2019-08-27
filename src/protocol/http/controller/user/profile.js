var _ = require('lodash')
var userService = require('../../../../domain/folk/user/_services/userService')
var { friendService } = require('../../../../domain/circle/friend/friendServiceTemp')
var { settingService } = require('../../../../domain/folk/user/setting/_services/settingServiceTemp')
var objOperator = require('../../../../library/objOperator')

/**
 * About profile:
 * A. Relation status including friends / strangers / yourself profile
 * 1. you are friends.
 * 1. show state:'invite' if he/she is a stranger. 
 * 2. show state:'invitation has sent' if you has invited he/she.
 * 3. hide state for yourself.
 * 
 * TODO: 
 * B. Assume user has a long long story/history ... batch load.
 */

/**
 * Relation status:
 * 1. friend,
 * 2. stranger,
 * 3. invitation has sent,
 * 4. myself.
 */
exports.getHeader = async (req, res, next) => {
  var ownerAccountInfo = req.params,
    visitorAccountInfo = _.mapKeys(req.query, (value,key) => key.replace('visitor_', ''))
  res.locals.data = objOperator.getDefaultIfUndefined(res.locals.data)

  userService.promiseServicesForProfileHeader(
    { friendService, settingService },
    ownerAccountInfo,
    visitorAccountInfo
  )
    .then(responsData => res.locals.data = userService.packetProfileHeader(responsData))
    .then(() => next())
    .catch(err => next(err))
}