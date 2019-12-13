module.exports = {
  domain: process.env.MESSAGING_DOMAIN,
  createUserUrl: `${process.env.MESSAGING_DOMAIN}${process.env.MESSAGING_PATH_CREATE_USER}`,
  authenticateUrl: `${process.env.MESSAGING_DOMAIN}${process.env.MESSAGING_PATH_AUTHENTICATE}`
}
