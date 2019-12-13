const HTTP = require('../_properties/constant').HTTP
var delay = require('../../../property/util').delay
var util = require('../_properties/util')

function MessageService () {
  // init test
  util.authRequestTest('authenticate connnection testing...')
}

/**
 * from message service
 * "userInfo" here must includes "clientuseragent"
 */
MessageService.prototype.createUser = async function (userInfo) {
  return Promise.race([
    util.syncCreateUserRequest('create-user-and-get-authenticate', userInfo),
    delay(HTTP.TIMEOUT, HTTP.TIMEOUT_MSG)
  ])
    .then(response => response)
}

/**
 * from message service
 * "userInfo" here must includes "clientuseragent"
 */
MessageService.prototype.authenticate = async function (userInfo) {
  return Promise.race([
    util.syncAuthRequest('get-authenticate', userInfo),
    delay(HTTP.TIMEOUT, HTTP.TIMEOUT_MSG)
  ])
    .then(response => response)
}

MessageService.prototype.quit = async function (userInfo) {
  return true
}

module.exports = new MessageService()
