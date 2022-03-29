module.exports = function osm2geojson(data) {
    let features = []

    JSON.parse(data).elements.forEach(function(e) {
        if(e.type === 'node' && e.hasOwnProperty('tags')) {
            let feature = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [e.lon, e.lat]
                },
                properties: e.tags,
                id: e.id
            }
            features.push(feature)
        } else if(e.type === 'way' && e.hasOwnProperty('tags')) {
            let feature = {
                type: "Feature",
                geometry: {
                    type: ""
                },
                properties: e.tags,
                id: e.id
            }
            features.push(feature)
        }

        // TODO support relation

    })

    const geojson = {
        type: "FeatureCollection",
        features: features
    }
    return geojson
  };
  