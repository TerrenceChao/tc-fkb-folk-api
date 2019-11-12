const { ACCOUT_IDENTITY } = require('./userConstant')

/**
 * [NOTE]: {profileLink, profilePic} should be extened here, not inside the publicInfo
 */
const USER_COMMON_PUBLIC_INFO = process.env.USER_COMMON_PUBLIC_INFO ? process.env.USER_COMMON_PUBLIC_INFO.split(',') : [
  'givenName',
  'familyName',
  'profileLink', // path: publicInfo.profileLink (should be extened here, not inside the publicInfo)
  'profilePic' // path: publicInfo.profilePic (should be extened here, not inside the publicInfo)
  // 'fullName'
]

exports.USER_COMMON_PUBLIC_INFO = USER_COMMON_PUBLIC_INFO
exports.VALIDATE_INVITE_FIELDS = ACCOUT_IDENTITY.concat(USER_COMMON_PUBLIC_INFO)
