/* @flow */
'use strict'

const assert = require('assert')
const bufferFrom /* : (b: string|Buffer) => Buffer */ = require('./buffer-from')
const Minio = require('minio')
const url = require('url')
const urljoin = require('url-join')

class Adapter {
  /* :: static default: Class<Adapter>; */

  /* :: accessKey: string; */
  /* :: bucket: (name: string) => string; */
  /* :: direct: (name: string) => boolean; */
  /* :: endPoint: string; */
  /* :: minio: Minio; */
  /* :: prefix: (name: string) => string; */
  /* :: region: string; */

  /* :: secretKey: string; */

  constructor (options /* : Object */ = {}) {
    const {
      accessKey, bucket, direct, endPoint, prefix, region, secretKey
    } = Object.assign({
      direct: false, prefix: '', region: 'us-east-1'
    }, options)

    assert(accessKey, 'Argument required: accessKey')
    assert(bucket, 'Argument required: bucket')
    assert(endPoint, 'Argument required: endPoint')
    assert(secretKey, 'Argument required: secretKey')

    // Needs the required() check for `endPoint` to have run
    const ep = new url.URL(endPoint)
    const { useSSL = ep.protocol === 'https:' } = options

    // Needs `useSSL`, whether it's provided or defaulted
    const { port = ep.port ? +ep.port : (useSSL ? 443 : 80) } = options

    Object.assign(this, { endPoint, region: `${region}` })
    Object.assign(this, {
      bucket: typeof bucket === 'function'
        ? bucket : () => {
          return `${bucket}`
        }
    })
    Object.assign(this, {
      direct: typeof direct === 'function'
        ? direct : () => !!direct
    })
    Object.assign(this, {
      prefix: typeof prefix === 'function'
        ? prefix : (name) => `${prefix}${name}`
    })

    this.minio = new Minio.Client({
      endPoint: ep.hostname, accessKey, secretKey, useSSL, port
    })
  }

  createBucket (filename /* : string */) /* : Promise<any> */ {
    return new Promise((resolve, reject) => {
      this.minio.bucketExists(this.bucket(filename)).then(resolve).catch(_ => {
        this.minio.makeBucket(this.bucket(filename), this.region).then(resolve).catch(reject)
      })
    })
    // return this.minio.bucketExists(this.bucket(filename))
    //   .catch(() => this.minio.makeBucket(this.bucket(filename), this.region))
  }

  createFile (
    name /* : string */,
    data /* : string|Buffer */,
    contentType /* : string */
  ) /* : Promise<any> */ {
    return this.createBucket(name)
      .then(() => this.minio.putObject(
        this.bucket(name),
        this.prefix(name),
        data,
        contentType
      ))
  }

  deleteFile (name /* : string */) /* : Promise<any> */ {
    return this.createBucket(name)
      .then(() => this.minio.removeObject(this.bucket(name), this.prefix(name)))
  }

  getFileData (name /* : string */) /* : Promise<Buffer> */ {
    return this.createBucket(name)
      .then(() => this.minio.getObject(this.bucket(name), this.prefix(name)))
      .then((stream) => new Promise((resolve, reject) => {
        const buflist = []
        stream.on('error', reject)
        stream.on('data', (chunk) => buflist.push(bufferFrom(chunk)))
        stream.on('end', () => resolve(Buffer.concat(buflist)))
      }))
  }

  getFileLocation (config /* : Object */, name /* : string */) /* : string */ {
    const parts = this.direct(name)
      ? [this.endPoint, this.bucket(name), this.prefix(name)]
      : [config.mount ? config.mount : '/', 'files', config.applicationId ? config.applicationId : '', encodeURIComponent(name)]
    return urljoin(...parts)
  }
}

module.exports = Adapter
module.exports.default = Adapter
