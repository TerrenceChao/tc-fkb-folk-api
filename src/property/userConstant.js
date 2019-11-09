exports.ACCOUT_IDENTITY = process.env.ACCOUT_IDENTITY ? process.env.ACCOUT_IDENTITY.split(',') : ['region', 'uid']

exports.USER_PUBLIC_INFO = process.env.USER_PUBLIC_INFO ? process.env.USER_PUBLIC_INFO.split(',') : [
  'region',
  'uid',
  'givenName',
  'familyName',
  'profileLink',
  'profilePic',
  'gender',

  'fullName'
]

exports.USER_PRIVATE_INFO = process.env.USER_PRIVATE_INFO ? process.env.USER_PRIVATE_INFO.split(',') : [
  'region',
  'uid',
  'givenName',
  'familyName',
  'profileLink',
  'profilePic',
  'gender',
  'lang',
  'auth',

  'fullName'
]

exports.PRIVATE_CONTACT_INFO = process.env.PRIVATE_CONTACT_INFO ? process.env.PRIVATE_CONTACT_INFO.split(',') : [
  'region',
  'uid',
  'email',
  'alternateEmail',
  'countryCode',
  'phone',
  'device'
]
