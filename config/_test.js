var path = require('path')

module.exports = function (root) {
  var test = path.join(root, 'test')
  var domain = path.join(test, 'domain')
  var common = path.join(test, '_common')

  return {
    common,
    domain: {
      circle: path.join(domain, 'circle'),
      folk: path.join(domain, 'folk'),
      user: path.join(domain, 'folk', 'user')
    },
    repository: {
      circle: path.join(domain, 'circle', '_repositories'),
      user: path.join(domain, 'folk', 'user', '_repositories')
    }
  }
}
