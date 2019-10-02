const _ = require('lodash')
const req = require('request')
const HTTP = require('../property/constant').HTTP

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


/**
 * @private private function
 * @param {*} param 
 * @returns {Object|undefined}
 */
function parse(param) {
  return typeof param === 'string' ? JSON.parse(param) : param
}

/**
 * 
 * @param {string} service 
 * @param {string} event 
 * @param {Object} options 
 * @param {int} retry 
 */
function request(service, event, options, retry = 0) {
  options.method = options.method.toUpperCase()
  const REQ_SUCESS = options.method === 'POST' ? HTTP.POST_SUCCESS : HTTP.SUCCESS

  req(options,
    (err, response, body) => {
      body = parse(body)
      
      if (! err && response.statusCode === REQ_SUCESS) {
        console.log(`\n${service} '${event}':\n request as ${options.url}\n statis code: ${response.statusCode}`)
        console.log('body:', body, '\n')
        return
      }

      if (! err && response.statusCode === HTTP.VALIDATE_ERROR) {
        console.error(`\n${service} '${event}':\n request FAIL\n statis code: ${response.statusCode}`)
        console.log('body in invalid formats:', body, '\n')
        return
      }
      
      if (retry < HTTP.RETRY_LIMIT) {
        console.error(err || _.assignIn({ statusCode: response.statusCode }, body))
        setTimeout(() => request(service, event, options, ++retry), HTTP.DELAY)
      } else {
        console.error(`request ${service} ${event} fail!\nreach the retry limit: ${HTTP.RETRY_LIMIT}`)
      }
    })
}

/**
 * 
 * @param {string} service 
 * @param {string} event 
 * @param {Object} options 
 * @param {function} callback 
 * @param {*} data 
 * @param {int} retry 
 */
function syncRequest(service, event, options, callback, data = null, retry = 0) {
  options.method = options.method.toUpperCase()
  const REQ_SUCESS = options.method === 'POST' ? HTTP.POST_SUCCESS : HTTP.SUCCESS

  return new Promise(resolve => {
    req(options,
      (err, response, body) => {
        body = parse(body)

        if (! err && response.statusCode === REQ_SUCESS) {
          console.log(`\n${service} '${event}':\n request as ${options.url}\n statis code: ${response.statusCode}`)
          console.log('body:', body, '\n')
          return resolve(callback(data || body))
        }

        if (! err && response.statusCode === HTTP.VALIDATE_ERROR) {
          console.error(`\n${service} '${event}':\n request FAIL\n statis code: ${response.statusCode}`)
          console.log('body in invalid formats:', body, '\n')
          return resolve(callback(body))
        }
        
        if (retry < HTTP.RETRY_LIMIT) {
          console.error(err || _.assignIn({ statusCode: response.statusCode }, body))
          setTimeout(() => resolve(syncRequest(service, event, options, callback, data, ++retry)), HTTP.DELAY)
        } else {
          let errMsg = `request ${service} ${event} fail!\nreach the retry limit: ${HTTP.RETRY_LIMIT}`
          console.error(errMsg)
          resolve({
            msgCode: `999999`,
            error: errMsg
          })
        }
      })
  })
}

module.exports = {
  parseReq,
  parseReqInFields,
  genVerifyInfo,
  request,
  syncRequest,
}
