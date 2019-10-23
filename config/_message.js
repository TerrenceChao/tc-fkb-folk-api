module.exports = {
  host: process.env.MESSAGING_HOST,
  authenticateUrl: `${process.env.MESSAGING_HOST}${process.env.MESSAGING_PATH_AUTHENTICATE}`
}
