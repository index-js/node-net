const Http = require('http')
const EventEmitter = require('events')

class Application extends EventEmitter{
    constructor() {
        super()
        this.middlewares = []
        this.callbacks = []
    }

    onerror(err) {
        console.error(err)
    }

    callback() {
        return (req, res) => {
            let index = 0
            let middleware = this.middlewares
            let callback = this.callbacks
            let response = () => respond(req, res)

            if (!this.listenerCount('error')) this.on('error', this.onerror);

            const next = () => {
                const fn = middleware[index ++]
                try {
                    if (!fn) Promise.all(callback.map(fn => fn(req, res))).then(response).catch(e => {throw e})
                    else fn(req, res, next)
                }
                catch (e) {
                    this.emit('error', e)
                    res.body = e
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
        if (typeof fn !== 'function') throw 'Middleware must be a function!'
        this.middlewares.push(fn)

        if (cb && typeof fn !== 'function') throw 'Callback must be a function!'
        if (cb) this.callbacks.unshift(cb)

        return this
    }
}

function respond(req, res) {
    if (!res.writable) return;

    let body = String(res.body);

    res['Content-Length'] = Buffer.byteLength(body);
    res.end(body);
}

module.exports = Application