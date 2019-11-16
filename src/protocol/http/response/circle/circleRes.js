const { mapKeysInCamelCase } = require('../../../../property/util')

function findFriendListSuccess (friendList, req, res, next) {
  res.locals.data = friendList.map(friend => mapKeysInCamelCase(friend))
  res.locals.meta = {
    msgCode: '100000'
  }

  res.locals.meta.msg = res.locals.data.length === 0 ? 'you dont have friend yet' : arguments.callee.name
  next()
}

function findFriendSuccess (friend, req, res, next) {
  res.locals.data = mapKeysInCamelCase(friend)
  res.locals.meta = {
    msgCode: '100000'
  }

  res.locals.meta.msg = res.locals.data == null ? 'friend not found' : arguments.callee.name
  next()
}

module.exports = {
  findFriendListSuccess,
  findFriendSuccess
}
