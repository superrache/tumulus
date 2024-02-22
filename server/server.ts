import express, { Express } from "express"
import { TumulusApi } from "./api"

const prod = process.env.TUMULUS_ENV === 'prod';

const app: Express = express()

if(prod) {
    const staticDir = __dirname + "/../dist"
    console.log(`Serving static files: ${staticDir}`)
    app.use(express.static(staticDir))
}

const port = process.env.PORT || (prod ? 3001 : 3000)

app.listen(port)

new TumulusApi(app, prod, process.env.DATABASE_URL)

console.log(`Server listening on: ${port}`)
