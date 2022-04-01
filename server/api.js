/**
 * The common server code
 * @param {app, prod} app 
 */
module.exports = function(app, prod) {
    const request = require('request')
    const osmtogeojson = require('osmtogeojson')


    app.get('/data', (req, res) => {
        if(!prod) { // parce que les ports server vue et server node sont différents en dev
            res.header('Access-Control-Allow-Origin', "*")
            res.header('Access-Control-Allow-Headers', "*")
        }

        try {
            const instances = [/*'https://overpass-api.de', */'https://lz4.overpass-api.de', 'https://z.overpass-api.de']
            const instance = instances[Math.floor(Math.random() * instances.length)]
            const url = instance + '/api/interpreter?data='
            const query = '[out:json][timeout:10];('
                    + 'node[' + req.query.filter + '](' + req.query.bounds + ');'
                    + 'way[' + req.query.filter + '](' + req.query.bounds + ');'
                    + 'relation[' + req.query.filter + '](' + req.query.bounds + ');'                    
                    + ');out body;>;out skel qt;'
            const fullUrl = url + encodeURIComponent(query)
            console.log('get /data request on ' + instance + ' filter: ' + req.query.filter + ' bounds: ' + req.query.bounds)
            request(fullUrl, (error, response, data) => {
                try {
                    if(error) console.log(error)
                    console.log(response.statusCode)
                    const geojson = osmtogeojson(JSON.parse(data))
                    res.json(geojson)
                } catch(err) {
                    //console.error(err)
                    //console.error(data)
                    res.json({error: 1})
                }
            })
        } catch(err) {
            //console.error(err)
            res.json({error: 2})
        }
    })

                    try {
                        if(error) console.log(error)
                        console.log(response.statusCode)
                        
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

 }