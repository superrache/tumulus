export function detect(feature, theme) {
    const props = feature.properties
    const issues = []

    if(props.historic && props.historic === 'monument') {
        if(!props.heritage) {
            issues.push({
                feature: feature,
                theme: theme,
                importance: 1,
                message: 'historic=monument sans la série d\'attributs heritage:*'
            })
        }
    }

    return issues
}
