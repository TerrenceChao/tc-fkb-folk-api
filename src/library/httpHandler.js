var _ = require('lodash')

/**
 * 
 * @param {request} req 
 * @param {string} field 
 */
function parseReq(req, field) {
  var value = req.headers[field] || req.params[field] || req.query[field] || req.body[field]
  if (value === undefined) {
    var err = new Error(`field value: ${field} is undefined in request `)
    err.status = 422
    throw err
  }

  return value
}

/**
 * 
 * @param {request} req 
 * @param {array} fieldList 
 */
function parseReqInFields(req, fieldList) {
  if (! Array.isArray(fieldList)) {
    throw new Error(`fieldList is not an array`)
  }

  const collect = {}
  fieldList.forEach(field => collect[field] = parseReq(req, field))

  return collect
}

/**
 * 
 * @param {request} req 
 * @param {Object} verification 
 */
function genVerifyInfo(req, verification) {
  verification.verifyLink = `${req.protocol}://${req.get('host')}/verification/code/${verification.token}`
  verification.resetLink = `${req.protocol}://${req.get('host')}/verification/password/${verification.token}`
  // 這裡不需要把 token 刪除. 在透過 notification service 寄送時需要 token 資訊！
  // delete verification.token (don't do this)

  return verification
}

module.exports = {
  parseReq,
  parseReqInFields,
  genVerifyInfo,
}
