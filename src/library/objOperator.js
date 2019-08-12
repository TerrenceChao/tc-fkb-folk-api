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

module.exports = {
  getDefaultIfUndefined,
  getFromReq
}