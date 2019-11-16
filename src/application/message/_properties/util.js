const _ = require('lodash')
const HTTP = require('./constant').HTTP
const httpHandler = require('../../../library/httpHandler')

/**
 *
 * @param {string} event
 * @param {Object} userInfo
 */
function authRequest (event, userInfo) {
  const options = HTTP.AUTHENTICATE.OPTIONS
  options.headers = _.assign(options.headers, {
    uid: userInfo.uid,
    clientuseragent: userInfo.clientuseragent
  })

  httpHandler.request('[message-service]', event, options)
}

/**
 *
 * @param {string} event
 * @param {Object} userInfo
 * @param {function} callback
 */
function syncAuthRequest (event, userInfo) {
  const options = HTTP.AUTHENTICATE.OPTIONS
  options.headers = _.assign(options.headers, {
    uid: userInfo.uid,
    clientuseragent: userInfo.clientuseragent
  })

  return httpHandler.syncRequest('[message-service]', event, options, (body) => body.data)
}

/**
 *
 * @param {string} event
 * @param {Object} userInfo
 */
function authRequestTest (event) {
  const options = HTTP.AUTHENTICATE.OPTIONS
  options.headers = _.assign(options.headers, {
    'robot-uid': 'robot-uid',
    'client-robot-agent': 'client-robot-agent'
  })

  httpHandler.request('[message-service]', event, options)
}

module.exports = {
  authRequest,
  syncAuthRequest,
  // test
  authRequestTest
}
