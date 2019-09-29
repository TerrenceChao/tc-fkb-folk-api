
exports.ACCOUT_IDENTITY = process.env.ACCOUT_IDENTITY ?
  process.env.ACCOUT_IDENTITY.split(',') : ['region', 'uid']

// account events
exports.ACCOUNT_EVENT_VALIDATE_ACCOUNT = 'account_event_validate_account'


exports.PUBLIC_USER_INFO = process.env.PUBLIC_USER_INFO ?
  process.env.PUBLIC_USER_INFO.split(',') : [
    'region',
    'uid',
    'givenName',
    'familyName',
    'fullName',
    'gender',
    'profileLink',
    'profilePic',
  ]

exports.PRIVATE_CONTACT_INFO = process.env.PRIVATE_CONTACT_INFO ?
  process.env.PRIVATE_CONTACT_INFO.split(',') : [
    'region',
    'uid',
    'email',
    'phone',
    'device'
  ]

/**
 * setting events:
 * Refers to all public information (user, friend, post, ... etc)
 */
exports.SETTING_EVENT_UPDATE_PUBLIC_INFO = 'setting_event_update_public_info'
