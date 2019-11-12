const _ = require('lodash')
const uuidv4 = require('uuid/v4')

/**
 * @param {Object} obj
 * @param {*} defultValue
 */
function init (obj, defultValue = {}) {
  return obj === undefined ? (obj = defultValue) : obj
}

/**
 * @param {Object} obj
 * @param {array} requiredKeys
 */
function hasKeys (obj, requiredKeys) {
  return _.every(requiredKeys, _.partial(_.has, obj))
}

/**
 * @param {Object} obj
 * @param {Object} extraData
 */
function cloneAndAssign (obj, extraData) {
  return _.assign(Object.create(obj), extraData)
}

/**
 * @param {Object} obj
 * @param {Object} extraData
 */
function cloneAndAssignIn (obj, extraData) {
  return _.assignIn(Object.create(obj), extraData)
}

/**
 * @param {number} time
 * @param {Object|null} timeoutObj
 */
function delay (time, timeoutObj = null) {
  return new Promise(resolve => {
    setTimeout(() => resolve(timeoutObj), time)
  })
}

/**
 * @param {{uid: string, region: string}} accountA
 * @param {{uid: string, region: string}} accountB
 */
function sameAccounts (accountA, accountB) {
  return accountA.uid === accountB.uid &&
    accountA.region === accountB.region
}

/**
 *
 * @param {Object[]} sourceList
 * @param {Object[]} targetList
 * @param {string} key matched key
 */
function sameValues (sourceList, targetList, key) {
  // if (sourceList.length !== targetList.length) {
  //   return false
  // }

  const sourceMapping = {}
  sourceList.forEach(source => { sourceMapping[source[key]] = source })
  for (let i = targetList.length - 1; i >= 0; i--) {
    const target = targetList[i]
    if (sourceMapping[target[key]] === undefined) {
      return false
    }
  }

  return true
}

/**
 * @param {Object} data
 */
function mapKeysInCamelCase (data) {
  return _.mapKeys(data, (value, key) => _.camelCase(key))
}

function validateErr (validation, validator, msgCode) {
  const error = {
    data: null,
    meta: {
      msgCode: msgCode || '900001',
      msg: `Validation Error: ${validator}`,
      error: JSON.stringify(validation.errors.all())
    }
  }

  // console.error('\nvalidate error:', validation.errors.all(), '\n')

  return error
}

module.exports = {
  init,
  hasKeys,
  cloneAndAssign,
  cloneAndAssignIn,
  delay,
  sameAccounts,
  sameValues,
  mapKeysInCamelCase,
  validateErr
}
