const _ = require('lodash')
const uuidv3 = require('uuid/v3')
const USER_COMMON_PUBLIC_INFO = require('./constant').USER_COMMON_PUBLIC_INFO

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
  * @param {string} event
  * @returns { iid: string, info: Object }
 */
function genFriendInvitationDBParams (inviterUserInfo, recipientUserInfo, event) {
  const recipientPart = recipientUserInfo.uid
    .concat('_').concat(recipientUserInfo.region)
    .concat('_').concat(event)
    .concat('_').concat(inviterUserInfo.region)
  const iid = uuidv3(recipientPart, inviterUserInfo.uid) // uuidv3(string, owner_namespace: uuid)
  return {
    iid,
    info: {
      inviter: _.pick(inviterUserInfo, USER_COMMON_PUBLIC_INFO),
      recipient: _.pick(recipientUserInfo, USER_COMMON_PUBLIC_INFO),
      header: {
        data: {
          options: [true, false]
        }
      }
    }
  }
}

/**
 * @param {{ inviter: Object, recipient: Object, header: Object }} invitation
 */
function parseFriendInvitation (invitation) {
  return {
    inviter: _.assign({
      uid: invitation.inviter_id || invitation.inviterId,
      region: invitation.inviter_region || invitation.inviterRegion
    }, invitation.info.inviter),
    recipient: _.assign({
      uid: invitation.recipient_id || invitation.recipientId,
      region: invitation.recipient_region || invitation.recipientRegion
    }, invitation.info.recipient),
    header: _.assign({
      iid: invitation.iid,
      inviteEvent: invitation.event
    }, invitation.info.header)
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
  genFriendInvitationDBParams,
  parseFriendInvitation,
  genFriendRowId,
  confirmFriendRecords
}
