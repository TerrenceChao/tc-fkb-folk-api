/**
 * Assume user has a long long story/history ...
 * batch load.
 * 
 * Relation status including strangers / friends / yourself profile
 * 1. show state:'invite/invited' if he/she is a stranger. 
 *    (state:'invite' means you haven't sent invitation yet)
 * 2. show state:'unfriend' if he/she is your friend.
 * 3. hide state for yourself.
 */

/**
 * 1. friend,
 * 2. invitation has sent,
 * 3. invite,
 * 4. nothing for yourself.
 */
exports.getRelationStatus = async (req, res, next) => {
  var owner = req.params.profile_id,
  var visitor = req.query.uid
  res.locals.data = {
    owner,
    visitor
  }
  next()
}