export const appName = "tumulus"

export const style = 'https://api.jawg.io/styles/77df562c-113e-451b-bc77-1634aedeee25.json?access-token=UG9wQV1RcEgsXwkTX9M9qfBUV0ZckAfUhlqa3W4hK16gVbTFDUSMXrn60H1hEE6d'

export const startingZoom = 15
export const startingPosition = [-1.27846, 47.15959]
export const nominatimInstance = 'https://nominatim.openstreetmap.org'

export const queries = {
  historic: {
    filter: '"historic"',
    label: 'Eléments d\'intérêt historique',
    bounds: '',
    cache: {},
    needed: false,
    loading: false
  },
  artwork: {
    filter: '"tourism"="artwork"',
    label: 'Oeuvres d\'art',
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
      values: ['memorial', 'highwater_mark']
    },
    archeo: {
      id: "archeo",
      label: "Site archéologique",
      color: "green",
      query: 'historic',
      key: 'historic',
      values: ['archaeological_site'],
      visible: true
    },
    monument: {
      id: "monument",
      label: "Monument historique",
      color: 'royalblue',
      query: 'historic',
      key: 'historic',
      values: ['aqueduct', 'building', 'creamery', 'farm', 'manor', 'monument', 'optical_telegraph', 'pillory', 'ruins', 'tomb', 'tower'],
      visible: true
    },
    military: {
      id: 'military',
      label: "Equipement militaire",
      color: "DarkOliveGreen",
      query: 'historic',
      key: 'historic',
      values: ['battlefield', 'bomb_crater', 'cannon', 'castle', 'castle_wall', 'citywalls', 'fort', 'pa', 'tank'],
      visible: true
    },
    transport: {
      id: 'transport',
      label: "Transport",
      color: "orangered",
      query: 'historic',
      key: 'historic',
      values: ['aircraft', 'locomotive', 'milestone', 'railway_car', 'ship', 'vehicle', 'wreck'],
      visible: true
    },
    shrine: {
      id: "shrine",
      label: "Element religieux",
      color: "blueviolet",
      query: 'historic',
      key: 'historic',
      values: ['wayside_cross', 'wayside_shrine', 'church', 'monastery', 'rune_stone'],
      visible: true
    },
    other: {
      id: "other",
      label: "Autres",
      color: "steelblue",
      query: 'historic',
      key: 'historic',
      values: ['yes'],
      visible: true
    },
    artwork: {
      id: "artwork",
      label: "Oeuvre d'art",
      color: "crimson",
      query: 'artwork',
      key: 'tourism',
      values: ['artwork'],
      visible: true
    },
    railway: {
      id: 'railway',
      label: 'Ferroviaire',
      color: 'fuchsia',
      query: 'railway',
      key: 'railway',
      values: ['abandoned'],
      visible: true
    }
  }