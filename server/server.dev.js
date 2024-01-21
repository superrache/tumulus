/**
 * The dev server (express only)
 */

const express = require('express')

const app = express()

const port = process.env.PORT || 3000

const server = app.listen(port)

const api = require('./api.js')
api(app, process.env.DATABASE_URL, false)

console.log('Server listening on: '+ port)
console.log('Server IP is: '+ server.address().address)
