'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('LocalAccounts', {
      email: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(60)
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
    return queryInterface.dropTable('LocalAccounts')
  }
}
