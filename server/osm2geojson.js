module.exports = function osm2geojson(data) {
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

    // TODO support way
    // TODO support relation

    var geojson = {
        type: "FeatureCollection",
        features: features
    }
    return geojson
  };
  