'use strict';

const url = require('url')
const util = require('util')

module.exports = {
  get headers() {
    return this.req.headers
  },
  get url() {
    return this.path
  },
  get originalUrl() {
    return this.req.originalUrl
  },
  get method() {
    return this.req.method
  },
  get path() {
    return url.parse(this.req.url, true).pathname
  },
  get href() {
    return this.req.url
  },
  get query() {
    return url.parse(this.req.url, true).query
  },
  get search() {
    return url.parse(this.req.url, true).search
  },
  get socket() {
    return this.req.socket
  },
  get protocol() {
    if (this.socket.encrypted) return 'https'
    
    const proto = this.get('X-Forwarded-Proto')
    return proto ? proto.split(/\s*,\s*/)[0] : 'http'
  },
  get secure() {
    return 'https' == this.protocol
  },
  get(field) {
    const headers = this.headers

    switch (field = field.toLowerCase()) {
      case 'referer':
      case 'referrer':
        return headers.referrer || headers.referer || ''
      default:
        return headers[field] || ''
    }
  }
}