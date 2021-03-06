function genVerifyEmailFormat (verifyInfo) {
  const content = verifyInfo.content
  Array.apply(null, ['expire', 'code', 'verify-token'].forEach(field => {
    content[field] = verifyInfo[field]
  }))

  return {
    channel: verifyInfo.type,
    to: verifyInfo.account,
    content
  }
}

function genVerifySMSFormat (verifyInfo) {
  const content = verifyInfo.content
  Array.apply(null, ['code', 'verify-token'].forEach(field => {
    content[field] = verifyInfo[field]
  }))

  return {
    channel: verifyInfo.type,
    to: verifyInfo.account,
    content
  }
}

function genVerifyFormat (verifyInfo) {
  const transformation = {
    email: genVerifyEmailFormat,
    phone: genVerifySMSFormat
  }

  return transformation[verifyInfo.type](verifyInfo)
}

module.exports = {
  genVerifyFormat
}
