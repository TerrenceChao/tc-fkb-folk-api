const { expect } = require('chai')
const path = require('path')
const config = require('config')
const Repository = require(path.join(config.src.library, 'Repository'))
const AuthRepository = require(path.join(config.src.repository.user, 'authRepository'))
const FriendRepository = require(path.join(config.src.repository.circle, 'friendRepository'))
const { genSignupInfo, parseFriendInfo, genDBFriendPublicInfo } = require(path.join(config.test.common, 'mock'))
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

    // act
    const friendRecord = await friendRepo.addFriend(account, friendInfo)

    // assert
    expect(friendRecord.user_id).to.equals(account.uid)
    assertFriend(friendInfo, friendRecord)
  })

  it('addFriend (duplicate)', async () => {
    // arrange

    // act

    // assert
  })

  it('getFriend', async () => {
    // arrange
    const account = { uid: userA.uid }
    const friendInfo = parseFriendInfo(userB)

    // act
    await friendRepo.addFriend(account, friendInfo)
    const friendRecord = await friendRepo.getFriend(account, friendInfo)

    // assert
    expect(friendRecord.user_id).to.equals(account.uid)
    assertFriend(friendInfo, friendRecord)
  })

  it('getFriendList', async () => {
    // arrange
    const account = { uid: userA.uid, region: userA.region }
    const friendInfoB = parseFriendInfo(userB)
    const friendInfoC = parseFriendInfo(userC)
    await friendRepo.addFriend(account, friendInfoB)
    await friendRepo.addFriend(account, friendInfoC)

    // act
    const friendRecordList = await friendRepo.getFriendList(account, 5, 0)

    // assert
    const friendInfo = [friendInfoB, friendInfoC]
    friendRecordList.forEach((friend, idx) => assertFriend(friendInfo[idx], friend))
  })

  it('updateFriend', async () => {
    // arrange
    const account = { uid: userA.uid }
    const friendInfo = parseFriendInfo(userB)
    const updatedPublicInfo = genDBFriendPublicInfo()

    // act
    await friendRepo.addFriend(account, friendInfo)
    await friendRepo.updateFriend(account, friendInfo, updatedPublicInfo)
    const friendRecord = await friendRepo.getFriend(account, friendInfo)

    // assert
    expect(friendRecord.user_id).to.equals(account.uid)
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
    const softDelete = true

    // act
    await friendRepo.addFriend(account, friendInfo)
    const deletedFriend = await friendRepo.removeFriend(account, friendInfo, softDelete)
    const friend = await friendRepo.getFriend(account, friendInfo)

    // assert
    assertFriend(friendInfo, deletedFriend)
    expect(friend).to.equals(undefined)
  })

  it('removeFriend', async () => {
    const account = { uid: userA.uid }
    const friendInfo = parseFriendInfo(userB)

    // act
    await friendRepo.addFriend(account, friendInfo)
    const deletedFriend = await friendRepo.removeFriend(account, friendInfo)
    const friend = await friendRepo.getFriend(account, friendInfo)

    // assert
    assertFriend(friendInfo, deletedFriend)
    expect(friend).to.equals(undefined)
  })

  afterEach(async () => {
    await repo.query('DELETE FROM "Friends" WHERE user_id = $1', [userA.uid])
  })
})
