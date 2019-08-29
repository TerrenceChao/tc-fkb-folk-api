const CONSTANT = require('../../../property/constant')

// TODO: for temporary
const friendRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')

function FriendService(friendRepo) {
  this.friendRepo = friendRepo
  console.log(`init ${arguments.callee.name} (template)`)
}

/**
 * 傳回用戶的所有朋友資訊，但為了節省效能，
 * 每一筆資料，僅傳回最低限量可供顯示的欄位即可
 */
FriendService.prototype.list = async function (accountInfo, limit = CONSTANT.LIMIT, skip = CONSTANT.SKIP) {
  return await this.friendRepo.getFriendList(accountInfo, limit, skip)
  
  return [
    // 僅傳回最低限量可供顯示的資料即可
    {
      region: 'us',
      uid: '3d6002e2-f834-4fee-89bb-8a118cc345ee',
      profileLink: '/rfvbnju',
      profilePic: '/rfvbnju6ytghjkopoiuy',
      // no email. its private
      // no phone num. its private,
      givenName: 'lydia',
      familyName: 'wang',
      allowFollowMe: true, // TODO: 重要。但開始有 post 時才有用
    },
    {
      region: 'uk',
      uid: '3fb6e6a1-abc1-4f6f-99d9-57ae6f4e759a',
      profileLink: '/asdfghjnjkoj',
      profilePic: '/asdfghjnjkojhgyu78iokjhgtfrgtyh',
      // no email. its private
      // no phone num. its private
      givenName: 'albert',
      familyName: 'lin',
      allowFollowMe: false, // TODO: 重要。但開始有 post 時才有用
    }
  ]
}

/**
 * find a friend of someone (accountInfo)
 */
FriendService.prototype.findOne = async function (accountInfo, targetAccountInfo) {
  return await this.friendRepo.getFriend(accountInfo, targetAccountInfo)

  return {
    region: targetAccountInfo.target_region,
    uid: targetAccountInfo.target_uid,
    profileLink: '/asdfghjnjkoj',
    profilePic: '/asdfghjnjkojhgyu78iokjhgtfrgtyh',
    // no email. its private
    // no phone num. its private
    givenName: 'albert',
    familyName: 'lin',
    allowFollowMe: true, // TODO: 重要。但開始有 post 時才有用
  }
}

/**
 * remove someone's (accountInfo) friend.
 */
FriendService.prototype.remove = async function (accountInfo, targetAccountInfo) {  
  return await this.friendRepo.removeFriend(accountInfo, targetAccountInfo)

  return {
    uid: targetAccountInfo.target_uid,
    region: targetAccountInfo.target_region
  }
}

/**
 * 1. friend (type 1)
 * 2. stranger (type 2)
 * 3. has invited (type 3)
 * 4. nothing for yourself (type 4)
 */
FriendService.prototype.getRelationStatus = async function (ownerAccountInfo, visitorAccountInfo) {
  return await this.friendRepo.relation(ownerAccountInfo, visitorAccountInfo)
  
  return {
    'type': 2,
    'relation': 'invitation has sent'
  }
}

module.exports = {
  friendService: new FriendService(friendRepo),
  FriendService
}