function genVerifyEmailFormat (verifyInfo) {
  var content = verifyInfo.content
  Array(['reset', 'code', 'verify-token']).forEach(field => {
    content[field] = verifyInfo[field]
  })

  return {
    channel: verifyInfo.type,
    to: verifyInfo.account,
    content
  }
}

function genVerifySMSFormat (verifyInfo) {
  var content = verifyInfo.content
  Array(['code', 'verify-token']).forEach(field => {
    content[field] = verifyInfo[field]
  })

  return {
    channel: verifyInfo.type,
    to: verifyInfo.account,
    content
  }
}

function genVerifyFormat (verifyInfo) {
  var transformation = {
    email: genVerifyEmailFormat,
    phone: genVerifySMSFormat
  }

  return transformation[verifyInfo.type](verifyInfo)
}

module.exports = {
  genVerifyFormat
}
