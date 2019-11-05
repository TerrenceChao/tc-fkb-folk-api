var path = require('path')

module.exports = function (root) {
  var src = path.join(root, 'src')
  var protocol = path.join(src, 'protocol')
  var domain = path.join(src, 'domain')
  var library = path.join(src, 'library')

  // protocol
  var controller = path.join(protocol, 'http', 'controller')
  var middleware = path.join(protocol, 'http', 'middleware')
  var request = path.join(protocol, 'http', 'request')
  var response = path.join(protocol, 'http', 'response')

  return {
    // protocol
    request: {
      circle: path.join(request, 'circle'),
      user: path.join(request, 'user')
    },
    controller: {
      region: {
        circle: path.join(controller, 'region', 'circle'),
        user: path.join(request, 'region', 'user')
      }
    },
    response: {
      circle: path.join(response, 'circle'),
      user: path.join(response, 'user')
    },

    // domain
    domain: {
      circle: path.join(domain, 'circle'),
      folk: path.join(domain, 'folk'),
      user: path.join(domain, 'folk', 'user')
    },

    // repository
    repository: {
      circle: path.join(domain, 'circle', '_repositories'),
      user: path.join(domain, 'folk', 'user', '_repositories')
    },

    library
  }
}
