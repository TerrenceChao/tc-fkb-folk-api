var frontendHost = process.env.FRONTEND_HOST
var pathRecoverByCode = process.env.FRONTEND_PATH_RECOVER_BY_CODE
var pathRecoverByPassword = process.env.FRONTEND_PATH_RECOVER_BY_PASSWORD

/**
 * lang: 'zh-tw' 在 sendVerification 時,
 * notificationService(透過 redis 發送) 用中文的 template 會變成亂碼:
 * path: src/application/notification/content/sms/template.js
 */
function getContentInZhTw(content) {
  var c = content
  return `親愛的 ${c.familyName} ${c.givenName} ${c.gender === 'male'?'先生':'女士'} 您好\n
    我們已收到你的 Facebook 密碼重設要求。
    輸入以下密碼重設確認碼：

      ${c.code} (url-link:${frontendHost}${pathRecoverByCode}?token=${c.token})


    你也可以改為直接變更密碼。

      url-link:${frontendHost}${pathRecoverByPassword}?token=${c.token}&reset=${c.reset}


    你並沒有要求更改密碼？
    如果你並未要求新密碼， url-link:請通知我們。`
}

function getContentInEn(content) {
  var c = content
  return `Dear ${c.gender === 'male'?'Mr.':'Miss./Mrs.'} ${c.givenName} ${c.familyName}\n
    We have received your password-change requirement.
    Please enter the following verify code to change:

      ${c.code} (url-link:${frontendHost}${pathRecoverByCode}?token=${c.token})


    you can change password directly instead of above.

      url-link:${frontendHost}${pathRecoverByPassword}?token=${c.token}&reset=${c.reset}


    Have you never requested for password-change?
    If you have not requested a new password, url-link: please let us know.`
}

/**
 * 寄送驗證信
 */
exports.getVerifyContent = function (content, lang) {
  var verifyContent = {
    'zh-tw': getContentInZhTw,
    'en': getContentInEn
  }

  return verifyContent[lang](content)
}