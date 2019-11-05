'use strict'
module.exports = (sequelize, DataTypes) => {
  const Auth = sequelize.define('Auth', {
    userId: DataTypes.UUID,
    pwSalt: DataTypes.STRING,
    pwHash: DataTypes.STRING,
    verification: DataTypes.JSONB,
    attempt: DataTypes.INTEGER,
    lock: DataTypes.BOOLEAN
  }, {})
  Auth.associate = function (models) {
    // associations can be defined here
  }
  return Auth
}
