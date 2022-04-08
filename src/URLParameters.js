//import * as config from './config.js'

export function applyURLParameters(map) {
    console.log(window.location.href)
    let parts = window.location.hash.split('?')
    if(parts.length > 1) {
        console.log(`applying parameters ${parts[1]}`)
        let params = parts[1].split('&')
        if(params.length > 0) {
            for(let param of params) {
                let kv = param.split('=')
                if(kv.length === 2) {
                    switch(kv[0]) {
                        case 'themes': {
                            let themesParam = kv[1].split(',')
                            for(let t in map.themes) {
                                let theme = map.themes[t]
                                theme.visible = themesParam.indexOf(t) > -1
                            }
                            break;
                        }
                        case 'id': {
                            map.pendingSelectedFeatureId = decodeURIComponent(kv[1])
                            break;
                        }
                        case 'basemap': {
                            map.pendingBasemapId = kv[1]
                            break;
                        }
                        default:
                            break;
                    }
                }
            }
        }
    }
}

export function updateAppUrl(map) {
    let params = 'themes=' + map.themesSelection 
        + (map.selectedFeatureId !== null ? '&id=' + encodeURIComponent(map.selectedFeatureId) : '')
        + (map.basemapSelect.currentBasemapId !== null ? '&basemap=' + map.basemapSelect.currentBasemapId : '')
    let mapHash = window.location.hash.split('?')[0].split('&')[0]
    window.location.hash = `${mapHash}?${params}`
}
