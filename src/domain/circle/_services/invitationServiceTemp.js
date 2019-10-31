var _ = require('lodash')
var util = require('../../../property/util')

const CONSTANT = require('../../../property/constant')
const CIRCLE_CONST = require('../_properties/constant')

// TODO: for temporary
const userRepo = require('../../folk/user/_repositories/authRepositoryTemp')
const friendRepo = require('../../folk/user/_repositories/authRepositoryTemp')
const inviteRepo = require('../../folk/user/_repositories/authRepositoryTemp')

function InvitationService (userRepo, friendRepo, inviteRepo) {
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
    .then(userDisplayInfoList => (invitation = {
      inviter: userDisplayInfoList[0],
      recipient: userDisplayInfoList[1],
      // TODO: header 是存放關於條件,邏輯規則用
      header: {
        // regions: {
        //   inviter: userDisplayInfoList[0].region,
        //   recipient: userDisplayInfoList[1].region,
        // },
        inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE,
        data: {
          options: [true, false]
        }
      }
      // TODO: content 是存放關於文案規則用
      // content: {
      //   // 有可能需要知道其他的事情
      // }
    }))
    .then(invitation => this.inviteRepo.findOrCreateFriendInvitation(invitation))

  // return {
  //   inviter: {
  //     fullName: 'Andy Chung',
  //     uid: accountInfo.uid,
  //     region: accountInfo.region,
  //     profileLink: '',
  //     profilePic: ''
  //   },
  //   recipient: {
  //     fullName: 'Allen Huang',
  //     uid: targetAccountInfo.target_uid,
  //     region: targetAccountInfo.target_region,
  //     profileLink: '',
  //     profilePic: ''
  //   },
  //   header: {
  //     iid: 'invitation_id_5678',
  //     region: 'tw',
  //     inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE,
  //     data: {
  //       options: [true, false]
  //     }
  //   },
  //   content: {
  //     'lang': 'zh-tw',
  //   },
  //   // sensitive: {} // private & sensitive data
  // }
}

/**
 * inviterAccountInfo (uid, region)
 * 如果邀請方(inviterAccountInfo) 發現之前對方也發過邀請函給自己，表示雙方都想交朋友，直接加好友
 */
InvitationService.prototype.confirmFriendInvitation = async function (invitation, inviterAccountInfo) {
  if (invitation == null) {
    throw new Error('Invitation not found')
  }

  // 如果邀請方(inviterAccountInfo) 發現之前對方也發過邀請函給自己，表示雙方都想交朋友，直接加好友
  const recipient = invitation.recipient
  if (recipient.uid === inviterAccountInfo.uid && recipient.region === inviterAccountInfo.region) {
    invitation.header.data.reply = true

    return await this.handleFriendInvitation(inviterAccountInfo, invitation)
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
  const NECESSARY_FIELDS_A = ['profileLink', 'profilePic', 'givenName', 'familyName']
  const NECESSARY_FIELDS_B = ['profileLink', 'profilePic', 'fullName']

  let inviter = invitationRes.inviter
  let recipient = accountInfo

  /**
   * TODO:
   * BUG:
   * 當只靠 header.data.reply 來判斷 invitationRes 是否為一則邀請時，
   * 若在 a.不是朋友 b.也尚未邀請的情況下，發送[回覆邀請] API ([PUT]: /circle/{{uid_B}}/{{region_B}}/invite),
   * 會發生[已加入好友]但找不到邀請函的狀況，此時若要再次發送邀請，也因為已經是朋友了無法發送。
   * (當然是找得到朋友的...)
   *
   * sol: 關鍵是要確認回覆一則[真實存在的邀請]
   */
  if (invitationRes.header.data.reply === true) {
    /**
     * TODO: 
     * 1. Add friend & make default [following-state]
     * 2. Both [inviter,recipient] must includes: {
     *      region,
     *      uid,
     *      publicInfo: { profileLink, profilePic, fullName or (givenName,familyName) }
     *    }
     * 3. [目前的流程似乎只能確保recipient滿足2.的條件,inviter做不到]
     */
    Promise.all([
      util.hasKeys(inviter, NECESSARY_FIELDS_A) || util.hasKeys(inviter, NECESSARY_FIELDS_B),
      util.hasKeys(recipient, NECESSARY_FIELDS_A) || util.hasKeys(recipient, NECESSARY_FIELDS_B)
    ])
      .then(results => Promise.all([
        results[0] === false ? this.userRepo.getUser(inviter, ['region', 'uid'].concat(NECESSARY_FIELDS_A)) : inviter,
        results[1] === false ? this.userRepo.getUser(recipient, ['region', 'uid'].concat(NECESSARY_FIELDS_A)) : recipient
      ]))
      .then(results => {
        inviter = results[0]
        recipient = results[1]
      })
      .catch(err => console.error(`\n${JSON.stringify(err, null, 2)}`))

    Promise.all([
      this.friendRepo.addFriend(recipient, inviter),
      this.friendRepo.addFriend(inviter, recipient)
    ]).then(() => console.log('add friend success for each other'))
  }

  // （改用 invitationRes 回傳）What does 'removedInvitation' look like?
  // var removedInvitation = await this.inviteRepo.removeInvitation(accountInfo, _.pick(invitationRes.header, ['iid', 'region']))
  // return removedInvitation

  const removed = await this.inviteRepo.removeRelatedInvitation(recipient, inviter)
  if (removed > 0) {
    invitationRes.recipient = recipient
    invitationRes.header.inviteEvent = CIRCLE_CONST.INVITE_EVENT_FRIEND_REPLY
    return invitationRes
  }

  throw new Error(`No invitation as ${JSON.stringify({
    inviter,
    recipient
  }, null, 2)}`)

  // //（改用 invitationRes 回傳）Does 'removedInvitation' look like this?
  // return {
  //   inviter: {
  //     fullName: 'Andy Chung',
  //     uid: '',
  //     region: 'tw',
  //     profileLink: '',
  //     profilePic: ''
  //   },
  //   recipient: {
  //     fullName: 'Terrence Chao',
  //     uid: accountInfo.uid,
  //     region: accountInfo.region,
  //     profileLink: '',
  //     profilePic: ''
  //   },
  //   header: {
  //     iid: 'invitation_id_6789',
  //     region: 'tw',
  //     inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE,
  //     data: {
  //       reply: true // one of the options
  //     }
  //   },
  //   content: {
  //     'lang': 'zh-tw',
  //   },
  //   // sensitive: {} // private & sensitive data
  // }
}

/**
 * get entire invitation by accountInfo & invitationInfo (iid, region)
 */
InvitationService.prototype.getInvitation = async function (accountInfo, invitationInfo) {
  return await this.inviteRepo.getInvitation(accountInfo, invitationInfo)

  // return {
  //   inviter: {
  //     fullName: 'Scarlett Liang',
  //     uid: `someone's uid`,
  //     region: `someone's region`,
  //     profileLink: '',
  //     profilePic: ''
  //   },
  //   recipient: {
  //     fullName: 'Allen Huang',
  //     uid: accountInfo.uid,
  //     region: accountInfo.region,
  //     profileLink: '',
  //     profilePic: ''
  //   },
  //   header: {
  //     iid: 'invitation_id_5678',
  //     region: 'tw',
  //     inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE,
  //     data: {
  //       options: [true, false]
  //     }
  //   },
  //   content: {
  //     'lang': 'zh-tw',
  //   },
  //   // sensitive: {} // private & sensitive data
  // }
}

/**
 * get list by accountInfo with page (limit, skip)
 * inviteArrow: [sent,received]
 * inviteCategory: [friend,society]
 */
InvitationService.prototype.getInvitationList = async function (accountInfo, inviteArrow, limit = CONSTANT.LIMIT, skip = CONSTANT.SKIP) {
  return await this.inviteRepo.getInvitationList(accountInfo, inviteArrow, limit, skip)

  // return [{
  //     inviter: {
  //       fullName: 'Scarlett Liang',
  //       uid: `someone's uid`,
  //       region: `someone's region`,
  //       profileLink: '',
  //       profilePic: ''
  //     },
  //     recipient: {
  //       fullName: 'Allen Huang',
  //       uid: accountInfo.uid,
  //       region: accountInfo.region,
  //       profileLink: '',
  //       profilePic: ''
  //     },
  //     header: {
  //       iid: 'invitation_id_5678',
  //       region: 'tw',
  //       inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE,
  //       data: {
  //         options: [true, false]
  //       }
  //     },
  //     content: {
  //       'lang': 'zh-tw',
  //     },
  //     // sensitive: {} // private & sensitive data
  //   },
  //   {
  //     inviter: {
  //       fullName: 'Andy Chung',
  //       uid: `someone's uid`,
  //       region: `someone's region`,
  //       profileLink: '',
  //       profilePic: ''
  //     },
  //     recipient: {
  //       fullName: 'Allen Huang',
  //       uid: accountInfo.uid,
  //       region: accountInfo.region,
  //       profileLink: '',
  //       profilePic: ''
  //     },
  //     header: {
  //       iid: 'invitation_id_6789',
  //       region: 'tw',
  //       inviteEvent: CIRCLE_CONST.INVITE_EVENT_FRIEND_INVITE,
  //       data: {
  //         options: [true, false]
  //       }
  //     },
  //     content: {
  //       'lang': 'zh-tw',
  //     },
  //     // sensitive: {} // private & sensitive data
  //   }
  // ]
}

InvitationService.prototype.getSentInvitationList = async function (accountInfo, limit = CONSTANT.LIMIT, skip = CONSTANT.SKIP) {
  return await this.inviteRepo.getSentInvitationList(accountInfo, limit, skip)
}

InvitationService.prototype.getReceivedInvitationList = async function (accountInfo, limit = CONSTANT.LIMIT, skip = CONSTANT.SKIP) {
  return await this.inviteRepo.getReceivedInvitationList(accountInfo, limit, skip)
}

module.exports = {
  invitationService: new InvitationService(userRepo, friendRepo, inviteRepo),
  InvitationService
}
