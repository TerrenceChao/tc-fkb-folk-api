const CONSTANT = require('../../../property/constant')
const CIRCLE_CONST = require('../_properties/constant')

// TODO: for temporary
const friendRepo = require('../../folk/user/_repositories/authRepositoryTemp')
const inviteRepo = require('../../folk/user/_repositories/authRepositoryTemp')

function FriendService(friendRepo, inviteRepo) {
  this.friendRepo = friendRepo
  this.inviteRepo = inviteRepo
  console.log(`init ${arguments.callee.name}`)
}

/**
 * 傳回用戶的所有朋友資訊，但為了節省效能，
 * 每一筆資料，僅傳回最低限量可供顯示的欄位即可
 */
FriendService.prototype.list = async function (accountInfo, limit = CONSTANT.LIMIT, skip = CONSTANT.SKIP) {

}

/**
 * TODO: 在跨區域機制下提供 dispatch-api 呼叫
 */
// FriendService.prototype.getRegionList = async function (accountInfo) {

// }

/**
 * TODO: 僅搜尋特定區域的朋友. 在跨區域機制下提供 dispatch-api 呼叫
 * 傳回用戶的所有朋友資訊，但為了節省效能，
 * 每一筆資料，僅傳回最低限量可供顯示的欄位即可
 */
// FriendService.prototype.listByRegion = async function (accountInfo, friendsRegion, limit = CONSTANT.LIMIT, skip = CONSTANT.SKIP) {

// }

/**
 * find a friend of someone (accountInfo)
 */
FriendService.prototype.findOne = async function (accountInfo, targetAccountInfo) {

}

/**
 * remove someone's (accountInfo) friend.
 * TODO: this.friendRepo.removeFriend 在同區域時,會刪除兩筆紀錄; 在不同區域時只會刪除一筆
 */
FriendService.prototype.remove = async function (accountInfo, targetAccountInfo) {  

}

/**
 * 1. user self (type 1)
 * 2. friend (type 2)
 * 3. user is invited (type 3)
 * 4. user invited someone (type 4)
 * 5. stranger
 */
FriendService.prototype.getRelationship = async function (ownerAccountInfo, visitorAccountInfo) {

}

module.exports = {
  friendService: new FriendService(friendRepo, inviteRepo),
  FriendService
}