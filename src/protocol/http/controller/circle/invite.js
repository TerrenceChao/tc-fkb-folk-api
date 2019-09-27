var _ = require('lodash')
const CONSTANT = require('../../../../domain/circle/_properties/constant')
var notificationService = require('../../../../application/notification/notificationService')
var circleService = require('../../../../domain/circle/_services/circleService')
var { friendService } = require('../../../../domain/circle/friend/friendServiceTemp')
var { invitationService } = require('../../../../domain/circle/invitation/invitationServiceTemp')
var op = require('../../../../library/objOperator')

/**
 * send invitation
 * 1. create invitation record
 * 2. notify(web, app): 
 *     a. pop-up.
 *     b. update someone's profile state [invitation_has_sent]
 */
exports.sendInvitation = async (req, res, next) => {
  var accountInfo = req.params,
    targetAccountInfo = _.mapKeys(req.body, (value, key) => key.replace('target_', ''))
  res.locals.data = op.getDefaultIfUndefined(res.locals.data)

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
  var accountInfo = req.params,
    invitationRes = req.body
  res.locals.data = op.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(invitationService.handleFriendInvitation(accountInfo, invitationRes))
    .then(replyInvite => notificationService.emitFriendInvitation(res.locals.data = replyInvite))
    .then(() => next())
    .catch(err => next(err))
}

exports.getInvitation = async (req, res, next) => {
  var accountInfo = req.params,
    invitationInfo = req.query
  res.locals.data = op.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(invitationService.getInvitation(accountInfo, invitationInfo))
    .then(invitation => res.locals.data = invitation)
    .then(() => next())
    .catch(err => next(err))
}

exports.getReceivedInvitationList = async (req, res, next) => {
  var accountInfo = req.params,
    query = req.query
  res.locals.data = op.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(invitationService.getInvitationList(accountInfo, CONSTANT.INVITE_ARROW_RECEIVED, query.limit, query.skip))
    .then(invitationList => res.locals.data = invitationList)
    .then(() => next())
    .catch(err => next(err))
}

exports.getSentInvitationList = async (req, res, next) => {
  var accountInfo = req.params,
    query = req.query
  res.locals.data = op.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(invitationService.getInvitationList(accountInfo, CONSTANT.INVITE_ARROW_SENT, query.limit, query.skip))
    .then(invitationList => res.locals.data = invitationList)
    .then(() => next())
    .catch(err => next(err))
}