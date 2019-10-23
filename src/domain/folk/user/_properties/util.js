var hasKeys = require('../../../../property/util').hasKeys
const ACCOUT_IDENTITY = require('./constant').ACCOUT_IDENTITY

/**
 * @param {Object} accountA
 * @param {Object} accountB
 */
function equalAccounts (accountA, accountB) {
  ACCOUT_IDENTITY.forEach(field => {
    if (accountA[field] !== accountB[field]) {
      return false
    }
  })

  return true
}

/**
 * @param {Object} accountInfo
 */
function validAccount (accountInfo) {
  return hasKeys(accountInfo, ACCOUT_IDENTITY)
}

module.exports = {
  equalAccounts,
  validAccount
}
