import type { Map, Style } from "maplibre-gl"
import type { Theme } from "./common"

export interface TumulusComponents {
    app: AppComponent
    map: TumulusMapComponent
    osmConnector: OSMConnectorComponent
    basemapSelect: BasemapSelectComponent
    search: SearchComponent
    themeSelect: ThemeSelectComponent
    thanks: ThanksComponent
    editorLog: EditorLogComponent
    featureResult: FeatureResultComponent
    featureEditor: FeatureEditorComponent
    plantNetAssistant: PlantNetAssistantComponent
    issueAnalyzer: IssueAnalyzerComponent
    commentDialog: CommentDialogComponent
}

export interface AppComponent {
    canReload: boolean
    dispZoomMore: boolean
    loading: string
    updateAppUrl: Function
}

export interface TumulusMapComponent {
    components: TumulusComponents
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
    currentZoom: number
    maxZoomToGetData: number
    countryCode: string | null
    createMap: Function
    updateParams: Function
    reload: Function
    selectFeature: Function
    updateFeature: Function
    updateThemesVisibility: Function
    addPoint: Function
    validateAddingPoint: Function
    cancelAddingPoint: Function
    flyTo: Function
}

export interface BasemapSelectComponent {
    components: TumulusComponents
    currentBasemapId: string
    style: Style | string | null
    selectBasemapById: Function
    init: Function
    collapse: Function
}

export interface SearchComponent {
    components: TumulusComponents

}

export interface ThemeSelectComponent {
    components: TumulusComponents
    load: Function
    collapse: Function
}

export interface FeatureResultComponent {
    updateFeature: Function
    loadFeature: Function
    unloadFeature: Function
    isLoaded: Function
}

export interface FeatureEditorComponent {
    components: TumulusComponents
    loadFeature: Function
    unloadFeature: Function
    isLoaded: Function
}

export interface PlantNetAssistantComponent {
    components: TumulusComponents
    loadFeature: Function
    unloadFeature: Function
    updatedThemes: Function
}

export interface OSMConnectorComponent {
    components: TumulusComponents
    connected: boolean
    addEditedFeature: Function
}

export interface CommentDialogComponent {
    components: TumulusComponents
    show: Function
}

export interface EditorLogComponent {
    clear: Function
    add: Function
    addInline: Function
}

export interface ThanksComponent {
    changeset: string
}

export interface IssueAnalyzerComponent {
    components: TumulusComponents
    setEditedKeys: Function
    clear: Function
    analyzeFeature: Function
}
