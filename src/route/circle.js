var express = require('express')
var router = express.Router()
var circleReq = require('../protocol/http/request/circle/circleReq')
var auth = require('../protocol/http/controller/user/auth')
var discover = require('../protocol/http/controller/circle/discover')
var friend = require('../protocol/http/controller/circle/friend')

/* GET circle listing. */
router.get('/', function (req, res, next) {
  res.send('respond with circle resource')
})

// send invitation
router.post('/:uid/invite/:someone_id',
  circleReq.targetUserValidator,
  auth.isLoggedIn,
  discover.sendInvitation
)

// invitation response (confirm/cancel)
router.put('/:uid/invite',
  auth.isLoggedIn,
  discover.invitationResponse
)

router.get('/:uid/friend/list',
  auth.isLoggedIn,
  friend.list
)

router.delete('/:uid/friend/:friend_id',
  circleReq.targetUserValidator,
  auth.isLoggedIn,
  friend.remove
)

module.exports = router