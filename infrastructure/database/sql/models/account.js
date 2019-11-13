'use strict'
module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    region: DataTypes.STRING,
    email: DataTypes.STRING,
    alternateEmail: DataTypes.STRING,
    countryCode: DataTypes.STRING,
    phone: DataTypes.STRING,
    device: DataTypes.JSONB,
    deletedAt: 'TIMESTAMP'
  }, {})
  Account.associate = function (models) {
    // associations can be defined here
    Account.hasOne(models.User)
    Account.hasMany(models.Friend)
    Account.hasMany(models.Invitation)
  }
  return Account
}
