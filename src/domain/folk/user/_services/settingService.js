const _ = require('lodash')
const C = require('../_properties/constant')
const { parseUserInfo } = require('../_properties/util')
const authRepo = require('../_repositories/authRepository').authRepository
const userRepo = require('../_repositories/userRepository').userRepository

function SettingService (authRepo, userRepo) {
  this.authRepo = authRepo
  this.userRepo = userRepo
  console.log(`init ${arguments.callee.name}`)
}

/**
 * @param {{ uid: string, region: string }} account
 */
SettingService.prototype.getUserInfo = async function (account) {
  const user = await this.userRepo.getUser(account, C.USER_PRIVATE_INFO)
  if (user === undefined) {
    throw new Error('user not found!')
  }

  return parseUserInfo(user)
}

/**
 * @param {{ uid: string, region: string }} account
 */
SettingService.prototype.getPublicUserInfo = async function (account) {
  const user = await this.userRepo.getUser(account, C.USER_PUBLIC_INFO)
  if (user === undefined) {
    throw new Error('user not found!')
  }

  return parseUserInfo(user)
}

/**
 * @param {{ uid: string, region: string }} account
 * @param {{
  *    beSearched: boolean|null,
  *    givenName: string|null,
  *    familyName: string|null,
  *    gender: string|null,
  *    birth: Date|null,
  *    lang: string|null,
  *    publicInfo: Object|null
  * }} newUserInfo
  */
SettingService.prototype.updateUserInfo = async function (account, newUserInfo) {
  newUserInfo = _.pick(newUserInfo, C.USER_PRIVATE_UPDATE_INFO)
  await this.userRepo.updateUser(account, newUserInfo)

  return true
}

/**
 * @param {{ uid: string, region: string }} account
 */
SettingService.prototype.getUserContact = async function (account) {
  const user = await this.userRepo.getUser(account, C.USER_CONTACT)
  if (user === undefined) {
    throw new Error('user not found!')
  }

  return parseUserInfo(user)
}

/**
 * [NOTE]
 * 1. email 不可變更！不像 linkedIn 可以替換信箱
 * 2. device is not available
 * @param {{ uid: string, region: string }} account
 * @param {{
  *    alternateEmail: string|null,
  *    countryCode: string|null,
  *    phone: string|null
  * }} newUserContact
  */
SettingService.prototype.updateUserContact = async function (account, newUserContact) {
  newUserContact = _.pick(newUserContact, C.USER_UPDATE_CONTACT)
  await this.authRepo.updateContact(account, newUserContact)

  return true
}

module.exports = {
  settingService: new SettingService(authRepo, userRepo),
  SettingService
}
