'use strict'

const EventEmitter = require('events')
const http = require('http')

module.exports = class Application extends EventEmitter {
  constructor() {
    super()
    this.middlewares = []
  }

  callback() {
    if (!this.listenerCount('error')) this.on('error', console.log)

    return (req, res) => {
      let index = -1
      let range = 0

      const next = async i => {
        if (i <= index) return Promise.reject('next() called multiple times')

        const fn = this.middlewares[++ index]
        if (!fn) return Promise.resolve()

        try {
          await fn(req, res, next.bind(null, i + 1))
          if (++ range < this.middlewares.length) next()  // Without using next, auto append
        } catch (e) {
          this.emit('error', e)
        }
      }

      return next(0)
    }
  }

  use(fn) {
    if (typeof fn !== 'function') throw new Error('Middleware must be a function!')
    this.middlewares.push(fn)
  }

  listen(...args) {
    const server = http.createServer(this.callback())
    return server.listen(...args)
  }
}