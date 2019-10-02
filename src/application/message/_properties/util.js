const _ = require('lodash')
const HTTP = require('./constant').HTTP
const httpHandler = require('../../../library/httpHandler')


/**
 * 
 * @param {string} event 
 * @param {Object} userInfo 
 */
function authRequest(event, userInfo) {
  let options = HTTP.AUTHENTICATE.OPTIONS
  options.headers = _.assignIn(options.headers, {
    uid: userInfo.uid,
    clientuseragent: userInfo.clientuseragent
  })

  httpHandler.request('message-service', event, options)
}

/**
 * 
 * @param {string} event 
 * @param {Object} userInfo 
 * @param {function} callback 
 */
function syncAuthRequest(event, userInfo) {
  let options = HTTP.AUTHENTICATE.OPTIONS
  options.headers = _.assignIn(options.headers, {
    uid: userInfo.uid,
    clientuseragent: userInfo.clientuseragent
  })

  return httpHandler.syncRequest('message-service', event, options, (body) => {
    return {
      token: body.msgToken,
      refreshToken: body.msgRefreshToken || 'message-service-refresh-token (not ready yet)',
    }
  })
}


module.exports = {
  authRequest,
  syncAuthRequest
}
