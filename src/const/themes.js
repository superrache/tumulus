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
      archeo: {
        id: "archeo",
        label: "Site archéologique",
        color: "#6FB1A0",
        query: 'historic',
        key: 'historic',
        values: ['archaeological_site'],
        icon: 'archeo',
        visible: true
      },
      military: {
        id: 'military',
        label: "Equipement militaire",
        color: "#15A2A2",
        query: 'historic',
        key: 'historic',
        values: ['battlefield', 'bomb_crater', 'cannon', 'castle_wall', 'citywalls', 'fort', 'pa', 'tank'],
        icon: 'military',
        visible: false
      },
      monument: {
        id: "monument",
        label: "Monument historique",
        color: '#1184A7',
        query: 'historic',
        key: 'historic',
        values: ['aqueduct', 'building', 'castle', 'creamery', 'farm', 'manor', 'monument', 'optical_telegraph', 'pillory', 'ruins', 'tomb', 'tower'],
        icon: 'monument',
        visible: true
      },
      transport: {
        id: 'transport',
        label: "Transport",
        color: "#046DC8",
        query: 'historic',
        key: 'historic',
        values: ['aircraft', 'locomotive', 'milestone', 'railway_car', 'ship', 'vehicle', 'wreck'],
        icon: 'transport',
        visible: false
      },
      railway: {
        id: 'railway',
        label: 'Ferroviaire',
        color: '#0450B4',
        query: 'railway',
        key: 'railway',
        values: ['abandoned'],
        icon: 'railway',
        visible: true
      },
      memorial: {
        id: "memorial",
        label: "Mémorial",
        color: "#FEA802",
        query: 'historic',
        key: 'historic',
        values: ['memorial', 'highwater_mark'],
        icon: 'memorial',
        visible: false
      },
      shrine: {
        id: "shrine",
        label: "Element religieux",
        color: "#B4418E",
        query: 'historic',
        key: 'historic',
        values: ['wayside_cross', 'wayside_shrine', 'church', 'monastery', 'rune_stone'],
        icon: 'shrine',
        visible: false
      },
      other: {
        id: "other",
        label: "Autres",
        color: "#D94A8C",
        query: 'historic',
        key: 'historic',
        values: ['yes', 'stone'],
        icon: 'other',
        visible: false
      },
      artwork: {
        id: "artwork",
        label: "Oeuvre d'art",
        color: "#EA515F",
        query: 'artwork',
        key: 'tourism',
        values: ['artwork'],
        icon: 'artwork',
        visible: true
      }
    }
  