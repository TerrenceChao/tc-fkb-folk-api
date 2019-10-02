const HTTP = require('../../../property/constant').HTTP
const CIRCILE_CONST = require('../../../domain/circle/_properties/constant')
const PUBLISH_URL = `${process.env.NOTIFICATION_MQ_HOST}${process.env.NOTIFICATION_MQ_PATH_PUBLISH}`

module.exports = {
  HTTP: {
    PUBLISH: {
      OPTIONS: {
        method: 'POST',
        url: PUBLISH_URL,
        headers: HTTP.HEADERS,
        body: {},
        json: true
      }
    },
    TIMEOUT: HTTP.TIMEOUT
  },
  CATEGORIES: {
    PERSONAL: 'personal', // eager delivered
    INVITE_EVENT_FRIEND: 'invite_event_friend',
    INVITE_EVENT_SOCIETY: 'invite_event_society',
    FRIEND_EVENT: 'friend_event'
  },
  CHANNELS: {
    EMAIL: 'email',
    SMS: 'sms',
    APP_PUSH: 'app-push',
    WEB_PUSH: 'web-push',
    PUSH: ['app-push', 'web-push'],
    INTERNAL_SEARCH: 'internal-search'
  },
  SENDERS: {
    [CIRCILE_CONST.INVITE_EVENT_FRIEND_INVITE]: 'inviter',
    [CIRCILE_CONST.INVITE_EVENT_FRIEND_REPLY]: 'recipient'
  },
  RECEIVERS: {
    [CIRCILE_CONST.INVITE_EVENT_FRIEND_INVITE]: 'recipient',
    [CIRCILE_CONST.INVITE_EVENT_FRIEND_REPLY]: 'inviter'
  }
}