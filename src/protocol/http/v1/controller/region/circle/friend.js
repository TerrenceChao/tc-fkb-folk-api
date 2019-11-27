var _ = require('lodash')
var cicleRes = require('../../../../response/circle/circleRes')
var notificationService = require('../../../../../../application/notification/_services/_notificationService')
var circleService = require('../../../../../../domain/circle/_services/_circleService')
var { friendService } = require('../../../../../../domain/circle/_services/friendService')

/**
 * get friend record list
 */
exports.list = async (req, res, next) => {
  var account = req.params
  var { limit, skip } = req.query

  Promise.resolve(friendService.list(account, limit, skip))
    .then(friendList => cicleRes.findFriendListSuccess(friendList, req, res, next))
    .catch(err => next(err))
}

exports.find = async (req, res, next) => {
  var account = req.params
  var targetAccount = _.mapKeys(req.query, (value, key) => _.camelCase(key.replace('target', '')))

  Promise.resolve(friendService.findOne(account, targetAccount))
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
exports.unfriend = async (req, res, next) => {
  var seq = req.headers.seq
  var account = req.params
  var targetAccount = _.mapKeys(req.query, (value, key) => _.camelCase(key.replace('target', '')))
  var extra = { seq }

  Promise.resolve(friendService.unfriend(account, targetAccount))
    .then(removedFriend => (res.locals.data = removedFriend))
    .then(() => circleService.handleNotifyUnfriendActivity(
      notificationService,
      account,
      targetAccount,
      extra
    ))
    .then(() => next())
    .catch(err => next(err))
}
