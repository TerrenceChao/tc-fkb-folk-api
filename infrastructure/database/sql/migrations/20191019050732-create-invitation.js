'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Invitations', {
      iid: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      inviterId: {
        allowNull: false,
        type: Sequelize.UUID,
        field: 'inviter_id'
      },
      inviterRegion: {
        allowNull: false,
        type: Sequelize.STRING(10),
        field: 'inviter_region'
      },
      recipientId: {
        allowNull: false,
        type: Sequelize.UUID,
        field: 'recipient_id'
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
            'inviter_id',
            'inviter_region',
            'recipient_id',
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
