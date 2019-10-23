// TODO: for temporary
const userRepo = require('../_repositories/authRepositoryTemp')

function SettingService (userRepo) {
  this.userRepo = userRepo
  console.log(`init ${arguments.callee.name}`)
}

module.exports = {
  settingService: new SettingService(userRepo),
  SettingService
}
