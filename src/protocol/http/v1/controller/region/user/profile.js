var _ = require('lodash')
var userService = require('../../../../../../domain/folk/user/_services/_userService')
var { friendService } = require('../../../../../../domain/circle/_services/friendServiceTemp')
var { settingService } = require('../../../../../../domain/folk/user/_services/settingServiceTemp')
var util = require('../../../../../../property/util')

/**
 * About profile:
 * A. Relation status including friends / strangers / yourself profile
 * 1. hide state for yourself
 * 2. you are friends.
 * 3. show options (Y/n) if you are invited.
 * 4. show state:'invitation has sent' if you invited he/she.
 * 5. show state:'invite' if he/she is a stranger.
 *
 * TODO:
 * B. Assume user has a long long story/history, such as
 *    photos, music, blogs, travels ... separate these parts as [batch-loading].
 */

/**
 * Relation status:
 * 1. user self (type 1)
 * 2. friend (type 2)
 * 3. user is invited (type 3)
 * 4. user invited someone (type 4)
 * 5. stranger
 */
exports.getHeader = async (req, res, next) => {
  var ownerAccount = req.params
  var visitorAccount = _.mapKeys(req.query, (value, key) => _.camelCase(key.replace('visitor', '')))
  res.locals.data = util.init(res.locals.data)

  Promise.all([
    friendService.getRelationship(ownerAccount, visitorAccount),
    settingService.getPublicUserInfo(ownerAccount)
  ])
    .then(responsData => (res.locals.data = userService.packetProfileHeader(responsData)))
    .then(() => next())
    .catch(err => next(err))
}
