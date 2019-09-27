/**
 * TODO: 這個檔案是用來實驗用的，在開發到一個階段的時候會被刪除
 * 目前的用途是：
 * 1. 模擬尚為實現的微服務功能
 * 2. 產生假資料
 */

var express = require('express')
var router = express.Router()
var auth = require('../protocol/http/controller/region/user/auth')
var generalRes = require('../protocol/http/response/generalRes')

/**
 * TODO: for temporary (it will be search engine instead of)
 *
 * discover/people 只是實驗用的，之後會用 elasticsearch 來取代，
 * discover/people 只是實驗用的，之後會用 elasticsearch 來取代，
 * discover/people 只是實驗用的，之後會用 elasticsearch 來取代，
 */
const elasticsearch = require('../domain/folk/user/_repositories/authRepositoryTemp')
router.get('/:uid/:region/discover/people',
  auth.isLoggedIn,
  async (req, res, next) => {
    var keyword = req.query.keyword
    var list = await elasticsearch.discoverAccounts(keyword)
    res.locals = { data: list }
    next()
  },
  generalRes.success
)

/**
 * TODO: 產生假帳號...
 */
const mock = require('../domain/folk/user/_repositories/authRepositoryTemp')
router.post('/generate_fake_accounts',
  async (req, res, next) => {
    var amount = req.query.amount
    var list = await mock.generateFakeAccounts(amount)
    res.locals = { data: list }
    next()
  },
  generalRes.createdSuccess
)

module.exports = router