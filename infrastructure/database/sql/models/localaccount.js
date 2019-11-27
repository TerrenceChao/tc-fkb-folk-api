'use strict'
module.exports = (sequelize, DataTypes) => {
  const LocalAccount = sequelize.define('LocalAccount', {
    userId: DataTypes.UUID
  }, {})
  LocalAccount.associate = function (models) {
    // associations can be defined here
    LocalAccount.belongsTo(models.Account)
  }
  return LocalAccount
}
