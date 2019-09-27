var express = require('express')
var router = express.Router()
var userReq = require('../../protocol/http/request/user/userReq')
var circleReq = require('../../protocol/http/request/circle/circleReq')
var generalRes = require('../../protocol/http/response/generalRes')

/* GET circle listing. */
router.get('/info/account', function (req, res, next) {
  res.send('respond for internal communicate')
})