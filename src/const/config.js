export const appName = "tumulus"

export const DEBUG = process.env.NODE_ENV !== 'production'

export const reloadOnMove = false

export const startingZoom = 14
export const startingPosition = [2.31903, 48.85968]
export const startingBasemap = 'default'

export const nominatimInstance = 'https://nominatim.openstreetmap.org'

export const tagInfoInstance = 'https://taginfo.openstreetmap.org'

export const osmApiDebug = {
  instance: 'https://master.apis.dev.openstreetmap.org',
  oauthConsumerKey: 'J0kI4dFGwwWfEk3GRj8KRat3bnalmFvKRp95av2Y',
  oauthSecret: '4TYpKych3loXgv6eO5ACvo7PRA490NCjjatCjOb2',
  nodeIdToEdit: 'node/4330823815' // overpass renvoyant des données openstreetmap.org, les id ne correspondent pas avec master.apis.dev...
}

export const osmApiProd = {
  instance: 'https://www.openstreetmap.org',
  oauthConsumerKey: 'bTmTD4dsTPCymICqf9uMbr6XxaqiNJaprTruAzdy',
  oauthSecret: 'qgXfV5WWqGNOZwZfUB2Ngf2e3d6VlFQ0x4CwktvK'
}

export const osmApi = osmApiProd
