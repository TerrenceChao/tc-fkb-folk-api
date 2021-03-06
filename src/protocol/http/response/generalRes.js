const { mapKeysInCamelCase } = require('../../../property/util')

function success (req, res, next) {
  res.locals.data = Array.isArray(res.locals.data) ? res.locals.data.map(item => mapKeysInCamelCase(item)) : mapKeysInCamelCase(res.locals.data)
  res.locals.meta = res.locals.meta || {
    msgCode: '100000',
    msg: arguments.callee.name
  }

  res.json(res.locals)
}

function createdSuccess (req, res, next) {
  res.locals.data = Array.isArray(res.locals.data) ? res.locals.data.map(item => mapKeysInCamelCase(item)) : mapKeysInCamelCase(res.locals.data)
  res.locals.meta = res.locals.meta || {
    msgCode: '100000',
    msg: arguments.callee.name
  }

  res.status(201).json(res.locals)
}

module.exports = {
  success,
  createdSuccess
}
