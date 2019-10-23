var util = require('util')

util.inherits(VerificationError, Error)

function VerificationError (message) {
  this.message = message
}

VerificationError.prototype.status = function (status) {
  this.status = status
  return this
}

exports.VerificationError = VerificationError
