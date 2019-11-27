'use strict'

/**
 *
 * @param {Object} accountRows
 */
function genAuths (accountRows) {
  const now = new Date()
  const auths = []
  const len = accountRows.length
  for (let i = 0; i < len; i++) {
    auths.push({
      id: reverseNextVal(i + len),
      user_id: accountRows[i].id,
      pw_hash: 'xxxx',
      pw_salt: 'oooo',
      verify_token: null,
      verify_code: null,
      verify_expire: null,
      attempt: 0,
      lock: false,
      created_at: now,
      updated_at: now
    })
  }

  return auths
}

/**
 * @param {number} autoIncrementId
 */
function reverseNextVal (autoIncrementId) {
  const str = autoIncrementId.toString()
  const len = str.length

  let newStr = ''
  for (let i = len - 1; i >= 0; i--) {
    newStr = newStr.concat(str[i])
  }

  return newStr
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const accounts = await queryInterface.sequelize.query(
      'SELECT id from "Accounts";'
    )
    console.log('accounts', accounts)

    return queryInterface.bulkInsert('Auths', genAuths(accounts[0]), {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Auths', null, {})
  }
}
