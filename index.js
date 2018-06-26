const server = require('./src/app')
const app = new server()

// m1
app.use(async function (req, res, next) {
    console.log(req.url)
    setTimeout(() => {
        console.log(this)
    })
    await next()
    console.log('m1')
}, function () {
    // return 'result'
})

// m2
app.use(function (req, res, next) {
    // throw 'm2 err'
    console.log('m2')
    res.body = 'body'
    next()
}, (req, res) => {
    console.log('callback')
})

// m3
app.use(async function (req, res, next) {
    console.log('m3')
    await next()
    console.log('m3-end')
}, function() {
    // throw 'error'
})

app.on('error', (err) => {
    console.log('err: ' + err)
})

app.listen(3000, () => {
    console.log('listening on 3000')
})