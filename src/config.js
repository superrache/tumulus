export const appName = "tumulus"

export const DEBUG = true

export const startingZoom = 14
export const startingPosition = [-2.90024, 47.56926]
export const startingBasemap = 'bdortho'

export const nominatimInstance = 'https://nominatim.openstreetmap.org'

export const osmApiDebug = {
  instance: 'https://master.apis.dev.openstreetmap.org',
  oauthConsumerKey: 'J0kI4dFGwwWfEk3GRj8KRat3bnalmFvKRp95av2Y',
  oauthSecret: '4TYpKych3loXgv6eO5ACvo7PRA490NCjjatCjOb2'
}

export const osmApiProd = {
  instance: 'https://www.openstreetmap.org',
  oauthConsumerKey: 'bTmTD4dsTPCymICqf9uMbr6XxaqiNJaprTruAzdy',
  oauthSecret: 'qgXfV5WWqGNOZwZfUB2Ngf2e3d6VlFQ0x4CwktvK'
}

export const queries = {
  historic: {
    filter: '"historic"',
    label: "Eléments d'intérêt historique",
    bounds: '',
    cache: {},
    needed: false,
    loading: false
  },
  artwork: {
    filter: '"tourism"="artwork"',
    label: "Oeuvres d'art",
    bounds: '',
    cache: {},
    needed: false,
    loading: false
  },
  railway: {
    filter: '"railway"="abandoned"',
    label: 'Ferroviaire',
    bounds: '',
    cache: {},
    needed: false,
    loading: false
  }
}

export const themes = {
    memorial: {
      id: "memorial",
      label: "Mémorial",
      color: "DarkGoldenRod",
      query: 'historic',
      key: 'historic',
      values: ['memorial', 'highwater_mark'],
      icon: 'memorial',
      visible: false
    },
    archeo: {
      id: "archeo",
      label: "Site archéologique",
      color: "green",
      query: 'historic',
      key: 'historic',
      values: ['archaeological_site'],
      icon: 'archeo',
      visible: true
    },
    monument: {
      id: "monument",
      label: "Monument historique",
      color: 'royalblue',
      query: 'historic',
      key: 'historic',
      values: ['aqueduct', 'building', 'castle', 'creamery', 'farm', 'manor', 'monument', 'optical_telegraph', 'pillory', 'ruins', 'tomb', 'tower'],
      icon: 'monument',
      visible: true
    },
    military: {
      id: 'military',
      label: "Equipement militaire",
      color: "DarkOliveGreen",
      query: 'historic',
      key: 'historic',
      values: ['battlefield', 'bomb_crater', 'cannon', 'castle_wall', 'citywalls', 'fort', 'pa', 'tank'],
      icon: 'military',
      visible: false
    },
    transport: {
      id: 'transport',
      label: "Transport",
      color: "orangered",
      query: 'historic',
      key: 'historic',
      values: ['aircraft', 'locomotive', 'milestone', 'railway_car', 'ship', 'vehicle', 'wreck'],
      icon: 'transport',
      visible: false
    },
    shrine: {
      id: "shrine",
      label: "Element religieux",
      color: "blueviolet",
      query: 'historic',
      key: 'historic',
      values: ['wayside_cross', 'wayside_shrine', 'church', 'monastery', 'rune_stone'],
      icon: 'shrine',
      visible: false
    },
    other: {
      id: "other",
      label: "Autres",
      color: "steelblue",
      query: 'historic',
      key: 'historic',
      values: ['yes', 'stone'],
      icon: 'other',
      visible: false
    },
    artwork: {
      id: "artwork",
      label: "Oeuvre d'art",
      color: "crimson",
      query: 'artwork',
      key: 'tourism',
      values: ['artwork'],
      icon: 'artwork',
      visible: true
    },
    railway: {
      id: 'railway',
      label: 'Ferroviaire',
      color: 'fuchsia',
      query: 'railway',
      key: 'railway',
      values: ['abandoned'],
      icon: 'railway',
      visible: true
    }
  }
