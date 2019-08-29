function CircleService() {
  console.log(`init ${arguments.callee.name}`)
}

module.exports = new CircleService()
