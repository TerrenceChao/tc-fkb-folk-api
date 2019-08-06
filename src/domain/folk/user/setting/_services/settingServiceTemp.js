function SettingService() {
  console.log(`init ${arguments.callee.name} (template)`)
}

SettingService.prototype.getUserInfo = async function (uid) {
  // create record in account 

  // var err = new Error(`SettingService causes error!`)
  // err.status = 501
  // throw err

  return {
    region: 'tw',
    lang: 'zh-tw',
    uid: '4bfd676f-ce80-404d-82db-4642a6543c09',
    email: 'terrence@gmail.com',
    givenName: 'terrence',
    familyName: 'chao',
    gender: 'male',
    birth: '2019-08-01',
  }
}

module.exports = new SettingService()