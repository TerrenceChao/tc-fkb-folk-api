var express = require('express')
var router = express.Router()

/**
 * 在領域模型中若以個人 (一般的個人用戶) 的角度來看，feeds 區分為 post, news
 * post:
 * 1. receive - 與 news 的共同點是可瀏覽來自他人的文章
 * 2. delivery - 其帳號是個人身份發的貼文, 需要廣播的對象少且單純; (只能手動遮蔽部分追蹤者)
 * 3. 個人可修改, 刪除
 *
 * news:
 * 1. receive - 與 post 的共同點是可瀏覽來自他人的文章
 * 2. delivery - 其帳號是媒體, 團體, 官方身份發的貼文, 需要廣播大量的追蹤者, 且可根據資料分析結果分眾廣播
 */

/* GET feeds listing. */
router.get('/', function (req, res, next) {
  res.send('respond with feeds resource')
})

module.exports = router
