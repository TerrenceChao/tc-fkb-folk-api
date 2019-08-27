var request = require('request')
var _ = require('lodash')

const HOST = process.env.MESSAGING_HOST
const URL_REQ_TOKEN = process.env.MESSAGING_URL_REQUEST_TOKEN
const OPTIONS = {
  url: `${HOST}${URL_REQ_TOKEN}`
}

function MessageService() {}

/**
 * from message service
 * "userInfo" here nust includes "clientuseragent"
 */
MessageService.prototype.authenticate = async function (userInfo) {
  var options = _.assignIn(OPTIONS, {
    headers: {
      uid: userInfo.uid,
      clientuseragent: userInfo.clientuseragent
    }
  })

  console.log(`\n=============`, `message http options: ${JSON.stringify(options, null, 2)}`, `\n=============`)
  
  return new Promise(resolve => {
    request(options, (err, response, body) => {
      let msgAuth = JSON.parse(body)
      resolve({
        token: msgAuth.msgToken,
        refreshToken: msgAuth.msgRefreshToken || 'message-service-refresh-token (not ready yet)'
      })
    })
  })
}

MessageService.prototype.quit = async function (userInfo) {
  return true
}

module.exports = new MessageService()
