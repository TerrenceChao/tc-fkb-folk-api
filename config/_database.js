const pg = require('pg')

// 資料庫配置
const config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PW,
  database: process.env.SQL_DATABASE,
  host: process.env.SQL_HOST,
  port: parseInt(process.env.SQL_PORT),
  // 擴充套件屬性
  max: parseInt(process.env.SQL_POOL_MAX_SIZE), // 連線池最大連線數
  idleTimeoutMillis: parseInt(process.env.SQL_CONNECTION_IDLE_TIMEOUT) // 連線最大空閒時間
}

// 建立連線池
const pool = new pg.Pool(config)

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
