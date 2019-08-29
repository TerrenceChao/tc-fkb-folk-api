// TODO: for temporary
const userRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')
const friendRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')
const inviteRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')


function InvitationService(userRepo, friendRepo, inviteRepo) {
  this.userRepo = userRepo
  this.friendRepo = friendRepo
  this.inviteRepo = inviteRepo
  console.log(`init ${arguments.callee.name}`)
}

InvitationService.prototype.inviteToBeFriend = function () {
  // create invitation record
}

module.exports = {
  invitationService: new InvitationService(userRepo, friendRepo, inviteRepo),
  InvitationService
}
