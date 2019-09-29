
exports.ACCOUT_IDENTITY = process.env.ACCOUT_IDENTITY.split(',') || ['region', 'uid']

// account events
exports.ACCOUNT_EVENT_VALIDATE_ACCOUNT = 'account_event_validate_account'


exports.SEARCH_QUERY_RANGE = process.env.SEARCH_QUERY_RANGE.split(',')
  || ['region', 'uid', 'givenName', 'familyName', 'fullName', 'gender', 'profileLink', 'profilePic']

// setting events
exports.SETTING_EVENT_UPDATE_PUBLIC_INFO = 'setting_event_update_public_info'
