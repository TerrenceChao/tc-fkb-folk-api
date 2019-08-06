function MessageService() {}

// from message service
MessageService.prototype.authenticate = async function (userInfo) {
  var msgToken = 'message-service-token'
  var msgRefreshToken = 'message-service-refresh-token XD'
  
  return new Promise(resolve => setTimeout(resolve({
      auth: {
        token: msgToken,
        refreshToken: msgRefreshToken,
      }
    }), 2000))
}

MessageService.prototype.quit = async function (userInfo) {
  return true
}

module.exports = new MessageService()
