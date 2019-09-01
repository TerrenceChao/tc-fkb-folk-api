exports.targetAccountInfoValidator = (req, res, next) => {
  const targetAccountInfo = { target_uid: '', target_region: '' }

  // 檢查欄位中，「region」很重要！
  Array.apply(null, ['target_uid', 'target_region'].forEach(field => {
    let value = req.query[field] || req.body[field]
    if (value === undefined) {
      var err = new Error(`target account info is lacked with: ${field}`)
      err.status = 422
      next(err)
    }

    targetAccountInfo[field] = value
  }))

  const accountInfo = req.params
  if (accountInfo.uid === targetAccountInfo.target_uid && accountInfo.region === targetAccountInfo.target_region) {
    var err = new Error(`user (account info) cannot invite self`)
    err.status = 422
    next(err)
  }

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