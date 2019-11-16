const _ = require('lodash')
const Validator = require('validatorjs')
const C = require('../../../../property/userConstant')
const validateErr = require('../../../../property/util').validateErr

/**
 * TODO:
 * 註冊的檢查欄位中，「region」很重要！
 * 未來如果真的實現異地部署，這裡的檢查欄位可能更多
 */
exports.registerInfoValidator = (req, res, next) => {
  Array.apply(null, ['region'].forEach(field => {
    if (req.headers[field] === undefined &&
      req.params[field] === undefined &&
      req.query[field] === undefined &&
      req.body[field] === undefined) {
      var err = new Error(`account identify is lacked with: ${field}`)
      err.status = 422
      return next(err)
    }
  }))
  next()
}

exports.loginValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(req.body, {
    email: 'required|email',
    password: 'required|string'
  })
  validation.passes() ? next() : res.status(422).json(validateErr(validation, 'loginValidator'))
}

exports.passwordValidator = (req, res, next) => {
  if (req.body.password === undefined) {
    const err = new Error('password is required')
    err.status = 422
    return next(err)
  }

  next()
}

/**
 * confirm both new password repeated twice are matched
 */
exports.newPasswordValidator = (req, res, next) => {
  const newPassword = req.body.newpass
  const confirmedNewPassword = req.body.confirmnewpass
  if (newPassword === undefined) {
    const err = new Error('new password is required')
    err.status = 422
    return next(err)
  }

  if (newPassword !== confirmedNewPassword) {
    const err = new Error('new passwords are not matched')
    err.status = 422
    return next(err)
  }
  next()
}

const ACCOUNT_RULES = {}
C.ACCOUT_IDENTITY.forEach(field => {
  ACCOUNT_RULES[field] = 'required|string'
})

exports.accountValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(req.params, ACCOUNT_RULES)
  if (validation.fails()) {
    return res.status(422).json(validateErr(validation, 'accountValidator'))
  }

  if (req.headers.token === undefined) {
    const err = new Error('auth-token is required')
    err.status = 422
    return next(err)
  }

  next()
}

const VISITOR_ACCOUNT_RULES = {}
C.ACCOUT_IDENTITY.forEach(field => {
  const visitorField = _.camelCase('visitor_'.concat(field))
  VISITOR_ACCOUNT_RULES[visitorField] = 'required|string'
})

exports.visitorAccountValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(req.query, VISITOR_ACCOUNT_RULES)
  validation.passes() ? next() : res.status(422).json(validateErr(validation, 'visitorAccountValidator'))
}

/**
 * including email OR phone format check
 */
exports.searchContactValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(req.query, {
    type: 'required|string',
    email: 'required_if:type,email|email',
    countryCode: 'required_if:type,phone|string',
    phone: 'required_if:type,phone|string'
  })
  validation.passes() ? next() : res.status(422).json(validateErr(validation, 'searchContactValidator'))
}

/**
 * including email OR phone format check
 */
exports.verifyAccountValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(req.body, {
    type: 'required|string',
    'account.email': 'required_if:type,email|email',
    'account.countryCode': 'required_if:type,phone|string',
    'account.phone': 'required_if:type,phone|string'
  })
  validation.passes() ? next() : res.status(422).json(validateErr(validation, 'verifyAccountValidator'))
}

exports.verificationValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(_.assign(req.params, req.body), {
    token: 'required|string',
    code: 'required_without:expire|string',
    expire: 'required_without:code|string'
  })
  validation.passes() ? next() : res.status(422).json(validateErr(validation, 'verificationValidator'))
}

const UPDATE_USER_INFO_RULES = {}
C.USER_PRIVATE_INFO.forEach(field => {
  if (field === 'beSearched') {
    UPDATE_USER_INFO_RULES[field] = 'boolean'
  } else if (!C.ACCOUT_IDENTITY.includes(field) && field !== 'publicInfo') {
    UPDATE_USER_INFO_RULES[field] = 'string'
  }
})

exports.updateUserInfoValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(req.body, UPDATE_USER_INFO_RULES)
  validation.passes() ? next() : res.status(422).json(validateErr(validation, 'updateUserInfoValidator'))
}

const UPDATE_CONTACT_RULES = {}
C.USER_UPDATE_CONTACT.forEach(field => {
  UPDATE_CONTACT_RULES[field] = 'string'
})

exports.updateContactValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(req.body, UPDATE_CONTACT_RULES)
  validation.passes() ? next() : res.status(422).json(validateErr(validation, 'updateContactValidator'))
}
