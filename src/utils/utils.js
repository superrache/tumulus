export function round6Digits(a) {
    return (Math.round(a * 100000) / 100000)
}

export function pointInBounds(lngLat, bounds) {
    return lngLat[0] >= bounds._sw.lng && lngLat[0] <= bounds._ne.lng
        && lngLat[1] >= bounds._sw.lat && lngLat[1] <= bounds._ne.lat
}

// converts bounds (maplibre extent) to bbox (turf.js extent)
export function boundsToBbox(bounds) {
    return [bounds._sw.lng, bounds._sw.lat, bounds._ne.lng, bounds._ne.lat]
}

export function bboxInBbox(inside, outside) {
    return inside[0] > outside[0] && inside[1] > outside[1] && inside[2] < outside[2] && inside[3] < outside[3]
}

export function getGeometryInteger(feature) {
    switch(feature.geometry.type) {
        case 'Point': return 0;
        case 'LineString': return 1;
        case 'Polygon': return 2;
        case 'MultiPoint': return 0;
        case 'MultiLineString': return 1;
        case 'MultiPolygon': return 2;
        default: return 0;
    }
}