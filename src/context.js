'use strict';

const delegate = require('delegates')
const util = require('util')
const statuses = require('statuses')

const proto = module.exports = {
  onerror(err) {
    if (!err) return
    if (!(err instanceof Error)) err = new Error(util.format('non-error thrown: %j', err))
    
    if (this.headerSent) return

    const res = this.res
    if (typeof res.getHeaderNames === 'function') {
      res.getHeaderNames().forEach(name => res.removeHeader(name));
    } else {
      res._headers = {}; // Node < 7.7
    }

    this.type = 'text'
    if ('ENOENT' == err.code) this.status = 404
    // default to 500
    if ('number' != typeof err.status || !statuses[err.status]) this.status = 500

    const code = statuses[this.status]
    const msg = err.message || statuses[code]

    this.length = Buffer.byteLength(msg)
    res.end(msg)

    this.app.emit('error', err)
	}
}

delegate(proto, 'request')
  .getter('search')
  .getter('method')
  .getter('query')
  .getter('path')
  .getter('url')


delegate(proto, 'response')
  .access('status')
  .access('body')
  .access('get')
  .access('set')
  .getter('headerSent')