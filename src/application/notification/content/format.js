function notityEmailFormat(verifyInfo) {
  var content = verifyInfo.content
  Array.apply(null, ['token', 'code', 'reset', 'verifyLink', 'resetLink']).forEach(field => {
    content[field] = verifyInfo[field]
  })

  return {
    channel: verifyInfo.type,
    to: verifyInfo.account,
    content,
  }
}

function notitySMSFormat(verifyInfo) {
  var content = verifyInfo.content
  Array.apply(null, ['token', 'code']).forEach(field => {
    content[field] = verifyInfo[field]
  })

  return {
    channel: verifyInfo.type,
    to: verifyInfo.account,
    content
  }
}

exports.byVerifyInfo = function (verifyInfo) {
  var transformation = {
    email: notityEmailFormat,
    phone: notitySMSFormat
  }

  return transformation[verifyInfo.type](verifyInfo)
}