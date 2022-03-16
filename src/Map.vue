<template>
    <div id="map_container">
      <div id="map" ref="map"></div>

      <div id="loading" :style="{width: loading + '%'}"></div>

      <div id="zoomMore" v-show="dispZoomMore">Zoomez plus pour voir les données</div>

      <Panel id="panel" ref="panel" />
    </div>
</template>

<script>

import { Map, NavigationControl, GeolocateControl } from 'maplibre-gl'

import * as env from './utils/env.js'
import * as utils from './utils/utils.js'

import Panel from './Panel.vue'

const appName = "tumulus"

export default {
  name: 'Map',
  components: {
    Panel
  },
  data () {
    return {
      map: null,
      startingZoom: 13,
      currentZoom: 0,
      center: { lat: 48.09589, lng: -4.46101 },
      panel: null,
      loading: 0,
      selectedFeatureId: null,
      selectedLayerId: null,
      neededQueries: new Set(),
      queries: {
        historic: {
          filter: '"historic"',
          bounds: '',
          cache: {}
        },
        artwork: {
          filter: '"tourism"="artwork"',
          bounds: '',
          cache: {}
        }
      },
      themes: {
        memorial: {
          id: "memorial",
          label: "Mémorial",
          color: "orange",
          query: 'historic',
          key: 'historic',
          values: ['memorial', 'highwater_mark']
        },
        archeo: {
          id: "archeo",
          label: "Site archéologique",
          color: "blue",
          query: 'historic',
          key: 'historic',
          values: ['archaeological_site'],
          visible: true
        },
        monument: {
          id: "monument",
          label: "Monument historique",
          color: 'salmon',
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
          color: "green",
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
          color: "dodgerblue",
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
          visible: false
        }
      }
    }
  },
  computed: {
    dispZoomMore() {
      return this.currentZoom < 12
    }
  },
  created() {
    console.log(location.pathname)
    const params = location.pathname.split('/')
    if(params.length >= 4) {
      this.startingZoom = params[1]
      console.log(this.startingZoom)
      this.center = { lat: params[2], lng: params[3] }
    }
  },
  mounted() {
    this.panel = this.$refs.panel

    this.panel.themeSelect.map = this

    this.map = new Map({
      container: this.$refs.map,
      style: 'https://api.jawg.io/styles/3425c3c4-29a2-494c-a977-e9232dd8cf26.json?access-token=UG9wQV1RcEgsXwkTX9M9qfBUV0ZckAfUhlqa3W4hK16gVbTFDUSMXrn60H1hEE6d',
      center: [this.center.lng, this.center.lat],
      zoom: this.startingZoom
    })

    this.map.addControl(new NavigationControl(), 'top-right')

    this.map.addControl(
      new GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
    )

    /*this.map.loadImage('./img/memorial.png', (error, image) => {
      if(error) throw error
      this.map.addImage('megalith', image)
    })*/

    console.log('mounted ok')
    this.map.on('load', this.onMapLoad)
  },
  methods: {
    onMapLoad() {
      console.log('map loaded')
      this.reinitThemes()
      this.map.on('moveend', this.onMapMove)
    },
    removeLayerAndSource(id) {
      if(this.map.getLayer(id)) this.map.removeLayer(id)
      if(this.map.getSource(id)) this.map.removeSource(id)
    },
    reinitThemes() {
      var oldNeededQueries = new Set()
      this.neededQueries.forEach(function(q) {
        oldNeededQueries.add(q)
      })
      this.neededQueries.clear()

      for(var t in this.themes) {
        const theme = this.themes[t]
        console.log('Theme ' + theme.id + (theme.visible ? ' visible' : ' hidden'))

        // dans tous les cas, on supprime la couche et la source
        this.removeLayerAndSource(theme.id)

        if(theme.visible) {
          theme.dataCacheIds = new Set()
          this.neededQueries.add(theme.query)

          theme.geojson = {
            type: "FeatureCollection",
            features: []
          }

          theme.source = this.map.addSource(theme.id, {
            type: "geojson",
            data: theme.geojson
          })

          /*this.map.addLayer({
              id: geojsonLayerId,
              source: geojsonSourceId,
              interactive: true,
              type: 'symbol',
              layout: {
                'icon-allow-overlap': true,
                'icon-anchor': 'center',
                'icon-ignore-placement': false,
                'icon-image': 'megalith',
                'icon-size': 0.1
              }
          })*/

          theme.layer = this.map.addLayer({
            id: theme.id,
            source: theme.id,
            interactive: true,
            type: 'circle',
            paint: {
              'circle-color': theme.color,
              'circle-opacity': 1,
              'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 10, 8],
              'circle-stroke-color': ['case', ['boolean', ['feature-state', 'selected'], false], "#ffff00", "#ffffff"],
              'circle-stroke-width': 4
            },
            layout: {
              visibility: 'visible'
            }
          })

          this.map.on('mousemove', theme.id, (e) => {
              if(e.features.length > 0) {
                  this.map.getCanvas().style.cursor = "pointer" //crosshair
              }
          })

          this.map.on('mouseleave', theme.id, () => {
              this.map.getCanvas().style.cursor = ""
          })

          this.map.on('click', theme.id, (e) => {
              if(e.features.length > 0) {
                  this.onFeatureSelect(e.features[0], theme)
              } else { // TODO 'click' without layer
                this.unselectFeature()
                this.panel.featureResult.unloadFeature()
              }
          })
        }
      }
      
      this.panel.featureResult.unloadFeature()

      let areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value)) // TODO move in utils
      this.onMapMove(null, oldNeededQueries.size === 0 || !areSetsEqual(oldNeededQueries, this.neededQueries))
    },
    async onMapMove(e, launchQuery) {
      if(e !== null) launchQuery = true // vrai déplacement

      const {lng, lat} = this.map.getCenter()
      this.currentZoom = this.map.getZoom()
      window.history.pushState(appName, appName, "/" + utils.round6Digits(this.currentZoom) + "/" + utils.round6Digits(lat) + "/" + utils.round6Digits(lng))

      if(!this.dispZoomMore) {
        console.log('onMapMove launchQuery=' + launchQuery)
        const sw = this.map.getBounds()._sw
        const ne = this.map.getBounds()._ne
        const bounds = sw.lat + ',' + sw.lng + ',' + ne.lat + ',' + ne.lng

        this.loading = 20
        if(launchQuery !== undefined && launchQuery) {
          for(var q of this.neededQueries.values()) {
            var launch = this.queries[q].bounds !== bounds // ne refait la requête que si la carte a bougé
            while(launch) {
              console.log('launching query ' + q)
              const response = await fetch(env.getServerUrl() + "/data?bounds=" + bounds + "&filter=" + this.queries[q].filter)
              const data = await response.json()
              if(data.error === undefined) {
                this.queries[q].cache = data
                this.queries[q].bounds = bounds
                this.loading += 1 / this.neededQueries.size * 100 - 20
                launch = false
              } else {
                console.log('query error ' + data.error)
                this.loading += 5 
              }
            }
          }
        }

        for(var t in this.themes) {
          const theme = this.themes[t]
          if(theme.visible) {
            this.loadGeojson(theme, this.queries[theme.query].cache)
          }
        }

        this.loading = 0
      }
    },
    loadGeojson(theme, geojson) {
      if(geojson.features !== undefined) {
        console.log('loading ' + geojson.features.length + ' features to theme ' + theme.id)
        var added = 0
        // ajout des nouvelles données aux données déjà chargées (contrôle sur l'id osm)
        for(var f in geojson.features) {
          const feature = geojson.features[f]
          if(!theme.dataCacheIds.has(feature.id)) {
            if(theme.values.indexOf(feature.properties[theme.key]) > -1) {
              theme.dataCacheIds.add(feature.id)
              theme.geojson.features.push(feature)
              added++
            }
          }
        }
        this.map.getSource(theme.id).setData(theme.geojson)
        console.log('' + added + ' features added to theme ' + theme.id)
      }
    },
    onFeatureSelect(feature, theme) {
      this.selectFeature(feature)
      this.panel.featureResult.loadFeature(feature, theme)
    },
    selectFeature(feature) {
      this.unselectFeature(feature)
      this.selectedFeatureId = feature.id
      this.selectedLayerId = feature.layer.id
      console.log('select ' + feature.id)
      this.map.setFeatureState(
        { source: this.selectedLayerId, id: this.selectedFeatureId },
        { selected: true }
      )
    },
    unselectFeature() {
      if(this.selectedFeatureId !== null) {
        console.log('unselect ' + this.selectedFeatureId)
        this.map.setFeatureState(
          { source: this.selectedLayerId, id: this.selectedFeatureId },
          { selected: false }
        )
      }
      this.selectedFeatureId = null
    }

  }
}

</script>

<style scoped>

@import '~maplibre-gl/dist/maplibre-gl.css';

#map_container {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  overflow: hidden;
}

li {
  cursor: pointer;
}

a {
  color: #5eb793;
}

#map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

#loading {
  position: absolute;
  top: 0px;
  left: 0px;
  height: 5px;
  z-index: 1020;
  background-color: red;
}

#zoomMore {
  width:180px;
  text-align:center;
  padding-top:20px;
  padding-bottom:20px;
  position: absolute;
  top: 50px;
  left: 50%;
  z-index: 1010;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
}

</style>
