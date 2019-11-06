var _ = require('lodash')
const CONSTANT = require('../../../../../../domain/circle/_properties/constant')
var notificationService = require('../../../../../../application/notification/_services/_notificationService')
var circleService = require('../../../../../../domain/circle/_services/_circleService')
var { friendService } = require('../../../../../../domain/circle/_services/friendServiceTemp')
var { invitationService } = require('../../../../../../domain/circle/_services/invitationServiceTemp')
var util = require('../../../../../../property/util')

/**
 * send invitation
 * 1. create invitation record
 * 2. notify(web, app):
 *     a. pop-up.
 *     b. update someone's profile state [invitation_has_sent]
 */
exports.sendInvitation = async (req, res, next) => {
  var accountInfo = req.params
  var targetAccountInfo = _.mapKeys(req.body, (value, key) => key.replace('target_', ''))
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(friendService.getRelationship(targetAccountInfo, accountInfo))
    .then(relationship => circleService.handleInviteActivity(invitationService, relationship, accountInfo, targetAccountInfo))
    .then(invitation => notificationService.emitFriendInvitation(res.locals.data = invitation))
    .then(() => next())
    .catch(err => next(err))
}

/**
 * invitation response (confirm / cancel)
 * At front-end: refresh friend list at local storage and re-render
 * A. confirm invite:
 *  1. confirmInvite
 *  2. add friend record
 *  3. notify(web, app):
 *      a. pop-up.
 *      b. update someone's profile state [friend]
 *
 * B. cancel invite:
 *  1. remove invitation record
 *  2. notify(web, app):
 *      a. DO NOT pop-up!
 *      b. update someone's profile state [invite]
 */
exports.replyInvitation = async (req, res, next) => {
  var accountInfo = req.params
  var invitationRes = req.body
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(invitationService.handleFriendInvitation(accountInfo, invitationRes))
    .then(replyInvite => notificationService.emitFriendInvitation(res.locals.data = replyInvite))
    .then(() => next())
    .catch(err => next(err))
}

exports.getInvitation = async (req, res, next) => {
  var accountInfo = req.params
  var invitationInfo = req.query
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(invitationService.getInvitation(accountInfo, invitationInfo))
    .then(invitation => (res.locals.data = invitation))
    .then(() => next())
    .catch(err => next(err))
}

exports.getReceivedInvitationList = async (req, res, next) => {
  var accountInfo = req.params
  var query = req.query
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(invitationService.getReceivedInvitationList(accountInfo, query.limit, query.skip))
    .then(invitationList => (res.locals.data = invitationList))
    .then(() => next())
    .catch(err => next(err))
}

exports.getSentInvitationList = async (req, res, next) => {
  var accountInfo = req.params
  var query = req.query
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(invitationService.getSentInvitationList(accountInfo, query.limit, query.skip))
    .then(invitationList => (res.locals.data = invitationList))
    .then(() => next())
    .catch(err => next(err))
}
