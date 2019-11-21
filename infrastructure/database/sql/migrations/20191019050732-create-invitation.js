'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Invitations', {
      iid: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
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
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Invitations')
  }
}
