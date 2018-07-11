const server = require('./index')
const app = new server()
const assert = require('assert')

// m1
app.use(async function (next) {
    console.log(this.url, 'm1')
    this.cookies.set('55', 555)
    setTimeout(() => {
        assert(this, app, 'should equal')
    })
    await next()
    console.log('m1 await then')
}, function () {
    console.log('m1 end\n')
})

// m2
app.use(function (next) {
    // throw 'm2 err'
    console.log('m2')
    this.cookies.get('55')
    this.body = '<body> - ' + Date.now()
    this.status = 200
    // next()
}, function (req, res) {
    console.log('m2 callback')
})

// m3
app.use(async function (next) {
    console.log('m3')
    // await next()
    console.log('m3-end')
}, function() {
    console.log('m3 callback begin')
})

app.keys = '12345'
app.on('error', (err) => {
    console.log('err: ' + err)
    throw new Error(err)
})

app.listen(3000, () => {
    console.log('listening on 3000')
})