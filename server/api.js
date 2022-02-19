/**
 * The common server code
 * @param {app, prod} app 
 */
module.exports = function(app, prod) {
    const request = require('request')

    app.get('/data', (req, res) => {
        if(!prod) { // parce que les ports server vue et server node sont différents en dev
            res.header('Access-Control-Allow-Origin', "*")
            res.header('Access-Control-Allow-Headers', "*")
        }

        console.log('get /data')

        try {
            var url = 'https://overpass-api.de/api/interpreter?data='
            var query = '[out:json][timeout:25];(node["historic"](' + req.query.bounds + '););out;>;out skel qt;'
            const fullUrl = url + encodeURIComponent(query)
            console.log(fullUrl)
            request(fullUrl, (error, response, data) => {
                try {
                    if(error) console.log(error)
                    console.log(response.statusCode)
                    var features = []
                    JSON.parse(data).elements.forEach(function(e) {
                        if(e.type === 'node' && e.hasOwnProperty('tags')) {
                            var feature = {
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates: [e.lon, e.lat]
                                },
                                properties: e.tags,
                                id: e.id
                            }
                            //feature.properties.id = e.id
                            features.push(feature)
                        }
                    })
                    var geojson = {
                        type: "FeatureCollection",
                        features: features
                    }
                    res.json(geojson)
                } catch(err) {
                    console.error(err)
                    res.json({error: 1})
                }
            })
        } catch(err) {
            console.error(err)
            res.json({error: 2})
        }
    })
}