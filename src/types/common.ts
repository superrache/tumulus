import type { AnyLayer, AnySourceData, Layer, Marker, Source } from "maplibre-gl"

export interface Basemap {
    label: string
    selected: boolean
    color: string
    icon: string
    url: string
    sources?: AnySourceData[]
    layers?: AnyLayer[]
    replaceUntilLayerId?: boolean
    except?: string[]
    forcePaint?: any
}

export interface Theme {
    id: string
    label: string
    color: string
    query: string
    key: string
    values: string[]
    icon: string
    visible: boolean
    dataCacheIds?: Set<string>
    geojsons?: [ Geojson, Geojson, Geojson ]
    sources?: Source[]
    layers?: Layer[]
    markers?: Record<string, Marker>
}

export interface Query {
    filters: string[]
    label: string
    bounds: string
    cache: Record<string, Feature>
    needed: boolean
    loading: boolean
}

export interface Geojson {
    type: 'FeatureCollection'
    features: Feature[]
}

export interface Feature {
    geometry: PointGeometry | LineGeometry | PolygonGeometry
    type: 'Feature'
    properties: Record<string, string | number> // g is number
    id: string
    lang: string
}

export interface PointGeometry {
    type: 'Point'
    coordinates: number[]
}

export interface LineGeometry {
    type: 'LineString'
    coordinates: number[][]
}

export interface PolygonGeometry {
    type: 'Polygon'
    coordinates: number[][]
}
