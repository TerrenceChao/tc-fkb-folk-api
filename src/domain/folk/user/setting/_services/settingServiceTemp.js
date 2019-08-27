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
    uid: '6d23430a-ccef-47b7-b1eb-2cf70e6bd9ca',
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
    uid: '6d23430a-ccef-47b7-b1eb-2cf70e6bd9ca',
    email: 'terrence@gmail.com',
    phone: '+886-123-456-789', // (private)
    givenName: 'albert',
    familyName: 'chao',
    gender: 'male',
    birth: '2013-12-12'
  }
}

module.exports = new SettingService()