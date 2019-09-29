const _ = require('lodash')

/**
 * @param {Object} obj
 * @param {*} defultValue
 */
function customizedDefault(obj, defultValue = {}) {
  return obj === undefined ? obj = defultValue : obj
}

/**
 * @param {Object} obj
 * @param {array} requiredKeys
 */
function hasKeys(obj, requiredKeys) {
  return _.every(requiredKeys, _.partial(_.has, obj))
}

/**
 * @param {Object} obj
 * @param {Object} extraData
 */
function cloneAndAssign(obj, extraData) {
  return _.assign(Object.create(obj), extraData)
}

/**
 * @param {Object} obj
 * @param {Object} extraData
 */
function cloneAndAssignIn(obj, extraData) {
  return _.assignIn(Object.create(obj), extraData)
}

/**
 * @param {int} time 
 * @param {Object|null} timeoutObj 
 */
function delay(time, timeoutObj = null) {
  return new Promise(resolve => {
    setTimeout(() => resolve(timeoutObj), time)
  })
}

module.exports = {
  customizedDefault,
  hasKeys,
  cloneAndAssign,
  cloneAndAssignIn,
  delay,
}