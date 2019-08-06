/**
 * get friend record list
 */
exports.list = async (req, res, next) => {
  res.json({
    status: `user:${JSON.stringify(req.params, null, 2)} get his/her friend list`
  })
}

/**
 * remove a friend:
 * 1. remove friend record
 * 2. notify(web, app): 
 *    a. DO NOT pop-up!
 *    b. update someone's profile state (invite)
 */
exports.remove = async (req, res, next) => {
  res.json({
    status: `user:${req.params.uid} remove a friend: ${req.params.fid}`
  })
}
