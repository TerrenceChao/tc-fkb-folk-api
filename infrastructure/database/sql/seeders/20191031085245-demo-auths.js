'use strict'
const faker = require('faker')

/**
 *
 * @param {Object} accountRows
 */
function genAuths (accountRows) {
  const now = new Date()
  const auths = []
  for (let i = 0; i < accountRows.length; i++) {
    auths.push({
      email: faker.internet.email(),
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
