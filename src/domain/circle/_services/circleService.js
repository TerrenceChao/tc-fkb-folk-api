const CONSTANT = require('../_properties/constant')

function CircleService() {
  console.log(`init ${arguments.callee.name}`)
}

CircleService.prototype.handleInviteActivity = async function (invitationService, relationship, accountInfo, targetAccountInfo) {
  switch (relationship.type) {
    // 1. user self
    case CONSTANT.RELATION_STATUS_SELF:
      return Promise.reject(new Error(`You cannot send invitation to yourself`))

    // 2. are aleady friends
    case CONSTANT.RELATION_STATUS_FRIEND:
      return Promise.reject(new Error(`You are already friends`))

    // 3. add friend & notify
    case CONSTANT.RELATION_STATUS_BE_INVITED:
      return Promise.resolve(invitationService.confirmFriendInvitation(relationship.invitation, accountInfo))

    // 4., 5. send invitation & notify
    case CONSTANT.RELATION_STATUS_INVITED:
    case CONSTANT.RELATION_STATUS_STRANGER:
      return Promise.resolve(invitationService.inviteToBeFriend(accountInfo, targetAccountInfo))

    default:
      return Promise.reject(new Error(`The type of relationship is not defined`))
  }
}

module.exports = new CircleService()
