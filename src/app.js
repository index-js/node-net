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
        return (req, res) => {
            let index = 0
            let middleware = this.middlewares
            let callback = this.callbacks
            let response = () => respond(req, res)

            if (!this.listenerCount('error')) this.on('error', this.onerror)

            const next = async() => {
                let fn = middleware[index ++]
                try {
                    if(fn) {
                        await fn.call(this, req, res, next)
                        if (--index == 1) Promise.all(callback.map(fn => fn.call(this, req, res))).then(response).catch(e => { throw e })
                    }
                }
                catch (e) {
                    this.emit('error', e)
                    res.body = 'error: ' + String(e)
                    res.statusCode = 500
                    response()
                }
            }

            return next()
        }
    }

    listen(...args) {
        const server = Http.createServer(this.callback())
        return server.listen(...args)
    }

    use(fn, cb = false) {
        if (typeof fn !== 'function') throw new Error('Middleware must be a function!')
        if (/^async? \(/.test(fn)) throw new Error('Middleware can not use arrow function!')
        this.middlewares.push(fn)

        if (cb){
            if (typeof fn !== 'function') throw new Error('Callback must be a function!')
            if (/^async? \(/.test(cb)) throw new Error('Callback can not use arrow function!')
            this.callbacks.unshift(cb)
        }

        return this
    }
}

function respond(req, res) {
    if (!res.writable) return

    let body = String(res.body)

    res['Content-Length'] = Buffer.byteLength(body)
    res.end(body)
}

module.exports = Application