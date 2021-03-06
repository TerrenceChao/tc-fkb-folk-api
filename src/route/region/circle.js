var express = require('express')
var router = express.Router()
var generalReq = require('../../protocol/http/request/generalReq')
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
  generalReq.sequenceValidator,
  userReq.accountValidator,
  circleReq.friendInviterValidator,
  auth.isLoggedIn,
  invite.sendInvitation,
  generalRes.createdSuccess
)

// get invitation
router.get('/:uid/:region/invite',
  userReq.accountValidator,
  circleReq.invitationQueryValidator,
  auth.isLoggedIn,
  invite.getInvitation,
  generalRes.success
)

// get received invitation list
router.get('/:uid/:region/invite/list/received',
  userReq.accountValidator,
  generalReq.queryListValidator,
  auth.isLoggedIn,
  invite.getReceivedInvitationList,
  generalRes.success
)

// get sent invitation list
router.get('/:uid/:region/invite/list/sent',
  userReq.accountValidator,
  generalReq.queryListValidator,
  auth.isLoggedIn,
  invite.getSentInvitationList,
  generalRes.success
)

// invitation response (confirm/cancel)
router.put('/:uid/:region/invite',
  generalReq.sequenceValidator,
  userReq.accountValidator,
  circleReq.friendRecipientValidator,
  auth.isLoggedIn,
  invite.replyInvitation,
  generalRes.success
)

router.get('/:uid/:region/friend/list',
  userReq.accountValidator,
  generalReq.queryListValidator,
  auth.isLoggedIn,
  friend.list,
  generalRes.success
)

router.get('/:uid/:region/friend',
  userReq.accountValidator,
  circleReq.targetAccountValidator,
  auth.isLoggedIn,
  friend.find,
  generalRes.success
)

router.delete('/:uid/:region/friend',
  generalReq.sequenceValidator,
  userReq.accountValidator,
  circleReq.targetAccountValidator,
  auth.isLoggedIn,
  friend.unfriend,
  generalRes.success
)

module.exports = router
