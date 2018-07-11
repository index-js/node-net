'use strict';

const EventEmitter = require('events')
const http = require('http')
const delegate = require('delegates')
const cookies = require('cookies')
const statuses = require('statuses')

const context = require('./context')
const request = require('./request')
const response = require('./response')

class Application extends EventEmitter{
    constructor() {
        super()
        this.middlewares = []
        this.callbacks = []
        this.context = Object.create(context)
        this.request = Object.create(request)
        this.response = Object.create(response)
    }

    onerror(err) {
        console.error('err:', err)
    }

    createContext(req, res) {
        const context = Object.create(this.context)

        let request = context.request = Object.create(this.request)
        let response = context.response = Object.create(this.response)

        context.app = request.app = response.app = this
        context.req = request.req = response.req = req
        context.res = request.res = response.res = res

        context.cookies = new cookies(req, res, {
            key: this.keys,
            secure: request.secure
        })
        context.state = {}

        return context
    }

    callback() {
        if (!this.listenerCount('error')) this.on('error', this.onerror)

        return (req, res) => {
            let index = -1
            let range = 0

            const next = async() => {
                const fn = this.middlewares[++ index]
                try {
                    if(fn) {
                        await fn.call(ctx, next)

                        if (++ range != this.middlewares.length) next()  // Without using next, auto append
                        else Promise.all(this.callbacks.map(fn => fn.call(ctx))).then(respond.call(ctx))
                    }
                }
                catch (e) {
                    ctx.status = 500
                    ctx.body = 'error: ' + String(e)
                    respond.call(ctx)
                    this.emit('error', e)
                }
            }

            const ctx = this.createContext(req, res)
            ctx.status = 404
            
            return next()
        }
    }

    listen(...args) {
        const server = http.createServer(this.callback())
        return server.listen(...args)
    }

    use(fn, cb) {
        if (typeof fn !== 'function') throw new Error('Middleware must be a function!')
        if (isArrow(fn)) throw new Error('Middleware can not use arrow function!')
        this.middlewares.push(fn)

        if (cb){
            if (typeof fn !== 'function') throw new Error('Callback must be a function!')
            if (isArrow(cb)) throw new Error('Callback can not use arrow function!')
            this.callbacks.unshift(cb)
        }

        return this
    }
}

function isArrow(functionObject) {
    return /^(async *)?\(/.test(functionObject)
}

function respond() {
    const res = this.res
    // if (!res.writable) return

    let body = this.body
    let code = this.status

    if (statuses.empty[code]) {
        this.body = null
        return res.end()
    }

    if (Buffer.isBuffer(body)) return res.end(body)

    if ('HEAD' === this.method) {
        this.length = String(body).length
        return res.end()
    }

    if (null == body) {
        body = this.message || String(code)
        this.type = 'text'
        this.length = Buffer.byteLength(body)
        return res.end(body)
    }

    if ('string' === typeof body) return res.end(body)
    if (body instanceof Stream) return body.pipe(res)

    body = JSON.stringify(body)
    this.length = Buffer.byteLength(body)
    res.end(body)
}

module.exports = Application