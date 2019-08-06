function success (req, res, next) {
  res.locals.data = res.locals.data || {}
  res.locals.meta = {
    code: '100000',
    msg: arguments.callee.name
  }

  res.json(res.locals)
}

module.exports = {
  success
}