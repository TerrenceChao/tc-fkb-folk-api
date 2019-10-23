require('dotenv').config()
var fs = require('fs')
var path = require('path')
var project = JSON.parse(fs.readFileSync('package.json'))
const ROOT = getParentDirPath(__dirname, project.name)

/**
 * @private
 * @param {string} currentDir
 * @param {string} specifyDir
 * @returns {string}
 */
function getParentDirPath (currentDir, specifyDir) {
  if (specifyDir == null) {
    return path.resolve(currentDir, '../')
  }

  while (path.basename(currentDir) !== specifyDir) {
    currentDir = path.resolve(currentDir, '../')
  }
  return currentDir
}

module.exports = {
  auth: require('./_auth'),
  database: require('./_database'),
  message: require('./_message'),
  notification: require('./_notification')
}
