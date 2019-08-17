exports.targetAccountInfoValidator = (req, res, next) => {
  // 檢查欄位中，「region」很重要！
  Array.apply(null, ['target_uid', 'target_region'].forEach(field => {
    if (req.headers[field] === undefined &&
      req.query[field] === undefined &&
      req.body[field] === undefined) {
      var err = new Error(`visitor identify is lacked with: ${field}`)
      err.status = 422
      next(err)
    }
  }))

  next()
}