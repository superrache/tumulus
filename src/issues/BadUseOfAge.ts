import type { Feature, Issue, Theme } from "@/types/common"

export function detect(feature: Feature, theme: Theme): Issue[] {
    const props = feature.properties
    const issues = [] as Issue[]

    if(props['age'] !== undefined && props['start_date'] === undefined) {
        issues.push({
            feature: feature,
            theme: theme,
            importance: 2,
            message: 'Attribut age peut-être mal utilisé (à remplacer par start_date)',
            autoRepair: async () => {
                feature.properties['start_date'] = feature.properties.age
                delete feature.properties.age
                return {feature: feature, message: 'Tag age remplacé par start_date'}
            },
            repairedIfEdited: 'age'
        })
    }

    return issues
}
