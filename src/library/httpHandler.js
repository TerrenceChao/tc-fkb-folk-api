const _ = require('lodash')
const httpRequest = require('request')
const { HTTP, NODE_ENV } = require('../property/constant')

function genRequestDomain (req) {
  return `${req.protocol}://${req.get('host')}${HTTP.PREFIX}/`
}

/**
 *
 * @param {Request} req
 */
function parseAuthentication (req) {
  const { uid, region } = req.params
  const token = req.headers.token // authorized token

  return {
    uid,
    region,
    token // authorized token
  }
}

/**
 *
 * @param {Request} req
 */
function parseVerifyCode (req) {
  const token = req.params.token // verify token
  const code = req.body.code

  return {
    token, // verify token
    code
  }
}

/**
 *
 * @param {Request} req
 * @param {string} field
 */
function parseReq (req, field) {
  var value = req.headers[field] || req.params[field] || req.query[field] || req.body[field]
  if (value === undefined) {
    var err = new Error(`field value: ${field} is undefined in request `)
    err.status = 422
    return Promise.reject(err)
  }

  return value
}

/**
 *
 * @param {Request} req
 * @param {array} fieldList
 */
function parseReqInFields (req, fieldList) {
  if (!Array.isArray(fieldList)) {
    return Promise.reject(new Error('fieldList is not an array')) 
  }

  const collect = {}
  // fieldList.forEach(field => (collect[field] = parseReq(req, field)))

  return collect
}

/**
 *
 * @param {rquest} req
 * @param {Object} verification
 */
function genRegistrationInfo (req, verification) {
  const info = {
    'region': verification.region,
    'uid': verification.uid,
    'verify-token': verification['verify-token'],
    'registration-link': `${req.protocol}://${req.get('host')}${HTTP.PREFIX}/user/newborn/code/${verification['verify-token']}`
  }

  const secret = {
    code: verification.code,
    expire: verification.expire
  }

  return NODE_ENV === 'development' ? _.assign(info, secret) : info
}

/**
 *
 * @param {Request} req
 * @param {Object} verification
 */
function genVerifyInfo (req, verification) {
  const info = {
    'region': verification.region,
    'uid': verification.uid,
    'verify-token': verification['verify-token'],
    'verify-link': `${req.protocol}://${req.get('host')}${HTTP.PREFIX}/user/verification/code/${verification['verify-token']}`,
    'expire-link': `${req.protocol}://${req.get('host')}${HTTP.PREFIX}/user/verification/password/${verification['verify-token']}/${verification.expire}`
  }

  const secret = {
    code: verification.code,
    expire: verification.expire
  }

  return NODE_ENV === 'development' ? _.assign(info, secret) : info
}

/**
 * @private private function
 * @param {*} param
 * @returns {Object|undefined}
 */
function parse (param) {
  return typeof param === 'string' ? JSON.parse(param) : param
}

/**
 *
 * @param {string} service
 * @param {string} event
 * @param {Object} options
 * @param {number} retry
 */
function request (service, event, options, retry = 0) {
  options.method = options.method.toUpperCase()
  const REQ_SUCESS = options.method === 'POST' ? HTTP.POST_SUCCESS : HTTP.SUCCESS

  httpRequest(options,
    (err, response, body) => {
      body = parse(body)

      if (!err && response.statusCode === REQ_SUCESS) {
        console.log(`\n${service} '${event}':\n request as ${options.url}\n statis code: ${response.statusCode}`)
        console.log('body:', body, '\n')
        return
      }

      if (!err && response.statusCode === HTTP.VALIDATE_ERROR) {
        console.error(`\n${service} '${event}':\n request FAIL\n statis code: ${response.statusCode}`)
        console.log('body in invalid formats:', body, '\n')
        return
      }

      if (retry < HTTP.RETRY_LIMIT) {
        console.error(err || _.assign({ statusCode: response.statusCode }, body))
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
 * @param {number} retry
 */
function syncRequest (service, event, options, callback, data = null, retry = 0) {
  options.method = options.method.toUpperCase()
  const REQ_SUCESS = options.method === 'POST' ? HTTP.POST_SUCCESS : HTTP.SUCCESS

  return new Promise(resolve => {
    httpRequest(options,
      (err, response, body) => {
        body = parse(body)

        if (!err && response.statusCode === REQ_SUCESS) {
          console.log(`\n${service} '${event}':\n request as ${options.url}\n statis code: ${response.statusCode}`)
          console.log('body:', body, '\n')
          return resolve(callback(data || body))
        }

        if (!err && response.statusCode === HTTP.VALIDATE_ERROR) {
          console.error(`\n${service} '${event}':\n request FAIL\n statis code: ${response.statusCode}`)
          console.log('body in invalid formats:', body, '\n')
          return resolve(callback(body))
        }

        if (retry < HTTP.RETRY_LIMIT) {
          console.error(err || _.assign({ statusCode: response.statusCode }, body))
          setTimeout(() => resolve(syncRequest(service, event, options, callback, data, ++retry)), HTTP.DELAY)
        } else {
          const errMsg = `request ${service} ${event} fail!\nreach the retry limit: ${HTTP.RETRY_LIMIT}`
          console.error(errMsg)
          resolve({
            msgCode: '999999',
            error: errMsg
          })
        }
      })
  })
}

module.exports = {
  genRequestDomain,
  parseAuthentication,
  parseVerifyCode,
  genRegistrationInfo,
  genVerifyInfo,
  request,
  syncRequest
}
