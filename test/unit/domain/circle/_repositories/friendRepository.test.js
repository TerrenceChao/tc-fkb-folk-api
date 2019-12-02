const { expect } = require('chai')
const path = require('path')
const config = require('config')
const Repository = require(path.join(config.src.library, 'Repository'))
const { AuthRepository } = require(path.join(config.src.repository.user, 'authRepository'))
const { FriendRepository } = require(path.join(config.src.repository.circle, 'friendRepository'))
const { genSignupInfo, genFriendRowId, parseFriendInfo, genDBFriendPublicInfo } = require(path.join(config.test.common, 'mock'))
const { assertFriend } = require(path.join(config.test.common, 'assert'))

const pool = config.database.pool

describe('repository: Friends', () => {
  const repo = new Repository(pool)
  const authRepo = new AuthRepository(pool)
  const friendRepo = new FriendRepository(pool)

  var userA
  const signupInfoA = genSignupInfo()
  var userB
  const signupInfoB = genSignupInfo()
  var userC
  const signupInfoC = genSignupInfo()

  before(async () => {
    userA = await authRepo.createAccountUser(signupInfoA)
    userB = await authRepo.createAccountUser(signupInfoB)
    userC = await authRepo.createAccountUser(signupInfoC)
  })

  it('addFriend', async () => {
    // arrange
    const account = { uid: userA.uid }
    const friendInfo = parseFriendInfo(userB)
    const rowId = genFriendRowId(account.uid, friendInfo)

    // act
    const friend = await friendRepo.addFriend(rowId, account, friendInfo)

    // assert
    expect(friend.uid).to.equals(account.uid)
    assertFriend(friendInfo, friend)
  })

  it('addFriend (duplicate)', async () => {
    // arrange

    // act

    // assert
  })

  it('makeFriends', async () => {
    // arrange
    const userInfo = parseFriendInfo(userA)
    const friendInfo = parseFriendInfo(userB)
    const uidMapping = {
      [userInfo.uid]: userInfo.uid,
      [friendInfo.uid]: friendInfo.uid
    }
    const recordMapping = {
      [userInfo.uid]: friendInfo,
      [friendInfo.uid]: userInfo
    }
    const userRowId = genFriendRowId(userInfo.uid, friendInfo)
    const friendRowId = genFriendRowId(friendInfo.uid, userInfo)

    // act
    const friendRecordList = await friendRepo.makeFriends(userRowId, userInfo, friendInfo, friendRowId)

    // assert
    friendRecordList.forEach(friend => {
      expect(friend.uid).to.equals(uidMapping[friend.uid])
      assertFriend(recordMapping[friend.uid], friend)
    })
  })

  it('makeFriends (duplicate)', async () => {
    // arrange

    // act

    // assert
  })

  it('getFriend', async () => {
    // arrange
    const account = { uid: userA.uid }
    const friendInfo = parseFriendInfo(userB)
    const rowId = genFriendRowId(account.uid, friendInfo)

    // act
    await friendRepo.addFriend(rowId, account, friendInfo)
    const friendRecord = await friendRepo.getFriend(account, friendInfo)

    // assert
    expect(friendRecord.uid).to.equals(account.uid)
    assertFriend(friendInfo, friendRecord)
  })

  it('getFriendByAccount', async () => {
    // arrange
    const account = { uid: userA.uid }
    const friendInfo = parseFriendInfo(userB)
    const rowId = genFriendRowId(account.uid, friendInfo)

    // act
    await friendRepo.addFriend(rowId, account, friendInfo)
    const friendRecord = await friendRepo.getFriendByAccount(friendInfo)

    // assert
    expect(friendRecord.uid).to.equals(account.uid)
    assertFriend(friendInfo, friendRecord)
  })

  it('getFriendList', async () => {
    // arrange
    const account = { uid: userA.uid, region: userA.region }
    const friendInfoB = parseFriendInfo(userB)
    const friendInfoC = parseFriendInfo(userC)
    const rowIdB = genFriendRowId(account.uid, friendInfoB)
    const rowIdC = genFriendRowId(account.uid, friendInfoC)
    await friendRepo.addFriend(rowIdB, account, friendInfoB)
    await friendRepo.addFriend(rowIdC, account, friendInfoC)

    // act
    const friendRecordList = await friendRepo.getFriendList(account, 5, 0)

    // assert
    const friendInfo = [friendInfoB, friendInfoC]
    friendRecordList.forEach((friend, idx) => assertFriend(friendInfo[idx], friend))
  })

  it('getLocalFriendList (friends are same region)', async () => {
    // arrange
    const account = { uid: userA.uid, region: 'region A' }
    const friendInfoB = parseFriendInfo(userB)
    const friendInfoC = parseFriendInfo(userC)
    friendInfoB.region = 'region A'
    friendInfoC.region = 'region A'
    const rowIdB = genFriendRowId(account.uid, friendInfoB)
    const rowIdC = genFriendRowId(account.uid, friendInfoC)
    await friendRepo.addFriend(rowIdB, account, friendInfoB)
    await friendRepo.addFriend(rowIdC, account, friendInfoC)

    // act
    const friendRecordList = await friendRepo.getLocalFriendList(account, 5, 0)

    // assert
    const friendInfo = [friendInfoB, friendInfoC]
    friendRecordList.forEach((friend, idx) => assertFriend(friendInfo[idx], friend))
  })

  it('getLocalFriendList (friends are different region)', async () => {
    // arrange
    const account = { uid: userA.uid, region: 'region A' }
    const friendInfoB = parseFriendInfo(userB)
    const friendInfoC = parseFriendInfo(userC)
    friendInfoB.region = 'region B'
    friendInfoC.region = 'region C'
    const rowIdB = genFriendRowId(account.uid, friendInfoB)
    const rowIdC = genFriendRowId(account.uid, friendInfoC)
    await friendRepo.addFriend(rowIdB, account, friendInfoB)
    await friendRepo.addFriend(rowIdC, account, friendInfoC)

    // act
    const friendRecordList = await friendRepo.getLocalFriendList(account, 5, 0)

    // assert
    expect(friendRecordList).to.be.an('array').that.is.empty
  })

  it('getNonlocalFriendList (friends are same region)', async () => {
    // arrange
    const account = { uid: userA.uid, region: 'region A' }
    const friendInfoB = parseFriendInfo(userB)
    const friendInfoC = parseFriendInfo(userC)
    friendInfoB.region = 'region A'
    friendInfoC.region = 'region A'
    const rowIdB = genFriendRowId(account.uid, friendInfoB)
    const rowIdC = genFriendRowId(account.uid, friendInfoC)
    await friendRepo.addFriend(rowIdB, account, friendInfoB)
    await friendRepo.addFriend(rowIdC, account, friendInfoC)

    // act
    const friendRecordList = await friendRepo.getNonlocalFriendList(account, 5, 0)

    // assert
    expect(friendRecordList).to.be.an('array').that.is.empty
  })

  it('getNonlocalFriendList (friends are different region)', async () => {
    // arrange
    const account = { uid: userA.uid, region: 'region A' }
    const friendInfoB = parseFriendInfo(userB)
    const friendInfoC = parseFriendInfo(userC)
    friendInfoB.region = 'region B'
    friendInfoC.region = 'region C'
    const rowIdB = genFriendRowId(account.uid, friendInfoB)
    const rowIdC = genFriendRowId(account.uid, friendInfoC)
    await friendRepo.addFriend(rowIdB, account, friendInfoB)
    await friendRepo.addFriend(rowIdC, account, friendInfoC)

    // act
    const friendRecordList = await friendRepo.getNonlocalFriendList(account, 5, 0)

    // assert
    const friendInfo = [friendInfoB, friendInfoC]
    friendRecordList.forEach((friend, idx) => assertFriend(friendInfo[idx], friend))
  })

  it('updateFriendPublicInfo', async () => {
    // arrange
    const accountB = { uid: userB.uid }
    const friendInfoA = parseFriendInfo(userA)
    const rowId = genFriendRowId(accountB.uid, friendInfoA)
    const newPublicInfoA = genDBFriendPublicInfo()

    // act
    await friendRepo.addFriend(rowId, accountB, friendInfoA)
    const friendRecordList = await friendRepo.updateFriendPublicInfo(friendInfoA, newPublicInfoA)

    // assert
    const friendRecord = friendRecordList[0]
    expect(friendRecord.uid).to.equals(accountB.uid)
    expect(friendRecord.friend_id).to.equals(friendInfoA.uid)
    expect(friendRecord.friend_region).to.equals(friendInfoA.region)
    expect(friendRecord.public_info.givenName).to.equals(newPublicInfoA.givenName)
    expect(friendRecord.public_info.familyName).to.equals(newPublicInfoA.familyName)
    expect(friendRecord.public_info.profileLink).to.equals(newPublicInfoA.profileLink)
    expect(friendRecord.public_info.profilePic).to.equals(newPublicInfoA.profilePic)
  })

  it('updateFriend', async () => {
    // arrange
    const account = { uid: userA.uid }
    const friendInfo = parseFriendInfo(userB)
    const updatedPublicInfo = genDBFriendPublicInfo()
    const rowId = genFriendRowId(account.uid, friendInfo)

    // act
    await friendRepo.addFriend(rowId, account, friendInfo)
    await friendRepo.updateFriend(account, friendInfo, updatedPublicInfo)
    const friendRecord = await friendRepo.getFriend(account, friendInfo)

    // assert
    expect(friendRecord.uid).to.equals(account.uid)
    expect(friendRecord.friend_id).to.equals(friendInfo.uid)
    expect(friendRecord.friend_region).to.equals(friendInfo.region)
    expect(friendRecord.public_info.givenName).to.equals(updatedPublicInfo.givenName)
    expect(friendRecord.public_info.familyName).to.equals(updatedPublicInfo.familyName)
    expect(friendRecord.public_info.profileLink).to.equals(updatedPublicInfo.profileLink)
    expect(friendRecord.public_info.profilePic).to.equals(updatedPublicInfo.profilePic)
  })

  it('removeFriend (soft delete)', async () => {
    const account = { uid: userA.uid }
    const friendInfo = parseFriendInfo(userB)
    const rowId = genFriendRowId(account.uid, friendInfo)
    const softDelete = true

    // act
    await friendRepo.addFriend(rowId, account, friendInfo)
    const deletedFriend = await friendRepo.removeFriend(account, friendInfo, softDelete)
    const friend = await friendRepo.getFriend(account, friendInfo)

    // assert
    assertFriend(friendInfo, deletedFriend)
    expect(friend).to.equals(undefined)
  })

  it('removeFriend', async () => {
    const account = { uid: userA.uid }
    const friendInfo = parseFriendInfo(userB)
    const rowId = genFriendRowId(account.uid, friendInfo)

    // act
    await friendRepo.addFriend(rowId, account, friendInfo)
    const deletedFriend = await friendRepo.removeFriend(account, friendInfo)
    const friend = await friendRepo.getFriend(account, friendInfo)

    // assert
    assertFriend(friendInfo, deletedFriend)
    expect(friend).to.equals(undefined)
  })

  // TODO: 
  it('unfriend (soft delete)', async () => {
    const userInfo = parseFriendInfo(userA)
    const friendInfo = parseFriendInfo(userB)
    const uidMapping = {
      [userInfo.uid]: userInfo.uid,
      [friendInfo.uid]: friendInfo.uid
    }
    const recordMapping = {
      [userInfo.uid]: friendInfo,
      [friendInfo.uid]: userInfo
    }
    const userRowId = genFriendRowId(userInfo.uid, friendInfo)
    const friendRowId = genFriendRowId(friendInfo.uid, userInfo)
    const softDelete = true

    // act
    await friendRepo.makeFriends(userRowId, userInfo, friendInfo, friendRowId)
    const deletedFriendList = await friendRepo.unfriend(userInfo, friendInfo, softDelete)
    const friendA = await friendRepo.getFriend(friendInfo, userInfo)
    const friendB = await friendRepo.getFriend(userInfo, friendInfo)

    // assert
    deletedFriendList.forEach(friend => {
      expect(friend.uid).to.equals(uidMapping[friend.uid])
      assertFriend(recordMapping[friend.uid], friend)
    })
    expect(friendA).to.equals(undefined)
    expect(friendB).to.equals(undefined)
  })

  // TODO: 
  it('unfriend', async () => {
    const userInfo = parseFriendInfo(userA)
    const friendInfo = parseFriendInfo(userB)
    const uidMapping = {
      [userInfo.uid]: userInfo.uid,
      [friendInfo.uid]: friendInfo.uid
    }
    const recordMapping = {
      [userInfo.uid]: friendInfo,
      [friendInfo.uid]: userInfo
    }
    const userRowId = genFriendRowId(userInfo.uid, friendInfo)
    const friendRowId = genFriendRowId(friendInfo.uid, userInfo)

    // act
    await friendRepo.makeFriends(userRowId, userInfo, friendInfo, friendRowId)
    const deletedFriendList = await friendRepo.unfriend(userInfo, friendInfo)
    const friendA = await friendRepo.getFriend(friendInfo, userInfo)
    const friendB = await friendRepo.getFriend(userInfo, friendInfo)

    // assert
    deletedFriendList.forEach(friend => {
      expect(friend.uid).to.equals(uidMapping[friend.uid])
      assertFriend(recordMapping[friend.uid], friend)
    })
    expect(friendA).to.equals(undefined)
    expect(friendB).to.equals(undefined)
  })

  afterEach(async () => {
    await repo.query('DELETE FROM "Friends" WHERE user_id IN ($1, $2)', [userA.uid, userB.uid])
  })
})
