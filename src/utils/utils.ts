import type { Feature } from '@/types/common'
import type { LngLatBounds } from 'maplibre-gl'

export function round6Digits(a: number) {
    return (Math.round(a * 100000) / 100000)
}

export function pointInBounds(lngLat: [number, number], bounds: LngLatBounds): boolean {
    return lngLat[0] >= bounds.getSouthWest().lng && lngLat[0] <= bounds.getNorthEast().lng
        && lngLat[1] >= bounds.getSouthWest().lat && lngLat[1] <= bounds.getNorthEast().lat
}

// converts bounds (maplibre extent) to bbox (turf.js extent)
export function boundsToBbox(bounds: LngLatBounds): [number, number, number, number] {
    return [bounds.getSouthWest().lng, bounds.getSouthWest().lat, bounds.getNorthEast().lng, bounds.getNorthEast().lat]
}

export function bboxInBbox(inside: [number, number, number, number], outside: [number, number, number, number]): boolean {
    return inside[0] > outside[0] && inside[1] > outside[1] && inside[2] < outside[2] && inside[3] < outside[3]
}

export function getGeometryType(feature: Feature): string {
    switch(feature.geometry.type) {
        case 'Point': return '0'
        case 'LineString': return '1'
        case 'Polygon': return '2'
        case 'MultiPoint': return '0'
        case 'MultiLineString': return '1'
        case 'MultiPolygon': return '2'
        default: return '0'
    }
}