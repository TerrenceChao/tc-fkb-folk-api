var hasKeys = require('../../../../property/util').hasKeys
const ACCOUT_IDENTITY = require('./constant').ACCOUT_IDENTITY

/**
 * @param {Object} account
 */
function validAccount (account) {
  return hasKeys(account, ACCOUT_IDENTITY)
}

/**
 * @param {Object} user
 */
function parseAccount (user) {
  return {
    uid: user.uid || user.id || user.user_id || user.userId,
    region: user.region
  }
}

/**
 *
 * @param {Object} user
 */
function parsePublicInfo (user) {
  const publicInfo = user.public_info || user.publicInfo
  delete (user.public_info || user.publicInfo)
  return _.assign(user, publicInfo)
}

module.exports = {
  validAccount,
  parseAccount,
  parsePublicInfo
}
