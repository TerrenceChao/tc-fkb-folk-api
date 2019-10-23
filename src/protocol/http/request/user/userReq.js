/**
 * 註冊的檢查欄位中，「region」很重要！
 * 未來如果真的實現異地部署，這裡的檢查欄位可能更多
 */
exports.registerInfoValidator = (req, res, next) => {
  // 檢查欄位中，「region」很重要！
  Array.apply(null, ['region'].forEach(field => {
    if (req.headers[field] === undefined &&
      req.params[field] === undefined &&
      req.query[field] === undefined &&
      req.body[field] === undefined) {
      var err = new Error(`account identify is lacked with: ${field}`)
      err.status = 422
      next(err)
    }
  }))
  next()
}

exports.userInfoValidator = (req, res, next) => {
  // the necessery user info fields check (not all of those)
  next()
}

exports.accountValidator = (req, res, next) => {
  // including email OR phone format check
  // including both new password repeated twice are matched

  req.body.email
  // password is encrypted ?
  req.body.password
  next()
}

exports.accountIdentifyValidator = (req, res, next) => {
  // 檢查欄位中，「region」很重要！
  Array.apply(null, ['uid', 'region', 'token'].forEach(field => {
    if (req.headers[field] === undefined &&
      req.params[field] === undefined &&
      req.query[field] === undefined &&
      req.body[field] === undefined) {
      var err = new Error(`account identify is lacked with: ${field}`)
      err.status = 422
      next(err)
    }
  }))

  next()
}

exports.visitorAccountInfoValidator = (req, res, next) => {
  // 檢查欄位中，「region」很重要！
  Array.apply(null, ['visitor_uid', 'visitor_region'].forEach(field => {
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

/**
 *[token隱含的資訊必須可知region]
 */
exports.verificationValidator = (req, res, next) => {
  // 檢查欄位中，「token」很重要！token 隱含的資訊必須可知 region
  // 'verify code' format check
  next()
}

exports.passwordValidator = (req, res, next) => {
  if (req.body.password === undefined) {
    var err = new Error('password is required')
    err.status = 422
    next(err)
  }
  next()
}

exports.newPasswordValidator = (req, res, next) => {
  // confirm both new password repeated twice are matched
  var {
    newPassword,
    newPasswordConfirm
  } = req.body // both password are encrypted
  if (newPassword === undefined || newPasswordConfirm === undefined) {
    const err = new Error('new password is required')
    err.status = 422
    next(err)
  }

  if (newPassword !== newPasswordConfirm) {
    const err = new Error('new passwords are not matched')
    err.status = 422
    next(err)
  }
  next()
}
