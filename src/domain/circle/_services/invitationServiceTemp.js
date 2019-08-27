var _ = require('lodash')
const CONSTANT = require('../../../property/constant')
const CIRCLE_CONST = require('../_properties/constant')

// TODO: for temporary
const userRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')
const inviteRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')
const friendRepo = require('../../folk/user/authenticate/_repositories/authRepositoryTemp')

function InvitationService() {}

/**
 * 1. check if invitation has been sent for same person
 * 2. create invitation record.
 */
InvitationService.prototype.inviteToBeFriend = async function (accountInfo, targetAccountInfo) {
  let invitation
  targetAccountInfo.uid = targetAccountInfo.target_uid
  targetAccountInfo.region = targetAccountInfo.target_region
  targetAccountInfo = _.omit(targetAccountInfo, ['target_uid', 'target_region'])
  // query fields =>'region', 'uid', 'lang', 'givenName', 'familyName', 'profileLink', 'profilePic'
  console.log(`accountInfo: ${JSON.stringify(accountInfo, null, 2)}`)
  console.log(`targetAccountInfo: ${JSON.stringify(targetAccountInfo, null, 2)}`)
  return Promise.resolve(userRepo.findPairUsers(accountInfo, targetAccountInfo))
  // transform to => 'region', 'uid', 'lang', 'givenName', 'familyName', 'profileLink', 'profilePic'
  .then(userDisplayInfoList => userDisplayInfoList.map(displayInfo => {
    displayInfo.fullName = `${displayInfo.givenName} ${displayInfo.familyName}`
    return _.omit(displayInfo, ['givenName', 'familyName'])
  }))
  .then(userDisplayInfoList => invitation = {
    inviter: userDisplayInfoList[0],
    invitee: userDisplayInfoList[1],
    header: {
      region: userDisplayInfoList[1].region,
      inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND,
      data: {
        options: [true, false]
      }
    },
    content: {
      lang: userDisplayInfoList[1].lang
    }
  })
  .then(invitation => inviteRepo.createFriendInvitation(invitation))

  return {
    inviter: {
      fullName: 'Andy Chung',
      uid: accountInfo.uid,
      region: accountInfo.region,
      profileLink: '',
      profilePic: ''
    },
    invitee: {
      fullName: 'Allen Huang',
      uid: targetAccountInfo.target_uid,
      region: targetAccountInfo.target_region,
      profileLink: '',
      profilePic: ''
    },
    header: {
      iid: 'invitation_id_5678',
      region: 'tw',
      inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND,
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
 * get entire invitation by accountInfo & invitationInfo (iid, region)
 */
InvitationService.prototype.getInvitation = async function (accountInfo, invitationInfo) {
  return await inviteRepo.getInvitation(accountInfo, invitationInfo)

  return {
    inviter: {
      fullName: 'Scarlett Liang',
      uid: `someone's uid`,
      region: `someone's region`,
      profileLink: '',
      profilePic: ''
    },
    invitee: {
      fullName: 'Allen Huang',
      uid: accountInfo.uid,
      region: accountInfo.region,
      profileLink: '',
      profilePic: ''
    },
    header: {
      iid: 'invitation_id_5678',
      region: 'tw',
      inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND,
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
  return await inviteRepo.getInvitationList(accountInfo, inviteArrow, limit, skip)
  
  return [{
      inviter: {
        fullName: 'Scarlett Liang',
        uid: `someone's uid`,
        region: `someone's region`,
        profileLink: '',
        profilePic: ''
      },
      invitee: {
        fullName: 'Allen Huang',
        uid: accountInfo.uid,
        region: accountInfo.region,
        profileLink: '',
        profilePic: ''
      },
      header: {
        iid: 'invitation_id_5678',
        region: 'tw',
        inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND,
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
      invitee: {
        fullName: 'Allen Huang',
        uid: accountInfo.uid,
        region: accountInfo.region,
        profileLink: '',
        profilePic: ''
      },
      header: {
        iid: 'invitation_id_6789',
        region: 'tw',
        inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND,
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

/**
 * 根據 invitationRes 內容決定是否加入好友，但最後一定刪除 invitation 紀錄
 * confirm:
 *  1. check: is accountInfo === invitee ?
 *  2. add friend record
 *  3. delete record
 * cancel:
 *  1. check: is accountInfo === invitee ?
 *  2. delete record
 */
InvitationService.prototype.dealwithFriendInvitation = async function (accountInfo, invitationRes) {
  const inviteHeader = invitationRes.header
  // console.log(`inviteHeader: ${JSON.stringify(inviteHeader)}`)

  if (inviteHeader.data.reply === true) {
    await friendRepo.addFriend(accountInfo, _.pick(invitationRes.inviter, ['uid', 'region']))
  }

  // TODO: What does 'removedInvitation' look like?
  var removedInvitation = await inviteRepo.removeInvitation(accountInfo, inviteHeader)

  return removedInvitation

  // TODO: Does 'removedInvitation' look like this?
  return {
    inviter: {
      fullName: 'Andy Chung',
      uid: '',
      region: 'tw',
      profileLink: '',
      profilePic: ''
    },
    invitee: {
      fullName: 'Terrence Chao',
      uid: accountInfo.uid,
      region: accountInfo.region,
      profileLink: '',
      profilePic: ''
    },
    header: {
      iid: 'invitation_id_6789',
      region: 'tw',
      inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND,
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

module.exports = new InvitationService()