// const crypto = require('crypto')
const { config } = require('../package.json')

module.exports = {
  endPoint: 'http://localhost:9000',
  useSSL: false,
  port: 9000,
  accessKey: config.access,
  secretKey: config.secret,
  bucket: 'joshua' // crypto.randomBytes(6).toString('hex').toLowerCase()
}
