'use strict';

const EventEmitter = require('events')
const http = require('http')
const delegate = require('delegates')
const cookies = require('cookies')

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
            const ctx = this.createContext(req, res)

            const next = async() => {
                const fn = this.middlewares[++ index]
                try {
                    if(fn) {
                        await fn.call(ctx, next)
                        console.log(index)
                        if (!--index) Promise.all(this.callbacks.map(fn => fn.call(ctx))).then(respond.call(ctx))
                    }
                }
                catch (e) {
                    ctx.status = 500
                    ctx.body = 'error: ' + String(e)
                    respond.call(ctx)
                    this.emit('error', e)
                }
            }

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

    const body = String(this.body)

    this.response.set('Content-Length', Buffer.byteLength(body))
    res.end(body)
}

module.exports = Application