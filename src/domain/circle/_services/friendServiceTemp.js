const CONSTANT = require('../../../property/constant')
const CIRCLE_CONST = require('../_properties/constant')

// TODO: for temporary
const userRepo = require('../../folk/user/_repositories/authRepositoryTemp')
const inviteRepo = require('../../folk/user/_repositories/authRepositoryTemp')
const friendRepo = require('../../folk/user/_repositories/authRepositoryTemp')

function FriendService (userRepo, inviteRepo, friendRepo) {
  this.userRepo = userRepo
  this.inviteRepo = inviteRepo
  this.friendRepo = friendRepo
  console.log(`init ${arguments.callee.name} (template)`)
}

/**
 * 傳回用戶的所有朋友資訊，但為了節省效能，
 * 每一筆資料，僅傳回最低限量可供顯示的欄位即可
 */
FriendService.prototype.list = async function (account, limit = CONSTANT.LIMIT, skip = CONSTANT.SKIP) {
  return await this.friendRepo.getFriendList(account, limit, skip)

  // return [
  //   // 僅傳回最低限量可供顯示的資料即可
  //   {
  //     region: 'us',
  //     uid: '3d6002e2-f834-4fee-89bb-8a118cc345ee',
  //     profileLink: '/rfvbnju',
  //     profilePic: '/rfvbnju6ytghjkopoiuy',
  //     // no email. its private
  //     // no phone num. its private,
  //     givenName: 'lydia',
  //     familyName: 'wang',
  //     allowFollowMe: true, // TODO: 重要。但開始有 post 時才有用
  //   },
  //   {
  //     region: 'uk',
  //     uid: '3fb6e6a1-abc1-4f6f-99d9-57ae6f4e759a',
  //     profileLink: '/asdfghjnjkoj',
  //     profilePic: '/asdfghjnjkojhgyu78iokjhgtfrgtyh',
  //     // no email. its private
  //     // no phone num. its private
  //     givenName: 'albert',
  //     familyName: 'lin',
  //     allowFollowMe: false, // TODO: 重要。但開始有 post 時才有用
  //   }
  // ]
}

/**
 * TODO: 在跨區域機制下提供 dispatch-api 呼叫
 */
// FriendService.prototype.getRegionList = async function (account) {

// }

/**
 * NOTE: [deprecated]
 * TODO: 僅搜尋特定區域的朋友. 在跨區域機制下提供 dispatch-api 呼叫
 * 傳回用戶的所有朋友資訊，但為了節省效能，
 * 每一筆資料，僅傳回最低限量可供顯示的欄位即可
 */
// FriendService.prototype.listByRegion = async function (account, friendsRegion, limit = CONSTANT.LIMIT, skip = CONSTANT.SKIP) {
//   return await this.friendRepo.getFriendListByRegion(account, friendsRegion, limit, skip)

//   return [
//     // 僅傳回最低限量可供顯示的資料即可
//     {
//       region: 'us',
//       uid: '3d6002e2-f834-4fee-89bb-8a118cc345ee',
//       profileLink: '/rfvbnju',
//       profilePic: '/rfvbnju6ytghjkopoiuy',
//       // no email. its private
//       // no phone num. its private,
//       givenName: 'lydia',
//       familyName: 'wang',
//       allowFollowMe: true, // TODO: 重要。但開始有 post 時才有用
//     },
//     {
//       region: 'uk',
//       uid: '3fb6e6a1-abc1-4f6f-99d9-57ae6f4e759a',
//       profileLink: '/asdfghjnjkoj',
//       profilePic: '/asdfghjnjkojhgyu78iokjhgtfrgtyh',
//       // no email. its private
//       // no phone num. its private
//       givenName: 'albert',
//       familyName: 'lin',
//       allowFollowMe: false, // TODO: 重要。但開始有 post 時才有用
//     }
//   ]
// }

/**
 * find a friend of someone (account)
 */
FriendService.prototype.findOne = async function (account, targetAccount) {
  return await this.friendRepo.getFriend(account, targetAccount)

  // return {
  //   region: targetAccount.targetRegion,
  //   uid: targetAccount.targetUid,
  //   profileLink: '/asdfghjnjkoj',
  //   profilePic: '/asdfghjnjkojhgyu78iokjhgtfrgtyh',
  //   // no email. its private
  //   // no phone num. its private
  //   givenName: 'albert',
  //   familyName: 'lin',
  //   allowFollowMe: true, // TODO: 重要。但開始有 post 時才有用
  // }
}

/**
 * remove someone's (account) friend.
 * [NOTE]: this.friendRepo 在同區域時,會刪除兩筆紀錄(unfriend); 在不同區域時只會刪除一筆(removeFriend)
 */
FriendService.prototype.unfriend = async function (account, targetAccount) {
  // return await this.friendRepo.removeFriend(account, targetAccount)
  return Promise.all([
    this.friendRepo.removeFriend(account, targetAccount),
    this.friendRepo.removeFriend(targetAccount, account)
  ])
    .then(result => result[0])

  // return {
  //   uid: targetAccount.targetUid,
  //   region: targetAccount.targetRegion
  // }
}

/**
 * 1. user self (type 1)
 * 2. friend (type 2)
 * 3. user is invited (type 3)
 * 4. user invited someone (type 4)
 * 5. stranger
 */
FriendService.prototype.getRelationship = async function (ownerAccount, visitorAccount) {
  // 1. user self
  if (ownerAccount.uid === visitorAccount.uid && ownerAccount.region === visitorAccount.region) {
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
  var invitation = await this.inviteRepo.getInvitationByRoles(visitorAccount, ownerAccount)
  if (invitation == null) {
    return {
      type: CIRCLE_CONST.RELATION_STATUS_STRANGER,
      relation: 'stranger',
      owner: ownerAccount,
      visitor: visitorAccount
    }
  }

  const inviter = invitation.inviter
  const recipient = invitation.recipient
  // 3. user (account) is invited
  if (recipient.uid === visitorAccount.uid && recipient.region === visitorAccount.region) {
    return {
      type: CIRCLE_CONST.RELATION_STATUS_BE_INVITED,
      relation: 'you are invited',
      invitation
    }
  }

  // 4. user has sent invitation to someone
  if (inviter.uid === visitorAccount.uid && inviter.region === visitorAccount.region) {
    return {
      type: CIRCLE_CONST.RELATION_STATUS_INVITED,
      relation: 'invitation has sent',
      invitation
    }
  }
}

module.exports = {
  friendService: new FriendService(userRepo, inviteRepo, friendRepo),
  FriendService
}
