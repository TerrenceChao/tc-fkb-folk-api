const cacheConfig = require('config').cache
const Redis = require('ioredis')
Redis.Promise = global.Promise
const cache = new Redis(cacheConfig.port, cacheConfig.host)

module.exports = cache
