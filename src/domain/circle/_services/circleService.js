function CircleService() {
  console.log(`init ${arguments.callee.name} (template)`)
}

module.exports = new CircleService()
