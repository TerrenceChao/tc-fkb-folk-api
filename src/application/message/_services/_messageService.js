var request = require('request')
var _ = require('lodash')
const HEADERS = require('../_properties/constant').HTTP.HEADERS
const MESSAGING_URL = `${process.env.MESSAGING_HOST}${process.env.MESSAGING_URL_REQUEST_TOKEN}`

function MessageService() {
  const headers = _.assignIn(HEADERS, {
    uid: 'test',
    clientuseragent: 'test'
  })

  // init test
  request({
    method: 'GET',
    url: MESSAGING_URL,
    headers
  },
  (err, response, body) => {
    if (err) {
      console.error(err)
      return 
    }

    console.log(`event 'message service connect test...':\n fetch as ${MESSAGING_URL}`)
    console.log('status code:', response.statusCode, '\nbody:', JSON.parse(body))
  })
}

/**
 * from message service
 * "userInfo" here must includes "clientuseragent"
 */
MessageService.prototype.authenticate = async function (userInfo) {
  const headers = _.assignIn(HEADERS, {
    uid: userInfo.uid,
    clientuseragent: userInfo.clientuseragent
  })

  return new Promise(resolve => {
    request({
      method: 'GET',
      url: MESSAGING_URL,
      headers
    },
    (err, response, body) => {
      if (err) {
        console.error(err)
        return resolve({
          msgCode: `999999`,
          error: `connect ECONNREFUSED MESSAGING_HOST`
        })
      }

      let msgAuth = JSON.parse(body)
      return resolve({
        token: msgAuth.msgToken,
        refreshToken: msgAuth.msgRefreshToken || 'message-service-refresh-token (not ready yet)',
      })
    })

  })
}

MessageService.prototype.quit = async function (userInfo) {
  return true
}

module.exports = new MessageService()
