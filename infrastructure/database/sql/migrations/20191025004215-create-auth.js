'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Auths', {
      userId: {
        allowNull: false,
        primaryKey: true,
        field: 'user_id',
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      pwHash: {
        allowNull: false,
        field: 'pw_hash',
        type: Sequelize.STRING
      },
      pwSalt: {
        allowNull: false,
        field: 'pw_salt',
        type: Sequelize.STRING
      },
      verification: {
        type: Sequelize.JSONB,
        index: true
      },
      attempt: {
        type: Sequelize.INTEGER
      },
      lock: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    await queryInterface.addIndex(
      'Auths',
      ['verification'],
      {
        using: 'gin',
        operator: 'jsonb_path_ops',
        name: 'auths_verification_idx'
      }
    )

    // await queryInterface.addIndex(
    //   'Auths',
    //   ['((verification->\'token\')::varchar)'],
    //   {
    //     using: 'gin',
    //     name: 'auths_verification_token_idx'
    //   }
    // )

    // await queryInterface.addIndex(
    //   'Auths',
    //   ['((verification->>\'code\')::varchar)'],
    //   {
    //     using: 'gin',
    //     name: 'auths_verification_code_idx'
    //   }
    // )

    // await queryInterface.addIndex(
    //   'Auths',
    //   ['((verification->>\'reset\')::varchar)'],
    //   {
    //     using: 'gin',
    //     name: 'auths_verification_reset_idx'
    //   }
    // )

    return queryInterface
  },
  down: async (queryInterface, Sequelize) => {
    // queryInterface.removeIndex('auths_verification_reset_idx')
    // queryInterface.removeIndex('auths_verification_code_idx')
    // queryInterface.removeIndex('auths_verification_token_idx')
    queryInterface.removeIndex('auths_verification_idx')

    return queryInterface.dropTable('Auths')
  }
}
