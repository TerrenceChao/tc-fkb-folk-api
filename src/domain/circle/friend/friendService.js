const friendRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')
const inviteRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')

function FriendService(friendRepo, inviteRepo) {
  this.friendRepo = friendRepo
  this.inviteRepo = inviteRepo
  console.log(`init ${arguments.callee.name}`)
}

FriendService.prototype.list = function () {

}

FriendService.prototype.remove = function () {

}

module.exports = {
  friendService: new FriendService(friendRepo, inviteRepo),
  FriendService
}
