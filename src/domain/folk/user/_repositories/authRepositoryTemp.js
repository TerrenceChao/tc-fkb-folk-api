const uuidv4 = require('uuid/v4')
const faker = require('faker')

var _ = require('lodash')

const TEST_ACCOUNT_DATA = new Map([
  ['rfvbnju@hotmail.com', {
    uid: '345b1c4c-128c-4286-8431-78d16d285f38',
    profileLink: '5678iolf-tw',
    profilePic: faker.internet.url(),
    verificaiton: {
      token: 'laierhgslierghULIHAsadaeri',
      code: '123456',
    },
    // friendList: [],
  }],
  ['alice.wang@outlook.com', {
    uid: 'c32f7185-31aa-40c3-b0a2-d0b68b35c783',
    profileLink: 'alice.wang',
    profilePic: faker.internet.url(),
    verificaiton: {
      token: 's.kdfjbnsjfv%SDFsdfbfxgnd&llk',
      code: '533418',
    },
    // friendList: [],
  }],
  ['joanna28@hotmail.com', {
    uid: '6d23430a-ccef-47b7-b1eb-2cf70e6bd9ca',
    profileLink: 'fyuiol-mnbv-en',
    profilePic: faker.internet.url(),
    verificaiton: {
      token: 'askdjfk.jH&vkadhfbk.degsahrf.KGYGY&llk',
      code: '622138',
    },
    // friendList: [],
  }]
])

function genAccountData () {
  return {
    uid: uuidv4(),
    profileLink: faker.internet.url(),
    profilePic: faker.internet.url(),
    verificaiton: {
      token: faker.internet.token,
      code: faker.random.number,
    },
    friendList: [],
  }
}

const userDB = new Map()
  .set('rfvbnju@hotmail.com', {
    region: 'tw',
    uid: TEST_ACCOUNT_DATA.get('rfvbnju@hotmail.com').uid,
    lang: 'en',
    email: 'rfvbnju@hotmail.com',
    phone: '+886-987-654-321', // (private)
    profileLink: TEST_ACCOUNT_DATA.get('rfvbnju@hotmail.com').profileLink,
    profilePic: TEST_ACCOUNT_DATA.get('rfvbnju@hotmail.com').profilePic,
    givenName: 'terrence',
    familyName: 'chao',
    gender: 'male',
    birth: '1983-08-01',
    verificaiton: TEST_ACCOUNT_DATA.get('rfvbnju@hotmail.com').verificaiton,
    friendList: [],
  })
  .set('alice.wang@outlook.com', {
    region: 'us',
    uid: TEST_ACCOUNT_DATA.get('alice.wang@outlook.com').uid,
    lang: 'en',
    email: 'alice.wang@outlook.com',
    phone: '+52-927-543-186', // (private)
    profileLink: TEST_ACCOUNT_DATA.get('alice.wang@outlook.com').profileLink,
    profilePic: TEST_ACCOUNT_DATA.get('alice.wang@outlook.com').profilePic,
    givenName: 'alice',
    familyName: 'wang',
    gender: 'female',
    birth: '1988-06-07',
    verificaiton: TEST_ACCOUNT_DATA.get('alice.wang@outlook.com').verificaiton,
    friendList: [],
  })
  .set('joanna28@hotmail.com', {
    region: 'us',
    uid: TEST_ACCOUNT_DATA.get('joanna28@hotmail.com').uid,
    lang: 'zh-tw',
    email: 'joanna28@hotmail.com',
    phone: '+886-955-123-456', // (private)
    profileLink: TEST_ACCOUNT_DATA.get('joanna28@hotmail.com').profileLink,
    profilePic: TEST_ACCOUNT_DATA.get('joanna28@hotmail.com').profilePic,
    givenName: 'joanna',
    familyName: 'lin',
    gender: 'female',
    birth: '1988-12-01',
    verificaiton: TEST_ACCOUNT_DATA.get('joanna28@hotmail.com').verificaiton,
    friendList: [],
  })

const invitationDB = new Map()

function AuthRepository () {}

/**
 * TODO: 在 repository 裡面只會有 SQL 語法錯誤， 除此之外不會主動拋出啥 Exception!! 之後想辦法調整
 * TODO: 在 repository 裡面只會有 SQL 語法錯誤， 除此之外不會主動拋出啥 Exception!! 之後想辦法調整
 * TODO: 在 repository 裡面只會有 SQL 語法錯誤， 除此之外不會主動拋出啥 Exception!! 之後想辦法調整
 * TODO: 在 repository 裡面只會有 SQL 語法錯誤， 除此之外不會主動拋出啥 Exception!! 之後想辦法調整
 * TODO: 在 repository 裡面只會有 SQL 語法錯誤， 除此之外不會主動拋出啥 Exception!! 之後想辦法調整
 */

/**
 * TODO: for temporary (it will be search engine instead of)
 * 
 * discoverAccounts 只是實驗用的，之後會用 elasticsearch 來取代，
 * discoverAccounts 只是實驗用的，之後會用 elasticsearch 來取代，
 * discoverAccounts 只是實驗用的，之後會用 elasticsearch 來取代，
 * ======================================================
 * discover others, and return lots results
 */
AuthRepository.prototype.discoverAccounts = async function (keyword) {
  const results = []
  for (const userInfo of userDB.values()) {
    if (userInfo.givenName.includes(keyword) || userInfo.familyName.includes(keyword)) {
      results.push(_.pick(userInfo, ['email', 'givenName', 'familyName', 'profileLink', 'profilePic']))
    }
  }

  return results;
}

/**
 * TODO: 實驗，模擬情境用, 之後會移除
 */
AuthRepository.prototype.generateFakeAccounts = async function (amount) {
  const REGIONS = ['tw', 'us', 'jp', 'au', 'nz']

  const list = []
  for (var i = 1; i <= amount; i++) {
    var fakeAccount = {
      region: faker.random.arrayElement(REGIONS),
      lang: faker.address.city(),
      email: faker.internet.email(),
      phone: faker.phone.phoneNumber(),
      givenName: faker.name.firstName(),
      familyName: faker.name.lastName(),
      gender: faker.random.arrayElement(['male', 'female']),
      birth: faker.date,
    }

    userDB.set(fakeAccount.email, _.assignIn(fakeAccount, genAccountData()))
    list.push(_.omit(Object.create(userDB.get(fakeAccount.email)), ['verificaiton', 'friendList']))
  }

  return list
}

/**
 * ===================================================================
 * friendRepo
 * ===================================================================
 */

/**
 * friendRepo
 */
AuthRepository.prototype.getFriendList = async function (account, limit, skip) {
  for (const userInfo of userDB.values()) {
    if (userInfo.uid !== account.uid || userInfo.region !== account.region) {
      // console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
      // console.log(`search: ${JSON.stringify(_.pick(account, 'uid', 'region'))}`)
      continue
    }

    // console.log(` in userInfo.friendList: ${JSON.stringify(userInfo.friendList.slice(skip, skip + limit), null, 2)}`)
    return userInfo.friendList.slice(skip, skip + limit)
  }

  return []
}

/**
 * friendRepo
 * TODO: 僅搜尋特定區域的朋友. 在跨區域機制下提供 dispatch-api 呼叫
 */
// AuthRepository.prototype.getFriendListByRegion = async function (account, region, limit, skip) {
//   for (const userInfo of userDB.values()) {
//     if (userInfo.uid !== account.uid || userInfo.region !== account.region) {
//       continue
//     }

//     // console.log(` in userInfo.friendList: ${JSON.stringify(userInfo.friendList)}`)
//     return userInfo.friendList.slice(skip, skip + limit).filter(friend => friend.region === region)
//   }

//   return []
// }

/**
 * friendRepo
 */
AuthRepository.prototype.getFriend = async function (account, targetAccount) {
  for (const userInfo of userDB.values()) {
    if (userInfo.uid !== account.uid || userInfo.region !== account.region) {
      // console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
      // console.log(`search: ${JSON.stringify(_.pick(account, 'uid', 'region'))}`)
      continue
    }

    return userInfo.friendList.find(friend => 
      friend.uid === targetAccount.uid &&
      friend.region === targetAccount.region
    )
  }

  return null
}

/**
 * friendRepo
 */
AuthRepository.prototype.addFriend = async function (account, targetAccount) {
  for (const userInfo of userDB.values()) {
    if (userInfo.uid !== account.uid || userInfo.region !== account.region) {
      // console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
      // console.log(`search: ${JSON.stringify(_.pick(account, 'uid', 'region'))}\n`)
      continue
    }

    // console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
    // console.log(`search: ${JSON.stringify(_.pick(account, 'uid', 'region'))}\n`)

    // if user has the friend, leave it and return null
    let friend = userInfo.friendList.find(friend => 
      friend.uid === targetAccount.uid &&
      friend.region === targetAccount.region
    )
    if (friend !== undefined) {
      return friend
    }

    // console.log(`targetAccount: ${JSON.stringify(targetAccount)}\n`)
    // add friend
    for (const friendInfo of userDB.values()) {
      if (friendInfo.uid === targetAccount.uid && friendInfo.region === targetAccount.region) {
        userInfo.friendList.push({
          region: friendInfo.region,
          uid: friendInfo.uid,
          profileLink: friendInfo.profileLink,
          profilePic: friendInfo.profilePic,
          givenName: friendInfo.givenName,
          familyName: friendInfo.familyName,
          allowFollowMe: null, // TODO: 重要。但開始有 post 時才有用
        })
        return friendInfo
      }
    }
  }

  throw new Error(`User not found`)
}

/**
 * friendRepo
 * [跨區域操作時使用]
 * TODO: 在同區域時,會刪除兩筆紀錄; 在不同區域時只會刪除一筆.
 * softDelete: 跨區域操作時使用，若雙邊操作需要 rollback 有機會補教。等雙邊都 commit 再硬刪除 (hard delete)
 */
AuthRepository.prototype.removeFriend = async function (account, targetAccount, softDelete = false) {
  let removedFriend

  // remove account's friend (targetAccount)
  for (const userInfo of userDB.values()) {
    if (userInfo.uid !== account.uid || userInfo.region !== account.region) {
      // console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
      // console.log(`search: ${JSON.stringify(_.pick(account, 'uid', 'region'))}`)

      continue
    }

    // console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
    // console.log(`search: ${JSON.stringify(_.pick(account, 'uid', 'region'))}`)

    // remove friend (will be stranger)
    let friend = userInfo.friendList.find(friend =>
      friend.uid === targetAccount.uid &&
      friend.region === targetAccount.region
    )
    if (friend !== undefined) {
      userInfo.friendList = userInfo.friendList.filter(friend => !(friend.uid === friend.uid && friend.region === friend.region))
    }
    console.log(`\n=====\n friend in userInfo.friendList: ${JSON.stringify(userInfo.friendList)}\n=====`)

    removedFriend = friend
  }

  // // remove targetAccount's friend (account)
  // for (const userInfo of userDB.values()) {
  //   if (userInfo.uid !== targetAccount.uid || userInfo.region !== targetAccount.region) {
  //     continue
  //   }
  //   // remove friend (will be stranger)
  //   let friend = userInfo.friendList.find(friend =>
  //     friend.uid === account.uid &&
  //     friend.region === account.region
  //   )
  //   if (friend !== undefined) {
  //     userInfo.friendList = userInfo.friendList.filter(friend => 
  //       !(friend.uid === friend.uid && friend.region === friend.region)
  //     )
  //   }
  // }

  return removedFriend
}

/**
 * friendRepo
 */
// const CONSTANT = require('../../../../circle/_properties/constant')
// AuthRepository.prototype.relation = async function (ownerAccount, visitorAccount) {
//   for (const userInfo of userDB.values()) {
//     if (userInfo.uid !== visitorAccount.uid || userInfo.region !== visitorAccount.region) {
//       console.log(`visitor in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
//       console.log(`search visitor: ${JSON.stringify(_.pick(visitorAccount, 'uid', 'region'))}`)
//       continue
//     }

//     // 3. invitation has sent
//     for (const inv of invitationDB.values()) {
//       if (inv['inviter'].uid === visitorAccount.uid && inv['inviter'].region === visitorAccount.region) {
//         return {
//           type: CONSTANT.RELATION_STATUS_INVITED,
//           relation: 'invitation has sent'
//         }
//       }
//     }

//     // 2. stranger
//     if (undefined === userInfo.friendList.find(friend => friend.uid === ownerAccount.uid && friend.region === ownerAccount.region)) {
//       return {
//         type: CONSTANT.RELATION_STATUS_STRANGER,
//         relation: 'stranger'
//       }
//     }

//     // 1. friend
//     return {
//       type: CONSTANT.RELATION_STATUS_FRIEND,
//       relation: 'friend'
//     }
//   }

//   throw new Error(`User not found`)
// }


/**
 * ===================================================================
 * invitationRepo
 * ===================================================================
 */


/**
 * invitationRepo
 */
AuthRepository.prototype.findOrCreateFriendInvitation = async function (newInvitation) {
  for (const inv of invitationDB.values()) {
    // if inviter has invited the same recipient, leave it
    if (inv.inviter.uid === newInvitation.inviter.uid &&
      inv.inviter.region === newInvitation.inviter.region &&
      inv.recipient.uid === newInvitation.recipient.uid &&
      inv.recipient.region === newInvitation.recipient.region) {
        return inv
    }
  }

  let iid = newInvitation.header.iid = uuidv4()
  invitationDB.set(iid, newInvitation)

  return newInvitation
}

/**
 * invitationRepo
 * invitationInfo (iid, region)
 */
AuthRepository.prototype.getInvitation = async function (account, invitationInfo) {
  console.log(`accoutInfo: ${JSON.stringify(account, null, 2)}`)
  console.log(`invitationInfo: ${JSON.stringify(invitationInfo, null, 2)}`)

  const invitation = invitationDB.get(invitationInfo.iid)
  if (invitation === undefined) {
    return null
  }

  if ((invitation.inviter.uid === account.uid && invitation.inviter.region === account.region) ||
      (invitation.recipient.uid === account.uid && invitation.recipient.region === account.region)
      ) {
        return invitation
    }

  throw new Error(`Invitation doesn't belong to user: ${JSON.stringify(account)}`)
}

/**
 * invitationRepo 
 * roles (inviter, recipient)
 */
const CONSTANT = require('../../../circle/_properties/constant')
AuthRepository.prototype.getInvitationByRoles = async function (account, targetAccount) {
  for (const invitation of invitationDB.values()) {
    const inviter = invitation.inviter
    const recipient = invitation.recipient

    // 3. user has sent invitation to someone
    if (inviter.uid === account.uid && inviter.region === account.region &&
      recipient.uid === targetAccount.uid && recipient.region === targetAccount.region) {
      return invitation
    }

    // 4. user (account) is invited
    if (inviter.uid === targetAccount.uid && inviter.region === targetAccount.region &&
      recipient.uid === account.uid && recipient.region === account.region) {
      return invitation
    }
  }

  return null
}

/**
 * invitationRepo
 */
AuthRepository.prototype.getInvitationList = async function (account, inviteArrow, limit, skip) {
  const inviteRoles = {
    sent: 'inviter',
    received: 'recipient'
  }
  let role = inviteRoles[inviteArrow]
  
  const list = []
  for (const inv of invitationDB.values()) {
    if (inv[role].uid === account.uid && inv[role].region === account.region) {
      list.push(inv)
    }
  }

  return list.slice(skip, skip + limit)
}

/**
 * invitationRepo
 */
AuthRepository.prototype.getSentInvitationList = async function (account, limit, skip) {
  const list = []
  for (const inv of invitationDB.values()) {
    if (inv.inviter.uid === account.uid && inv.inviter.region === account.region) {
      list.push(inv)
    }
  }

  return list.slice(skip, skip + limit)
}

/**
 * invitationRepo
 */
AuthRepository.prototype.getReceivedInvitationList = async function (account, limit, skip) {
  const list = []
  for (const inv of invitationDB.values()) {
    if (inv.recipient.uid === account.uid && inv.recipient.region === account.region) {
      list.push(inv)
    }
  }

  return list.slice(skip, skip + limit)
}

// /**
//  * invitationRepo
//  * invitationInfo (iid, region)
//  */
// AuthRepository.prototype.removeInvitation = async function (account, invitationInfo) {
//   let invitation = invitationDB.get(invitationInfo.iid)
//   if (invitation === undefined) {
//     return false
//   }

//   if (invitation.header.region !== invitationInfo.region) {
//     throw new Error(`Invitation's region is incorrect`)
//   }

//   if ((invitation.inviter.uid === account.uid && invitation.inviter.region === account.region) ||
//       (invitation.recipient.uid === account.uid && invitation.recipient.region === account.region)
//       ) {
//         invitationDB.delete(invitationInfo.iid)
//         return true
//     }

//   throw new Error(`Invitation doesn't belong to user: ${JSON.stringify(account)}`)
// }

/**
 * invitationRepo
 * 不論是否跨區域，有可能雙方幾乎同時發送了邀請，也同時建立了invitation records,
 * 導致雙方都是邀請者/受邀者，所以刪除時 需考慮這種情況 (刪除至多 2 筆資訊)
 * account (uid, region)
 * targetAccount (uid, region)
 *
 * [跨區域操作時使用]
 * softDelete: 跨區域操作時使用，若雙邊操作需要 rollback 有機會補教。等雙邊都 commit 再硬刪除 (hard delete)
 *
 * TODO: 將參數改為四個：(account, targetAccount, [event], softDelete)
 */
AuthRepository.prototype.removeRelatedInvitation = async function (account, targetAccount, softDelete = false) {
  let deleteRows = 0
  for (const invitation of invitationDB.values()) {
    const header = invitation.header
    const inviter = invitation.inviter
    const recipient = invitation.recipient

    if (inviter.uid === account.uid && inviter.region === account.region &&
      recipient.uid === targetAccount.uid && recipient.region === targetAccount.region) {
      invitationDB.delete(header.iid)
      deleteRows++
    }

    if (inviter.uid === targetAccount.uid && inviter.region === targetAccount.region &&
      recipient.uid === account.uid && recipient.region === account.region) {
      invitationDB.delete(header.iid)
      deleteRows++
    }

    if (deleteRows >= 2) {
      break
    }
  }

  return deleteRows
}



/**
 * ===================================================================
 * userRepo
 * ===================================================================
 */
const VERIFICATION_FIELDS = 
  ['region', 'uid', 'givenName', 'familyName', 'profileLink', 'profilePic',
    'verificaiton', 'lang', 'gender', // for email/SMS content
    'email', 'phone'  // for user contact
  ]
const DEFAULT_PUBLIC_USER_FIELDS = 
  ['region', 'uid', 'givenName', 'familyName', 'profileLink', 'profilePic']


/**
 * userRepo
 */
AuthRepository.prototype.getUser = async function (account, selectedFields = ['*']) {
  const PW_FIELDS = ['verificaiton', 'password', 'newPassword', 'newPasswordConfirm', 'friendList']
  for (const userInfo of userDB.values()) {
    if (userInfo.uid === account.uid && userInfo.region === account.region) {
      let partialUserInfo = _.omit(userInfo, PW_FIELDS)
      return _.isEqual(selectedFields.sort(), ['*'].sort()) ? partialUserInfo : _.pick(partialUserInfo, selectedFields)
    }
  }

  return null
}

/**
 * userRepo
 * TODO: email 不可變更！這網站不像 linkedIn 可以替換信箱
 */
AuthRepository.prototype.updateUser = async function (account, newUserInfo) {
  for (const userInfo of userDB.values()) {
    if (userInfo.uid === account.uid && userInfo.region === account.region) {
      // email 不可變更！
      const updatedUserInfo = _.assignIn(userInfo, newUserInfo)
      userDB.set(userInfo.email, updatedUserInfo)
      return true
    }
  }

  return false
}

/**
 * userRepo
 */
AuthRepository.prototype.getPairUsers = async function (account, targetAccount, defaultFields = DEFAULT_PUBLIC_USER_FIELDS) {
  let user, targetUser
  for (const userInfo of userDB.values()) {
    if (userInfo.uid === account.uid && userInfo.region === account.region) {
      user = _.pick(userInfo, defaultFields)
    }

    if (userInfo.uid === targetAccount.uid && userInfo.region === targetAccount.region) {
      targetUser = _.pick(userInfo, defaultFields)
    }

    if (user !== undefined && targetUser !== undefined) {
      return [user, targetUser]
    }
  }

  throw new Error('user or targetUser not found')
}


// search someone, and only one result
AuthRepository.prototype.getAccountUserByContact = async function(type, account) {
  if (type === 'phone') {
    for (const userInfo of userDB.values()) {
      if (account === userInfo.phone) {
        return userInfo.phone
      }
    }
    throw new Error(`user not found`)
  }

  const userInfo = userDB.get(account)
  if (userInfo != null) {
    return userInfo.email
  }

  throw new Error(`user not found`)
}

AuthRepository.prototype.createAccountUser = async function (signupInfo) {
  // 測試用的特例
  if (TEST_ACCOUNT_DATA.has(signupInfo.email)) {
    let newUSer = _.assignIn(signupInfo, TEST_ACCOUNT_DATA.get(signupInfo.email))
    newUSer.friendList = []
    userDB.set(signupInfo.email, newUSer)
    return _.omit(userDB.get(signupInfo.email), ['verificaiton', 'friendList'])
  }

  if (userDB.has(signupInfo.email)) {
    throw new Error(`This user has registered`)
  }

  userDB.set(signupInfo.email, _.assignIn(signupInfo, genAccountData()))

  return _.omit(Object.create(userDB.get(signupInfo.email)), ['verificaiton', 'friendList'])
}

AuthRepository.prototype.getAuthorizedUser = async function (email, password) {
  return _.omit(Object.create(userDB.get(email)), ['phone', 'verificaiton', 'friendList'])
}

/**
 * TODO: [findOrCreateVerification] 這裡將指為單純回傳 table: Accounts & Auths 中的資訊。實際應用時，需要上層結合 table: Users 中的欄位
 */
AuthRepository.prototype.findOrCreateVerification = async function (type, account, expire = null, selectedFields = null) {
  selectedFields = selectedFields == null ? VERIFICATION_FIELDS : selectedFields
  if (type === 'phone') {
    for (const userInfo of userDB.values()) {
      if (account === userInfo.phone) {
        userInfo.verificaiton.expire = expire
        userDB.set(account.phone, userInfo)
        return _.pick(userInfo, selectedFields)
      }
    }
    throw new Error(`user not found`)
  }

  const userInfo = userDB.get(account.email)
  if (userInfo != null) {
    userInfo.verificaiton.expire = expire
    userDB.set(account.email, userInfo)
    return _.pick(userInfo, selectedFields)
  }

  throw new Error(`user not found`)
}

AuthRepository.prototype.getVerifyUserByCode = async function (token, code, selectedFields = null) {
  console.log(`verification: ${JSON.stringify({token, code}, null, 2)}`)
  for (const userInfo of userDB.values()) {
    const userVerify = userInfo.verificaiton
    console.log(`userVerify in database: ${JSON.stringify(userVerify, null, 2)}`)
    if (token === userVerify.token && code === userVerify.code) {
      return _.pick(userInfo, VERIFICATION_FIELDS)
    }
  }
  return undefined // throw new Error(`user not found`)
}

AuthRepository.prototype.getVerifyUserWithoutExpired = async function (token, expire, selectedFields = null) {
  console.log(`token: ${JSON.stringify(token, null, 2)}`)
  for (const userInfo of userDB.values()) {
    const userVerify = userInfo.verificaiton
    console.log(`userVerify in database: ${JSON.stringify(userVerify, null, 2)}`)
    // 在真實需求中 expire 也需要符合
    if (token === userVerify.token) {
      return _.pick(userInfo, VERIFICATION_FIELDS)
    }
  }
  return undefined // throw new Error(`user not found`)
}

AuthRepository.prototype.deleteVerification = async function (userInfo) {
  return true
}

module.exports = new AuthRepository()