const _ = require('lodash')
const { mapKeysInCamelCase } = require('../../../property/util')
const USER_COMMON_PUBLIC_INFO = require('./constant').USER_COMMON_PUBLIC_INFO

/**
 * @param {{ inviter: Object, recipient: Object, header: Object }} invitation
 */
function parseInvitationRoles (invitation) {
  return {
    inviter: {
      uid: invitation.inviter_uid || invitation.inviterUid,
      region: invitation.inviter_region || invitation.inviterRegion
    },
    recipient: {
      uid: invitation.recipient_uid || invitation.recipientUid,
      region: invitation.recipient_region || invitation.recipientRegion
    }
  }
}

/**
 * @param {{ inviter: Object, recipient: Object, header: Object }} invitation
 */
function parseInvitation (invitation) {
  return {
    inviter: _.assign({
      uid: invitation.inviter_uid || invitation.inviterUid,
      region: invitation.inviter_region || invitation.inviterRegion
    }, invitation.info.inviter),
    recipient: _.assign({
      uid: invitation.recipient_uid || invitation.recipientUid,
      region: invitation.recipient_region || invitation.recipientRegion
    }, invitation.info.recipient),
    header: _.assign({
      iid: invitation.iid,
      inviteEvent: invitation.event
    }, invitation.info.header)
  }
}

/**
 * @param {{
  *    uid: string,
  *    region: string,
  *    givenName: string,
  *    familyname: string,
  *    profileLink: string,
  *    profilePic: string
  * }} inviterUserInfo
  * @param {{
  *    uid: string,
  *    region: string,
  *    givenName: string,
  *    familyname: string,
  *    profileLink: string,
  *    profilePic: string
  * }} recipientUserInfo
 */
function genFriendInvitationDBInfo (inviterUserInfo, recipientUserInfo) {
  return {
    inviter: _.pick(inviterUserInfo, USER_COMMON_PUBLIC_INFO),
    recipient: _.pick(recipientUserInfo, USER_COMMON_PUBLIC_INFO),
    header: {
      data: {
        options: [true, false]
      }
    }
  }
}

/**
 *
 * @param {Object[]} sourceList { uid, region, givenName, familyName, profileLink, profilePic }
 * @param {Object[]} targetList { uid, friend_id, friend_region, public_info }
 */
function confirmFriendRecords (sourceList, targetList) {
  // if (sourceList.length !== targetList.length) {
  //   return false
  // }

  const sourceMapping = {}
  sourceList.forEach(source => { sourceMapping[source.uid] = source })

  for (let i = targetList.length - 1; i >= 0; i--) {
    const target = _.mapKeys(targetList[i], (value, key) => _.camelCase(key))
    if (sourceMapping[target.friendId] === undefined) {
      return false
    }

    const source = sourceMapping[target.friendId]
    if (source.region !== target.friendRegion) {
      return false
    }

    const publicInfo = target.publicInfo
    for (let i = USER_COMMON_PUBLIC_INFO.length - 1; i >= 0; i--) {
      const field = USER_COMMON_PUBLIC_INFO[i]
      if (publicInfo[field] === undefined) {
        throw new Error(`Invalid DB record: Invalid friend format in public_info. lack with ${field}`)
      }

      if (publicInfo[field] !== source[field]) {
        return false
      }
    }
  }

  return true
}

module.exports = {
  parseInvitationRoles,
  parseInvitation,
  genFriendInvitationDBInfo,
  confirmFriendRecords,
  mapKeysInCamelCase
}
