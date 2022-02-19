/**
 * The dev server (express only)
 */

var express = require('express')

const app = express()

var port = process.env.PORT || 3000

app.listen(port)

const api = require('./api.js')
api(app, false)

console.log('Server listening on: '+ port)
