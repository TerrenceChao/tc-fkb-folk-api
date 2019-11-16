const { LIMIT, SKIP } = require('../../../property/constant')
const { sameAccounts } = require('../../../property/util')
const CIRCLE_CONST = require('../_properties/constant')
const { parseInvitation, genFriendInvitationDBInfo, confirmFriendRecords } = require('../_properties/util')
const friendRepo = require('../../circle/_repositories/friendRepository').friendRepository
const inviteRepo = require('../../circle/_repositories/invitationRepository').invitationRepository

function InvitationService (friendRepo, inviteRepo) {
  this.friendRepo = friendRepo
  this.inviteRepo = inviteRepo
  console.log(`init ${arguments.callee.name}`)
}

/**
 * TODO: 在 cross region 的情境下，一方檢查 recipient, 另一方檢查 inviter.
 * @param {{ uid: string, region: string }} account
 * @param {{
 *  header: {
 *    inviteEvent: string,
 *    iid: number|null,
 *    data: {
 *      options: Array,
 *      reply: boolean|null (在回覆邀請時才會有)
 *    },
 * },
 *  inviter: {
 *    uid: string,
 *    region: string,
 *    givenName: string,
 *    familyname: string,
 *    profileLink: string,
 *    profilePic: string
 * },
 *  recipient: {
 *    uid: string,
 *    region: string,
 *    givenName: string,
 *    familyname: string,
 *    profileLink: string,
 *    profilePic: string
 * }
 * }} invitation 邀請函
 * @returns {boolean} alway true
 */
InvitationService.prototype.validateRoles = function (account, invitation) {
  // 'account' should be the valid 'recipient' or 'inviter'
  if (!sameAccounts(account, invitation.recipient) && !sameAccounts(account, invitation.inviter)) {
    throw new Error(`${arguments.callee.name}: recipient or inviter of the invitation is invalid!`)
  }

  return true
}

/**
 * 發送邀請函
 * 1. check if invitation has been sent for same person
 * 2. create invitation record.
 * @param {{
 *    uid: string,
 *    region: string,
 *    givenName: string,
 *    familyname: string,
 *    profileLink: string,
 *    profilePic: string
 * }} inviterUserInfo
 * @param {{
 *    uid: string,
 *    region: string,
 *    givenName: string,
 *    familyname: string,
 *    profileLink: string,
 *    profilePic: string
 * }} recipientUserInfo
 * @returns {Invitation}
 */
InvitationService.prototype.inviteToBeFriend = async function (inviterUserInfo, recipientUserInfo) {
  const event = CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE
  const info = genFriendInvitationDBInfo(inviterUserInfo, recipientUserInfo)
  const invitation = await this.inviteRepo.createOrUpdateInvitation(inviterUserInfo, recipientUserInfo, event, info)
  if (invitation === undefined) {
    throw new Error(`${arguments.callee.name}: create invitation fail!`)
  }

  return parseInvitation(invitation)
}

/**
 * invitation.inviter (uid, region)
 * 如果邀請方(invitation.inviter) 發現之前對方也發過邀請函給自己，表示雙方都想交朋友，直接加好友
 * @param {Invitation} invitation
 * @param {boolean} director 在更新本地區域的資料庫時為 true, 當需要更新跨區域的資料庫時，此值為 false
 * @returns {Invitation}
 */
InvitationService.prototype.confirmFriendInvitation = async function (invitation, director = true) {
  if (invitation == null) {
    throw new Error(`${arguments.callee.name}: Invitation not found`)
  }

  invitation = parseInvitation(invitation)
  invitation.header.data.reply = true
  invitation = await this.handleFriendInvitation(invitation, director)

  return invitation
}

/**
 * 根據 invitationRespose 內容決定是否加入好友，但最後一定刪除 invitation 紀錄
 * confirm:
 *  1. check: is account === recipient ?
 *  2. add friend record
 *  3. delete record
 * cancel:
 *  1. check: is account === recipient ?
 *  2. delete record
 *
 * [NOTE]: invitationRespose 中的 recipient & inviter, 一定有: { uid, region, givenName, familyName, profileLink, profilePic}
 * @param {Invitation} invitationRespose 具回覆資訊的邀請函
 * @param {boolean} director 在更新本地區域的資料庫時為 true, 當需要更新跨區域的資料庫時，此值為 false
 * @returns {Invitation}
 */
InvitationService.prototype.handleFriendInvitation = async function (invitationRespose, director = true) {
  const recipient = invitationRespose.recipient
  const inviter = invitationRespose.inviter

  /**
   * [NOTE]:
   * cross-region 的 public user info 可能找不到.
   * 所以最好可以由 client 端直接提供 public info (可直接嵌入 invitationRespose)。
   * 因此，invitationRespose 中的 recipient & inviter, 一定有:
   * { uid, region, givenName, familyName, profileLink, profilePic}
   */
  var confirmed = true
  if (invitationRespose.header.data.reply === true) {
    if (inviter.region === recipient.region) {
      const friendRecords = await this.friendRepo.makeFriends(recipient, inviter)
      confirmed = confirmFriendRecords([recipient, inviter], friendRecords)
    }

    /**
     * TODO: 在 cross region 的情境下，
     * 一方的參數為 addFriend(recipient, inviter),
     * 另一方的參數應該為 addFriend(inviter, recipient)
     */
    else if (director === true) {
      const friendRecord = await this.friendRepo.addFriend(recipient, inviter)
      confirmed = confirmFriendRecords([inviter], [friendRecord])
    } else if (director === false) {
      const friendRecord = await this.friendRepo.addFriend(inviter, recipient)
      confirmed = confirmFriendRecords([recipient], [friendRecord])
    }
  }

  const removedInvitationList = await this.inviteRepo.removeRelatedInvitation(inviter, recipient, CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE)
  if (removedInvitationList.length > 0 && confirmed) {
    invitationRespose.header.inviteEvent = CIRCLE_CONST.INVITE_EVENT_FRIEND_REPLY
    return invitationRespose
  }

  throw new Error(`${arguments.callee.name}: No invitation bwtween ${inviter} & ${recipient} OR friend record's creation fail!`)
}

/**
 * TODO: 不會只有一個，在 invitationInfo 多加一個屬性：type (inviter or recipient). invitation repo test will be modified
 * get entire invitation by account & invitationInfo (iid, region)
 * @param {{ uid: string, region: string }} account
 * @param {{ iid: number }|{ event: string }|{ iid: number, event: string }} invitationInfo
 * @returns {Invitation}
 */
InvitationService.prototype.getInvitation = async function (account, invitationInfo) {
  const invitation = await this.inviteRepo.getInvitation(account, invitationInfo)
  // ...
  return parseInvitation(invitation)
}

/**
 * account is inviter, get invitation(s) he/she sent & not being confirmed
 * @param {{ uid: string, region: string }} account
 * @param {number} limit
 * @param {number} skip
 * @returns {Invitation[]}
 */
InvitationService.prototype.getSentInvitationList = async function (account, limit = LIMIT, skip = SKIP) {
  const sentInvitationList = await this.inviteRepo.getSentInvitationList(account, limit, skip)
  return sentInvitationList.map(invitation => parseInvitation(invitation))
}

/**
 * account is recipient, get invitation(s) he/she doesn't replied
 * @param {{ uid: string, region: string }} account
 * @param {number} limit
 * @param {number} skip
 * @returns {Invitation[]}
 */
InvitationService.prototype.getReceivedInvitationList = async function (account, limit = LIMIT, skip = SKIP) {
  const receivedInvitationList = await this.inviteRepo.getReceivedInvitationList(account, limit, skip)
  return receivedInvitationList.map(invitation => parseInvitation(invitation))
}

module.exports = {
  invitationService: new InvitationService(friendRepo, inviteRepo),
  InvitationService
}
