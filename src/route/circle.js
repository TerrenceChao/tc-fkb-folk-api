var express = require('express')
var router = express.Router()
var userReq = require('../protocol/http/request/user/userReq')
var circleReq = require('../protocol/http/request/circle/circleReq')
var auth = require('../protocol/http/controller/user/auth')
var discover = require('../protocol/http/controller/circle/discover')
var friend = require('../protocol/http/controller/circle/friend')

/* GET circle listing. */
router.get('/', function (req, res, next) {
  res.send('respond with circle resource')
})

// send invitation
router.post('/:uid/:region/invite',
  userReq.accountIdentifyValidator,
  circleReq.targetUserValidator,
  auth.isLoggedIn,
  discover.sendInvitation
)

// invitation response (confirm/cancel)
router.put('/:uid/:region/invite',
  userReq.accountIdentifyValidator,
  auth.isLoggedIn,
  discover.invitationResponse
)

router.get('/:uid/:region/friend/list',
  userReq.accountIdentifyValidator,
  auth.isLoggedIn,
  friend.list
)

router.delete('/:uid/:region/friend/:target_uid/:target_region',
  userReq.accountIdentifyValidator,
  circleReq.targetUserValidator,
  auth.isLoggedIn,
  friend.remove
)

module.exports = router