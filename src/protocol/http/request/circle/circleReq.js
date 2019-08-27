exports.targetAccountInfoValidator = (req, res, next) => {
  // 檢查欄位中，「region」很重要！
  Array.apply(null, ['target_uid', 'target_region'].forEach(field => {
    if (req.query[field] === undefined &&
      req.body[field] === undefined) {
      var err = new Error(`target account info is lacked with: ${field}`)
      err.status = 422
      next(err)
    }
  }))

  next()
}

exports.invitationInfoValidator = (req, res, next) => {
  // 檢查欄位中，「region」很重要！
  Array.apply(null, ['iid', 'region'].forEach(field => {
    if (req.query[field] === undefined) {
      var err = new Error(`invitation info is lacked with: ${field}`)
      err.status = 422
      next(err)
    }
  }))

  next()
}