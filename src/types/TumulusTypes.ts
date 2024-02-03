import type { Layer, Marker, Source } from "maplibre-gl"
import type maplibregl from "maplibre-gl"

export type TumulusMap = {
    map: maplibregl.Map | null
    zoom: number
    center: [number, number]
    bearing: number
    pitch: number
    themes: Record<string, Theme>
    themesSelection: string
    pendingSelectedFeatureId: string | null
    pendingBasemapId: string | null
    selectedFeatureId: string | null
    components: TumulusComponents
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
    properties: Record<string, string>
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

export interface TumulusComponents {
    map: TumulusMapComponent
    basemapSelect: BasemapSelectComponent
    featureResult: FeatureResultComponent
    featureEditor: FeatureEditorComponent
    plantNetAssistant: PlantNetAssistantComponent
}

export interface TumulusMapComponent {

}

export interface BasemapSelectComponent {
    currentBasemapId: string
    selectBasemapById: Function
}

export interface FeatureResultComponent {
    unloadFeature: Function
}

export interface FeatureEditorComponent {
    unloadFeature: Function
}

export interface PlantNetAssistantComponent {
    unloadFeature: Function
}
