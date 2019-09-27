'use strict'

require('dotenv').config()
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')

var indexRouter = require('./src/route/_index')
var userRouter = require('./src/route/region/user')
var circleRouter = require('./src/route/region/circle')
var feedsRouter = require('./src/route/region/feeds')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({
  extended: false
}))
app.use(cookieParser())

const ALLOW_REGION = process.env.ACCESS_CONTROL_ALLOW_ORIGIN
const ALLOW_METHODS = process.env.ACCESS_CONTROL_ALLOW_METHODS
const ALLOW_HEADERS = process.env.ACCESS_CONTROL_ALLOW_HEADERS

app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', ALLOW_REGION)

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', ALLOW_METHODS)

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', ALLOW_HEADERS)

  /**
   * Set to true if you need the website to include cookies in the requests sent
   * to the API (e.g. in case you use sessions)
   */
  res.setHeader('Access-Control-Allow-Credentials', true)

  next()
})

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

var prefix = '/folk-service/api/v1'
app.use(`${prefix}/user`, userRouter)
app.use(`${prefix}/circle`, circleRouter)
app.use(`${prefix}/feeds`, feedsRouter)

// TODO: for temporary (實驗，模擬情境用, 之後會移除)
app.use(`${prefix}/simulate`, require('./src/route/__simulation'))


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app