const CONSTANT = require('../../../property/constant')
const { sameAccounts } = require('../../../property/util')
const CIRCLE_CONST = require('../_properties/constant')
const { parseFriendInvitation } = require('../_properties/util')
const userRepo = require('../../folk/user/_repositories/userRepository').userRepository
const inviteRepo = require('../../circle/_repositories/invitationRepository').invitationRepository
const friendRepo = require('../../circle/_repositories/friendRepository').friendRepository

function FriendService (userRepo, inviteRepo, friendRepo) {
  this.userRepo = userRepo
  this.inviteRepo = inviteRepo
  this.friendRepo = friendRepo
  console.log(`init ${arguments.callee.name}`)
}

/**
 * 傳回用戶的所有朋友資訊，但為了節省效能，
 * 每一筆資料，僅傳回最低限量可供顯示的欄位即可
 * @param {{ uid: string, region: string }} account
 * @param {number} limit
 * @param {number} skip
 * @returns {Friend[]} Friend: { id: number, uid: string, group: string|null, friend_uid: string, friend: region, public }
 */
FriendService.prototype.list = async function (account, limit = CONSTANT.LIMIT, skip = CONSTANT.SKIP) {
  const list = await this.friendRepo.getFriendList(account, limit, skip)
  if (list == null || list.length === 0) {
    return []
  }

  return list
}

/**
 * find a friend of someone (account)
 * @param {{ uid: string, region: string }} account
 * @param {{ uid: string, region: string }} targetAccount
 * @returns {Friend}
 */
FriendService.prototype.findOne = async function (account, targetAccount) {
  const friend = await this.friendRepo.getFriend(account, targetAccount)
  return friend
}

/**
 * remove someone's (account) friend.
 * [NOTE]: this.friendRepo 在同區域時,會刪除兩筆紀錄(unfriend); 在不同區域時只會刪除一筆(removeFriend)
 * @param {{ uid: string, region: string }} account
 * @param {{ uid: string, region: string }} targetAccount
 * @param {boolean} softDelete 在本地區域時直接刪除(true), 在需要與跨區域資料庫同步更新時(達成最終一致性)，考慮 rollback 事件需要設定為 false
 * @returns {Friend|Friend[]|string}
 */
FriendService.prototype.unfriend = async function (account, targetAccount, softDelete = false) {
  /**
   * 若同一個國家有多個區域該如何處理？一樣的。基本上會用到這個 function, 在 web-api
   * 就知道這裡是哪個區域，刪除時僅需考慮 account OR targetAccount 其中一個的那個區域即可。
   */
  if (account.region === targetAccount.region) {
    const deletedFriendList = await this.friendRepo.unfriend(account, targetAccount, softDelete)
    // TODO: 是否需要額外的判斷？比如一定回傳 2 筆紀錄
    if (deletedFriendList == null || deletedFriendList.length === 0) {
      return 'friend has been deleted'
    }
    return deletedFriendList
  }

  const deletedFriend = await this.friendRepo.removeFriend(account, targetAccount, softDelete)
  // TODO: 是否需要額外的判斷？比如一定回傳 1 筆紀錄
  if (deletedFriend == null) {
    return 'friend has been deleted'
  }
  return deletedFriend
}

/**
 * 1. user self (type 1)
 * 2. friend (type 2)
 * 3. user is invited (type 3)
 * 4. user invited someone (type 4)
 * 5. stranger
 * @param {
 *    uid: string,
 *    region: string,
 *    givenName: string,
 *    familyname: string,
 *    profileLink: string,
 *    profilePic: string
 * } ownerAccount
 * @param {
 *    uid: string,
 *    region: string,
 *    givenName: string,
 *    familyname: string,
 *    profileLink: string,
 *    profilePic: string
 * } visitorAccount
 * @returns {{ type: number, relation: string, invitation: Invitation|null, owner: Object|null, visitor: Object|null }}
 */
FriendService.prototype.getRelationship = async function (ownerAccount, visitorAccount) {
  // 1. user self
  if (sameAccounts(ownerAccount, visitorAccount)) {
    return {
      type: CIRCLE_CONST.RELATION_STATUS_SELF,
      relation: 'myself'
    }
  }

  // 2. you are friend
  var friend = await this.friendRepo.getFriend(ownerAccount, visitorAccount)
  if (friend != null) {
    return {
      type: CIRCLE_CONST.RELATION_STATUS_FRIEND,
      relation: 'friend'
    }
  }

  // 5. stranger
  var invitation = await this.inviteRepo.getInvitationByRoles(ownerAccount, visitorAccount)
  if (invitation == null) {
    /**
     * TODO:
     * cross-region 的 public user info 可能找不到.
     * 所以最好可以由 client 端直接提供 public info (可直接嵌入 ownerAccount, visitorAccount)。
     */
    // const selectedFields = ['givenName', 'familyName', 'publicInfo']
    // const userList = await this.userRepo .getPairUsers(ownerAccount, visitorAccount, selectedFields)
    return {
      type: CIRCLE_CONST.RELATION_STATUS_STRANGER,
      relation: 'stranger',
      owner: ownerAccount, // userList.find(user => user.uid === ownerAccount.uid),
      visitor: visitorAccount // userList.find(user => user.uid === visitorAccount.uid)
    }
  }

  invitation = parseFriendInvitation(invitation)
  // 3. user (account) is invited
  if (sameAccounts(invitation.recipient, visitorAccount)) {
    return {
      type: CIRCLE_CONST.RELATION_STATUS_BE_INVITED,
      relation: 'you are invited',
      invitation
    }
  }

  // 4. user has sent invitation to someone
  if (sameAccounts(invitation.inviter, visitorAccount)) {
    return {
      type: CIRCLE_CONST.RELATION_STATUS_INVITED,
      relation: 'invitation has sent',
      invitation
    }
  }

  throw new Error('relationship between owner & visitor are not found.')
}

module.exports = {
  friendService: new FriendService(userRepo, inviteRepo, friendRepo),
  FriendService
}
