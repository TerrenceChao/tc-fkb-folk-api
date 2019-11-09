const _ = require('lodash')
const Validator = require('validatorjs')
const CIRCLE_CONST = require('../../../../property/circleConstant')
const { ACCOUT_IDENTITY } = require('../../../../property/userConstant')
const { INVITE_EVENT_FRIEND_REPLY } = require('../../../../domain/circle/_properties/constant')
const validateErr = require('../../../../property/util').validateErr

const TARGET_ACCOUNT_RULES = {}
ACCOUT_IDENTITY.forEach(field => {
  const targetField = _.camelCase('target_'.concat(field))
  TARGET_ACCOUNT_RULES[targetField] = `required|string|different:${field}`
})

exports.targetAccountValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(_.assign(req.params, req.query), TARGET_ACCOUNT_RULES)
  validation.passes() ? next() : res.status(422).json(validateErr(validation, 'targetAccountValidator'))
}

/**
 * VALIDATE_INVITE_FIELDS includes ACCOUT_IDENTITY
 */
const FRIEND_INVITER_RULES = {}
CIRCLE_CONST.VALIDATE_INVITE_FIELDS.forEach(field => {
  FRIEND_INVITER_RULES[`inviter.${field}`] = 'string' // 'required|string'
  FRIEND_INVITER_RULES[`recipient.${field}`] = 'string' // 'required|string'
})

exports.friendInviterValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(req.body, FRIEND_INVITER_RULES)
  validation.passes() ? next() : res.status(422).json(validateErr(validation, 'friendInviterValidator'))
}

const FRIEND_RECIPIENT_RULES = {
  'header.inviteEvent': `required|string|in:${INVITE_EVENT_FRIEND_REPLY}`,
  'header.iid': 'required|string',
  'header.data.options': 'required|array',
  'header.data.options.*': 'required|boolean',
  'header.data.reply': 'required|boolean'
}
/**
 * VALIDATE_INVITE_FIELDS includes ACCOUT_IDENTITY
 */
CIRCLE_CONST.VALIDATE_INVITE_FIELDS.forEach(field => {
  FRIEND_RECIPIENT_RULES[`inviter.${field}`] = 'string' // 'required|string'
  FRIEND_RECIPIENT_RULES[`recipient.${field}`] = 'string' // 'required|string'
})

exports.friendRecipientValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(req.body, FRIEND_RECIPIENT_RULES)
  validation.passes() ? next() : res.status(422).json(validateErr(validation, 'friendRecipientValidator'))
}

exports.invitationQueryValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(req.query, {
    iid: 'string',
    event: 'string'
  })
  validation.passes() ? next() : res.status(422).json(validateErr(validation, 'invitationQueryValidator'))
}

exports.queryListValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(req.query, {
    limit: 'required|numeric',
    skip: 'required|numeric'
  })
  validation.passes() ? next() : res.status(422).json(validateErr(validation, 'queryListValidator'))
}
