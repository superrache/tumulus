import {wikidataApi} from '../utils/WikiApi'

import type { Feature, Theme } from "@/types/common"

export function detect(feature: Feature, theme: Theme) {
    const props = feature.properties
    const issues = []

    for(const wikidataTagName in props) {
        if(wikidataTagName.indexOf('wikidata') > -1) {
            let wikipediaTagName = 'wikipedia'
            const s = wikidataTagName.split(':')
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
                                feature.properties[wikipediaTagName] = feature.lang + ':' + data.entities[wikidataValue].sitelinks[feature.lang + 'wiki'].title
                                return {feature: feature, message: `Ajout du tag ${wikipediaTagName}=${feature.properties[wikipediaTagName]} relatif à ${wikidataTagName}=${wikidataValue}`}
                            }
                        }
                        return null
                    },
                    repairedIfEdited: `${wikipediaTagName}`
                })
            }
        }
    }

    return issues
}
