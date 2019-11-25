'use strict'
module.exports = (sequelize, DataTypes) => {
  const Auth = sequelize.define('Auth', {
    userId: DataTypes.UUID,
    pwSalt: DataTypes.STRING,
    pwHash: DataTypes.STRING,
    verifyToken: DataTypes.STRING,
    verifyCode: DataTypes.STRING,
    verifyExpire: DataTypes.BIGINT,
    attempt: DataTypes.INTEGER,
    lock: DataTypes.BOOLEAN
  }, {})
  Auth.associate = function (models) {
    // associations can be defined here
    Auth.belongsTo(models.Account)
  }
  return Auth
}
