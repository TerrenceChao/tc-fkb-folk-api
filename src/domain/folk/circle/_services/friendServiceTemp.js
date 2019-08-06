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
      email: 'lydia@gmail.com',
      // no phone num. its private
      givenName: 'lydia',
      familyName: 'wang',
    },
    {
      region: 'uk',
      uid: '3fb6e6a1-abc1-4f6f-99d9-57ae6f4e759a',
      email: 'albert@gmail.com',
      // no phone num. its private
      givenName: 'albert',
      familyName: 'lin',
    }
  ]
}

FriendService.prototype.remove = function (userInfo) {
  return '3fb6e6a1-abc1-4f6f-99d9-57ae6f4e759a'
}

module.exports = new FriendService()