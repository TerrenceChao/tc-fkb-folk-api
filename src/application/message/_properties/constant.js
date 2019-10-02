const HTTP = require('../../../property/constant').HTTP
const AUTHENTICATE_URL = `${process.env.MESSAGING_HOST}${process.env.MESSAGING_PATH_AUTHENTICATE}`

module.exports = {
  HTTP: {
    AUTHENTICATE: {
      OPTIONS: {
        method: 'GET',
        url: AUTHENTICATE_URL,
        headers: HTTP.HEADERS
      }
    },
    TIMEOUT: HTTP.TIMEOUT
  }
}