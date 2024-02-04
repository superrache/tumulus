import * as env from './env'

export async function wikipediaApi(wikipediaPage: string): Promise<any> {
    const s = wikipediaPage.split(':')
    if(s.length > 1) {
        let lang = s[0]
        let pageTitle = s[1].split('?')[0].split('#')[0]
        let response = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`)
        if(response.status === 200) {
            return await response.json()
        } else {
            return null
        }
    } else {
        return null
    }
}

export async function wikidataApi(wikibaseItem: string): Promise<any> {
    let response = await fetch(`${env.getServerUrl()}/wikidata?q=${wikibaseItem}`)
    return await response.json()
}