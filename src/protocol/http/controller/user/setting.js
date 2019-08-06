exports.getUserInfo = async (req, res, next) => {
  // settingService
  res.json({
    status: `the info with regular formats about user:${req.params.uid}`
  })
}

exports.updateUserInfo = async (req, res, next) => {
  // settingService
  res.json({
    status: `user:${req.params.uid} updates his/her info`
  })
}