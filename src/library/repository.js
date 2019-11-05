const config = require('config').database
const pool = config.pool

function Repository (pool) {
  this.pool = pool
}

/**
 * @param {string} statement
 * @param {Object[]} fieldValues
 * @param {number|null} rowIndex
 */
Repository.prototype.query = async function (statement, fieldValues, rowIndex = null) {
  this.pool = this.pool ? this.pool : pool

  return this.pool.connect()
    .then(client => {
      return client.query(statement, fieldValues)
        .then(result => {
          client.release()
          return rowIndex === null ? result.rows : result.rows[rowIndex]
        })
        .catch(err => {
          client.release()
          console.error('Repository query error:', err.message, err.stack)
          return Promise.reject(err)
        })
    })
}

module.exports = Repository
