'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Auths', {
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
      verifyToken: {
        field: 'verify_token',
        type: Sequelize.STRING
      },
      verifyCode: {
        field: 'verify_code',
        type: Sequelize.STRING(20)
      },
      verifyExpire: {
        field: 'verify_expire',
        type: Sequelize.BIGINT
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
    }, {
      uniqueKeys: {
        unique_verify_token: {
          fields: ['verify_token']
        }
      }
    })

    // await queryInterface.addIndex(  // deprecated at 2019/11/15
    //   'Auths',
    //   ['verification'],
    //   {
    //     using: 'gin',
    //     operator: 'jsonb_path_ops',
    //     name: 'auths_verification_idx'
    //   }
    // )

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
    //   ['((verification->>\'expire\')::varchar)'],
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

    // queryInterface.removeIndex('auths_verification_idx') // deprecated at 2019/11/15

    return queryInterface.dropTable('Auths')
  }
}
