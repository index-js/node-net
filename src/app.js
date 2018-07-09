const Http = require('http')
const EventEmitter = require('events')

class Application extends EventEmitter{
    constructor() {
        super()
        this.middlewares = []
        this.callbacks = []
    }

    onerror(err) {
        console.error('err:', err)
    }

    callback() {
        if (!this.listenerCount('error')) this.on('error', this.onerror)

        return (req, res) => {
            let index = -1

            const next = async() => {
                let fn = this.middlewares[++ index]
                try {
                    if(fn) {
                        await fn.call(this, req, res, next)
                        if (!--index) Promise.all(this.callbacks.map(fn => fn.call(this, req, res))).then(respond.call(this, req, res))
                    }
                }
                catch (e) {
                    this.emit('error', e)
                    res.body = 'error: ' + String(e)
                    res.statusCode = 500
                    respond(req, res)
                }
            }

            return next()
        }
    }

    listen(...args) {
        const server = Http.createServer(this.callback())
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

function respond(req, res) {
    if (!res.writable) return

    let body = String(res.body)

    res['Content-Length'] = Buffer.byteLength(body)
    res.end(body)
}

module.exports = Application