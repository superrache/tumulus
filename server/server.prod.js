/**
 * The prod server
 */

const express = require('express')

const app = express()
app.use(express.json())

const staticDir = __dirname + "/../dist"
console.log('Serving static files: ' + staticDir)
app.use(express.static(staticDir))

const port = process.env.PORT || 3001
app.listen(port)

const api = require('./api.js')
api(app, process.env.DATABASE_URL, true)

console.log('Server listening on: '+ port)
