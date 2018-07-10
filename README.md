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
app.use(async function() {
  this.body = 'Hello World';
});
 
app.listen(3000);
```
Middleware
``` js
app.use(async function (next) {
    console.log(this.url)
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
    throw new Error(err)
    console.log('err: ' + err)
})
```
[Cookies](https://www.npmjs.com/package/cookies)
``` js
app.keys = '' // Use Keygrip
this.cookies.set( name, [ value ], [ options ] )
this.cookies.get( name, [ options ] )
```


## Authors

**Yanglin** ([i@yangl.in](mailto:mail@yanglin.me))


## License

Copyright (c) 2018 Yanglin

Released under the MIT license
