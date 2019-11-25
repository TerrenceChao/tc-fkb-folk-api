const _ = require('lodash')
const { NODE_ENV, EXPIRATION_SECS, CIPHER_ALGO } = require('../../../../property/constant')
const C = require('../../../../property/userConstant')

// account events
exports.ACCOUNT_EVENT_REGISTRATION = 'account_event_registration'
exports.ACCOUNT_EVENT_VALIDATE_ACCOUNT = 'account_event_validate_account'

/**
 * setting events:
 * Refers to all public information (user, friend, post, ... etc)
 */
exports.SETTING_EVENT_UPDATE_PUBLIC_INFO = 'setting_event_update_public_info'

/**
 * Consider cross-region
 * 用於產生具唯一性的 verify-token。(註冊時適用，因存放在 {cache} 須具唯一性)
 * token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域找尋 => Consider cross-region
 */
exports.CIPHER_ALGO = CIPHER_ALGO

/**
 * common constants
 */
exports.NODE_ENV = NODE_ENV

exports.EXPIRATION_SECS = EXPIRATION_SECS

exports.ACCOUT_IDENTITY = C.ACCOUT_IDENTITY

exports.USER_PUBLIC_INFO = C.USER_PUBLIC_INFO

exports.USER_PRIVATE_INFO = C.USER_PRIVATE_INFO

exports.USER_PRIVATE_UPDATE_INFO = _.difference(C.USER_PRIVATE_INFO, C.ACCOUT_IDENTITY)

exports.USER_CONTACT = C.USER_CONTACT

exports.USER_UPDATE_CONTACT = C.USER_UPDATE_CONTACT

exports.USER_VALIDATE_CONTACT = C.USER_VALIDATE_CONTACT

exports.USER_PUBLIC_INFO_AND_CONTACT = C.USER_PUBLIC_INFO.concat(C.USER_CONTACT)

exports.USER_PRIVATE_INFO_AND_CONTACT = C.USER_PRIVATE_INFO.concat(C.USER_CONTACT)

exports.USER_AUTHENTICATION = C.USER_AUTHENTICATION

exports.USER_VERIFICATION = C.USER_VERIFICATION
