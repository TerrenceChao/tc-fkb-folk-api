const { ACCOUT_IDENTITY } = require('./userConstant')

const USER_COMMON_PUBLIC_INFO = process.env.USER_COMMON_PUBLIC_INFO ? process.env.USER_COMMON_PUBLIC_INFO.split(',') : [
  'givenName',
  'familyName',
  'profileLink',
  'profilePic'
  // 'fullName'
]

exports.USER_COMMON_PUBLIC_INFO = USER_COMMON_PUBLIC_INFO
exports.VALIDATE_INVITE_FIELDS = ACCOUT_IDENTITY.concat(USER_COMMON_PUBLIC_INFO)
