# Simple server for Node.js
> Pure Package, Simple Code, Use 'this' keywords


## Installation

Install via `npm`:

```
$ npm i node-net
```


## Usage

Hello World
``` js
const server = require('node-net')
const app = new server()

// response
app.use(async function(req, res) {
  res.body = 'Hello World';
});
 
app.listen(3000);
```
Middleware
``` js
app.use(async function (req, res, next) {
    console.log(req.url)
    setTimeout(() => {
        assert(this, app, 'should equal')
    })
    await next()
    console.log('m1')
}, function () {
    console.log('end')
})
```
Error Handler
``` js
app.on('error', (err) => {
    console.log('err: ' + err)
})
```


## Authors

**Yanglin** ([i@yangl.in](mailto:mail@yanglin.me))


## License

Copyright (c) 2018 Yanglin

Released under the MIT license
