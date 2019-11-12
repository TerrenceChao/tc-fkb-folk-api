const LIMIT = 12
const SKIP = 0

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
  EXPIRATION_SECS: parseInt(process.env.EXPIRATION_SECS) || 600
}
