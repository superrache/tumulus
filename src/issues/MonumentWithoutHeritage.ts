import type { Feature, Issue, Theme } from "@/types/common"

export function detect(feature: Feature, theme: Theme): Issue[] {
    const props = feature.properties
    const issues = [] as Issue[]

    if(props.historic && props.historic === 'monument') {
        if(!props.heritage) {
            issues.push({
                feature: feature,
                theme: theme,
                importance: 1,
                message: 'historic=monument sans la série d\'attributs heritage:*',
                repairedIfEdited: 'heritage'
            })
        }
    }

    return issues
}
