import * as config from '../const/config.js'

export async function search(q) {
    const url = config.nominatimInstance + '/search.php?format=jsonv2&q=' + encodeURIComponent(q)
    const response = await fetch(url)
    return await response.json()
}

export async function getCountryCode(lngLat) {
    const response = await fetch(`${config.nominatimInstance}/reverse?format=jsonv2&lon=${lngLat.lng}&lat=${lngLat.lat}&zoom=3`) // 3=country
    const json = await response.json()
    if(json.address && json.address.country_code) return json.address.country_code
    return null
}