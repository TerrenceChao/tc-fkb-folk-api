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
  // // 檢查欄位中，「region」很重要！
  // Array.apply(null, ['iid', 'region'].forEach(field => {
  //   if (req.query[field] === undefined) {
  //     var err = new Error(`invitation info is lacked with: ${field}`)
  //     err.status = 422
  //     next(err)
  //   }
  // }))

  // 因為 invitation 改為不同區域時，雙邊皆有同樣 iid 的紀錄(雙邊各有一份紀錄)，所以這邊不需要 region 資訊
  // (同時 inviation unique key = [iid, inviter, recipient, ...] 至少三個)
  if (req.query['iid'] === undefined) {
    var err = new Error(`invitation info is lacked with: 'iid'`)
    err.status = 422
    next(err)
  }

  next()
}