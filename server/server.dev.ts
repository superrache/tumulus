/**
 * The dev server (express only)
 */
import express from 'express' 

const app = express()

const port = process.env.PORT || 3000

app.listen(port)

const api = require('./api.js')
api(app, process.env.DATABASE_URL, false)

console.log('Server listening on: '+ port)
