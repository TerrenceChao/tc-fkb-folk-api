/**
 * lang: 'zh-tw' 在 sendVerification 時,
 * notificationService(透過 redis 發送) 用中文的 template 會變成亂碼:
 * path: src/application/notification/content/sms/template.js
 */
function getContentInZhTw(content) {
  var c = content
  return `親愛的 ${c.familyName} ${c.givenName} ${c.gender === 'male'?'先生':'女士'} 您好\n
    我們已收到你的 Fakebook 密碼重設要求。
    輸入以下密碼重設確認碼：
    ${c.code}`
}

function getContentInEn(content) {
  var c = content
  return `Dear ${c.gender === 'male'?'Mr.':'Miss./Mrs.'} ${c.givenName} ${c.familyName}\n
    We have received your password reset requirement.
    Please enter the following verify code to reset:
    ${c.code}`
}

/**
 * 寄送驗證簡訊
 */
exports.getVerifyContent = function (content, lang) {
  var verifyContent = {
    'zh-tw': getContentInZhTw,
    'en': getContentInEn
  }

  return verifyContent[lang](content)
}