var express = require('express')
var router = express.Router()
var userReq = require('../../protocol/http/request/user/userReq')
var circleReq = require('../../protocol/http/request/circle/circleReq')
var auth = require('../../protocol/http/v1/controller/region/user/auth')
var invite = require('../../protocol/http/v1/controller/region/circle/invite')
var friend = require('../../protocol/http/v1/controller/region/circle/friend')
var generalRes = require('../../protocol/http/response/generalRes')

/* GET circle listing. */
router.get('/', function (req, res, next) {
  res.send('respond with circle resource')
})

// send invitation
router.post('/:uid/:region/invite',
  userReq.accountIdentifyValidator,
  circleReq.friendInviterValidator,
  auth.isLoggedIn,
  invite.sendInvitation,
  generalRes.createdSuccess
)

// get invitation
router.get('/:uid/:region/invite',
  userReq.accountIdentifyValidator,
  circleReq.invitationQueryValidator,
  auth.isLoggedIn,
  invite.getInvitation,
  generalRes.success
)

// get received invitation list
router.get('/:uid/:region/invite/list/received',
  userReq.accountIdentifyValidator,
  circleReq.queryListValidator,
  auth.isLoggedIn,
  invite.getReceivedInvitationList,
  generalRes.success
)

// get sent invitation list
router.get('/:uid/:region/invite/list/sent',
  userReq.accountIdentifyValidator,
  circleReq.queryListValidator,
  auth.isLoggedIn,
  invite.getSentInvitationList,
  generalRes.success
)

// invitation response (confirm/cancel)
router.put('/:uid/:region/invite',
  userReq.accountIdentifyValidator,
  circleReq.friendRecipientValidator,
  auth.isLoggedIn,
  invite.replyInvitation,
  generalRes.success
)

router.get('/:uid/:region/friend/list',
  userReq.accountIdentifyValidator,
  circleReq.queryListValidator,
  auth.isLoggedIn,
  friend.list,
  generalRes.success
)

router.get('/:uid/:region/friend',
  userReq.accountIdentifyValidator,
  circleReq.targetAccountValidator,
  auth.isLoggedIn,
  friend.find,
  generalRes.success
)

router.delete('/:uid/:region/friend',
  userReq.accountIdentifyValidator,
  circleReq.targetAccountValidator,
  auth.isLoggedIn,
  friend.unfriend,
  generalRes.success
)

module.exports = router
