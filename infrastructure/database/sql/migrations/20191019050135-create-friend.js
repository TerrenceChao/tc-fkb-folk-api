'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Friends', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
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
      friendId: {
        allowNull: false,
        type: Sequelize.UUID,
        field: 'friend_id'
      },
      friendRegion: {
        allowNull: false,
        type: Sequelize.STRING(10),
        field: 'friend_region'
      },
      publicInfo: {
        // allowNull: false,
        type: Sequelize.JSONB,
        field: 'public_info',
        defaultValue: '{}'
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
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Friends')
  }
}
