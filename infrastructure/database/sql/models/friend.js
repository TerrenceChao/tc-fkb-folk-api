'use strict'
module.exports = (sequelize, DataTypes) => {
  const Friend = sequelize.define('Friend', {
    userId: DataTypes.UUID,
    friendId: DataTypes.UUID,
    friendRegion: DataTypes.STRING,
    publicInfo: DataTypes.JSONB,
    deletedAt: 'TIMESTAMP'
  }, {})
  Friend.associate = function (models) {
    // associations can be defined here
    Friend.belongsTo(models.Account)
  }
  return Friend
}
