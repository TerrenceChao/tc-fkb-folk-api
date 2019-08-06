exports.byVerification = function (req, verification) {
  verification.verifyLink = `${req.protocol}://${req.get('host')}/verification/code/${verification.token}`
  verification.resetLink = `${req.protocol}://${req.get('host')}/verification/password/${verification.token}`
  // 這裡不需要把 token 刪除. 在透過 notification service 寄送時需要 token 資訊！
  // delete verification.token (don't do this)

  return verification
}