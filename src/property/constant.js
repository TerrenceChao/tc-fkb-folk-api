const LIMIT = 12
const SKIP = 0

/**
 * @param {string|null} param
 */
function isMsgUserInfoReplicate (param) {
  param = param || false
  if (param.toLowerCase() === 'true') {
    return true
  }

  return false
}

const replicate = isMsgUserInfoReplicate(process.env.MESSAGING_USER_INFO_REPLICATE)
console.log('Is msg user info replicate ? >>>', replicate)

module.exports = {
  LIMIT,
  SKIP,
  HTTP: {
    HEADERS: {
      'content-type': 'application/json'
    },
    PREFIX: process.env.PREFIX,
    SUCCESS: 200,
    POST_SUCCESS: 201,
    VALIDATE_ERROR: 422,
    RETRY_LIMIT: parseInt(process.env.REQ_RETRY_LIMIT) || 3,
    DELAY: parseInt(process.env.REQ_DELAY) || 500,
    TIMEOUT: parseInt(process.env.REQ_TIMEOUT) || 100
  },
  NODE_ENV: process.env.NODE_ENV,
  EXPIRATION_SECS: parseInt(process.env.EXPIRATION_SECS) || 300,
  REGEX_UUID: process.env.REGEX_UUID || '/[0-9a-fA-F]{8}\/-[0-9a-fA-F]{4}\/-[0-9a-fA-F]{4}\/-[0-9a-fA-F]{4}\/-[0-9a-fA-F]{12}/',
  CIPHER_ALGO: process.env.CIPHER_ALGO,
  MESSAGING_USER_INFO_REPLICATE: replicate
}
