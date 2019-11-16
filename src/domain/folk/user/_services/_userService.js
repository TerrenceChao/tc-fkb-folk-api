const _ = require('lodash')
const { mapKeysInCamelCase } = require('../../../../property/util')
const USER_PRIVATE_INFO = require('../_properties/constant').USER_PRIVATE_INFO

function UserService () {
  console.log(`init ${arguments.callee.name}`)
}

/**
 * get user's personal info & filter some secret/unecessery info
 * @param {Object} userInfo
 * @returns {Object} userInfo
 */
UserService.prototype.getPersonalInfo = function (userInfo) {
  return _.pick(userInfo, USER_PRIVATE_INFO)
}

const PROFILE_PARTS = {
  0: 'relationStatus',
  1: 'about'
}

/**
 * get a user's public info (about) & relationships between visitor
 * @param {Object[]} responsData
 * @returns {Object} header of profile
 */
UserService.prototype.packetProfileHeader = function (responsData) {
  return responsData.reduce((profileInfo, info, part) => {
    profileInfo[PROFILE_PARTS[part]] = info
    return profileInfo
  }, {})
}

const REGISTER_INFO_PARTS = {
  0: 'userInfo',
  1: 'msgInfo',
  2: 'notifyInfo',
  3: 'friendList'
}

/**
 * mark the serviceInfo with label: userInfo, msgInfo, notifyInfo or friendList
 * @param {Object[]} serviceInfoList
 * @returns {{ userInfo: Object, msgInfo: Object, notifyInfo: Object, friendList: Friend[] }}
 */
UserService.prototype.packetRegisterInfo = function (serviceInfoList) {
  return serviceInfoList.reduce((serviceInfo, info, part) => {
    if (Array.isArray(info)) {
      serviceInfo[REGISTER_INFO_PARTS[part]] = info.map(item => mapKeysInCamelCase(item))
    } else {
      serviceInfo[REGISTER_INFO_PARTS[part]] = info
    }
    return serviceInfo
  }, {})
}

module.exports = new UserService()
