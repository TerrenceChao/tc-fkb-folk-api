const _ = require('lodash')
const HTTP = require('./constant').HTTP
const httpHandler = require('../../../library/httpHandler')


/**
 * 
 * @param {string} event 
 * @param {Object} message 
 */
function publishRequest(event, message) {
  let options = HTTP.PUBLISH.OPTIONS
  options.body = message

  httpHandler.request('notification-service', event, options)
}

/**
 * 
 * @param {string} event 
 * @param {Object} message 
 * @param {function} callback 
 * @param {*} data 
 */
function syncPublishRequest(event, message, callback, data) {
  let options = HTTP.PUBLISH.OPTIONS
  options.body = message

  return httpHandler.syncRequest('notification-service', event, options, callback, data)
}


module.exports = {
  publishRequest,
  syncPublishRequest,
}
