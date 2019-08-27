function findFriendListSuccess (friendList, req, res, next) {
  res.locals['data'] = friendList
  res.locals.meta = {
    code: '100000'
  }

  res.locals.meta.msg = res.locals['data'].length === 0 ? 'you dont have friend yet' : arguments.callee.name
  next()
}

function findFriendSuccess (friend, req, res, next) {
  res.locals['data'] = friend
  res.locals.meta = {
    code: '100000'
  }

  res.locals.meta.msg = res.locals['data'] === undefined ? 'friend not found' : arguments.callee.name
  next()
}

module.exports = {
  findFriendListSuccess,
  findFriendSuccess,
}