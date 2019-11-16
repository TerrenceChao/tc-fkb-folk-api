function signupSuccess (req, res, next) {
  res.locals.data = res.locals.data || {}
  res.locals.meta = res.locals.meta || {
    msgCode: '100000',
    msg: arguments.callee.name
  }

  res.status(201).json(res.locals)
}

function sendVerifySuccess (req, res, next) {
  res.locals.data = res.locals.data || {}
  res.locals.meta = res.locals.meta || {
    msgCode: '100000',
    msg: arguments.callee.name
  }

  res.json(res.locals)
}

module.exports = {
  signupSuccess,
  sendVerifySuccess
}
