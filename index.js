const server = require('./src/app')
const app = new server()
const assert = require('assert')

// m1
app.use(async function (req, res, next) {
    console.log(req.url, 'm1')
    setTimeout(() => {
        assert(this, app, 'should equal')
    })
    await next()
    console.log('m1 await then')
}, function () {
    console.log('m1 end\n')
})

// m2
app.use(function (req, res, next) {
    // throw 'm2 err'
    console.log('m2')
    res.body = 'body - ' + Date.now()
    next()
}, function (req, res) {
    console.log('m2 callback')
})

// m3
app.use(async function (req, res, next) {
    console.log('m3')
    await next()
    console.log('m3-end')
}, function() {
    console.log('m3 callback begin')
})

app.on('error', (err) => {
    console.log('err: ' + err)
})

app.listen(3000, () => {
    console.log('listening on 3000')
})