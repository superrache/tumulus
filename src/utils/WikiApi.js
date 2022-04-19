export async function wikipediaApi(wikipediaPage) {
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

export async function wikidataApi(wikibaseItem) {
    let response = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&props=sitelinks/urls&ids=${wikibaseItem}&format=json`)
    return await response.json()
}