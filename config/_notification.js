module.exports = {
  redis: {
    host: process.env.NOTIFICATION_REDIS_HOST,
    port: process.env.NOTIFICATION_REDIS_PORT
  },
  mq: {
    host: process.env.NOTIFICATION_MQ_HOST,
    publishUrl: `${process.env.NOTIFICATION_MQ_HOST}${process.env.NOTIFICATION_MQ_PATH_PUBLISH}`
  },
  specify: process.env.SPECIFY_NOTIFICATION_VENDOR
}
