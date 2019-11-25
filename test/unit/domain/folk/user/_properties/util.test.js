const { expect } = require('chai')
const {
  encrypt,
  decrypt,
  genUniqueToken,
  parseUniqueToken
} = require('../../../../../../src/domain/folk/user/_properties/util')

const CIPHER_ALGO = 'aes-256-cbc'

/**
 * @param {string} str
 */
function genSecret (str) {
  let secret = str
  while (Buffer.from(secret).length < 32) {
    secret = `${secret};`.concat(secret)
  }

  return secret
}

describe('test util', () => {
  const region = 'tw'
  const email = 'b-256@abc.com'
  const now = Date.now()
  const userData = { region, email, now }

  const code = '123456'

  it('test encrypt/decrypt', () => {
    // arrange
    const secret = genSecret(email)
    var tokenData = encrypt(JSON.stringify(userData), secret, CIPHER_ALGO)

    // action
    var token = `${tokenData.iv}.${tokenData.encrypted}`
    var result = decrypt(token, secret, CIPHER_ALGO)

    // assert
    const actual = JSON.parse(result)
    expect(actual).to.have.all.keys('region', 'email', 'now')
    expect(actual.region).to.equals(userData.region)
    expect(actual.email).to.equals(userData.email)
    expect(actual.now).to.equals(userData.now)
  })

  it('test gen/parse unique token (註冊時用。token 本身不受時間影響，須具備永久唯一性)', () => {
    // arrange
    userData.now = undefined
    var token = genUniqueToken(userData, userData.email, CIPHER_ALGO) // secret use email

    // action
    var result = parseUniqueToken(token, userData.email, CIPHER_ALGO) // secret use email

    // assert
    const actual = JSON.parse(result)
    expect(actual).to.have.all.keys('region', 'email')
    expect(actual.region).to.equals(userData.region)
    expect(actual.email).to.equals(userData.email)
    expect(actual.now).to.equals(undefined)
  })

  it('test gen/parse unique token (會員時用。token 本身受時間影響，情境如：忘記密碼...etc)', () => {
    // arrange
    userData.now = Date.now()
    var token = genUniqueToken(userData, code, CIPHER_ALGO) // secret use code

    // action
    var result = parseUniqueToken(token, code, CIPHER_ALGO) // secret use code

    // assert
    const actual = JSON.parse(result)
    expect(actual).to.have.all.keys('region', 'email', 'now')
    expect(actual.region).to.equals(userData.region)
    expect(actual.email).to.equals(userData.email)
    expect(actual.now).to.equals(userData.now)
  })
})
