function authValidatorInQuery(req, res, next) {
  Array.apply(null, ['region', 'uid', 'email']).forEach(field => {
    if (req.query[field] === undefined) {
      var err = new Error(`user info is lacked with: ${field}`)
      err.status = 422
      next(err)
    }
  })
}

function authValidatorInBody(req, res, next) {
  Array.apply(null, ['region', 'uid', 'email']).forEach(field => {
    if (req.body[field] === undefined) {
      var err = new Error(`user info is lacked with: ${field}`)
      err.status = 422
      next(err)
    }
  })
}

var authValidators = {
  POST: authValidatorInBody,
  GET: authValidatorInQuery,
  PUT: authValidatorInBody,
  PATCH: authValidatorInBody,
  DELETE: authValidatorInQuery,
}

exports.userInfoValidator = (req, res, next) => {
  // 檢查欄位中，「region」很重要！
  // the necessery user info fields check (not all of those)
  authValidators[req.method](req, res, next)
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

var sessionValidatorInQuery = function (req, res, next) {
  Array.apply(null, ['region', 'uid', 'token']).forEach(field => {
    if (req.query[field] === undefined) {
      var err = new Error(`session info is lacked with: ${field}`)
      err.status = 422
      next(err)
    }
  })
}

var sessionValidatorInBody = function (req, res, next) {
  Array.apply(null, ['region', 'uid', 'token']).forEach(field => {
    if (req.body[field] === undefined) {
      var err = new Error(`session info is lacked with: ${field}`)
      err.status = 422
      next(err)
    }
  })
}

var sessionValidators = {
  POST: sessionValidatorInBody,
  GET: sessionValidatorInQuery,
  PUT: sessionValidatorInBody,
  PATCH: sessionValidatorInBody,
  DELETE: sessionValidatorInQuery,
}

exports.sessionValidator = (req, res, next) => {
  sessionValidators[req.method](req, res, next)
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

exports.newPasswordValidator = (req, res, next) => {
  // confirm both new password repeated twice are matched
  var {
    password,
    passwordRepeat
  } = req.body // both password are encrypted
  if (password === undefined || passwordRepeat === undefined || password !== passwordRepeat) {
    var err = new Error(`password are not matched`)
    err.status = 422
    next(err)
  }
  next()
}