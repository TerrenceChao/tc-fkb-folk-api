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
    friendList: [],
  }],
  ['alice.wang@outlook.com', {
    uid: 'c32f7185-31aa-40c3-b0a2-d0b68b35c783',
    profileLink: 'fyuiol-mnbv-en',
    profilePic: faker.internet.url(),
    verificaiton: {
      token: 's.kdfjbnsjfv%SDFsdfbfxgnd&llk',
      code: '533418',
    },
    friendList: [],
  }],
  ['joanna28@hotmail.com', {
    uid: '6d23430a-ccef-47b7-b1eb-2cf70e6bd9ca',
    profileLink: 'alice.wang',
    profilePic: faker.internet.url(),
    verificaiton: {
      token: 'askdjfk.jH&vkadhfbk.degsahrf.KGYGY&llk',
      code: '622138',
    },
    friendList: [],
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
AuthRepository.prototype.genFakeAccounts = async function (amount) {
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
 * TODO: 實驗，模擬情境用, 之後會移除
 */
AuthRepository.prototype.getFriendList = async function (accountInfo, limit, skip) {
  for (const userInfo of userDB.values()) {
    if (userInfo.uid !== accountInfo.uid || userInfo.region !== accountInfo.region) {
      // console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
      // console.log(`search: ${JSON.stringify(_.pick(accountInfo, 'uid', 'region'))}`)
      continue
    }

    console.log(` in userInfo.friendList: ${JSON.stringify(userInfo.friendList)}`)
    return userInfo.friendList.slice(skip, skip + limit)
  }

  throw new Error(`User not found`)
}

/**
 * TODO: 實驗，模擬情境用, 之後會移除
 */
AuthRepository.prototype.findFriend = async function (accountInfo, targetAccountInfo) {
  for (const userInfo of userDB.values()) {
    if (userInfo.uid !== accountInfo.uid || userInfo.region !== accountInfo.region) {
      console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
      console.log(`search: ${JSON.stringify(_.pick(accountInfo, 'uid', 'region'))}`)
      continue
    }

    const friend = userInfo.friendList.find(friend => friend.uid === targetAccountInfo.uid && friend.region === targetAccountInfo.region)
    return friend
  }

  throw new Error(`User not found`)
}

/**
 * TODO: 實驗，模擬情境用, 之後會移除
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
    let friend = userInfo.friendList.find(friend => friend.uid === targetAccountInfo.uid && friend.region === targetAccountInfo.region)
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
 * TODO: 實驗，模擬情境用, 之後會移除
 */
AuthRepository.prototype.removeFriend = async function (accountInfo, targetAccountInfo) {
  for (const userInfo of userDB.values()) {
    if (userInfo.uid !== accountInfo.uid || userInfo.region !== accountInfo.region) {
      console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
      console.log(`search: ${JSON.stringify(_.pick(accountInfo, 'uid', 'region'))}`)
      continue
    }

    // remove friend (will be stranger)
    let stranger = userInfo.friendList.find(friend => friend.uid === targetAccountInfo.uid && friend.region === targetAccountInfo.region)
    if (stranger !== undefined) {
      userInfo.friendList.filter(friend => friend.uid === stranger.uid && friend.region === stranger.region)
    }

    return stranger
  }

  throw new Error(`User not found`)
}

/**
 * TODO: 實驗，模擬情境用, 之後會移除
 */
const CONSTANT = require('../../../../circle/_properties/constant')
AuthRepository.prototype.relation = async function (accountInfo, targetAccountInfo) {
  for (const userInfo of userDB.values()) {
    if (userInfo.uid !== accountInfo.uid || userInfo.region !== accountInfo.region) {
      console.log(` in userDB: ${JSON.stringify(_.pick(userInfo, 'uid', 'region'))}`)
      console.log(`search: ${JSON.stringify(_.pick(accountInfo, 'uid', 'region'))}`)
      continue
    }

    if (userInfo.friendList.find(friend => friend.uid === targetAccountInfo.uid && friend.region === targetAccountInfo.region)) {
      return {
        type: CONSTANT.RELATION_STATUS_FRIEND,
        relation: 'friend'
      }
    }

    return {
      type: CONSTANT.RELATION_STATUS_STRANGER,
      relation: 'stranger'
    }
  }

  throw new Error(`User not found`)
}

AuthRepository.prototype.findUser = async function (accountInfo) {
  for (const userInfo of userDB.values()) {
    if (userInfo.uid === accountInfo.uid && userInfo.region === accountInfo.region) {
      return userInfo
    }
  }
}

AuthRepository.prototype.findPairUsers = async function (accountInfo, targetAccountInfo) {
  let user, targetUser
  for (const userInfo of userDB.values()) {
    if (userInfo.uid === accountInfo.uid && userInfo.region === accountInfo.region) {
      user = _.pick(userInfo, ['uid', 'region', 'lang', 'givenName', 'familyName', 'profileLink', 'profilePic'])
    }

    if (userInfo.uid === targetAccountInfo.uid && userInfo.region === targetAccountInfo.region) {
      targetUser = _.pick(userInfo, ['uid', 'region', 'lang', 'givenName', 'familyName', 'profileLink', 'profilePic'])
    }

    if (user !== undefined && targetUser !== undefined) {
      return [user, targetUser]
    }
  }

  throw new Error('user or targetUser not found')
}

/**
 * TODO: 實驗，模擬情境用, 之後會移除
 */
AuthRepository.prototype.createFriendInvitation = async function (newInvitation) {
  for (const inv of invitationDB.values()) {
    // if inviter has invited the same invitee, leave it
    if (inv.inviter.uid === newInvitation.inviter.uid &&
      inv.inviter.region === newInvitation.inviter.region &&
      inv.invitee.uid === newInvitation.invitee.uid &&
      inv.invitee.region === newInvitation.invitee.region) {
        return inv
    }
  }

  let iid = newInvitation.header.iid = uuidv4()
  invitationDB.set(iid, newInvitation)

  return newInvitation
}

/**
 * TODO: 實驗，模擬情境用, 之後會移除
 * invitationInfo (iid, region)
 */
AuthRepository.prototype.getInvitation = async function (accountInfo, invitationInfo) {
  for (const inv of invitationDB.values()) {
    // if invitation belongs user(accountInfo) no matter inviter/invitee, return
    if ((inv.inviter.uid === accountInfo.uid &&
      inv.inviter.region === accountInfo.region) ||
      (inv.invitee.uid === accountInfo.uid &&
        inv.invitee.region === accountInfo.region) &&
        inv.iid === invitationInfo.iid
        // && inv.region === invitationInfo.region
      ) {
        return inv
    }
  }

  return null
}

/**
 * TODO: 實驗，模擬情境用, 之後會移除
 */
AuthRepository.prototype.getInvitationList = async function (accountInfo, inviteArrow, limit, skip) {
  const inviteRoles = {
    sent: 'inviter',
    received: 'invitee'
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

/**
 * TODO: 實驗，模擬情境用, 之後會移除
 */
AuthRepository.prototype.removeInvitation = async function (accountInfo, inviteHeader) {
  let invitation = null
  for (const inv of invitationDB.values()) {
    // if invitation belongs user(accountInfo) no matter inviter/invitee, delete & return
    if ((inv.inviter.uid === accountInfo.uid &&
      inv.inviter.region === accountInfo.region) ||
      (inv.invitee.uid === accountInfo.uid &&
      inv.invitee.region === accountInfo.region) &&
      inv.header.iid === inviteHeader.iid 
      // && inv.header.region === inviteHeader.region
    ) {
      invitation = inv
      invitationDB.delete(inv.header.iid)
      break
    }
  }

  return invitation
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
    userDB.set(signupInfo.email, _.assignIn(signupInfo, TEST_ACCOUNT_DATA.get(signupInfo.email)))
    return _.omit(Object.create(userDB.get(signupInfo.email)), ['verificaiton', 'friendList'])
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