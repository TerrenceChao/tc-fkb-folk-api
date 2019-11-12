const CONSTANT = require('../../user/_properties/constant')
const userRepo = require('../_repositories/authRepositoryTemp')

function SettingService (userRepo) {
  this.userRepo = userRepo
  console.log(`init ${arguments.callee.name} (template)`)
}

/**
 * account 至少有 uid, region,
 * 額外的資訊才有 email, phone, ....
 */
SettingService.prototype.getUserInfo = async function (account) {
  const user = await this.userRepo.getUser(account)
  if (user != null) {
    return user
  }

  throw new Error('User not found')
  // var err = new Error('SettingService causes error!')
  // err.status = 501
  // throw err

  // return {
  //   region: 'us',
  //   lang: 'en',
  //   uid: '6d23430a-ccef-47b7-b1eb-2cf70e6bd9ca',
  //   email: 'alice.wang@outlook.com',
  //   givenName: 'alice',
  //   familyName: 'wang',
  //   gender: 'female',
  //   birth: '2019-08-01',
  // }
}

/**
 * account 至少有 uid, region,
 * 額外的資訊才有 email, phone, ....
 */
SettingService.prototype.getPublicUserInfo = async function (account) {
  const user = await this.userRepo.getUser(account, CONSTANT.USER_PUBLIC_INFO)
  if (user != null) {
    return user
  }

  throw new Error('User not found')
  // var err = new Error('SettingService causes error!')
  // err.status = 501
  // throw err

  // return {
  //   region: 'us',
  //   uid: '6d23430a-ccef-47b7-b1eb-2cf70e6bd9ca',
  //   lang: 'en',
  //   gender: 'female',
  //   birth: '2019-08-01',
  //   email: 'alice.wang@outlook.com',
  //   phone: '+886-987-654-321',
  //   givenName: 'alice',
  //   familyName: 'wang',
  //   profileLink: 'xxxxxxxxxxx',
  //   profilePic: 'xxxxxxxxxxx',
  // }
}

/**
 * account 至少有 uid, region,
 * 額外的資訊才有 email, phone, ....
 */
SettingService.prototype.updateUserInfo = async function (account, userInfo) {
  const updated = await this.userRepo.updateUser(account, userInfo)
  if (updated == true) {
    return updated
  }

  throw new Error('Update user info fail')

  // var err = new Error('SettingService causes error!')
  // err.status = 501
  // throw err

  // return {
  //   region: 'tw',
  //   uid: '6d23430a-ccef-47b7-b1eb-2cf70e6bd9ca',
  //   lang: 'zh-tw',
  //   gender: 'male',
  //   birth: '2013-12-12',
  //   // email: 'terrence@gmail.com',
  //   phone: '+886-123-456-789', // (private)
  //   givenName: 'albert',
  //   familyName: 'chao',
  //   // profileLink: 'xxxxxxxxxxx',
  //   profilePic: 'xxxxxxxxxxx',
  // }
}

SettingService.prototype.getUserContact = async function (account) {}

SettingService.prototype.updateUserContact = async function (account, newUserContact) {}

module.exports = {
  settingService: new SettingService(userRepo),
  SettingService
}
