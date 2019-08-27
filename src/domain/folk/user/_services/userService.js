function UserService() {
  console.log(`init ${arguments.callee.name} (template)`)
}

const PROFILE_PARTS = {
  0: 'relationStatus',
  1: 'about'
}

UserService.prototype.promiseServicesForProfileHeader = async function(services, ownerAccountInfo, visitorAccountInfo) {
  return Promise.all([
    services.friendService.getRelationStatus(ownerAccountInfo, visitorAccountInfo),
    services.settingService.getPublicUserInfo(ownerAccountInfo)
  ])
}

UserService.prototype.packetProfileHeader = function(responsData) {
  return responsData.reduce((profileInfo, info, part) => {
    profileInfo[PROFILE_PARTS[part]] = info
    return profileInfo
  }, {})
}


const REGISTER_INFO_PARTS = {
  0: 'userInfo',
  1: 'msgInfo',
  2: 'notifyInfo',
  3: 'friendList',
}

UserService.prototype.packetRegisterInfo = function(serviceInfoList) {
  return serviceInfoList.reduce((serviceInfo, info, part) => {
    serviceInfo[REGISTER_INFO_PARTS[part]] = info
    return serviceInfo
  }, {})
}

module.exports = new UserService()
