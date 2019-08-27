var friendService = require('../../../../domain/circle/_services/friendServiceTemp')
var objOperator = require('../../../../library/objOperator')

/**
 * Assume user has a long long story/history ...
 * batch load.
 * 
 * Relation status including strangers / friends / yourself profile
 * 1. show state:'invite/invited' if he/she is a stranger. 
 *    (state:'invite' means you haven't sent invitation yet)
 * 2. show state:'unfriend' if he/she is your friend.
 * 3. hide state for yourself.
 */

/**
 * 1. friend,
 * 2. invitation has sent,
 * 3. invite,
 * 4. nothing for yourself.
 */
exports.getRelationStatus = async (req, res, next) => {
  var ownerAccountInfo = req.params,
    visitorAccountInfo = req.query
  var data = res.locals.data = objOperator.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(friendService.getRelationStatus(ownerAccountInfo, visitorAccountInfo))
    .then(relationStatus => data.relationStatus = relationStatus)
    .then(() => next())
    .catch(err => next(err))
}