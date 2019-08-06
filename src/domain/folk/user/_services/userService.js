function UserService() {
  console.log(`init ${arguments.callee.name} (template)`)
}

module.exports = new UserService()
