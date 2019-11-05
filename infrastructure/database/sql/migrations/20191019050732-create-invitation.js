'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Invitations', {
      iid: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      inviterUid: {
        allowNull: false,
        type: Sequelize.UUID,
        field: 'inviter_uid',
        references: {
          model: {
            tableName: 'Accounts'
          },
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      inviterRegion: {
        allowNull: false,
        type: Sequelize.STRING(10),
        field: 'inviter_region'
      },
      recipientUid: {
        allowNull: false,
        type: Sequelize.UUID,
        field: 'recipient_uid',
        references: {
          model: {
            tableName: 'Accounts'
          },
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      recipientRegion: {
        allowNull: false,
        type: Sequelize.STRING(10),
        field: 'recipient_region'
      },
      event: {
        allowNull: false,
        type: Sequelize.STRING(40)
      },
      info: {
        allowNull: false,
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
        unique_invitation: {
          fields: [
            'inviter_uid',
            'inviter_region',
            'recipient_uid',
            'recipient_region',
            'event'
          ]
        }
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Invitations')
  }
}
