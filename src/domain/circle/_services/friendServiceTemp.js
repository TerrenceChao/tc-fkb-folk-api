function FriendService() {
  console.log(`init ${arguments.callee.name} (template)`)
}

/**
 * 傳回用戶的所有朋友資訊，但為了節省效能，
 * 每一筆資料，僅傳回最低限量可供顯示的欄位即可
 */
FriendService.prototype.list = function (userInfo) {
  return [
    // 僅傳回最低限量可供顯示的資料即可
    {
      region: 'us',
      uid: '3d6002e2-f834-4fee-89bb-8a118cc345ee',
      profilePath: '/rfvbnju',
      profilePic: '/rfvbnju6ytghjkopoiuy',
      // no email. its private
      // no phone num. its private
      givenName: 'lydia',
      familyName: 'wang',
    },
    {
      region: 'uk',
      uid: '3fb6e6a1-abc1-4f6f-99d9-57ae6f4e759a',
      profilePath: '/asdfghjnjkoj',
      profilePic: '/asdfghjnjkojhgyu78iokjhgtfrgtyh',
      // no email. its private
      // no phone num. its private
      givenName: 'albert',
      familyName: 'lin',
    }
  ]
}

FriendService.prototype.remove = function (userInfo) {
  return '3fb6e6a1-abc1-4f6f-99d9-57ae6f4e759a'
}

/**
 * 1. friend (type 1)
 * 2. invitation has sent (type 2)
 * 3. invite (type 3)
 * 4. nothing for yourself (type 4)
 */
FriendService.prototype.getRelationStatus = function (ownerAccountInfo, visitorAccountInfo) {
  return {
    'type': 2,
    'relation': 'invitation has sent'
  }
}

module.exports = new FriendService()