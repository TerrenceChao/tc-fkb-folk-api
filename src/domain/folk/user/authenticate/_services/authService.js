// TODO: for temporary
var authRepo = require('../_repositories/authRepositoryTemp')

function AuthService (authRepo) {
  this.authRepo = authRepo
  console.log(`init ${arguments.callee.name}`)
}

AuthService.prototype.signup = async function (userInfo) {
  
}

module.exports = {
  authService: new AuthService(authRepo),
  AuthService
}
