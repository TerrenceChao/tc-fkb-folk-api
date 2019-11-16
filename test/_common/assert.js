const { expect } = require('chai')

/**
 *
 * @param {Object} user
 * @param {Object} signupInfo
 */
function assertUserProperties (user, signupInfo) {
  const publicInfo = signupInfo.publicInfo
  expect(user.uid).to.equals(signupInfo.uid)
  expect(user.region).to.equals(signupInfo.region)
  expect(user.email).to.equals(signupInfo.email)
  expect(user.country_code).to.equals(signupInfo.countryCode)
  expect(user.phone).to.equals(signupInfo.phone)
  expect(user.given_name).to.equals(signupInfo.givenName)
  expect(user.family_name).to.equals(signupInfo.familyName)
  expect(user.public_info.profileLink).to.equals(publicInfo.profileLink)
  expect(user.public_info.profilePic).to.equals(publicInfo.profilePic)
}

/**
 *
 * @param {Object} source invitation info
 * @param {Object} target invitation record (must be db rows)
 */
function assertInvitation (source, target) {
  expect(target.iid).to.equals(source.iid)
  expect(target.inviter_id).to.equals(source.inviter_id)
  expect(target.inviter_region).to.equals(source.inviter_region)
  expect(target.recipient_id).to.equals(source.recipient_id)
  expect(target.recipient_region).to.equals(source.recipient_region)
  expect(target.event).to.equals(source.event)
  expect(sortJSONByKeys(target.info)).to.deep.equal(sortJSONByKeys(source.info))
}

/**
 *
 * @param {Object} source friend info
 * @param {Object} target friend record (must be db rows)
 */
function assertFriend (source, target) {
  expect(target.friend_id).to.equals(source.uid)
  expect(target.friend_region).to.equals(source.region)
  expect(target.public_info.givenName).to.equals(source.givenName)
  expect(target.public_info.familyName).to.equals(source.familyName)
  expect(target.public_info.profileLink).to.equals(source.profileLink)
  expect(target.public_info.profilePic).to.equals(source.profilePic)
}

/**
 *
 * @param {Object} jsonObj
 */
function sortJSONByKeys (jsonObj) {
  const ary = []
  for (const p in jsonObj) {
    ary.push([p, jsonObj[p]])
  }
  ary.sort((a, b) => {
    var nameA = a[0].toUpperCase() // ignore upper and lowercase
    var nameB = b[0].toUpperCase() // ignore upper and lowercase
    if (nameA < nameB) {
      return -1
    }
    if (nameA > nameB) {
      return 1
    }

    // names must be equal
    return 0
  })

  return ary.reduce((newJsonObj, value) => {
    newJsonObj[value[0]] = value[1]
    return newJsonObj
  }, {})
}

module.exports = {
  assertUserProperties,
  assertInvitation,
  assertFriend,
  sortJSONByKeys
}
