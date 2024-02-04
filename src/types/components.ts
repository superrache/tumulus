import type { Map } from "maplibre-gl"
import type { Theme } from "./common"

export interface TumulusComponents {
    map: TumulusMapComponent
    basemapSelect: BasemapSelectComponent
    featureResult: FeatureResultComponent
    featureEditor: FeatureEditorComponent
    plantNetAssistant: PlantNetAssistantComponent
    osmConnector: OSMConnectorComponent
    commentDialog: CommentDialogComponent
    editorLog: EditorLogComponent
    thanks: ThanksComponent
    issueAnalyzer: IssueAnalyzerComponent
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
    reload: Function
    updateFeature: Function
}

export interface BasemapSelectComponent {
    currentBasemapId: string
    selectBasemapById: Function
}

export interface FeatureResultComponent {
    updateFeature: Function
    unloadFeature: Function
}

export interface FeatureEditorComponent {
    unloadFeature: Function
}

export interface PlantNetAssistantComponent {
    unloadFeature: Function
}

export interface OSMConnectorComponent {
    connected: boolean
    addEditedFeature: Function
}

export interface CommentDialogComponent {
    show: Function
}

export interface EditorLogComponent {
    clear: Function
    add: Function
}

export interface ThanksComponent {
    changeset: string
}

export interface IssueAnalyzerComponent {
    setEditedKeys: Function
}