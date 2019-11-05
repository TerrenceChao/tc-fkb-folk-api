'use strict'
const uuidv4 = require('uuid/v4')
const faker = require('faker')
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

const amount = 10

/**
 * @param {number} count
 */
function genAccounts (count) {
  const now = new Date()
  const accounts = []
  for (let i = 0; i < count; i++) {
    accounts.push({
      id: uuidv4(),
      region: [faker.address.countryCode(), faker.address.cityPrefix()].join(),
      email: faker.internet.email(),
      alternate_email: faker.internet.email(),
      country_code: '+886',
      phone: faker.phone.phoneNumberFormat(),
      created_at: now,
      updated_at: now
    })
  }

  return accounts
}

/**
 * @param {Object} accountRows
 */
function genUsers (accountRows) {
  const now = new Date()
  const users = []
  for (let i = 0; i < accountRows.length; i++) {
    users.push({
      user_id: accountRows[i].id,
      be_searched: true,
      given_name: faker.name.firstName(),
      family_name: faker.name.lastName(),
      gender: faker.random.boolean() === true ? '1' : '0',
      birth: faker.date.past(),
      lang: faker.locale,
      public_info: JSON.stringify({
        profileLink: faker.internet.url(),
        profilePic: faker.internet.url()
      }),
      created_at: now,
      updated_at: now
    })
  }

  return users
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Accounts', genAccounts(amount), {})

    const accounts = await queryInterface.sequelize.query(
      'SELECT id from "Accounts";'
    )
    console.log('accounts', accounts)

    await queryInterface.bulkInsert('Users', genUsers(accounts[0]), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
    await queryInterface.bulkDelete('Accounts', null, {})
  }
}
