var _ = require('lodash')
var cicleRes = require('../../response/circle/circleRes')
var notificationService = require('../../../../application/notification/notificationService')
var { friendService } = require('../../../../domain/circle/friend/friendServiceTemp')

/**
 * get friend record list
 */
exports.list = async (req, res, next) => {
  var accountInfo = req.params,
      { limit, skip } = req.query
  
  Promise.resolve(friendService.list(accountInfo, limit, skip))
    .then(friendList => cicleRes.findFriendListSuccess(friendList, req, res, next))
    .catch(err => next(err))
}

exports.find = async (req, res, next) => {
  var accountInfo = req.params,
      targetAccountInfo = _.mapKeys(req.query, (value, key) => key.replace('target_', ''))
  
  Promise.resolve(friendService.findOne(accountInfo, targetAccountInfo))
    .then(friend => cicleRes.findFriendSuccess(friend, req, res, next))
    .catch(err => next(err))
}

/**
 * remove a friend:
 * 1. remove friend record
 * 2. notify(web, app): 
 *    a. DO NOT pop-up!
 *    b. update someone's profile state (invite)
 */
exports.remove = async (req, res, next) => {
  var accountInfo = req.params,
      targetAccountInfo = _.mapKeys(req.query, (value, key) => key.replace('target_', ''))
  
  Promise.resolve(friendService.remove(accountInfo, targetAccountInfo))
    .then(removedFriend => res.locals['data'] = removedFriend)
    //TODO: improve
    .then(() => notificationService.emitEvent(targetAccountInfo, {
      requestEvent: 'unfriend',
      receiver: accountInfo,
      data: accountInfo
    }))
    .then(() => next())
    .catch(err => next(err))
}
