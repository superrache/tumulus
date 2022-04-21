export function detect(feature, theme) {
    const props = feature.properties
    const issues = []

    if(props['ref:mhs'] && !props['heritage:operator']) {
        issues.push({
            feature: feature,
            theme: theme,
            importance: 1,
            message: 'ref:mhs sans heritage:operator=mhs',
            autoRepair: async () => {
                feature.properties['heritage:operator'] = 'mhs'
                return feature
            }
        })
    }

    if(props['ref:mhs'] && !props['heritage']) {
        issues.push({
            feature: feature,
            theme: theme,
            importance: 0,
            message: 'ref:mhs sans heritage=2 (classé monument historique) heritage=3 (inscrit monument historique)'
        })
    }

    if(props['ref:mhs'] && !props['mhs:inscription']) {
        issues.push({
            feature: feature,
            theme: theme,
            importance: 0,
            message: 'ref:mhs sans date mhs:inscription'
        })
    }

    if(props['mhs:inscription'] && !props['ref:mhs']) {
        issues.push({
            feature: feature,
            theme: theme,
            importance: 0,
            message: 'mhs:inscription sans ref:mhs'
        })
    }

    return issues
}
