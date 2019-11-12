const Validator = require('validatorjs')
const validateErr = require('../../../property/util').validateErr

exports.queryListValidator = (req, res, next) => {
  res.locals.data = {}
  const validation = new Validator(req.query, {
    limit: 'required|numeric',
    skip: 'required|numeric'
  })
  validation.passes() ? next() : res.status(422).json(validateErr(validation, 'queryListValidator'))
}
