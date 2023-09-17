export function detect(feature, theme) {
    const props = feature.properties
    const issues = []

    if('tourism' in props && props['tourism'] === 'artwork') {
        let invaderRef = ''
        if('ref' in props && props['ref'].startsWith('PA')) {
            invaderRef = props['ref']
        }
        if('name' in props && props['name'].startsWith('PA')) {
            invaderRef = props['name']
        }
        invaderRef = 'PA_' + invaderRef.replace('-', '_').split('PA')[1]
        
        if(invaderRef.length > 0) {
            issues.push({
                feature: feature,
                theme: theme,
                importance: 2,
                message: `Invader mosaic`,
                autoRepair: async () => {
                    feature.properties['artist_name'] = 'Invader'
                    feature.properties['artist:wikidata'] = 'Q1671666'
                    feature.properties['artist:wikipedia'] = 'fr:Invader_(artiste)'
                    feature.properties['artwork_type'] = 'mosaic'
                    feature.properties['ref'] = invaderRef // ref in all case, by name could be different
                    if('name' in feature.properties && feature.properties['name'].startsWith('PA')) feature.properties['name'] = invaderRef
                    return {feature: feature, message: 'Tags invader ajoutés'}
                },
                repairedIfEdited: 'artist_name'
            })
        }
    }

    return issues
}
