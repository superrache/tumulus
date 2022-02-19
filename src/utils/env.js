export function getServerUrl() {
    let url = window.location.origin
    
    if(url.indexOf('herokuapp.com') > 0) {
        return url
    } else {
        return url.replace(':8080', ':3000')
    }
}
