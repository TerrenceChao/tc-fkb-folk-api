var path = require('path')

module.exports = function (root) {
  var src = path.join(root, 'src')
  var protocol = path.join(src, 'protocol')
  var application = path.join(src, 'application')
  var domain = path.join(src, 'domain')
  var library = path.join(src, 'library')

  // protocol
  var controller = path.join(protocol, 'http', 'controller')
  var middleware = path.join(protocol, 'http', 'middleware')
  var request = path.join(protocol, 'http', 'request')
  var response = path.join(protocol, 'http', 'response')
  var errorHandler = path.join(protocol, 'http', 'errorHandler')

  return {
    // protocol
    middleware,
    userRequest: path.join(request, 'user'),
    circleRequest: path.join(request, 'circle'),
    feedsRequest: path.join(request, 'feeds'),

    userController: path.join(controller, 'user'),
    circleController: path.join(controller, 'circle'),
    feedsController: path.join(controller, 'feeds'),

    userResponse: path.join(response, 'user'),
    circleResponse: path.join(response, 'circle'),
    feedsResponse: path.join(response, 'feeds'),
    errorHandler,
    
    // domain
    feedsDomain: path.join(domain, 'feeds'),
    feeds: {
      postDomain: path.join(domain, 'feeds', 'post'),
    },

    folkDomain: path.join(domain, 'folk'),
    // folk: {
    //   circleDomain: {

    //   },
    //   userDomain: {

    //   }
    // },
  }
}
