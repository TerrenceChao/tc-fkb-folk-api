var notificationService = require('../../../../../../application/notification/_services/_notificationService')
var circleService = require('../../../../../../domain/circle/_services/_circleService')
var { friendService } = require('../../../../../../domain/circle/_services/friendService')
var { invitationService } = require('../../../../../../domain/circle/_services/invitationService')
var util = require('../../../../../../property/util')

/**
 * send invitation
 * 1. create invitation record
 * 2. notify(web, app):
 *     a. pop-up.
 *     b. update someone's profile state [invitation_has_sent]
 */
exports.sendInvitation = async (req, res, next) => {
  var seq = req.headers.seq
  var account = req.params
  var inviterUserInfo = req.body.inviter
  var recipientUserInfo = req.body.recipient
  var extra = { seq }
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(invitationService.validateRoles(account, req.body))
    .then(() => friendService.getRelationship(recipientUserInfo, inviterUserInfo))
    .then(relationship => circleService.handleInviteActivity(invitationService, relationship))
    .then(invitation => notificationService.emitFriendInvitation((res.locals.data = invitation), extra))
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
  var seq = req.headers.seq
  var account = req.params
  var invitationRespose = req.body
  var extra = { seq }
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(invitationService.validateRoles(account, invitationRespose))
    .then(() => invitationService.handleFriendInvitation(invitationRespose))
    .then(invitationRespose => notificationService.emitFriendInvitation((res.locals.data = invitationRespose), extra))
    .then(() => next())
    .catch(err => next(err))
}

exports.getInvitation = async (req, res, next) => {
  var account = req.params
  var invitationInfo = req.query
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(invitationService.getInvitation(account, invitationInfo))
    .then(invitation => (res.locals.data = invitation))
    .then(() => next())
    .catch(err => next(err))
}

exports.getReceivedInvitationList = async (req, res, next) => {
  var account = req.params
  var { event, limit, skip } = req.query
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(invitationService.getReceivedInvitationList(account, event, limit, skip))
    .then(invitationList => (res.locals.data = invitationList))
    .then(() => next())
    .catch(err => next(err))
}

exports.getSentInvitationList = async (req, res, next) => {
  var account = req.params
  var { event, limit, skip } = req.query
  res.locals.data = util.init(res.locals.data)

  Promise.resolve(invitationService.getSentInvitationList(account, event, limit, skip))
    .then(invitationList => (res.locals.data = invitationList))
    .then(() => next())
    .catch(err => next(err))
}
