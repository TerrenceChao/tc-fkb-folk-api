'use strict'
module.exports = (sequelize, DataTypes) => {
  const Invitation = sequelize.define('Invitation', {
    inviterId: DataTypes.UUID,
    inviterRegion: DataTypes.STRING,
    recipientId: DataTypes.UUID,
    recipientRegion: DataTypes.STRING,
    event: DataTypes.STRING,
    info: DataTypes.JSONB,
    deletedAt: 'TIMESTAMP'
  }, {})
  Invitation.associate = function (models) {
    // associations can be defined here
  }
  return Invitation
}
