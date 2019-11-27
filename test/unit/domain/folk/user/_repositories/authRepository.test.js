const { expect } = require('chai')
const faker = require('faker')
const path = require('path')
const config = require('config')
const Repository = require(path.join(config.src.library, 'Repository'))
const { AuthRepository } = require(path.join(config.src.repository.user, 'authRepository'))
const { genToken, genSignupInfo } = require(path.join(config.test.common, 'mock'))

const pool = config.database.pool

describe('repository: Auths', () => {
  const repo = new Repository(pool)
  const authRepo = new AuthRepository(pool)

  it('create acount/auth/user', async () => {
    // arrange
    const signupInfo = genSignupInfo()
    const publicInfo = signupInfo.publicInfo

    // act
    const newAccount = await authRepo.createAccountUser(signupInfo)

    // assert
    expect(newAccount).to.have.all.keys('id', 'uid', 'region', 'email', 'pw_hash', 'pw_salt', 'seq', 'be_searched', 'given_name', 'family_name', 'lang', 'public_info')
    // fields of "Accounts" and "Auth"
    expect(newAccount.uid).to.equals(signupInfo.uid)
    expect(newAccount.region).to.equals(signupInfo.region)
    expect(newAccount.email).to.equals(signupInfo.email)
    expect(newAccount.pw_hash).to.equals(signupInfo.pwHash)
    expect(newAccount.pw_salt).to.equals(signupInfo.pwSalt)
    // fields of "Users"
    expect(newAccount.be_searched).to.equals(true)
    expect(newAccount.given_name).to.equals(signupInfo.givenName)
    expect(newAccount.family_name).to.equals(signupInfo.familyName)
    expect(newAccount.lang).to.equals(signupInfo.lang)
    expect(newAccount.public_info.profileLink).to.equals(publicInfo.profileLink)
    expect(newAccount.public_info.profilePic).to.equals(publicInfo.profilePic)
  })

  it('create and search acount/auth', async () => {
    // arrange
    const signupInfo = genSignupInfo()
    const email = signupInfo.email
    const selectedFields = ['uid', 'email', 'countryCode', 'phone', 'beSearched', 'givenName', 'familyName', 'lang', 'publicInfo']

    // act
    await authRepo.createAccountUser(signupInfo)
    const account = await authRepo.getAccountUserByContact('email', { email }, selectedFields)

    // assert
    expect(account).to.have.all.keys(['uid', 'email', 'country_code', 'phone', 'be_searched', 'given_name', 'family_name', 'lang', 'public_info'])
    expect(account.uid).to.equals(signupInfo.uid)
    expect(account.email).to.equals(signupInfo.email)
    expect(account.country_code).to.equals(signupInfo.countryCode)
    expect(account.phone).to.equals(signupInfo.phone)
    expect(account.be_searched).to.equals(true)
    expect(account.given_name).to.equals(signupInfo.givenName)
    expect(account.family_name).to.equals(signupInfo.familyName)
    expect(account.lang).to.equals(signupInfo.lang)
    expect(account.public_info).to.deep.equals(signupInfo.publicInfo)
  })

  it('create verification by email', async () => {
    // arrange
    const signupInfo = genSignupInfo()
    const email = signupInfo.email
    const now = Date.now()
    const verification = {
      token: genToken(),
      code: faker.random.alphaNumeric(6),
      expire: now + 50000
    }

    const newVerification = {
      token: genToken(),
      code: faker.random.alphaNumeric(6),
      expire: now << 1
    }

    // act
    await authRepo.createAccountUser(signupInfo)
    const verifyInfo = await authRepo.findOrCreateVerification('email', { email }, verification)
    const newVerifyInfo = await authRepo.findOrCreateVerification('email', { email }, newVerification)

    // arrange
    // 1st verifyInfo
    expect(verifyInfo.uid).to.equals(signupInfo.uid)
    expect(verifyInfo.region).to.equals(signupInfo.region)
    expect(verifyInfo.email).to.equals(email)
    expect(verifyInfo.token).to.equals(verification.token)
    expect(verifyInfo.code).to.equals(verification.code)
    expect(parseInt(verifyInfo.expire)).to.equals(verification.expire)
    // 2nd verifyInfo
    expect(newVerifyInfo.token).to.equals(verification.token)
    expect(newVerifyInfo.code).to.equals(verification.code)
    expect(parseInt(newVerifyInfo.expire)).to.equals(verification.expire)
  })

  it('create verification by phone', async () => {
    // arrange
    const signupInfo = genSignupInfo()
    const countryCode = signupInfo.countryCode
    const phone = signupInfo.phone
    const now = Date.now()
    const verification = {
      token: genToken(),
      code: faker.random.alphaNumeric(6),
      expire: now + 50000
    }

    const newVerification = {
      token: faker.random.word(),
      code: faker.random.alphaNumeric(6),
      expire: now << 1
    }

    // act
    await authRepo.createAccountUser(signupInfo)
    const verifyInfo = await authRepo.findOrCreateVerification('phone', { countryCode, phone }, verification)
    const newVerifyInfo = await authRepo.findOrCreateVerification('phone', { countryCode, phone }, newVerification)

    // arrange
    // 1st verifyInfo
    expect(verifyInfo.uid).to.equals(signupInfo.uid)
    expect(verifyInfo.region).to.equals(signupInfo.region)
    expect(verifyInfo.country_code).to.equals(countryCode)
    expect(verifyInfo.phone).to.equals(phone)
    expect(verifyInfo.token).to.equals(verification.token)
    expect(verifyInfo.code).to.equals(verification.code)
    expect(parseInt(verifyInfo.expire)).to.equals(verification.expire)
    // 2nd verifyInfo
    expect(newVerifyInfo.token).to.equals(verification.token)
    expect(newVerifyInfo.code).to.equals(verification.code)
    expect(parseInt(newVerifyInfo.expire)).to.equals(verification.expire)
  })

  it('get verification by token/code', async () => {
    // arrange
    const signupInfo = genSignupInfo()
    const email = signupInfo.email
    const now = Date.now()
    const verification = {
      token: genToken(),
      code: faker.random.alphaNumeric(6).toString(),
      expire: now
    }

    // act
    await authRepo.createAccountUser(signupInfo)
    await authRepo.findOrCreateVerification('email', { email }, verification, now)
    const verifyUser = await authRepo.getVerifyUserByCode(verification.token, verification.code)

    // arrange
    expect(verifyUser.uid).to.equals(signupInfo.uid)
    expect(verifyUser.region).to.equals(signupInfo.region)
    expect(verifyUser.token).to.equals(verification.token)
    expect(verifyUser.code).to.equals(verification.code)
  })

  it('get verification by token/expire', async () => {
    // arrange
    const signupInfo = genSignupInfo()
    const email = signupInfo.email
    const now = Date.now()
    const verification = {
      token: genToken(),
      code: faker.random.alphaNumeric(6).toString(),
      expire: now
    }

    // act
    await authRepo.createAccountUser(signupInfo)
    await authRepo.findOrCreateVerification('email', { email }, verification, now)
    const verifyUser = await authRepo.getVerifyUserByExpire(verification.token, verification.expire)

    // arrange
    expect(verifyUser.uid).to.equals(signupInfo.uid)
    expect(verifyUser.region).to.equals(signupInfo.region)
    expect(verifyUser.token).to.equals(verification.token)
    expect(parseInt(verifyUser.expire)).to.equals(verification.expire)
  })

  it('delete verification', async () => {
    // arrange
    const signupInfo = genSignupInfo()
    const uid = signupInfo.uid
    const region = signupInfo.region
    const email = signupInfo.email

    const now = Date.now()
    const verification = {
      token: genToken(),
      code: faker.random.alphaNumeric(6).toString(),
      expire: now
    }

    // act
    await authRepo.createAccountUser(signupInfo)
    await authRepo.findOrCreateVerification('email', { email }, verification, now)
    const verifyUser = await authRepo.deleteVerification({ uid, region }, ['email', 'countryCode', 'phone'])

    // arrange
    expect(verifyUser.uid).to.equals(signupInfo.uid)
    expect(verifyUser.region).to.equals(signupInfo.region)
    expect(verifyUser.email).to.equals(signupInfo.email)
    expect(verifyUser.country_code).to.equals(signupInfo.countryCode)
    expect(verifyUser.phone).to.equals(signupInfo.phone)
    expect(verifyUser.token).to.equals(null)
    expect(verifyUser.code).to.equals(null)
    expect(verifyUser.expire).to.equals(null)
  })

  after(async () => {
    await repo.query('DELETE FROM "Users";', [])
    await repo.query('DELETE FROM "Auths";', [])
    await repo.query('DELETE FROM "Accounts";', [])
  })
})
