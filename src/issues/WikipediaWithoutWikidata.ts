import {wikipediaApi} from '../utils/WikiApi'

import type { Feature, Issue, Theme } from "@/types/common"

export function detect(feature: Feature, theme: Theme): Issue[] {
    const props = feature.properties
    const issues = [] as Issue[]

    for(const wikipediaTagName in props) {
        if(wikipediaTagName.indexOf('wikipedia') > -1) {
            let wikidataTagName = 'wikidata'
            const s = wikipediaTagName.split(':')
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
