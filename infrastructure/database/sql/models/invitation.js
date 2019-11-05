'use strict'
module.exports = (sequelize, DataTypes) => {
  const Invitation = sequelize.define('Invitation', {
    inviterUid: DataTypes.UUID,
    inviterRegion: DataTypes.STRING,
    recipientUid: DataTypes.UUID,
    recipientRegion: DataTypes.STRING,
    event: DataTypes.STRING,
    info: DataTypes.JSONB,
    deletedAt: 'TIMESTAMP'
  }, {})
  Invitation.associate = function (models) {
    // associations can be defined here
    Invitation.belongsTo(models.Account)
  }
  return Invitation
}
