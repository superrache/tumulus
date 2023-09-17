export function getServerUrl() {
    let url = window.location.origin
    
    if(url.indexOf('herokuapp.com') > 0) { // FIXME: replace when have a domain
        return url
    } else {
        return url.replace(':8080', ':3000')
    }
}
