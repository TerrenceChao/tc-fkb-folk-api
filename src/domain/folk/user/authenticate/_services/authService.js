
function AuthService (userRepo, accountRepo) {
  this.userRepo = userRepo
  this.accountRepo = accountRepo
}

AuthService.prototype.signup = async function (userInfo) {
  
}

module.exports = new AuthService(userRepository, accountRepository)
