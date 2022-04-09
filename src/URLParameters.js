import * as config from './config.js'
import * as utils from './utils/utils.js'

export function applyURLParameters(map) {
    let parts = window.location.search.split('?')
    if(parts.length > 1) {
        console.log(`applying parameters ${parts[1]}`)
        let params = parts[1].split('&')
        if(params.length > 0) {
            for(let param of params) {
                let kv = param.split('=')
                if(kv.length === 2) {
                    let key = kv[0], value = kv[1]
                    switch(key) {
                        case 'themes': {
                            let themesParam = value.split(',')
                            for(let t in map.themes) {
                                let theme = map.themes[t]
                                theme.visible = themesParam.indexOf(t) > -1
                            }
                            break
                        }
                        case 'id': {
                            map.pendingSelectedFeatureId = decodeURIComponent(value)
                            break
                        }
                        case 'basemap': {
                            map.pendingBasemapId = value
                            break
                        }
                        case 'map': {
                            let comps = value.split(',')
                            if(comps.length >= 1) map.zoom = comps[0]
                            if(comps.length >= 2) map.center = [comps[2], comps[1]]
                            if(comps.length >= 4) map.bearing = comps[3]
                            if(comps.length >= 5) map.pitch = comps[4]
                            break
                        }
                        default:
                            break
                    }
                }
            }
        }
    }
}

export function updateAppUrl(map) {
    let {lng, lat} = map.map.getCenter()
    let zoom = map.map.getZoom()
    let bearing = map.map.getBearing()
    let pitch = map.map.getPitch()
    let mapParam = utils.round6Digits(zoom) + ',' + utils.round6Digits(lat) + ',' + utils.round6Digits(lng)
    if(bearing !== 0 && pitch !== 0) mapParam += ',' + utils.round6Digits(bearing) + ',' + utils.round6Digits(pitch)
    else if(pitch !== 0) mapParam += ',0,' + utils.round6Digits(pitch)

    let params = 'themes=' + map.themesSelection 
        + (map.selectedFeatureId !== null ? '&id=' + encodeURIComponent(map.selectedFeatureId) : '')
        + (map.basemapSelect.currentBasemapId !== null ? '&basemap=' + map.basemapSelect.currentBasemapId : '')
        + '&map=' + mapParam

    window.history.pushState(config.appName, config.appName, '?' + params)
}
