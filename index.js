'use strict'

const EventEmitter = require('events')
const http = require('http')
const dispatch = require('./util/dispatch')

module.exports = class Application extends EventEmitter {
  constructor() {
    super()
    this.middlewares = []
  }

  callback() {
    if (!this.listenerCount('error')) this.on('error', console.log)

    return (...args) => dispatch.apply(this, [...args, this.middlewares])
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