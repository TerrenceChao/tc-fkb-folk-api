const CONSTANT = require('../../../property/constant')

// TODO: for temporary
const userRepo = require('../../folk/user/_repositories/authRepositoryTemp')
const friendRepo = require('../../folk/user/_repositories/authRepositoryTemp')
const inviteRepo = require('../../folk/user/_repositories/authRepositoryTemp')

function InvitationService (userRepo, friendRepo, inviteRepo) {
  this.userRepo = userRepo
  this.friendRepo = friendRepo
  this.inviteRepo = inviteRepo
  console.log(`init ${arguments.callee.name}`)
}

/**
 * 1. check if invitation has been sent for same person
 * 2. create invitation record.
 */
InvitationService.prototype.inviteToBeFriend = async function (accountInfo, targetAccountInfo) {

}

/**
 * inviterAccountInfo (uid, region)
 * 如果邀請方(inviterAccountInfo) 發現之前對方也發過邀請函給自己，表示雙方都想交朋友，直接加好友
 */
InvitationService.prototype.confirmFriendInvitation = async function (invitation, inviterAccountInfo) {

}

/**
 * 根據 invitationRes 內容決定是否加入好友，但最後一定刪除 invitation 紀錄
 * confirm:
 *  1. check: is accountInfo === recipient ?
 *  2. add friend record
 *  3. delete record
 * cancel:
 *  1. check: is accountInfo === recipient ?
 *  2. delete record
 */
InvitationService.prototype.handleFriendInvitation = async function (accountInfo, invitationRes) {

}

/**
 * get entire invitation by accountInfo & invitationInfo (iid, region)
 */
InvitationService.prototype.getInvitation = async function (accountInfo, invitationInfo) {

}

/**
 * get list by accountInfo with page (limit, skip)
 * inviteArrow: [sent,received]
 * inviteCategory: [friend,society]
 */
InvitationService.prototype.getInvitationList = async function (accountInfo, inviteArrow, limit = CONSTANT.LIMIT, skip = CONSTANT.SKIP) {

}

module.exports = {
  invitationService: new InvitationService(userRepo, friendRepo, inviteRepo),
  InvitationService
}
