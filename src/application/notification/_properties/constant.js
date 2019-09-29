module.exports = {
  HTTP: {
    HEADERS: {
      'content-type': 'application/json',
    },
    PUBLISH_METHOD: 'POST',
    PUBLISH_URL: `${process.env.NOTIFICATION_MQ_HOST}${process.env.NOTIFICATION_MQ_PATH_PUBLISH}`,
    PUBLISH_SUCCESS: 201,
    PUBLISH_FORMAT_ERROR: 422,
    PUBLISH_RESPONSE_KEYS: ['error', 'request'],
    RETRY_LIMIT: parseInt(process.env.NOTIFICATION_RETRY_LIMIT) || 3,
    DELAY: parseInt(process.env.NOTIFICATION_DELAY) || 500,
    TIMEOUT: parseInt(process.env.NOTIFICATION_TIMEOUT) || 100,
  },
  CATEGORIES: {
    PERSONAL: 'personal', // eager delivered
    INVITE_EVENT_FRIEND: 'invite_event_friend',
    INVITE_EVENT_SOCIETY: 'invite_event_society',
    FRIEND_EVENT: 'friend_event',
  },
  CHANNELS: {
    EMAIL: 'email',
    SMS: 'sms',
    APP_PUSH: 'app-push',
    WEB_PUSH: 'web-push',
    PUSH: ['app-push', 'web-push'],
    INTERNAL_SEARCH: 'internal-search',
  }
}