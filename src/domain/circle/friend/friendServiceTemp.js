const CONSTANT = require('../../../property/constant')
const CIRCLE_CONST = require('../_properties/constant')

// TODO: for temporary
const friendRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')
const inviteRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')

function FriendService(friendRepo, inviteRepo) {
  this.friendRepo = friendRepo
  this.inviteRepo = inviteRepo
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
 * 1. user self (type 1)
 * 2. friend (type 2)
 * 3. user is invited (type 3)
 * 4. user invited someone (type 4)
 * 5. stranger
 */
FriendService.prototype.getRelationship = async function (ownerAccountInfo, visitorAccountInfo) {
  // 1. user self
  if (ownerAccountInfo.uid === visitorAccountInfo.uid && ownerAccountInfo.region === visitorAccountInfo.region) {
    return {
      type: CIRCLE_CONST.RELATION_STATUS_SELF,
      relation: 'myself'
    }
  }

  // 2. you are friend
  var friend = await this.friendRepo.getFriend(ownerAccountInfo, visitorAccountInfo)
  if (friend != null) {
    return {
      type: CIRCLE_CONST.RELATION_STATUS_FRIEND,
      relation: 'friend'
    }
  }

  // 5. stranger
  var invitation = await this.inviteRepo.getInvitationByRoles(ownerAccountInfo, visitorAccountInfo)
  if (invitation == null) {
    return {
      type: CIRCLE_CONST.RELATION_STATUS_STRANGER,
      relation: 'stranger'
    }
  } 
  
  const inviter = invitation.inviter
  const recipient = invitation.recipient
  // 3. user (accountInfo) is invited
  if (recipient.uid === visitorAccountInfo.uid && recipient.region === visitorAccountInfo.region) {
    return {
      type: CIRCLE_CONST.RELATION_STATUS_BE_INVITED,
      relation: 'you are invited',
      invitation,
    }
  }

  // 4. user has sent invitation to someone
  if (inviter.uid === visitorAccountInfo.uid && inviter.region === visitorAccountInfo.region) {
    return {
      type: CIRCLE_CONST.RELATION_STATUS_INVITED,
      relation: 'invitation has sent',
    }
  }
}

module.exports = {
  friendService: new FriendService(friendRepo, inviteRepo),
  FriendService
}