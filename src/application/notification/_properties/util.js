const _ = require('lodash')
const req = require('request')
const HTTP = require('./constant').HTTP


/**
 * 
 * @param {string} type 
 * @param {Object} message 
 * @param {int} retry 
 */
function request(type, message, retry = 0) {
  req({ 
      method: HTTP.PUBLISH_METHOD,
      uri: HTTP.PUBLISH_URL,
      headers: HTTP.HEADERS,
      body: message,
      json: true
    },
    (err, response, body) => {
      if (! err && response.statusCode === HTTP.PUBLISH_SUCCESS) {
        console.log(`event '${type}':\n published as ${HTTP.PUBLISH_URL}\nbody: ${JSON.stringify(body)}\n`)
        return
      }

      if (! err && response.statusCode === HTTP.PUBLISH_FORMAT_ERROR) {
        console.error(`event '${type}':\n published FAIL for invalid format: ${JSON.stringify(body)}\n`)
        return
      }
      
      if (retry < HTTP.RETRY_LIMIT) {
        console.error(err)
        setTimeout(() => request(type, message, ++retry), HTTP.DELAY)
      } else {
        console.error(`notify ${type} fail!\nreach the retry limit: ${HTTP.RETRY_LIMIT}`)
      }
    })
}

/**
 * 
 * @param {string} type 
 * @param {Object} message 
 * @param {function} callback 
 * @param {*} data 
 * @param {int} retry 
 */
function cbRequest(type, message, callback, data, retry = 0) {
  return new Promise(resolve => {
    req({
        method: HTTP.PUBLISH_METHOD,
        uri: HTTP.PUBLISH_URL,
        headers: HTTP.HEADERS,
        body: message,
        json: true
      },
      (err, response, body) => {
        if (! err && response.statusCode === HTTP.PUBLISH_SUCCESS) {
          console.log(`event '${type}':\n published as ${HTTP.PUBLISH_URL}\nbody: ${JSON.stringify(body)}\n`)
          return resolve(callback(data))
        }

        if (! err && response.statusCode === HTTP.PUBLISH_FORMAT_ERROR) {
          console.error(`event '${type}':\n published FAIL for invalid format: ${JSON.stringify(body)}\n`)
          return resolve(callback(_.pick(body, HTTP.PUBLISH_RESPONSE_KEYS)))
        }
        
        if (retry < HTTP.RETRY_LIMIT) {
          console.error(err)
          setTimeout(() => cbRequest(type, message, callback, data, ++retry), HTTP.DELAY)
        } else {
          let errMsg = `notify ${type} fail!\nreach the retry limit: ${HTTP.RETRY_LIMIT}`
          console.error(errMsg)
          resolve(errMsg)
        }
      })
  })
}

module.exports = {
  request,
  cbRequest,
}
