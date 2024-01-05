export const queries = {
    historic: {
      filters: ['["historic"]', '["heritage"][!"historic"]'],
      label: "queryHistoric",
      bounds: '',
      cache: {},
      needed: false,
      loading: false
    },
    artwork: {
      filters: ['["tourism"="artwork"]'],
      label: "queryArtwork",
      bounds: '',
      cache: {},
      needed: false,
      loading: false
    },
    railway: {
      filters: ['["railway"="abandoned"]'],
      label: 'queryRailway',
      bounds: '',
      cache: {},
      needed: false,
      loading: false
    },
    plant: {
      filters: ['["natural"~"shrub|tree"]["species"]'],
      label: "queryPlant",
      bounds: '',
      cache: {},
      needed: false,
      loading: false
    }
  }
  
  export const themes = {
      archeo: {
        id: "archeo",
        label: "themeArcheo",
        color: "#6FB1A0",
        query: 'historic',
        key: 'historic',
        values: ['archaeological_site'],
        icon: 'archeo',
        visible: true
      },
      military: {
        id: 'military',
        label: "themeMilitary",
        color: "#15A2A2",
        query: 'historic',
        key: 'historic',
        values: ['battlefield', 'bomb_crater', 'cannon', 'castle_wall', 'citywalls', 'fort', 'pa', 'tank'],
        icon: 'military',
        visible: false
      },
      monument: {
        id: "monument",
        label: "themeMonument",
        color: '#1184A7',
        query: 'historic',
        key: 'historic',
        values: ['!', 'aqueduct', 'building', 'castle', 'creamery', 'farm', 'manor', 'monument', 'optical_telegraph', 'pillory', 'ruins', 'tomb', 'tower'],
        icon: 'monument',
        visible: true
      },
      transport: {
        id: 'transport',
        label: "themeTransport",
        color: "#046DC8",
        query: 'historic',
        key: 'historic',
        values: ['aircraft', 'locomotive', 'milestone', 'railway_car', 'railway_station', 'ship', 'vehicle', 'wreck'],
        icon: 'transport',
        visible: false
      },
      railway: {
        id: 'railway',
        label: 'themeRailway',
        color: '#0450B4',
        query: 'railway',
        key: 'railway',
        values: ['abandoned'],
        icon: 'railway',
        visible: true
      },
      memorial: {
        id: "memorial",
        label: "themeMemorial",
        color: "#FEA802",
        query: 'historic',
        key: 'historic',
        values: ['memorial', 'highwater_mark'],
        icon: 'memorial',
        visible: false
      },
      shrine: {
        id: "shrine",
        label: "themeShrine",
        color: "#B4418E",
        query: 'historic',
        key: 'historic',
        values: ['wayside_cross', 'wayside_shrine', 'church', 'monastery', 'rune_stone'],
        icon: 'shrine',
        visible: false
      },
      other: {
        id: "other",
        label: "themeOther",
        color: "#D94A8C",
        query: 'historic',
        key: 'historic',
        values: ['yes', 'stone'],
        icon: 'other',
        visible: false
      },
      artwork: {
        id: "artwork",
        label: "themeArtwork",
        color: "#EA515F",
        query: 'artwork',
        key: 'tourism',
        values: ['artwork'],
        icon: 'artwork',
        visible: true
      },
      plant: {
        id: "plant",
        label: "themePlant",
        color: "#33cc33",
        query: 'plant',
        key: 'natural',
        values: ['plant', 'tree'],
        icon: 'plant',
        visible: true
      }
    }
  