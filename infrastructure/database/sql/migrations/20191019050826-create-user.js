'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        field: 'user_id',
        references: {
          model: {
            tableName: 'Accounts'
          },
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      beSearched: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        field: 'be_searched',
        defaultValue: true
      },
      givenName: {
        allowNull: false,
        type: Sequelize.STRING(80),
        field: 'given_name'
      },
      familyName: {
        allowNull: false,
        type: Sequelize.STRING(40),
        field: 'family_name'
      },
      gender: {
        allowNull: false,
        type: Sequelize.STRING(1)
      },
      birth: {
        type: Sequelize.DATE
      },
      lang: {
        allowNull: false,
        type: Sequelize.STRING(10)
      },
      publicInfo: {
        allowNull: false,
        type: Sequelize.JSONB,
        field: 'public_info',
        defaultValue: '{}'
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
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users')
  }
}
