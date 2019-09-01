var _ = require('lodash')
const CONSTANT = require('../../../property/constant')
const CIRCLE_CONST = require('../_properties/constant')

// TODO: for temporary
const userRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')
const friendRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')
const inviteRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')

function InvitationService(userRepo, friendRepo, inviteRepo) {
  this.userRepo = userRepo
  this.friendRepo = friendRepo
  this.inviteRepo = inviteRepo
  console.log(`init ${arguments.callee.name} (template)`)
}

/**
 * 1. check if invitation has been sent for same person
 * 2. create invitation record.
 */
InvitationService.prototype.inviteToBeFriend = async function (accountInfo, targetAccountInfo) {
  let invitation
  // query fields =>'region', 'uid', 'lang', 'givenName', 'familyName', 'profileLink', 'profilePic'
  return Promise.resolve(this.userRepo.getPairUsers(accountInfo, targetAccountInfo))
    // transform to => 'region', 'uid', 'lang', 'fullyName', 'profileLink', 'profilePic'
    .then(userDisplayInfoList => userDisplayInfoList.map(displayInfo => {
      displayInfo.fullName = `${displayInfo.givenName} ${displayInfo.familyName}`
      return _.omit(displayInfo, ['givenName', 'familyName'])
    }))
    .then(userDisplayInfoList => invitation = {
      inviter: userDisplayInfoList[0],
      recipient: userDisplayInfoList[1],
      header: {
        region: userDisplayInfoList[1].region,
        inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE,
        data: {
          options: [true, false]
        }
      },
      content: {
        // 有可能需要知道其他的事情
      }
    })
    .then(invitation => this.inviteRepo.findOrCreateFriendInvitation(invitation))

  return {
    inviter: {
      fullName: 'Andy Chung',
      uid: accountInfo.uid,
      region: accountInfo.region,
      profileLink: '',
      profilePic: ''
    },
    recipient: {
      fullName: 'Allen Huang',
      uid: targetAccountInfo.target_uid,
      region: targetAccountInfo.target_region,
      profileLink: '',
      profilePic: ''
    },
    header: {
      iid: 'invitation_id_5678',
      region: 'tw',
      inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE,
      data: {
        options: [true, false]
      }
    },
    content: {
      'lang': 'zh-tw',
    },
    // sensitive: {} // private & sensitive data
  }
}

/**
 * inviterAccountInfo (uid, region)
 * 如果邀請方(inviterAccountInfo) 發現之前對方也發過邀請函給自己，表示雙方都想交朋友，直接加好友
 */
InvitationService.prototype.confirmFriendInvitation = async function (invitation, inviterAccountInfo) {
  if (invitation == null) {
    throw new Error(`Invitation not found`)
  }

  // 如果邀請方(inviterAccountInfo) 發現之前對方也發過邀請函給自己，表示雙方都想交朋友，直接加好友
  const recipient = invitation.recipient
  if (recipient.uid === inviterAccountInfo.uid && recipient.region === inviterAccountInfo.region) {
    let invitationRes = _.pick(invitation, ['header', 'inviter'])
    invitationRes.header.data.reply = true
  
    return await this.handleFriendInvitation(inviterAccountInfo, invitationRes)
  }

  return invitation
}

/**
 * 根據 invitationRes 內容決定是否加入好友，但最後一定刪除 invitation 紀錄
 * confirm:
 *  1. check: is accountInfo === recipient ?
 *  2. add friend record
 *  3. delete record
 * cancel:
 *  1. check: is accountInfo === recipient ?
 *  2. delete record
 */
InvitationService.prototype.handleFriendInvitation = async function (accountInfo, invitationRes) {
  // console.log(`invitationRes.header: ${JSON.stringify(invitationRes.header)}`)

  if (invitationRes.header.data.reply === true) {
    // TODO: add friend & make default following state
    await this.friendRepo.addFriend(accountInfo, _.pick(invitationRes.inviter, ['uid', 'region']))
  }

  //（改用 invitationRes 回傳）What does 'removedInvitation' look like?
  // var removedInvitation = await this.inviteRepo.removeInvitation(accountInfo, _.pick(invitationRes.header, ['iid', 'region']))
  // return removedInvitation

  let removed = await this.inviteRepo.removeRelatedInvitation(accountInfo, invitationRes.inviter)

  // TODO: 改用 invitationRes 回傳
  if (removed > 0) {
    invitationRes.recipient = accountInfo
    invitationRes.header.inviteEvent = CIRCLE_CONST.INVITE_EVENT_FRIEND_REPLY
    return invitationRes
  }

  throw new Error(`No invitation as ${JSON.stringify(_.pick(invitationRes.header, ['iid', 'region']), null, 2)}`)

  //（改用 invitationRes 回傳）Does 'removedInvitation' look like this?
  return {
    inviter: {
      fullName: 'Andy Chung',
      uid: '',
      region: 'tw',
      profileLink: '',
      profilePic: ''
    },
    recipient: {
      fullName: 'Terrence Chao',
      uid: accountInfo.uid,
      region: accountInfo.region,
      profileLink: '',
      profilePic: ''
    },
    header: {
      iid: 'invitation_id_6789',
      region: 'tw',
      inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE,
      data: {
        reply: true // one of the options
      }
    },
    content: {
      'lang': 'zh-tw',
    },
    // sensitive: {} // private & sensitive data
  }
}



/**
 * get entire invitation by accountInfo & invitationInfo (iid, region)
 */
InvitationService.prototype.getInvitation = async function (accountInfo, invitationInfo) {
  return await this.inviteRepo.getInvitation(accountInfo, invitationInfo)

  return {
    inviter: {
      fullName: 'Scarlett Liang',
      uid: `someone's uid`,
      region: `someone's region`,
      profileLink: '',
      profilePic: ''
    },
    recipient: {
      fullName: 'Allen Huang',
      uid: accountInfo.uid,
      region: accountInfo.region,
      profileLink: '',
      profilePic: ''
    },
    header: {
      iid: 'invitation_id_5678',
      region: 'tw',
      inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE,
      data: {
        options: [true, false]
      }
    },
    content: {
      'lang': 'zh-tw',
    },
    // sensitive: {} // private & sensitive data
  }
}

/**
 * get list by accountInfo with page (limit, skip)
 * inviteArrow: [sent,received]
 * inviteCategory: [friend,society]
 */
InvitationService.prototype.getInvitationList = async function (accountInfo, inviteArrow, limit = CONSTANT.LIMIT, skip = CONSTANT.SKIP) {
  return await this.inviteRepo.getInvitationList(accountInfo, inviteArrow, limit, skip)
  
  return [{
      inviter: {
        fullName: 'Scarlett Liang',
        uid: `someone's uid`,
        region: `someone's region`,
        profileLink: '',
        profilePic: ''
      },
      recipient: {
        fullName: 'Allen Huang',
        uid: accountInfo.uid,
        region: accountInfo.region,
        profileLink: '',
        profilePic: ''
      },
      header: {
        iid: 'invitation_id_5678',
        region: 'tw',
        inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE,
        data: {
          options: [true, false]
        }
      },
      content: {
        'lang': 'zh-tw',
      },
      // sensitive: {} // private & sensitive data
    },
    {
      inviter: {
        fullName: 'Andy Chung',
        uid: `someone's uid`,
        region: `someone's region`,
        profileLink: '',
        profilePic: ''
      },
      recipient: {
        fullName: 'Allen Huang',
        uid: accountInfo.uid,
        region: accountInfo.region,
        profileLink: '',
        profilePic: ''
      },
      header: {
        iid: 'invitation_id_6789',
        region: 'tw',
        inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE,
        data: {
          options: [true, false]
        }
      },
      content: {
        'lang': 'zh-tw',
      },
      // sensitive: {} // private & sensitive data
    }
  ]
}

module.exports = {
  invitationService: new InvitationService(userRepo, friendRepo, inviteRepo),
  InvitationService
}