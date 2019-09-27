
var Redis = require('ioredis')

var host = process.env.NOTIFICATION_REDIS_HOST
var port = process.env.NOTIFICATION_REDIS_PORT

function RedisEmitter () {
  console.log(`init ${arguments.callee.name}`)

  // this.redis = new Redis(port, host)
  this.pub = new Redis(port, host)
  console.log(`redis is listening: ${host}:${port}`)
}

RedisEmitter.prototype.publish = function (channel, data) {
  // in Redis:
  // redis.subscribe(channel, function (err, count) {
  //   // Now we are subscribed to both the 'news' and 'music' channels.
  //   // `count` represents the number of channels we are currently subscribed to.
  //   pub.publish(channel, 'Hello world!')
  // })

  /**
   * 盡量少用 會佔用 calback stack 的測試 比如 setTimeout 在這邊只是為了
   * 先確認前端有沒有拿到 redis host 後做了訂閱，而延遲發送 publish 訊息；
   * 這種無用的測試都會佔用 calback stack, 當 stack 累積越多 會拖慢 nodejs 效能
   */
  // console.log(`channel: ${channel}, data: ${JSON.stringify(data, null, 2)}`)
  if (typeof data !== 'string') {
    data = JSON.stringify(data)
  }
  this.pub.publish(channel, data)
}

module.exports = new RedisEmitter()