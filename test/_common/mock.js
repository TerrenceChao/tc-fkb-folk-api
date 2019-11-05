const faker = require('faker')
const moment = require('moment')

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

function genDBInvitationInfo () {
  return {
    inviter: {
      profileLink: faker.internet.url(),
      profilePic: faker.internet.url()
    },
    recipient: {
      profileLink: faker.internet.url(),
      profilePic: faker.internet.url()
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

/**
 *
 * @param {string} str
 */
function genTimestamp (str = null) {
  return moment(new Date(str)).format('YYYY-MM-DD HH:mm:ss.fff')
}

module.exports = {
  genSignupInfo,
  genDBInvitationInfo,
  parseFriendInfo,
  genDBFriendPublicInfo,
  genTimestamp
}
