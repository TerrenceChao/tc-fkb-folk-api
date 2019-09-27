var _ = require('lodash')
const {
  CATEGORIES,
  CHANNELS
} = require('../../../application/notification/_properties/constant')
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

/**
 * TODO: DONT async!!!!!
 */
CircleService.prototype.handleNotifyUnfriendActivity = function (notificationService, accountInfo, targetAccountInfo) {
  // const registerRegion = accountInfo.region
  
  // 跟自己說
  notificationService.emitEvent({
    // registerRegion,
    category: CATEGORIES.FRIEND_EVENT,
    channels: CHANNELS.PUSH,
    sender: accountInfo,
    receivers: [accountInfo],
    content: {
      event: CONSTANT.FRIEND_EVENT_REMOVE_FRIEND,
      data: targetAccountInfo
    }
  })

  // 跟對方說
  notificationService.emitEvent({
    // registerRegion,
    category: CATEGORIES.FRIEND_EVENT,
    channels: CHANNELS.PUSH,
    sender: accountInfo,
    receivers: [targetAccountInfo],
    content: {
      event: CONSTANT.FRIEND_EVENT_REMOVE_FRIEND,
      data: accountInfo
    }
  })
}

/**
 * TODO: DONT async!!!!!
 */
CircleService.prototype.handleNotifyAllFriendsActivity = function (friendService, notificationService, accountInfo, packet, batchLimit = CONSTANT.FRIEND_BATCH_LIMIT) {
  let friendList = []
  let skip = 0
  while ((friendList = Promise.resolve(friendService.list(accountInfo, batchLimit, skip))).length > 0) {
    notificationService.emitEvent(_.assignIn(packet, { receivers: friendList }))
    skip += batchLimit
  }
}

module.exports = new CircleService()
