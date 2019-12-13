const config = require('config').message
const { HTTP, MESSAGING_USER_INFO_REPLICATE } = require('../../../property/constant')

module.exports = {
  HTTP: {
    CREATE_USER: {
      OPTIONS: {
        method: 'POST',
        url: config.createUserUrl,
        headers: HTTP.HEADERS
      }
    },
    AUTHENTICATE: {
      OPTIONS: {
        method: 'GET',
        url: config.authenticateUrl,
        headers: HTTP.HEADERS
      }
    },
    TIMEOUT: HTTP.TIMEOUT,
    TIMEOUT_MSG: {
      msgCode: 'xxxxxx',
      error: `connect ECONNREFUSED MESSAGING_DOMAIN, timeout: ${HTTP.TIMEOUT}`
    }
  },
  MESSAGING_USER_INFO_REPLICATE
}
