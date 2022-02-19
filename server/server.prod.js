/**
 * The prod server
 */

var express = require('express')

const app = express()

const staticDir = __dirname + "/../dist"
console.log('Serving static files: ' + staticDir)
app.use(express.static(staticDir))

var port = process.env.PORT || 3001
app.listen(port)

const api = require('./api.js')
api(app, true)

console.log('Server listening on: '+ port)
