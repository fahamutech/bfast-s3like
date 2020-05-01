const crypto = require('crypto')
const { config } = require('../package.json')

module.exports = {
  endPoint: 'http://localhost:9000',
  useSSL: false,
  port: 9000,
  accessKey: config.access,
  secretKey: config.secret,
  bucket: crypto.randomBytes(6).toString('hex').toLowerCase()
}

// endPoint: 'https://eu-central-1.linodeobjects.com/', // 'http://localhost:9000',
//   useSSL: false,
//   port: 80,
//   accessKey: '5IGXSX5CU52C2RFZFALG', // config.access,
//   secretKey: '2q2vteO9lQp6LaxT3lGMLdkUF5THdxZWmyWmb1y9', // config.secret,
//   bucket: crypto.randomBytes(6).toString('hex').toLowerCase()
