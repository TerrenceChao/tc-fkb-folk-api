const { expect } = require('chai')
const _ = require('lodash')
const path = require('path')
const config = require('config')
const Repository = require(path.join(config.src.library, 'Repository'))
const { AuthRepository } = require(path.join(config.src.repository.user, 'authRepository'))
const { UserRepository } = require(path.join(config.src.repository.user, 'userRepository'))
const { genSignupInfo } = require(path.join(config.test.common, 'mock'))
const { assertUserProperties } = require(path.join(config.test.common, 'assert'))

const pool = config.database.pool

describe('repository: Users', () => {
  const repo = new Repository(pool)
  const authRepo = new AuthRepository(pool)
  const userRepo = new UserRepository(pool)

  const CHECK_FIELDS = ['uid', 'region', 'email', 'countryCode', 'phone', 'givenName', 'familyName', 'publicInfo']
  const UPDATE_USER_FIELDS = ['beSearched', 'givenName', 'familyName', 'gender', 'lang', 'publicInfo']
  const UPDATE_CONTACT_FIELDS = ['alternateEmail', 'countryCode', 'phone', 'device']

  var userA
  const signupInfoA = genSignupInfo()

  before(async () => {
    userA = await authRepo.createAccountUser(signupInfoA)
  })

  it('getAuthorizedUser', async () => {
    // act
    const authorizedUser = await userRepo.getAuthorizedUser(signupInfoA.email, signupInfoA.pwHash, CHECK_FIELDS)

    // assert
    assertUserProperties(authorizedUser, signupInfoA)
  })

  it('reset password', async () => {
    // arrange
    const signupInfo = genSignupInfo()
    await authRepo.createAccountUser(signupInfo)
    const newPwHash = 'abcdefg'

    // act
    const { uid, region, email } = _.pick(signupInfo, ['uid', 'region', 'email'])
    await authRepo.resetPassword({ uid, region }, newPwHash)
    const user = await userRepo.getAuthorizedUser(email, newPwHash, CHECK_FIELDS)

    // assert
    assertUserProperties(user, signupInfo)
  })

  it('reset password with confirm old password', async () => {
    // arrange
    const signupInfo = genSignupInfo()
    await authRepo.createAccountUser(signupInfo)
    const newPwHash = 'abcdefg'

    // act
    const { uid, region, email, pwHash } = _.pick(signupInfo, ['uid', 'region', 'email'])
    await authRepo.resetPassword({ uid, region }, newPwHash, pwHash)
    const user = await userRepo.getAuthorizedUser(email, newPwHash, CHECK_FIELDS)

    // assert
    assertUserProperties(user, signupInfo)
  })

  it('getUser', async () => {
    // arrange
    const { uid, region } = _.pick(signupInfoA, ['uid', 'region'])

    // act
    const user = await userRepo.getUser({ uid, region }, CHECK_FIELDS)

    // assert
    assertUserProperties(user, signupInfoA)
  })

  it('getPairUsers', async () => {
    // arrange
    const signupInfoB = genSignupInfo()
    const userB = await authRepo.createAccountUser(signupInfoB)

    // act
    const account = { uid: userA.uid, region: userA.region }
    const targetAccount = { uid: userB.uid, region: userB.region }
    let users = await userRepo.getPairUsers(account, targetAccount, CHECK_FIELDS)

    // assert
    const order = {
      [account.uid]: 0,
      [targetAccount.uid]: 1
    }

    users = users
      .reduce((obj, row) => {
        obj.push({
          idx: [order[row.uid]],
          row
        })
        return obj
      }, [])
      .sort((a, b) => a.idx - b.idx)
      .map(item => item.row)

    const queryUserA = users[0]
    const queryUserB = users[1]
    assertUserProperties(queryUserA, signupInfoA)
    assertUserProperties(queryUserB, signupInfoB)
  })

  it('update user', async () => {
    // TODO: birth 的寫入格式有問題，目前 UPDATE_USER_FIELDS 沒有 birth 欄位的更新
    // arrange
    const newUserInfo = _.pick(genSignupInfo(), UPDATE_USER_FIELDS)
    const newPublicInfo = newUserInfo.publicInfo

    // act
    const updatedUser = await userRepo.updateUser({ uid: userA.uid, region: userA.region }, newUserInfo)

    // arrange
    expect(updatedUser.uid).to.equals(userA.uid)
    expect(updatedUser.region).to.equals(userA.region)
    expect(updatedUser.be_searched).to.equals(newUserInfo.beSearched)
    expect(updatedUser.given_name).to.equals(newUserInfo.givenName)
    expect(updatedUser.family_name).to.equals(newUserInfo.familyName)
    expect(updatedUser.gender).to.equals(newUserInfo.gender)
    // birth 的寫入格式有問題
    expect(updatedUser.birth).to.equals(newUserInfo.birth)
    expect(updatedUser.lang).to.equals(newUserInfo.lang)
    expect(updatedUser.public_info.profileLink).to.equals(newPublicInfo.profileLink)
    expect(updatedUser.public_info.profilePic).to.equals(newPublicInfo.profilePic)
  })

  it('update contact', async () => {
    // arrange
    const newContectInfo = _.pick(genSignupInfo(), UPDATE_CONTACT_FIELDS)

    // act
    const updatedUser = await authRepo.updateContact({ uid: userA.uid, region: userA.region }, newContectInfo)

    // assert
    expect(updatedUser.uid).to.equals(userA.uid)
    expect(updatedUser.region).to.equals(userA.region)
    expect(updatedUser.alternate_email).to.equals(newContectInfo.alternateEmail)
    expect(updatedUser.country_code).to.equals(newContectInfo.countryCode)
    expect(updatedUser.phone).to.equals(newContectInfo.phone)
    expect(updatedUser.device).to.equals(newContectInfo.device)
  })

  after(async () => {
    await repo.query('DELETE FROM "LocalAccounts";', [])
    await repo.query('DELETE FROM "Users";', [])
    await repo.query('DELETE FROM "Accounts";', [])
  })
})
