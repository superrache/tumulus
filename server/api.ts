import { Express, Request, Response } from 'express'
import multer, { FileFilterCallback, Multer } from 'multer'
import { Client, QueryResult } from 'pg'
import osmtogeojson from 'osmtogeojson'
import { FeatureCollection } from 'geojson'
import axios from 'axios'
import FormData from 'form-data'

export class TumulusApi {

    prod: boolean
    db: Client | undefined = undefined
    upload: Multer | undefined = undefined
    simpleCache: Record<string, FeatureCollection>= {}

    constructor(app: Express, prod: boolean, databaseUrl?: string) {
        this.prod = prod
        this.initDatabase(databaseUrl)

        this.upload = multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 12 * 1024 * 1024 // max file size 15mb
            },
            fileFilter: this.imageFilter
        })

        app.get('/status', this.statusHandler)
        app.get('/data', this.dataHandler)
        app.get('/wikidata', this.wikidataHandler)
        app.post('/plantnet-identify', this.upload.single('image'), this.plantnetIdentifyHandler)
        app.get('/connect', this.connectHandler)
        app.get('/stat-changes', this.statChangesHandler)
        app.get('/show-stats', this.showStatsHandler)
    }

    initDatabase(databaseUrl?: string) {
        if(databaseUrl === undefined || databaseUrl.length == 0) {
            console.log('Warning: database URL must be specified')
            console.log('Launching server without database')
        } else {
            console.log(`Initializing database: ${databaseUrl}`)
    
            this.db = new Client({
                connectionString: databaseUrl,
                ssl: this.prod ? {rejectUnauthorized: false} : false
            })
        
            try {
                this.db.connect()
                console.log('Connected')
                this.db.query('create table if not exists osm_user ( name text not null unique, connections int default 0, changes int default 0, changesets int default 0, created_at TIMESTAMPTZ DEFAULT Now());')
                console.log('Table osm_user created or existing')
            } catch(e) {
                console.log('An error occured')
                console.log(e)
                this.db = undefined
            }
        }    
    }

    imageFilter(req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) { // plantnet accepts only png and jpeg files
            return cb(new Error('Only image files are allowed'))
        }
        cb(null, true);
    }

    static formatMemoryUsage(data: number): string {
        return `${Math.round(data / 1024 / 1024 * 100) / 100} MB`
    }

    static updateHeader(prod: boolean, res: Response): Response {
        if(!prod) { // parce que les ports server vue et server node sont différents en dev
            res.header('Access-Control-Allow-Origin', "*")
            res.header('Access-Control-Allow-Headers', "*")
        }
        return res
    }

    statusHandler(req: Request, res: Response) {
        const memoryData = process.memoryUsage()
        const memoryUsage = {
            rss: `${TumulusApi.formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
            heapTotal: `${TumulusApi.formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
            heapUsed: `${TumulusApi.formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
            external: `${TumulusApi.formatMemoryUsage(memoryData.external)} -> V8 external memory`,
        }
        console.log(memoryUsage)
        res.json(memoryUsage)
    }    

    dataHandler(req: Request<{}, {}, {}, {filters: string, bounds: string}>, res: Response) {
        res = TumulusApi.updateHeader(this.prod, res)

        try {
            const instances = ['https://gall.openstreetmap.de/api', 'https://lambert.openstreetmap.de/api', 'https://lz4.overpass-api.de', 'https://z.overpass-api.de']
            const instance = instances[Math.floor(Math.random() * instances.length)]
            const url = instance + '/api/interpreter?data='
            
            const bounds = req.query.bounds
            console.log(`get /data request on ${instance} filters: ${req.query.filters} bounds: ${bounds}`)

            const filters = req.query.filters.split(',')
            let query = '[out:json][timeout:25];('
            for(let f in filters) {
                let filter = filters[f]
                query += `node${filter}(${bounds});way${filter}(${bounds});relation${filter}(${bounds});`
            }
            query += ');out body;>;out skel qt;'

            const fullUrl = url + encodeURIComponent(query)
            //console.log(query)

            if(query in this.simpleCache) {
                console.log('[result in cache]')
                res.json(this.simpleCache[query])
            } else {
                axios.get(fullUrl).then((response) => {
                    const geojson = osmtogeojson(response.data)
                    this.simpleCache[query] = geojson
                    res.json(geojson)
                }).catch(() => res.json({error: 1}))
            }
        } catch(err) {
            res.json({error: 2})
        }
    }
    
    wikidataHandler(req: Request<{}, {}, {}, {q: string}>, res: Response) {
        res = TumulusApi.updateHeader(this.prod, res)

        try {
            console.log(`get /wikidata q=${req.query.q}`)
            axios.get(`https://www.wikidata.org/w/api.php?action=wbgetentities&props=sitelinks&ids=${req.query.q}&format=json`).then((response) => {
                try {
                    res.header("Content-Type", "application/json")
                    res.send(response.data)
                } catch(err) {
                    res.json({error: 4})
                }
            }).catch(() => res.json({error: 4}))
        } catch(err) {
            res.json({error: 3})
        }
    }
    
    plantnetIdentifyHandler(req: Request, res: Response) {
        res = TumulusApi.updateHeader(this.prod, res)

        try {
            console.log(`get /plantnet-identify ${req.body.organs}`)

            // build a plantnet post identify request
            const form = new FormData()
            form.append('organs', req.body.organs)
            form.append('images', req.file!.buffer, req.file!.originalname)

            axios.post(
                `https://my-api.plantnet.org/v2/identify/all?api-key=2b10uKobhNtnceQ7cvc3tseye&include-related-images=true&lang=${req.body.lang}`,
                form, {
                    headers: form.getHeaders() // 'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
                }
            ).then((response) => {
                console.log('success, best match: ', response.data.bestMatch)
                res.json({
                    sucess: 200,
                    results: response.data.results
                })
            }).catch((error) => {
                console.error('plantnet API error')
                if(error.response !== undefined && error.response.data !== undefined) {
                    console.error(error.response.data)
                    res.json({error: 21, data: error.response.data})
                } else {
                    console.error(error)
                    res.json({error: 22, data: {message: 'unknown error from plantnet API call'}})
                }
            })
        } catch (error) {
            console.error('plantnet-identify error')
            res.json({error: 20})
        }
    }
        
    /*
        /connect?name=johnny
    */
    connectHandler(req: Request<{}, {}, {}, {name: string}>, res: Response) {
        res = TumulusApi.updateHeader(this.prod, res)

        if(req.query.name == undefined) {
            res.json({error: 10})
        } else {
            const name = req.query.name
            console.log(`get /connect name=${name}`)
            this.db!.query('insert into osm_user(name) values($1) on conflict (name) do nothing;', [name])
            this.db!.query('update osm_user set connections = connections + 1 where name like $1;', [name])
            
            res.json({status: 200})
        }
    }
    
    statChangesHandler(req: Request<{}, {}, {}, {name: string, changes: number}>, res: Response) {
        res = TumulusApi.updateHeader(this.prod, res)

        if(req.query.name == undefined || req.query.changes == undefined) {
            res.json({error: 11})
        } else {
            const name = req.query.name
            const changes = req.query.changes
            console.log(`get /stat-changes name=${name} changes=${changes}`)
            this.db!.query('update osm_user set changes = changes + $2, changesets = changesets + 1 where name like $1;', [name, changes])
            
            res.json({status: 200})
        }
    }
    
    showStatsHandler(req: Request, res: Response) {
        res = TumulusApi.updateHeader(this.prod, res)

        console.log('get /show-stats')
        
        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8'
        })
        var html = "<!doctype html><html><head><title>Tumulus stats</title></head><body><h1>OSM users</h1><table border=\"1\"><tr><th>name</th><th>created at</th><th>connections</th><th>changesets</th><th>changes</th></tr>"

        this.db!.query('select name, created_at, connections, changesets, changes from osm_user order by changes desc;', (err: Error, sel: QueryResult<any>) => {
            if(err) {
                console.error(err.message)
            }
            for(var r in sel.rows) {
                const row = sel.rows[r]
                html += "<tr><td>" + row.name + "</td><td>" + row.created_at + "</td><td>" + row.connections + "</td><td>" + row.changesets + "</td><td>" + row.changes + "</td></tr>"
            }
            html += "</table>"
            html += "</body></html>"
            res.write(html, "utf-8")
            res.end()
        })
    }
}
