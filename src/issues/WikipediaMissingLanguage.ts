import {wikipediaApi} from '../utils/WikiApi'

import type { Feature, Issue, Theme } from "@/types/common"

export function detect(feature: Feature, theme: Theme): Issue[] {
    const props = feature.properties
    const issues = [] as Issue[]

    for(const wikipediaTagName in props) {
        if(wikipediaTagName.indexOf('wikipedia') > -1) {
            if(props[wikipediaTagName].indexOf(':') < 0) {
                issues.push({
                    feature: feature,
                    theme: theme,
                    importance: 2,
                    message: `Langue manquante dans la référence ${wikipediaTagName}=${props[wikipediaTagName]}`,
                    autoRepair: async () => {
                        const wikipediaValue = feature.lang + ':' + feature.properties[wikipediaTagName]
                        const data = await wikipediaApi(wikipediaValue)
                        if(data !== null) {
                            feature.properties[wikipediaTagName] = wikipediaValue
                            return {feature: feature, message: `Ajout de la langue dans la référence wikipedia : ${wikipediaTagName}=${wikipediaValue}`}
                        } else {
                            return null
                        }
                    },
                    repairedIfEdited: `${wikipediaTagName}`
                })
            }
        }
    }

    return issues
}
