const req = require('request')
const PUBLISH_URL = `${process.env.NOTIFICATION_MQ_HOST}${process.env.NOTIFICATION_MQ_URL_REQUEST_PUBLISH}`
const RETRY_LIMIT = process.env.NOTIFICATION_RETRY || 3

function request(type, packet, retry = 0) {
  req(
    { 
      method: 'PUT',
      uri: PUBLISH_URL,
      json: packet
    },
    (error, response, body) => {
      if(!error) {
        console.log(`${type} published as ${PUBLISH_URL}`)
        return
      }
      
      if (retry < RETRY_LIMIT) {
        console.log(`error: ${error}`)
        request(type, packet, ++retry)
      } else {
        console.log(`notify ${type} fail!\nreach the retry limit: ${RETRY_LIMIT}\nresponse: status: ${response.statusCode}\nbody: ${JSON.stringify(body, null, 2)}`)
      }
    }
  )
}

function cbRequest(type, packet, callback, data, retry = 0) {
  req(
    { 
      method: 'PUT',
      uri: PUBLISH_URL,
      json: packet
    },
    (error, response, body) => {
      if(!error) {
        console.log(`${type} published as ${PUBLISH_URL}`)
        callback(data)
        return
      }
      
      if (retry < RETRY_LIMIT) {
        console.log(`error: ${error}`)
        cbRequest(type, packet, callback, data, ++retry)
      } else {
        console.log(`notify ${type} fail!\nreach the retry limit: ${RETRY_LIMIT}\nresponse: status: ${response.statusCode}\nbody: ${JSON.stringify(body, null, 2)}`)
      }
    }
  )
}

module.exports = {
  request,
  cbRequest,
}
