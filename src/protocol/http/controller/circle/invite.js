var _ = require('lodash')
var constant = require('../../../../domain/circle/_properties/constant')
var invitationService = require('../../../../domain/circle/_services/invitationServiceTemp')
var notificationService = require('../../../../application/notification/notificationService')
var objOperator = require('../../../../library/objOperator')

/**
 * send invitation
 * 1. create invitation record
 * 2. notify(web, app): 
 *     a. pop-up.
 *     b. update someone's profile state [invitation_has_sent]
 */
exports.sendInvitation = async (req, res, next) => {
  var accountInfo = req.params,
    targetAccountInfo = req.body
  res.locals.data = objOperator.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(invitationService.inviteToBeFriend(accountInfo, targetAccountInfo))
    .then(invitation => {
      notificationService.sendInvitation(invitation)
      res.locals.data = invitation
      next()
    })
    .catch(err => next(err))
}

exports.getInvitation = async (req, res, next) => {
  var accountInfo = req.params,
    invitationId = req.query.iid
  res.locals.data = objOperator.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(invitationService.getInvitation(accountInfo, invitationId))
    .then(invitation => res.locals.data = invitation)
    .then(() => next())
    .catch(err => next(err))
}

exports.getReceivedInvitationList = async (req, res, next) => {
  var accountInfo = req.params,
    {
      limit,
      skip
    } = req.query
  res.locals.data = objOperator.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(invitationService.getInvitationList(accountInfo, constant.INVITE_ARROW_RECEIVED, limit, skip))
    .then(invitationList => res.locals.data = invitationList)
    .then(() => next())
    .catch(err => next(err))
}

exports.getSentInvitationList = async (req, res, next) => {
  var accountInfo = req.params,
    {
      limit,
      skip
    } = req.query
  res.locals.data = objOperator.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(invitationService.getInvitationList(accountInfo, constant.INVITE_ARROW_SENT, limit, skip))
    .then(invitationList => res.locals.data = invitationList)
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
    invitationReply = req.body
  res.locals.data = objOperator.getDefaultIfUndefined(res.locals.data)

  Promise.resolve(invitationService.dealwithFriendInvitation(accountInfo, invitationReply))
    .then(reply => {
      notificationService.replyInvitation(reply)
      res.locals.data = reply
      next()
    })
    .catch(err => next(err))
}