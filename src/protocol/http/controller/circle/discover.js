var notificationService = require('../../../../application/notification/notificationService')

/**
 * X) No search controllers:
 *  1. exports.search = async (req, res, next) => {}
 *  2. exports.searchAutocompled = async (req, res, next) => {}
 * O) call external service:
 *  call 'Search Service' directly
 */

 /**
  * send invitation
  * 1. create invitation record
  * 2. notify(web, app): 
  *     a. pop-up.
  *     b. update someone's profile state [invitation_has_sent]
  */
exports.sendInvitation = async (req, res, next) => {
  res.json({
    status: `user:${req.params.uid} has sent an invitation to ${req.params.fid}`
  })
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
exports.invitationResponse = async (req, res, next) => {
  res.json({
    status: `user:${req.params.uid} makes a response for an invitation`
  })
}