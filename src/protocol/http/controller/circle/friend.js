var friendService = require('../../../../domain/circle/_services/friendServiceTemp')
var notificationService = require('../../../../application/notification/notificationService')
var objOperator = require('../../../../library/objOperator')

/**
 * get friend record list
 */
exports.list = async (req, res, next) => {
  var accountInfo = req.params,
      { limit, skip } = req.query
  
  Promise.resolve(friendService.list(accountInfo, limit, skip))
    .then(friendList => res.locals['data'] = friendList)
    .then(() => next())
    .catch(err => next(err))
}

exports.find = async (req, res, next) => {
  var accountInfo = req.params,
      targetAccountInfo = req.query
  
  Promise.resolve(friendService.findOne(accountInfo, targetAccountInfo))
    .then(friendList => res.locals['data'] = friendList)
    .then(() => next())
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
      targetAccountInfo = req.query
  
  Promise.resolve(friendService.remove(accountInfo, targetAccountInfo))
    .then(removedFriend => {
      res.locals['data'] = removedFriend
      notificationService.notify(targetAccountInfo, {
        requestEvent: 'unfriend',
        data: accountInfo
      })
    })
    .then(() => next())
    .catch(err => next(err))
}
