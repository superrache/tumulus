/**
 * The common server code
 * @param {app, databaseUrl, prod} app 
 */
module.exports = function(app, databaseUrl, prod) {
    console.log('Database URL: ' + databaseUrl)
    if(databaseUrl === undefined) {
        console.log('Error: database URL must be specified')
        process.exit(1)
    }

    console.log('Initializing database')
    const { Client } = require('pg')

    let ssl = prod ? {rejectUnauthorized: false} : false

    const db = new Client({
        connectionString: databaseUrl,
        ssl: ssl
    })

    try {
        db.connect()
        console.log('Connected')
        db.query('create table if not exists osm_user ( name text not null unique, connections int default 0, changes int default 0, changesets int default 0, created_at TIMESTAMPTZ DEFAULT Now());')
        console.log('Table osm_user created or existing')
    } catch(e) {
        console.log('An error occured')
        console.log(e)
    }

    const request = require('request')
    const osmtogeojson = require('osmtogeojson')

    const simpleCache = []

    const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`

    app.get('/status', (req, res) => {
        const memoryData = process.memoryUsage()
        const memoryUsage = {
            rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
            heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
            heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
            external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
        }
        console.log(memoryUsage)
        res.json(memoryUsage)
    })

    app.get('/data', (req, res) => {
        if(!prod) { // parce que les ports server vue et server node sont différents en dev
            res.header('Access-Control-Allow-Origin', "*")
            res.header('Access-Control-Allow-Headers', "*")
        }

        try {
            const instances = [/*'https://overpass-api.de', */'https://lz4.overpass-api.de', 'https://z.overpass-api.de']
            const instance = instances[Math.floor(Math.random() * instances.length)]
            const url = instance + '/api/interpreter?data='
            
            const bounds = req.query.bounds
            console.log('get /data request on ' + instance + ' filters: ' + req.query.filters + ' bounds: ' + bounds)

            const filters = req.query.filters.split(',')
            let query = '[out:json][timeout:25];('
            for(let f in filters) {
                let filter = filters[f]
                query += `node${filter}(${bounds});way${filter}(${bounds});relation${filter}(${bounds});`
            }
            query += ');out body;>;out skel qt;'

            const fullUrl = url + encodeURIComponent(query)
            //console.log(query)

            if(simpleCache.hasOwnProperty(query)) {
                console.log('[result in cache]')
                res.json(simpleCache[query])
            } else {
                request(fullUrl, (error, response, data) => {
                    try {
                        if(error) console.log(error)
                        console.log(response.statusCode)
                        const geojson = osmtogeojson(JSON.parse(data))
                        simpleCache[query] = geojson
                        res.json(geojson)
                    } catch(err) {
                        //console.error(err)
                        //console.error(data)
                        res.json({error: 1})
                    }
                })
            }
        } catch(err) {
            //console.error(err)
            res.json({error: 2})
        }
    })

    app.get('/wikidata', (req, res) => {
        if(!prod) { // parce que les ports server vue et server node sont différents en dev
            res.header('Access-Control-Allow-Origin', "*")
            res.header('Access-Control-Allow-Headers', "*")
        }
        try {
            console.log(`get /wikidata q=${req.query.q}`)
            request(`https://www.wikidata.org/w/api.php?action=wbgetentities&props=sitelinks&ids=${req.query.q}&format=json`, (error, response, data) => {
                try {
                    res.header("Content-Type", "application/json")
                    res.send(data)
                } catch(err) {
                    res.json({error: 4})
                }
            })
        } catch(err) {
            res.json({error: 3})
        }
    })

    /*
        /connect?name=johnny
    */
    app.get('/connect', (req, res) => {
        if(!prod) { // parce que les ports server vue et server node sont différents en dev
            res.header('Access-Control-Allow-Origin', "*")
            res.header('Access-Control-Allow-Headers', "*")
        }

        if(req.query.name == undefined) {
            res.json({error: 10})
        } else {
            let name = req.query.name
            console.log('get /connect name=' + name)
            db.query('insert into osm_user(name) values($1) on conflict (name) do nothing;', [name])
            db.query('update osm_user set connections = connections + 1 where name like $1;', [name])
            
            res.json({status: 200})
        }
    })

    /*
        /stat-changes?name=johnny&changes=12
    */
    app.get('/stat-changes', (req, res) => {
        if(!prod) { // parce que les ports server vue et server node sont différents en dev
            res.header('Access-Control-Allow-Origin', "*")
            res.header('Access-Control-Allow-Headers', "*")
        }

        if(req.query.name == undefined || req.query.changes == undefined) {
            res.json({error: 11})
        } else {
            let name = req.query.name
            let changes = req.query.changes
            console.log('get /stat-changes name=' + name + ' changes=' + changes)
            db.query('update osm_user set changes = changes + $2, changesets = changesets + 1 where name like $1;', [name, changes])
            
            res.json({status: 200})
        }
    })

}