const LIMIT = 12

const SKIP = 0

module.exports = {
  LIMIT,
  SKIP,
  HTTP: {
    HEADERS: {
      'content-type': 'application/json',
    },
    SUCCESS: 200,
    POST_SUCCESS: 201,
    VALIDATE_ERROR: 422,
    RETRY_LIMIT: parseInt(process.env.REQ_RETRY_LIMIT) || 3,
    DELAY: parseInt(process.env.REQ_DELAY) || 500,
    TIMEOUT: parseInt(process.env.REQ_TIMEOUT) || 100,
  },
}

