module.exports = {
  domain: process.env.NOTIFICATION_DOMAIN,
  publishUrl: `${process.env.NOTIFICATION_DOMAIN}${process.env.NOTIFICATION_PATH_PUBLISH}`
}
