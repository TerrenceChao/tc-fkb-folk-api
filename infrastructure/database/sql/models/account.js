'use strict'
module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    region: DataTypes.STRING,
    alternateEmail: DataTypes.STRING,
    countryCode: DataTypes.STRING,
    phone: DataTypes.STRING,
    device: DataTypes.JSONB,
    deletedAt: 'TIMESTAMP'
  }, {})
  Account.associate = function (models) {
    // associations can be defined here
    Account.hasOne(models.Auth)
    Account.hasOne(models.User)
    Account.hasMany(models.Friend)
  }
  return Account
}
