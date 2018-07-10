'use strict';

const getType = require('mime-types').contentType
const statuses = require('statuses')

module.exports = {
	get headers() {
		return this.res.getHeaders
		? this.res.getHeaders()
		: this.res._headers || {}  // Node < 8
	},
	get message() {
		return this.res.statusMessage
	},
	set message(msg) {
		if (this.headerSent) return

		this.res.statusMessage = msg
	},
	get status() {
		return this.res.statusCode
	},
	set status(code) {
		if (this.headerSent) return

	    this.res.statusCode = code
		if (this.req.httpVersionMajor < 2) this.message = statuses[code]
	    if (this.body && statuses.empty[code]) this.body = null
	},
	get type () {
		let type = this.get('Content-Type')
		return type.split(';')[0]
	},
	set type (val) {
		if (val = getType(val)) {
			this.set('Content-Type', val)
		} else {
			this.remove('Content-Type')
		}
	},
	get length() {
		let len = this.get('content-length')
		let body = this.body

		if (!len) {
			if (!body) return
			if (typeof body === 'string') return Buffer.byteLength(body)
			if (Buffer.isBuffer(body)) return body.length
		}

		return ~~len
	},
	set length(val) {
		this.set('Content-Length', val)
	},
	get body() {
		return this._body
	},
	set body(val) {
		const original = this._body
		this._body = val

		if (val == null) {
			this.status = 204
			this.remove('Content-Type')
			this.remove('Content-Length')
			this.remove('Transfer-Encoding')
			return this
		}

		const setType = !this.headers['content-type']
		if (typeof val === 'string') {
			if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text'
			this.length = Buffer.byteLength(val)
			return this
		}

		if (Buffer.isBuffer(body)) {
			if (setType) this.type = 'bin'
			this.length = val.length
			return this
		}

		if ('function' === typeof val.pipe) {
			if (null != original && original != val) this.remove('Content-Length')
			if (setType) this.type = 'bin'
			return this
		}

		this.remove('Content-Length')
		this.type = 'json'
	},
	get headerSent() {
	    return this.res.headersSent
	},
	get(field) {
		return this.header[field.toLowerCase()] || ''
	},
	set(field, val) {
		if (this.headerSent) return

		if (arguments.length === 2) {
			this.res.setHeader(field, String(val))
		} else {
			for (let key in field) {
				this.set(key, field[key])
			}
		}
	},
	remove(field) {
		if (this.headerSent) return

		this.res.removeHeader(field)
	},
	redirect() {
	}
}