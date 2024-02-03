import type { Map } from "maplibre-gl"
import type { Theme } from "./common"

export interface TumulusComponents {
    map: TumulusMapComponent
    basemapSelect: BasemapSelectComponent
    featureResult: FeatureResultComponent
    featureEditor: FeatureEditorComponent
    plantNetAssistant: PlantNetAssistantComponent
}

export interface TumulusMapComponent {
    map: Map | null
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
    updateParams: Function
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
