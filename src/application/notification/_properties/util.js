const httpHandler = require('../../../library/httpHandler')
const {
  HTTP,
  CATEGORIES,
  CHANNELS
} = require('./constant')

/**
 *
 * @param {string} event
 * @param {Object} message
 */
function publishRequest (event, message) {
  const options = HTTP.PUBLISH.OPTIONS
  options.body = message

  httpHandler.request('[notification-service]', event, options)
}

/**
 *
 * @param {string} event
 * @param {Object} message
 * @param {function} callback
 * @param {*} data
 */
function syncPublishRequest (event, message, callback, data) {
  const options = HTTP.PUBLISH.OPTIONS
  options.body = message

  return httpHandler.syncRequest('[notification-service]', event, options, callback, data)
}

/**
 *
 * @param {string} event
 * @param {function} callback
 * @param {*} data
 */
function syncPublishRequestTest (event, callback, data) {
  const options = HTTP.PUBLISH.OPTIONS
  options.body = {
    category: CATEGORIES.PERSONAL,
    channels: CHANNELS.PUSH,
    sender: null,
    receivers: [{
      uid: 'test',
      region: 'test'
    }],
    packet: {
      event: 'test',
      content: 'test'
    }
  }

  return httpHandler.syncRequest('[notification-service]', event, options, callback, data)
}

module.exports = {
  publishRequest,
  syncPublishRequest,
  // test
  syncPublishRequestTest
}
