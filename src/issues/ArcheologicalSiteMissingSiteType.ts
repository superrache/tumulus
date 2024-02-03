import type { Feature, Theme } from "@/types/common"

export function detect(feature: Feature, theme: Theme) {
    const props = feature.properties
    const issues = []

    if(props['historic'] === 'archaeological_site' && !props['site_type']) {
        issues.push({
            feature: feature,
            theme: theme,
            importance: 0,
            message: 'Attribut site_type manquant pour le site archéologique',
            repairedIfEdited: 'site_type'
        })
    }

    return issues
}
