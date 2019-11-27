'use strict'
const faker = require('faker')

/**
 *
 * @param {Object} accountRows
 */
function genLocalAccounts (accountRows) {
  const localAccounts = []
  const len = accountRows.length
  for (let i = 0; i < len; i++) {
    localAccounts.push({
      email: faker.internet.email(),
      user_id: accountRows[i].id
    })
  }

  return localAccounts
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const accounts = await queryInterface.sequelize.query(
      'SELECT id from "Accounts";'
    )
    console.log('accounts', accounts)

    return queryInterface.bulkInsert('LocalAccounts', genLocalAccounts(accounts[0]), {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('LocalAccounts', null, {})
  }
}
