const {
  host, port, password
} = require('config').cache
const Redis = require('ioredis')
Redis.Promise = global.Promise
const cache = new Redis(port, host, { password })

module.exports = cache
