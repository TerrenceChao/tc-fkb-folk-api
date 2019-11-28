const config = require('config').notification
const HTTP = require('../../../property/constant').HTTP
const CIRCILE_CONST = require('../../../domain/circle/_properties/constant')

module.exports = {
  HTTP: {
    PUBLISH: {
      OPTIONS: {
        method: 'POST',
        url: config[config.specify].publishUrl,
        headers: HTTP.HEADERS,
        body: {},
        json: true
      }
    },
    TIMEOUT: HTTP.TIMEOUT,
    TIMEOUT_MSG: {
      msgCode: 'xxxxxx',
      error: `connect ECONNREFUSED NOTIFICATION_HOST, timeout: ${HTTP.TIMEOUT}`
    }
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
    INTERNAL_SEARCH: 'internal-search',
    RECALL: 'recall'
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
