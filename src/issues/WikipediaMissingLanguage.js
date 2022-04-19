import {wikipediaApi} from '../utils/WikiApi.js'

export function detect(feature) {
    const props = feature.properties
    const issues = []

    for(let wikipediaTagName in props) {
        if(wikipediaTagName.indexOf('wikipedia') > 0) {
            if(props[wikipediaTagName].indexOf(':') < 0) {
                issues.push({
                    feature: feature,
                    importance: 2,
                    message: `Langue manquante dans la référence ${wikipediaTagName}=${props[wikipediaTagName]}`,
                    autoRepair: async () => {
                        const wikipediaValue = feature.lang + ':' + feature.properties[wikipediaTagName]
                        const data = await wikipediaApi(wikipediaValue)
                        if(data !== null) {
                            feature.properties[wikipediaTagName] = wikipediaValue
                            console.log(`[REPAIRED] added lang ${wikipediaTagName}=${wikipediaValue}`)
                            return feature
                        } else {
                            return null
                        }
                    }
                })
            }
        }
    }

    return issues
}
