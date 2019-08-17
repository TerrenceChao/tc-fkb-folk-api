var constant = require('../../../property/constant')

function InvitationService() {}

/**
 * 1. check if invitation has been sent for same person
 * 2. create invitation record.
 */
InvitationService.prototype.inviteToBeFriend = async function (accountInfo, targetAccountInfo) {
  return {
    iid: 'invitation_id_5678',
    inviter: {
      fullName: 'Andy Chung',
      uid: accountInfo.uid,
      region: accountInfo.region,
      profilePath: '',
      profilePic: ''
    },
    invitee: {
      fullName: 'Allen Huang',
      uid: targetAccountInfo.target_uid,
      region: targetAccountInfo.target_region,
      profilePath: '',
      profilePic: ''
    },
    header: {
      // requestEvent
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
 * get entire invitation by accountInfo & iid
 */
InvitationService.prototype.getInvitation = async function (accountInfo, iid) {
  return {
    iid: 'invitation_id_5678',
    inviter: {
      fullName: 'Scarlett Liang',
      uid: `someone's uid`,
      region: `someone's region`,
      profilePath: '',
      profilePic: ''
    },
    invitee: {
      fullName: 'Allen Huang',
      uid: accountInfo.uid,
      region: accountInfo.region,
      profilePath: '',
      profilePic: ''
    },
    header: {
      // requestEvent
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
InvitationService.prototype.getInvitationList = async function (accountInfo, inviteArrow, limit = constant.LIMIT, skip = constant.SKIP) {
  return [{
      iid: 'invitation_id_5678',
      inviter: {
        fullName: 'Scarlett Liang',
        uid: `someone's uid`,
        region: `someone's region`,
        profilePath: '',
        profilePic: ''
      },
      invitee: {
        fullName: 'Allen Huang',
        uid: accountInfo.uid,
        region: accountInfo.region,
        profilePath: '',
        profilePic: ''
      },
      header: {
        // requestEvent
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
      iid: 'invitation_id_6789',
      inviter: {
        fullName: 'Andy Chung',
        uid: `someone's uid`,
        region: `someone's region`,
        profilePath: '',
        profilePic: ''
      },
      invitee: {
        fullName: 'Allen Huang',
        uid: accountInfo.uid,
        region: accountInfo.region,
        profilePath: '',
        profilePic: ''
      },
      header: {
        // requestEvent
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
 * 根據 invitationReply 內容決定是否加入好友，但最後一定刪除 invitation 紀錄
 * confirm:
 *  1. check: is accountInfo === invitee ?
 *  2. add friend record
 *  3. delete record
 * cancel:
 *  1. check: is accountInfo === invitee ?
 *  2. delete record
 */
InvitationService.prototype.dealwithFriendInvitation = async function (accountInfo, invitationReply) {
  return {
    // iid: 'invitation_id_5678',
    inviter: {
      fullName: 'Andy Chung',
      uid: '',
      region: 'tw',
      profilePath: '',
      profilePic: ''
    },
    invitee: {
      fullName: 'Terrence Chao',
      uid: accountInfo.uid,
      region: accountInfo.region,
      profilePath: '',
      profilePic: ''
    },
    header: {
      // requestEvent
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