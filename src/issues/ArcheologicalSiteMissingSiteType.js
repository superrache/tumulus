export function detect(feature) {
    const props = feature.properties
    const issues = []

    if(props['historic'] === 'archaeological_site' && props['site_type'] === undefined) {
        issues.push({
            feature: feature,
            importance: 0,
            message: 'Attribut site_type manquant pour le site archéologique'
        })
    }

    return issues
}
