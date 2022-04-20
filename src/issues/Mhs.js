export function detect(feature, theme) {
    const props = feature.properties
    const issues = []

    for(let key in props) {
        if(key['ref:mhs'] && !key['heritage:operator']) {
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

        if(key['ref:mhs'] && !key['heritage']) {
            issues.push({
                feature: feature,
                theme: theme,
                importance: 0,
                message: 'ref:mhs sans heritage=2 (classé monument historique) heritage=3 (inscrit monument historique)'
            })
        }

        if(key['ref:mhs'] && !key['mhs:inscription']) {
            issues.push({
                feature: feature,
                theme: theme,
                importance: 0,
                message: 'ref:mhs sans date mhs:inscription'
            })
        }

        if(key['mhs:inscription'] && !key['ref:mhs']) {
            issues.push({
                feature: feature,
                theme: theme,
                importance: 0,
                message: 'mhs:inscription sans ref:mhs'
            })
        }

    }

    return issues
}
