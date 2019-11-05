'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    userId: DataTypes.UUID,
    beSearched: DataTypes.BOOLEAN,
    givenName: DataTypes.STRING,
    familyName: DataTypes.STRING,
    gender: DataTypes.STRING,
    birth: DataTypes.DATE,
    lang: DataTypes.STRING,
    publicInfo: DataTypes.JSONB
  }, {})
  User.associate = function (models) {
    // associations can be defined here
    User.belongsTo(models.Account)
  }
  return User
}
