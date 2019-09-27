// invitation arrow
exports.INVITE_ARROW_SENT = 'sent'

exports.INVITE_ARROW_RECEIVED = 'received'


// invitation events
// 朋友邀請
exports.INVITE_EVENT_FRIEND_INVITE = 'invite_event_friend_invite'

exports.INVITE_EVENT_FRIEND_REPLY = 'invite_event_friend_reply'

// 社團邀請
exports.INVITE_EVENT_SOCIETY_INVITE = 'invite_event_society_invite'

exports.INVITE_EVENT_SOCIETY_REPLY = 'invite_event_society_reply'

// friend events
exports.FRIEND_EVENT_ADD_FRIEND = 'friend_event_add_friend'

exports.FRIEND_EVENT_REMOVE_FRIEND = 'friend_event_remove_friend'

// friend
exports.FRIEND_BATCH_LIMIT = process.env.FRIEND_BATCH_LIMIT || 500



// relation status
exports.RELATION_STATUS_SELF = 1

exports.RELATION_STATUS_FRIEND = 2

exports.RELATION_STATUS_BE_INVITED = 3 // 已收到邀請未回覆

exports.RELATION_STATUS_INVITED = 4 // 已發送邀請

exports.RELATION_STATUS_STRANGER = 5