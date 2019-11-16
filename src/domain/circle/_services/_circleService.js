var _ = require('lodash')
const {
  CATEGORIES,
  CHANNELS
} = require('../../../application/notification/_properties/constant')
const CONSTANT = require('../_properties/constant')

function CircleService () {
  console.log(`init ${arguments.callee.name}`)
}

/**
 * @param {InvitationService} invitationService
 * @param {{ type: number, relation: string, invitation: Invitation|null, owner: Object|null, visitor: Object|null }} relationship
 * @returns {Promise}
 */
CircleService.prototype.handleInviteActivity = async function (invitationService, relationship) {
  switch (relationship.type) {
    // 1. user self
    case CONSTANT.RELATION_STATUS_SELF:
      return Promise.reject(new Error('You cannot send invitation to yourself'))

    // 2. are aleady friends
    case CONSTANT.RELATION_STATUS_FRIEND:
      return Promise.reject(new Error('You are already friends'))

    // 3. add friend & notify
    case CONSTANT.RELATION_STATUS_BE_INVITED:
      return Promise.resolve(invitationService.confirmFriendInvitation(relationship.invitation))

    // 4. send invitation & notify (has invited)
    case CONSTANT.RELATION_STATUS_INVITED:
      return relationship.invitation

    // 5. send invitation & notify
    case CONSTANT.RELATION_STATUS_STRANGER:
      // 'visitor' send invitation to 'owner'
      var { visitor, owner } = relationship
      return Promise.resolve(invitationService.inviteToBeFriend(visitor, owner))

    default:
      return Promise.reject(new Error('The type of relationship is not defined'))
  }
}

/**
 * [NOTE] DONT async!!!!!
 * TODO:check the process if request is cross-region
 * @param {NotificationService} notificationService
 * @param {{ uid: string, region: string }} account
 * @param {{ uid: string, region: string }} targetAccount
 */
CircleService.prototype.handleNotifyUnfriendActivity = function (notificationService, account, targetAccount) {
  // const registerRegion = account.region

  // 跟自己說
  notificationService.emitEvent({
    // registerRegion,
    category: CATEGORIES.FRIEND_EVENT,
    channels: CHANNELS.PUSH,
    sender: account,
    receivers: [account],
    packet: {
      event: CONSTANT.FRIEND_EVENT_REMOVE_FRIEND,
      content: targetAccount
    }
  })

  // 跟對方說
  notificationService.emitEvent({
    // registerRegion,
    category: CATEGORIES.FRIEND_EVENT,
    channels: CHANNELS.PUSH,
    sender: account,
    receivers: [targetAccount],
    packet: {
      event: CONSTANT.FRIEND_EVENT_REMOVE_FRIEND,
      content: account
    }
  })
}

/**
 * [NOTE] DONT async!!!!!
 * TODO: test doesn't pass.
 * @param {FriendService} friendService
 * @param {NotificationService} notificationService
 * @param {{ uid: string, region: string }} account
 * @param {any} packet
 * @param {number} batchLimit
 */
CircleService.prototype.handleNotifyAllFriendsActivity = function (friendService, notificationService, account, packet, batchLimit = CONSTANT.FRIEND_BATCH_LIMIT) {
  (async function (friendList, skip) {
    while ((friendList = await friendService.list(account, batchLimit, skip)).length > 0) {
      notificationService.emitEvent(_.assignIn(packet, { receivers: friendList }))
      skip += batchLimit
    }
  })([], 0)
}

module.exports = new CircleService()
