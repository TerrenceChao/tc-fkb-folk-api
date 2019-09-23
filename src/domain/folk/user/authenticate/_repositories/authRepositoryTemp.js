const uuidv4 = require('uuid/v4')
const faker = require('faker')

var _ = require('lodash')

const TEST_ACCOUNT_DATA = new Map([
  ['terrence@gmail.com', {
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
    profileLink: 'fyuiol-mnbv-en',
    profilePic: faker.internet.url(),
    verificaiton: {
      token: 's.kdfjbnsjfv%SDFsdfbfxgnd&llk',
      code: '533418',
    },
    // friendList: [],
  }],
  ['joanna28@hotmail.com', {
    uid: '6d23430a-ccef-47b7-b1eb-2cf70e6bd9ca',
    profileLink: 'alice.wang',
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
  .set('terrence@gmail.com', {
    region: 'tw',
    uid: TEST_ACCOUNT_DATA.get('terrence@gmail.com').uid,
    lang: 'en',
    email: 'terrence@gmail.com',
    phone: '+886-987-654-321', // (private)
    profileLink: TEST_ACCOUNT_DATA.get('terrence@gmail.com').profileLink,
    profilePic: TEST_ACCOUNT_DATA.get('terrence@gmail.com').profilePic,
    givenName: 'terrence',
    familyName: 'chao',
    gender: 'male',
    birth: '1983-08-01',
    verificaiton: TEST_ACCOUNT_DATA.get('terrence@gmail.com').verificaiton,
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
 * friendRepo
 */
AuthRepository.prototype.getFriendList = async function (accountInfo, limit, skip) {
  for (const userInfo of userDB.values()) {
    if (userInfo.uid !== accountInfo.uid || userInfo.region !== accountInfo.region) {
      // console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
      // console.log(`search: ${JSON.stringify(_.pick(accountInfo, 'uid', 'region'))}`)
      continue
    }

    // console.log(` in userInfo.friendList: ${JSON.stringify(userInfo.friendList)}`)
    return userInfo.friendList.slice(skip, skip + limit)
  }

  return []
}

/**
 * friendRepo
 */
AuthRepository.prototype.getFriend = async function (accountInfo, targetAccountInfo) {
  for (const userInfo of userDB.values()) {
    if (userInfo.uid !== accountInfo.uid || userInfo.region !== accountInfo.region) {
      // console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
      // console.log(`search: ${JSON.stringify(_.pick(accountInfo, 'uid', 'region'))}`)
      continue
    }

    return userInfo.friendList.find(friend => 
      friend.uid === targetAccountInfo.uid &&
      friend.region === targetAccountInfo.region
    )
  }

  return null
}

/**
 * friendRepo
 */
AuthRepository.prototype.addFriend = async function (accountInfo, targetAccountInfo) {
  for (const userInfo of userDB.values()) {
    if (userInfo.uid !== accountInfo.uid || userInfo.region !== accountInfo.region) {
      // console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
      // console.log(`search: ${JSON.stringify(_.pick(accountInfo, 'uid', 'region'))}\n`)
      continue
    }

    // console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
    // console.log(`search: ${JSON.stringify(_.pick(accountInfo, 'uid', 'region'))}\n`)

    // if user has the friend, leave it and return null
    let friend = userInfo.friendList.find(friend => 
      friend.uid === targetAccountInfo.uid &&
      friend.region === targetAccountInfo.region
    )
    if (friend !== undefined) {
      return friend
    }

    // console.log(`targetAccountInfo: ${JSON.stringify(targetAccountInfo)}\n`)
    // add friend
    for (const friendInfo of userDB.values()) {
      if (friendInfo.uid === targetAccountInfo.uid && friendInfo.region === targetAccountInfo.region) {
        userInfo.friendList.push({
          region: friendInfo.region,
          uid: friendInfo.uid,
          profileLink: friendInfo.profileLink,
          profilePic: friendInfo.profilePic,
          givenName: friendInfo.givenName,
          familyName: friendInfo.familyName,
          allowFollowMe: null, // TODO: 重要。但開始有 post 時才有用
        })
        friendInfo.friendList.push({
          region: userInfo.region,
          uid: userInfo.uid,
          profileLink: userInfo.profileLink,
          profilePic: userInfo.profilePic,
          givenName: userInfo.givenName,
          familyName: userInfo.familyName,
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
 * softDelete: 跨區域操作時使用，若雙邊操作需要 rollback 有機會補教。等雙邊都 commit 再硬刪除 (hard delete)
 */
AuthRepository.prototype.removeFriend = async function (accountInfo, targetAccountInfo, softDelete = false) {
  let removedFriend

  // remove accountInfo's friend (targetAccountInfo)
  for (const userInfo of userDB.values()) {
    if (userInfo.uid !== accountInfo.uid || userInfo.region !== accountInfo.region) {
      // console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
      // console.log(`search: ${JSON.stringify(_.pick(accountInfo, 'uid', 'region'))}`)

      continue
    }

    // console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
    // console.log(`search: ${JSON.stringify(_.pick(accountInfo, 'uid', 'region'))}`)

    // remove friend (will be stranger)
    let friend = userInfo.friendList.find(friend =>
      friend.uid === targetAccountInfo.uid &&
      friend.region === targetAccountInfo.region
    )
    if (friend !== undefined) {
      userInfo.friendList = userInfo.friendList.filter(friend => !(friend.uid === friend.uid && friend.region === friend.region))
    }
    console.log(`\n=====\n friend in userInfo.friendList: ${JSON.stringify(userInfo.friendList)}\n=====`)

    removedFriend = friend
  }

  // remove targetAccountInfo's friend (accountInfo)
  for (const userInfo of userDB.values()) {
    if (userInfo.uid !== targetAccountInfo.uid || userInfo.region !== targetAccountInfo.region) {
      continue
    }
    // remove friend (will be stranger)
    let friend = userInfo.friendList.find(friend =>
      friend.uid === accountInfo.uid &&
      friend.region === accountInfo.region
    )
    if (friend !== undefined) {
      userInfo.friendList = userInfo.friendList.filter(friend => 
        !(friend.uid === friend.uid && friend.region === friend.region)
      )
    }
  }

  return removedFriend
}

/**
 * friendRepo
 */
// const CONSTANT = require('../../../../circle/_properties/constant')
// AuthRepository.prototype.relation = async function (ownerAccountInfo, visitorAccountInfo) {
//   for (const userInfo of userDB.values()) {
//     if (userInfo.uid !== visitorAccountInfo.uid || userInfo.region !== visitorAccountInfo.region) {
//       console.log(`visitor in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
//       console.log(`search visitor: ${JSON.stringify(_.pick(visitorAccountInfo, 'uid', 'region'))}`)
//       continue
//     }

//     // 3. invitation has sent
//     for (const inv of invitationDB.values()) {
//       if (inv['inviter'].uid === visitorAccountInfo.uid && inv['inviter'].region === visitorAccountInfo.region) {
//         return {
//           type: CONSTANT.RELATION_STATUS_INVITED,
//           relation: 'invitation has sent'
//         }
//       }
//     }

//     // 2. stranger
//     if (undefined === userInfo.friendList.find(friend => friend.uid === ownerAccountInfo.uid && friend.region === ownerAccountInfo.region)) {
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
AuthRepository.prototype.getInvitation = async function (accountInfo, invitationInfo) {
  console.log(`accoutInfo: ${JSON.stringify(accountInfo, null, 2)}`)
  console.log(`invitationInfo: ${JSON.stringify(invitationInfo, null, 2)}`)

  const invitation = invitationDB.get(invitationInfo.iid)
  if (invitation === undefined) {
    return null
  }

  if ((invitation.inviter.uid === accountInfo.uid && invitation.inviter.region === accountInfo.region) ||
      (invitation.recipient.uid === accountInfo.uid && invitation.recipient.region === accountInfo.region)
      ) {
        return invitation
    }

  throw new Error(`Invitation doesn't belong to user: ${JSON.stringify(accountInfo)}`)
}

/**
 * invitationRepo 
 * roles (inviter, recipient)
 */
const CONSTANT = require('../../../../circle/_properties/constant')
AuthRepository.prototype.getInvitationByRoles = async function (accountInfo, targetAccountInfo) {
  for (const invitation of invitationDB.values()) {
    const inviter = invitation.inviter
    const recipient = invitation.recipient

    // 3. user has sent invitation to someone
    if (inviter.uid === accountInfo.uid && inviter.region === accountInfo.region &&
      recipient.uid === targetAccountInfo.uid && recipient.region === targetAccountInfo.region) {
        return invitation
    }

    // 4. user (accountInfo) is invited
    if (inviter.uid === targetAccountInfo.uid && inviter.region === targetAccountInfo.region &&
      recipient.uid === accountInfo.uid && recipient.region === accountInfo.region) {
        return invitation
    }
  }

  return null
}

/**
 * invitationRepo
 */
AuthRepository.prototype.getInvitationList = async function (accountInfo, inviteArrow, limit, skip) {
  const inviteRoles = {
    sent: 'inviter',
    received: 'recipient'
  }
  let role = inviteRoles[inviteArrow]
  
  const list = []
  for (const inv of invitationDB.values()) {
    if (inv[role].uid === accountInfo.uid && inv[role].region === accountInfo.region) {
      list.push(inv)
    }
  }

  return list.slice(skip, skip + limit)
}

// /**
//  * invitationRepo
//  * invitationInfo (iid, region)
//  */
// AuthRepository.prototype.removeInvitation = async function (accountInfo, invitationInfo) {
//   let invitation = invitationDB.get(invitationInfo.iid)
//   if (invitation === undefined) {
//     return false
//   }

//   if (invitation.header.region !== invitationInfo.region) {
//     throw new Error(`Invitation's region is incorrect`)
//   }

//   if ((invitation.inviter.uid === accountInfo.uid && invitation.inviter.region === accountInfo.region) ||
//       (invitation.recipient.uid === accountInfo.uid && invitation.recipient.region === accountInfo.region)
//       ) {
//         invitationDB.delete(invitationInfo.iid)
//         return true
//     }

//   throw new Error(`Invitation doesn't belong to user: ${JSON.stringify(accountInfo)}`)
// }

/**
 * invitationRepo
 * 不論是否跨區域，有可能雙方幾乎同時發送了邀請，也同時建立了invitation records,
 * 導致雙方都是邀請者/受邀者，所以刪除時 需考慮這種情況 (刪除至多 2 筆資訊)
 * accountInfo (uid, region)
 * targetAccountInfo (uid, region)
 * 
 * [跨區域操作時使用]
 * softDelete: 跨區域操作時使用，若雙邊操作需要 rollback 有機會補教。等雙邊都 commit 再硬刪除 (hard delete)
 */
AuthRepository.prototype.removeRelatedInvitation = async function (accountInfo, targetAccountInfo, softDelete = false) {
  let deleteRows = 0
  for (const invitation of invitationDB.values()) {
    const header = invitation.header
    const inviter = invitation.inviter
    const recipient = invitation.recipient

    if (inviter.uid === accountInfo.uid && inviter.region === accountInfo.region &&
      recipient.uid === targetAccountInfo.uid && recipient.region === targetAccountInfo.region) {
      invitationDB.delete(header.iid)
      deleteRows++
    }

    if (inviter.uid === targetAccountInfo.uid && inviter.region === targetAccountInfo.region &&
      recipient.uid === accountInfo.uid && recipient.region === accountInfo.region) {
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
 * userRepo
 */
AuthRepository.prototype.getUser = async function (accountInfo, ignoredFields = []) {
  const DEFAULT_IGNORED_FIELDS = ['verificaiton', 'friendList'].concat(ignoredFields)
  for (const userInfo of userDB.values()) {
    if (userInfo.uid === accountInfo.uid && userInfo.region === accountInfo.region) {
      return _.omit(userInfo, DEFAULT_IGNORED_FIELDS)
    }
  }

  return null
}

/**
 * userRepo
 * TODO: email 不可變更！這網站不像 linkedIn 可以替換信箱
 */
AuthRepository.prototype.updateUser = async function (accountInfo, newUserInfo) {
  for (const userInfo of userDB.values()) {
    if (userInfo.uid === accountInfo.uid && userInfo.region === accountInfo.region) {
      // email 不可變更！
      let updatedUserInfo = _.assignIn(userInfo, newUserInfo)
      userDB.set(userInfo.email, updatedUserInfo)
      return true
    }
  }

  return false
}

/**
 * userRepo
 */
const DEFAULT_PUBLIC_USER_FIELDS = ['uid', 'region', 'givenName', 'familyName', 'profileLink', 'profilePic']
AuthRepository.prototype.getPairUsers = async function (accountInfo, targetAccountInfo, defaultFields = DEFAULT_PUBLIC_USER_FIELDS) {
  let user, targetUser
  for (const userInfo of userDB.values()) {
    if (userInfo.uid === accountInfo.uid && userInfo.region === accountInfo.region) {
      user = _.pick(userInfo, defaultFields)
    }

    if (userInfo.uid === targetAccountInfo.uid && userInfo.region === targetAccountInfo.region) {
      targetUser = _.pick(userInfo, defaultFields)
    }

    if (user !== undefined && targetUser !== undefined) {
      return [user, targetUser]
    }
  }

  throw new Error('user or targetUser not found')
}


// search someone, and only one result
AuthRepository.prototype.searchAccount = async function(type, account) {
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

AuthRepository.prototype.getAccountUser = async function (userInfo, password) {
  return _.omit(Object.create(userDB.get(userInfo.email)), ['phone', 'verificaiton', 'friendList'])
}

AuthRepository.prototype.createVerification = async function (type, account, reset = null) {
  if (type === 'phone') {
    for (const userInfo of userDB.values()) {
      if (account === userInfo.phone) {
        userInfo.verificaiton.reset = reset
        userDB.set(account, userInfo)
        return _.pick(userInfo, ['verificaiton', 'region', 'lang', 'givenName', 'familyName', 'gender', 'friendList'])
      }
    }
    throw new Error(`user not found`)
  }

  const userInfo = userDB.get(account)
  if (userInfo != null) {
    userInfo.verificaiton.reset = reset
    userDB.set(account, userInfo)
    return _.pick(userInfo, ['verificaiton', 'region', 'lang', 'givenName', 'familyName', 'gender', 'friendList'])
  }

  throw new Error(`user not found`)
}

AuthRepository.prototype.validateVerification = async function (verificaiton) {
  console.log(`verification: ${JSON.stringify(verificaiton, null, 2)}`)
  for (const userInfo of userDB.values()) {
    const userVerify = userInfo.verificaiton
    console.log(`userVerify in database: ${JSON.stringify(userVerify, null, 2)}`)
    // verificaiton.reset 這邊需要檢查是否超過現在的時間
    if (verificaiton.token === userVerify.token &&
      (verificaiton.code === userVerify.code || verificaiton.reset != null)) {
      return _.omit(userInfo, ['phone', 'verificaiton', 'friendList'])
    }
  }
  throw new Error(`user not found`)
}

module.exports = new AuthRepository()