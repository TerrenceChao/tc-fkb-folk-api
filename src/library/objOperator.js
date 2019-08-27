var _ = require('lodash')

function getDefaultIfUndefined(value, defultValue = {}) {
  return value === undefined ? value = defultValue : value
}

function getFromReq(req, field) {
  var value = req.headers[field] || req.params[field] || req.query[field] || req.body[field]
  if (value === undefined) {
    var err = new Error(`field value: ${field} is undefined in request `)
    err.status = 422
    throw err
  }

  return value
}

function collectFromReq(req, fieldList) {
  if (! Array.isArray(fieldList)) {
    throw new Error(`fieldList is not an array`)
  }

  const collect = {}
  fieldList.forEach(field => {
    collect[field] = getFromReq(req, field)
  })

  return collect
}

function cloneAndAssign(data, extraData) {
  return _.assign(Object.create(data), extraData)
}

function cloneAndAssignIn(data, extraData) {
  return _.assignIn(Object.create(data), extraData)
}

module.exports = {
  getDefaultIfUndefined,
  cloneAndAssign,
  cloneAndAssignIn,
  getFromReq,
  collectFromReq,
}