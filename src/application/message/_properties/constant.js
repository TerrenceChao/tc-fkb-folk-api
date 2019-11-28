const config = require('config').message
const HTTP = require('../../../property/constant').HTTP

module.exports = {
  HTTP: {
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
  }
}
