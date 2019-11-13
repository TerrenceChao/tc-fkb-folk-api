const pg = require('pg')
const env = process.env.NODE_ENV || 'development'
const config = require('../infrastructure/database/sql/config/config.json')[env]

// 資料庫配置
const setups = {
  user: config.username,
  password: config.password,
  database: config.database,
  host: config.host,
  port: config.port,
  // 擴充套件屬性
  max: parseInt(process.env.SQL_POOL_MAX_SIZE), // 連線池最大連線數
  idleTimeoutMillis: parseInt(process.env.SQL_CONNECTION_IDLE_TIMEOUT) // 連線最大空閒時間
}

// 建立連線池
const pool = new pg.Pool(setups)

pool.on('acquire', function (client) {
  // console.log('acquire Event', '\n')
})
pool.on('connect', function () {
  console.log('connect Event', '\n')
})

module.exports = {
  pool,
  types: pg.types
}
