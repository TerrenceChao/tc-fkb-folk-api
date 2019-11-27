'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Accounts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      region: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      alternateEmail: {
        type: Sequelize.STRING(60),
        field: 'alternate_email'
      },
      countryCode: {
        type: Sequelize.STRING(10),
        field: 'country_code'
      },
      phone: {
        type: Sequelize.STRING(40)
      },
      device: {
        type: Sequelize.JSONB
      },
      deletedAt: {
        type: 'TIMESTAMP',
        field: 'deleted_at',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      createdAt: {
        allowNull: false,
        type: 'TIMESTAMP',
        field: 'created_at',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: 'TIMESTAMP',
        field: 'updated_at',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      uniqueKeys: {
        unique_phone: {
          fields: ['country_code', 'phone']
        }
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Accounts')
  }
}
