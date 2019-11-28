module.exports = {
  domain: process.env.MESSAGING_DOMAIN,
  authenticateUrl: `${process.env.MESSAGING_DOMAIN}${process.env.MESSAGING_PATH_AUTHENTICATE}`
}
