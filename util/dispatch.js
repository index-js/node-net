'use strict'

module.exports = function(req, res, middlewares) {
  let index = -1
  let range = 0

  const next = async i => {
    if (i <= index) return Promise.reject(new Error('next() called multiple times'))

    const fn = middlewares[++ index]
    if (!fn) return Promise.resolve()

    try {
      await fn(req, res, next.bind(null, i + 1))
      if (++ range < middlewares.length) next()  // Without using next, auto append
    } catch (e) {
      this.emit('error', e)
    }
  }

  return next(0)
}