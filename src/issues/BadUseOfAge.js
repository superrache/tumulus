export function detect(feature, theme) {
    const props = feature.properties
    const issues = []

    if(props['age'] !== undefined && props['start_date'] === undefined) {
        issues.push({
            feature: feature,
            theme: theme,
            importance: 2,
            message: 'Attribut age peut-être mal utilisé (à remplacer par start_date)',
            autoRepair: async () => {
                feature.properties['start_date'] = feature.properties.age
                return feature
            }
        })
    }

    return issues
}
