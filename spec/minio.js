'use strict'

const Minio = require('minio')
const play = require('./config')
const url = require('url')

const config = Object.assign({}, play)
delete config.bucket

const { hostname, port, protocol } = new url.URL(config.endPoint)
config.endPoint = hostname
config.port = +port
config.useSSL = protocol === 'https:'

// const minio = module.exports = new Minio.Client(config)
module.exports = new Minio.Client(config)
