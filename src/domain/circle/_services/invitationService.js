const _ = require('lodash')
const { LIMIT, SKIP } = require('../../../property/constant')
const { sameAccounts } = require('../../../property/util')
const CIRCLE_CONST = require('../_properties/constant')
const { parseInvitation, genFriendInvitationDBInfo, confirmFriendRecords } = require('../_properties/util')
const userRepo = require('../../folk/user/_repositories/authRepository').authRepository
const friendRepo = require('../../circle/_repositories/friendRepository').friendRepository
const inviteRepo = require('../../circle/_repositories/invitationRepository').invitationRepository

function InvitationService (userRepo, friendRepo, inviteRepo) {
  this.userRepo = userRepo
  this.friendRepo = friendRepo
  this.inviteRepo = inviteRepo
  console.log(`init ${arguments.callee.name}`)
}

/**
 * TODO: 在 cross region 的情境下，一方檢查 recipient, 另一方檢查 inviter.
 */
InvitationService.prototype.validateRoles = function (account, invitation) {
  // 'account' should be the valid 'recipient' or 'inviter'
  if (!sameAccounts(account, invitation.recipient) && !sameAccounts(account, invitation.inviter)) {
    throw new Error('recipient or inviter of the invitation is invalid!')
  }

  return true
}

/**
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
 */
InvitationService.prototype.inviteToBeFriend = async function (inviterUserInfo, recipientUserInfo) {
  const event = CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE
  const info = genFriendInvitationDBInfo(inviterUserInfo, recipientUserInfo)
  const invitation = await this.inviteRepo.createOrUpdateInvitation(inviterUserInfo, recipientUserInfo, event, info)

  return parseInvitation(invitation)
}

/**
 * invitation.inviter (uid, region)
 * 如果邀請方(invitation.inviter) 發現之前對方也發過邀請函給自己，表示雙方都想交朋友，直接加好友
 */
InvitationService.prototype.confirmFriendInvitation = async function (invitation, inviterAccount /** [deprecated] */, director = true) {
  if (invitation == null) {
    throw new Error('Invitation not found')
  }

  invitation = parseInvitation(invitation)
  invitation.header.data.reply = true
  invitation = await this.handleFriendInvitation(invitation, null /** [deprecated] */, director)

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
 * [NOTE]:
 * invitationRespose 中的 recipient & inviter, 一定有:
 * { uid, region, givenName, familyName, profileLink, profilePic}
 */
InvitationService.prototype.handleFriendInvitation = async function (invitationRespose, account /** [deprecated] */, director = true) {
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
    // const selectedFields = ['givenName', 'familyName', 'publicInfo']
    // const userList = await this.userRepo.getPairUsers(inviter, recipient, selectedFields)
    // switch (userList.length.toString()) {
    //   // same region
    //   case '2':
    //     var recipientInfo = userList.find(user => user.uid === recipient.uid)
    //     var inviterInfo = userList.find(user => user.uid === inviter.uid)
    //     await this.friendRepo.makeFriends(
    //       parsePublicInfo(recipientInfo),
    //       parsePublicInfo(inviterInfo)
    //     )
    //     break

    //   // cross region
    //   case '1':
    //     // find local region first
    //     var localRegion = userList[0].region
    //     await this.friendRepo.addFriend(
    //       localRegion === recipient.region ? recipient : inviter,
    //       localRegion !== recipient.region ? recipient : inviter
    //     )
    //     break

    //   // length maybe '0' OR >= '3', something goes wrong!
    //   default:
    //     throw new Error(`No user info found by ${inviter} OR ${recipient}`)
    // }
  }

  const removedInvitationList = await this.inviteRepo.removeRelatedInvitation(recipient, inviter)
  if (removedInvitationList > 0 && confirmed) {
    invitationRespose.header.inviteEvent = CIRCLE_CONST.INVITE_EVENT_FRIEND_REPLY
    return invitationRespose
  }

  throw new Error(`No invitation bwtween ${inviter} & ${recipient} OR friend record's creation fail!`)
}

/**
 * get entire invitation by account & invitationInfo (iid, region)
 */
InvitationService.prototype.getInvitation = async function (account, invitationInfo) {
  /**
   * TODO: 不會只有一個，在 invitationInfo 多加一個屬性：type (inviter or recipient)
   * invitation repo test will be modified
   */
  const invitation = await this.inviteRepo.getInvitation(account, invitationInfo)
  // ...
  return invitation
}

InvitationService.prototype.getSentInvitationList = async function (account, limit = LIMIT, skip = SKIP) {
  const sentInvitationList = await this.inviteRepo.getSentInvitationList(account, limit, skip)
  return sentInvitationList
}

InvitationService.prototype.getReceivedInvitationList = async function (account, limit = LIMIT, skip = SKIP) {
  const receivedInvitationList = await this.inviteRepo.getReceivedInvitationList(account, limit, skip)
  return receivedInvitationList
}

module.exports = {
  invitationService: new InvitationService(userRepo, friendRepo, inviteRepo),
  InvitationService
}
