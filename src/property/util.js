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
 * TODO: 尚未實現。產生出的 token 能找出 uid, region 資訊。
 * @param {Object} userInfo
 * @param {number|null} reset
 * @param {boolean} unique 是否建立唯一性的 token [註冊時適用，因存放在{cache}須具唯一性]
 */
function genVerification (userInfo, reset = null, unique = false) {
  return {
    region: userInfo.region,
    uid: userInfo.uid || uuidv4(),
    /**
     * token 隱含的資訊，已經能讓後端服務知道 token 要去哪一個區域(region)
     *  (Tokyo, Taipei, Sydney ...) 找尋用戶資料了
     *
     * [NOTE] 以'verify-token'命名是因為你不知道從這個 function 丟出去的結果會走向哪裡，
     * 他很有可能和 session/auth 相關的 token 搞混。因此強制性的命名。
     */
    'verify-token': 'laierhgslierghULIHAsadaeri',
    // token: partialUserData.verificaiton.token,
    code: '123456', // TODO: type: string
    /**
     * for reset password directly (with expiration expiration time: 10 mins)
     */
    reset // TODO: type: number
  }
}

module.exports = {
  init,
  hasKeys,
  cloneAndAssign,
  cloneAndAssignIn,
  delay,
  genVerification
}
