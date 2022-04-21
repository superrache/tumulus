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
                return {feature: feature, message: 'Ajout du tag heritage:operator=mhs'}
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

    if(props['ref:mhs'] && !props['mhs:inscription_date']) {
        issues.push({
            feature: feature,
            theme: theme,
            importance: 0,
            message: 'ref:mhs sans date mhs:inscription_date'
        })
    }

    if(props['mhs:inscription_date'] && !props['ref:mhs']) {
        issues.push({
            feature: feature,
            theme: theme,
            importance: 0,
            message: 'mhs:inscription_date sans ref:mhs'
        })
    }

    return issues
}
