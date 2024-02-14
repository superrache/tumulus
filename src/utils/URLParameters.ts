import type { TumulusMapComponent } from '@/types/components'
import * as config from '../const/config'
import * as utils from './utils'

export function applyURLParameters(map: TumulusMapComponent) {
    const parts = window.location.search.split('?')
    if(parts.length > 1) {
        console.log(`applying parameters ${parts[1]}`)
        const params = parts[1].split('&')
        if(params.length > 0) {
            for(const param of params) {
                const kv = param.split('=')
                if(kv.length === 2) {
                    const key = kv[0], value = kv[1]
                    switch(key) {
                        case 'themes': {
                            const themesParam = value.split(',')
                            for(const t in map.themes) {
                                const theme = map.themes[t]
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
                            const comps = value.split(',')
                            if(comps.length >= 1) map.zoom = parseFloat(comps[0])
                            if(comps.length >= 2) map.center = [parseFloat(comps[2]), parseFloat(comps[1])]
                            if(comps.length >= 4) map.bearing = parseFloat(comps[3])
                            if(comps.length >= 5) map.pitch = parseFloat(comps[4])
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

export function updateAppUrl(map: TumulusMapComponent) {
    if (map.map) {
        const {lng, lat} = map.map.getCenter()
        const zoom = map.map.getZoom()
        const bearing = map.map.getBearing()
        const pitch = map.map.getPitch()
        let mapParam = `${utils.round6Digits(zoom)},${utils.round6Digits(lat)},${utils.round6Digits(lng)}`
        if(bearing !== 0 && pitch !== 0) mapParam += `,${utils.round6Digits(bearing)},${utils.round6Digits(pitch)}`
        else if(pitch !== 0) mapParam += `,0,${utils.round6Digits(pitch)}`
    
        const params = `themes=${map.themesSelection}${map.selectedFeatureId !== null ? '&id=' + encodeURIComponent(map.selectedFeatureId) : ''}${map.components.basemapSelect.currentBasemapId !== null ? '&basemap=' + map.components.basemapSelect.currentBasemapId : ''}&map=${mapParam}`
    
        window.history.pushState(config.appName, config.appName, '?' + params)
    }
}
