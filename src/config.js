export const appName = "tumulus"

export const DEBUG = true

export const style = 'https://api.jawg.io/styles/77df562c-113e-451b-bc77-1634aedeee25.json?access-token=UG9wQV1RcEgsXwkTX9M9qfBUV0ZckAfUhlqa3W4hK16gVbTFDUSMXrn60H1hEE6d'

export const startingZoom = 16.5
export const startingPosition = [-1.55468, 47.21853]

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
      visible: true
    },
    archeo: {
      id: "archeo",
      label: "Site archéologique",
      color: "green",
      query: 'historic',
      key: 'historic',
      values: ['archaeological_site'],
      visible: false
    },
    monument: {
      id: "monument",
      label: "Monument historique",
      color: 'royalblue',
      query: 'historic',
      key: 'historic',
      values: ['aqueduct', 'building', 'castle', 'creamery', 'farm', 'manor', 'monument', 'optical_telegraph', 'pillory', 'ruins', 'tomb', 'tower'],
      visible: false
    },
    military: {
      id: 'military',
      label: "Equipement militaire",
      color: "DarkOliveGreen",
      query: 'historic',
      key: 'historic',
      values: ['battlefield', 'bomb_crater', 'cannon', 'castle_wall', 'citywalls', 'fort', 'pa', 'tank'],
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
      visible: false
    },
    other: {
      id: "other",
      label: "Autres",
      color: "steelblue",
      query: 'historic',
      key: 'historic',
      values: ['yes'],
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
      visible: false
    },
    railway: {
      id: 'railway',
      label: 'Ferroviaire',
      color: 'fuchsia',
      query: 'railway',
      key: 'railway',
      values: ['abandoned'],
      icon: 'railway',
      visible: false
    }
  }

export const historicTypes = {
    'yes': 'intérêt historique',
    'aircraft': 'Aéronef',
    'aqueduct': 'Aqueduc',
    'archaeological_site': 'Site archéologique',
    'battlefield': 'Champ de bataille',
    'bomb_crater': 'Cratère de bombe',
    'building': 'Bâtiment',
    'cannon': 'Canon',
    'castle': 'Château',
    'castle_wall': 'Mur défensif',
    'charcoal_pile': 'Tas de charbon',
    'church': 'Etablissement religieux',
    'city_gate': 'Porte de ville',
    'citywalls': 'Muraille',
    'farm': 'Ferme',
    'fort': 'Fort militaire',
    'gallows': 'Potence',
    'highwater_mark': 'Repère de crue',
    'locomotive': 'Locomotive',
    'manor': 'Manoir',
    'memorial': 'Mémorial',
    'mine': 'Mine',
    'mine_shaft': 'Mine',
    'milestone': 'Borne routière',
    'monastery': 'Monastère',
    'monument': 'Monument',
    'optical_telegraph': 'Télégraphe optique par sémaphore',
    'pillory': 'Pilori',
    'railway_car': 'Wagon',
    'railway_station': 'Gare ferroviaire',
    'ruins': 'Ruines',
    'rune_store': 'Pierre runique',
    'ship': 'Bateau ou sous-marin',
    'stone': 'Pierre',
    'tank': 'Tank',
    'tomb': 'Tombe',
    'tower': 'Tour',
    'vehicle': 'Véhicule',
    'wayside_cross': 'Croix ou calvaire',
    'wayside_shrine': 'Oratoire',
    'wreck': 'Epave'
  }

export const memorialTypes = {
    'plaque': 'Plaque commémorative',
    'war_memorial': 'Mémorial de guerre',
    'statue': 'Statue',
    'bust': 'Buste',
    'stele': 'Stèle',
    'stone': 'Pierre'
  }

export const artworkTypes = {
    'architecture': 'Bâtiment remarquable',
    'mural': 'Oeuvre d\'art mural',
    'mural_painting': 'Peinture murale',
    'painting': 'Peinture',
    'sculpture': 'Sculpture',
    'statue': 'Statue',
    'bust': 'Buste',
    'stone': 'Rocher',
    'installation': 'Installation artistique',
    'graffiti': 'Graffiti',
    'tilework': 'Carrelage',
    'mosaic': 'Mosaïc',
    'azulejo': 'Azulejo',
    'land_art': 'Land art',
    'landart': 'Land art',
    'streetart': 'Streetart',
    'street_art': 'Streetart',
    'fountain': 'Fontaine',
    'column': 'Colonne',
    'stele': 'Stèle'
  }

export const railwayTypes = {
  'abandoned': 'Ancienne voie ferrée'
  }