const { expect } = require('chai')
const {
  encrypt,
  decrypt,
  genUniqueToken,
  parseUniqueToken
} = require('../../../../../src/domain/folk/user/_properties/util')

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
  const email = 'b-256@abc.com'
  const userData = { region: 'tw', email }

  it('test encrypt/decrypt', () => {
    // arrange
    const secret = genSecret(email)
    var tokenData = encrypt(JSON.stringify(userData), secret, CIPHER_ALGO)

    // action
    var token = `${tokenData.iv}.${tokenData.encrypted}`
    var result = decrypt(token, secret, CIPHER_ALGO)

    // assert
    const actual = JSON.parse(result)
    expect(actual).to.have.all.keys('region', 'email')
    expect(actual.region).to.equals(userData.region)
    expect(actual.email).to.equals(userData.email)
  })

  it('test gen/parse unique token', () => {
    // arrange
    var token = genUniqueToken(userData, CIPHER_ALGO)

    // action
    var result = parseUniqueToken(token, userData.email, CIPHER_ALGO)

    // assert
    const actual = JSON.parse(result)
    expect(actual).to.have.all.keys('region', 'email')
    expect(actual.region).to.equals(userData.region)
    expect(actual.email).to.equals(userData.email)
  })
})
