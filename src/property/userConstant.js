exports.ACCOUT_IDENTITY = process.env.ACCOUT_IDENTITY ? process.env.ACCOUT_IDENTITY.split(',') : ['region', 'uid']

exports.USER_PUBLIC_INFO = process.env.USER_PUBLIC_INFO ? process.env.USER_PUBLIC_INFO.split(',') : [
  'region',
  'uid',
  'givenName',
  'familyName',
  'gender',
  'lang',
  'publicInfo' // 'profileLink', /** path: publicInfo.profileLink */ 'profilePic', /** path: publicInfo.profilePic */
  // 'fullName'
]

exports.USER_PRIVATE_INFO = process.env.USER_PRIVATE_INFO ? process.env.USER_PRIVATE_INFO.split(',') : [
  'region',
  'uid',
  'beSearched',
  'givenName',
  'familyName',
  'gender',
  'birth',
  'lang',
  'publicInfo' // 'profileLink', /** path: publicInfo.profileLink */ 'profilePic', /** path: publicInfo.profilePic */
  // 'fullName'
]

exports.USER_CONTACT = process.env.USER_CONTACT ? process.env.USER_CONTACT.split(',') : [
  'region',
  'uid',
  'email',
  'alternateEmail',
  'countryCode',
  'phone',
  'device'
]

exports.USER_UPDATE_CONTACT = process.env.USER_UPDATE_CONTACT ? process.env.USER_UPDATE_CONTACT.split(',') : [
  'alternateEmail',
  'countryCode',
  'phone'
]

exports.USER_VALIDATE_CONTACT = process.env.USER_VALIDATE_CONTACT ? process.env.USER_VALIDATE_CONTACT.split(',') : [
  'email',
  'countryCode',
  'phone'
]

exports.USER_AUTHENTICATION = process.env.USER_AUTHENTICATION ? process.env.USER_AUTHENTICATION.split(',') : [
  'pwHash',
  'pwSalt',
  'lock',
  'attempt'
]

exports.USER_VERIFICATION = process.env.USER_VERIFICATION ? process.env.USER_VERIFICATION.split(',') : [
  'token',
  'code',
  'expire'
]
