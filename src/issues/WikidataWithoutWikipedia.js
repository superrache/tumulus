import {wikidataApi} from '../utils/WikiApi.js'

export function detect(feature, theme) {
    const props = feature.properties
    const issues = []

    for(let wikidataTagName in props) {
        if(wikidataTagName.indexOf('wikidata') > 0) {
            let wikipediaTagName = 'wikipedia'
            let s = wikidataTagName.split(':')
            if(s.length == 2) {
                wikipediaTagName = `${s[0]}:wikipedia`
            }

            if(props[wikipediaTagName] === undefined) {
                issues.push({
                    feature: feature,
                    theme: theme,
                    importance: 1,
                    message: `Référence ${wikidataTagName} sans référence ${wikipediaTagName}`,
                    autoRepair: async () => {
                        const wikidataValue = feature.properties[wikidataTagName]
                        const data = await wikidataApi(wikidataValue)
                        if(data !== null && data.entities !== undefined && data.entities[wikidataValue] !== undefined && data.entities[wikidataValue].sitelinks !== undefined) {
                            if(data.entities[wikidataValue].sitelinks[feature.lang + 'wiki'] !== undefined) { 
                                feature.properties[wikipediaTagName] = feature.lang + ':' + data.entities[wikidataValue].sitelinks[feature.lang + 'wiki'].title.replace(/ /g, '_')
                                console.log(`[REPAIRED] add wikipedia for ${wikidataTagName}=${wikidataValue} => ${wikipediaTagName}=${feature.properties[wikipediaTagName]}`)
                                return feature
                            }
                        }
                        return null
                    }
                })
            }
        }
    }

    return issues
}
