const faker = require('faker')
const moment = require('moment')
const uuidv3 = require('uuid/v3')

function genSignupInfo () {
  const profileLink = faker.internet.url()
  const profilePic = faker.internet.url()
  return {
    // Auths
    pwHash: 'xxxx',
    pwSalt: 'oooo',
    lock: false,
    attempt: 0,
    verification: null,
    verifyToken: null,
    verifyCode: null,
    verifyExpire: null,

    // Accounts
    uid: faker.random.uuid(),
    region: faker.address.countryCode(),
    email: faker.internet.email(),
    alternateEmail: faker.internet.email(),
    countryCode: '+886',
    phone: faker.phone.phoneNumberFormat(),
    device: null,
    // Users
    beSearched: faker.random.boolean(),
    givenName: faker.name.firstName(),
    familyName: faker.name.lastName(),
    gender: faker.random.boolean() === true ? '1' : '0',
    birth: faker.date.past(),
    lang: faker.locale,
    publicInfo: {
      profileLink,
      profilePic
    }
  }
}

function genDBInvitationRowId (userA, userB, event) {
  const recipientPart = userB.uid
    .concat('_').concat(userB.region)
    .concat('_').concat(event)
    .concat('_').concat(userA.region)
  const iid = uuidv3(recipientPart, userA.uid) // uuidv3(string, owner_namespace: uuid)

  return iid
}

function genDBInvitationInfo (userA, userB) {
  return {
    inviter: {
      profileLink: faker.internet.url(),
      profilePic: faker.internet.url(),
      givenName: userA.given_name || userA.givenName,
      familyName: userA.family_name || userA.familyName
    },
    recipient: {
      profileLink: faker.internet.url(),
      profilePic: faker.internet.url(),
      givenName: userB.given_name || userB.givenName,
      familyName: userB.family_name || userB.familyName
    },
    header: {
      data: {
        options: [
          true,
          false
        ]
      }
    }
  }
}

/**
 *
 * @param {string} ownerUid
 * @param {{ uid: string, region: string }} friendAccount
 */
function genFriendRowId (ownerUid, friendAccount) {
  return uuidv3(friendAccount.uid.concat('_').concat(friendAccount.region), ownerUid) // uuidv3(string, owner_namespace: uuid)
}

/**
 *
 * @param {Object} friend
 */
function parseFriendInfo (friend) {
  return {
    uid: friend.uid,
    region: friend.region,
    givenName: friend.given_name,
    familyName: friend.family_name,
    // lang: friend.lang, => unnecessary
    profileLink: friend.public_info.profileLink,
    profilePic: friend.public_info.profilePic
  }
}

function genDBFriendPublicInfo () {
  // no uid, region in field: 'public_info' of table: 'Friends'
  return {
    givenName: faker.name.firstName(),
    familyName: faker.name.lastName(),
    // lang: friend.lang, => unnecessary
    profileLink: faker.internet.url(),
    profilePic: faker.internet.url()
  }
}

function genToken () {
  return faker.random.uuid().concat(Date.now().toString())
}

/**
 *
 * @param {string} str
 */
function genTimestamp (str = null) {
  return moment(new Date(str)).format('YYYY-MM-DD HH:mm:ss.fff')
}

module.exports = {
  genSignupInfo,
  genDBInvitationRowId,
  genDBInvitationInfo,
  genFriendRowId,
  parseFriendInfo,
  genDBFriendPublicInfo,
  genToken,
  genTimestamp
}
