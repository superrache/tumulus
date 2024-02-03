import type { Feature, Theme } from "@/types/common"

export function detect(feature: Feature, theme: Theme) {
    const props = feature.properties
    const issues = []

    if(feature.geometry.type === 'Point') { // invaders are points
        const coords = feature.geometry.coordinates
        if(coords[0] > 2.2048 && coords[0] < 2.4747 && coords[1] > 48.7944 && coords[1] < 48.9202) { // Paris
            if('tourism' in props && props['tourism'] === 'artwork') {
                let invaderRef = ''
                if('ref' in props && props['ref'].startsWith('PA')) {
                    invaderRef = props['ref']
                }
                if('name' in props && props['name'].startsWith('PA')) {
                    invaderRef = props['name']
                }
                
                if(invaderRef.length > 0) {
                    // format ref PA_XXXXX
                    invaderRef = 'PA_' + invaderRef.split('PA')[1].replace('-', '').replace('_', '')
                    issues.push({
                        feature: feature,
                        theme: theme,
                        importance: 0,
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
        }
    }

    return issues
}
