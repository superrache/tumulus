import {wikipediaApi} from '../utils/WikiApi.js'

export function detect(feature, theme) {
    const props = feature.properties
    const issues = []

    for(let wikipediaTagName in props) {
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
