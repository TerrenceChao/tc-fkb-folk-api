const friendRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')

function FriendService(friendRepo) {
  this.friendRepo = friendRepo
  console.log(`init ${arguments.callee.name} (template)`)
}

FriendService.prototype.list = function () {

}

FriendService.prototype.remove = function () {

}

module.exports = {
  friendService: new FriendService(friendRepo),
  FriendService
}
