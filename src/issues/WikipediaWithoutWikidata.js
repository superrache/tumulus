import {wikipediaApi} from '../utils/WikiApi.js'

export function detect(feature, theme) {
    const props = feature.properties
    const issues = []

    for(let wikipediaTagName in props) {
        if(wikipediaTagName.indexOf('wikipedia') > -1) {
            let wikidataTagName = 'wikidata'
            let s = wikipediaTagName.split(':')
            if(s.length == 2) {
                wikidataTagName = `${s[0]}:wikidata`
            }

            if(props[wikidataTagName] === undefined) {
                issues.push({
                    feature: feature,
                    theme: theme,
                    importance: 1,
                    message: `Référence ${wikipediaTagName} sans référence ${wikidataTagName}`,
                    autoRepair: async () => {
                        const wikipediaValue = feature.properties[wikipediaTagName]
                        const data = await wikipediaApi(wikipediaValue)
                        if(data !== null && data.wikibase_item !== undefined) {
                            feature.properties[wikidataTagName] = data.wikibase_item
                            return {feature: feature, message: `Ajout du tag ${wikidataTagName}=${data.wikibase_item} relatif à ${wikipediaTagName}=${wikipediaValue}`}
                        } else {
                            return null
                        }
                    },
                    repairedIfEdited: `${wikidataTagName}`
                })
            }
        }
    }

    return issues
}
