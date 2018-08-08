const server = require('./index')
const app = new server()
const assert = require('assert')

app.use(async function(req, res, next) {
  res.write('content')
  await next()
  console.log('back end')
})

app.use(function(req, res, next) {
  res.write('middle')
})

app.use(async function(req, res, next) {
  console.log('back start')
  await next()
  res.end('end')
})

app.listen(3000, () => {
  console.log('127.0.0.1:3000')
})