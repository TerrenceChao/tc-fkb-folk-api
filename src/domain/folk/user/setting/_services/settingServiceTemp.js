function SettingService() {
  console.log(`init ${arguments.callee.name} (template)`)
}

/**
 * accountInfo 至少有 uid, region,
 * 額外的資訊才有 email, phone, ....
 */
SettingService.prototype.getUserInfo = async function (accountInfo) {
  // create record in account 

  // var err = new Error(`SettingService causes error!`)
  // err.status = 501
  // throw err

  return {
    region: 'us',
    lang: 'en',
    uid: '4bfd676f-ce80-404d-82db-4642a6543c09',
    email: 'alice.wang@outlook.com',
    givenName: 'alice',
    familyName: 'wang',
    gender: 'female',
    birth: '2019-08-01',
  }
}

/**
 * accountInfo 至少有 uid, region,
 * 額外的資訊才有 email, phone, ....
 */
SettingService.prototype.updateUserInfo = async function (accountInfo, userInfo) {
  // create record in account 

  // var err = new Error(`SettingService causes error!`)
  // err.status = 501
  // throw err

  return {
    region: 'tw',
    lang: 'zh-tw',
    uid: '4bfd676f-ce80-404d-82db-4642a6543c09',
    email: 'terrence@gmail.com',
    phone: '+886-123-456-789', // (private)
    givenName: 'albert',
    familyName: 'chao',
    gender: 'male',
    birth: '2013-12-12'
  }
}

module.exports = new SettingService()