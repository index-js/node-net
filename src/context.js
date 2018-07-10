'use strict';

const delegate = require('delegates')

const proto = module.exports = {}

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