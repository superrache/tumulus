<template>
    <div id="map_container">
      <div id="map" ref="map"></div>

      <div id="loading" :style="{width: loading + '%'}"></div>

      <div id="queries">
          <div class="query" v-for="q in queries" :key="q">
              <div v-if="q.loading">
                  <img src='./img/radar.gif' width="25"/>   {{q.label}}
              </div>
          </div>
      </div>

      <div id="zoomMore" v-show="dispZoomMore">Zoomez plus pour voir les données</div>

      <Panel id="panel" ref="panel" />
      <OSMConnector id="osmConnector" ref="osmConnector" />
    </div>
</template>

<script>

import { Map, NavigationControl, GeolocateControl } from 'maplibre-gl'

import * as env from './utils/env.js'
import * as utils from './utils/utils.js'
import * as config from './config.js'

import Panel from './Panel.vue'
import OSMConnector from './OSMConnector.vue'

export default {
  name: 'Map',
  components: {
    Panel,
    OSMConnector
  },
  data () {
    return {
      map: null,
      maxZoomToGetData: 13,
      currentZoom: 0,
      panel: null,
      osmConnector: null,
      loading: 0,
      currentCodename: '',
      selectedFeatureId: null,
      selectedLayerId: null,
      queries: config.queries,
      themes: config.themes
    }
  },
  computed: {
    dispZoomMore() {
      return this.currentZoom < this.maxZoomToGetData
    }
  },
  mounted() {
    // liens entre les composants
    this.panel = this.$refs.panel
    this.panel.search.map = this
    this.panel.themeSelect.map = this
    this.panel.issueAnalyzer.osmConnector = this.$refs.osmConnector

    this.map = new Map({
      container: this.$refs.map,
      style: config.style,
      center: config.startingPosition,
      zoom: config.startingZoom
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
      this.initThemes()
      this.updateThemesVisibility()
      this.map.on('moveend', this.onMapMove)
    },
    initThemes() {
      for(let t in this.themes) {
        const theme = this.themes[t]
        console.log('init theme ' + theme.id)

        theme.dataCacheIds = new Set()
        theme.geojsons = [ {type: "FeatureCollection", features: []}, {type: "FeatureCollection", features: []}, {type: "FeatureCollection", features: []} ]
        theme.sources = []
        theme.layers = []

        // 1 layer et 1 source par theme et par type de géométrie (0=point, 1=polyline, 2=polygon)
        for(let g = 0; g < 3; g++) {
          const id = g + '/' + theme.id
          theme.sources.push(this.map.addSource(id, {
              type: "geojson",
              data: theme.geojsons[g]
          }))

          const type = (g === 0 ? 'circle' : (g === 1 ? 'line' : 'fill'))
          const paint = (g === 0 ? {
              'circle-color': theme.color,
              'circle-opacity': 1,
              'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 10, 8],
              'circle-stroke-color': ['case', ['boolean', ['feature-state', 'selected'], false], "#ffff00", "#ffffff"],
              'circle-stroke-width': 4
            } : (g === 1 ? {
              'line-color': theme.color,
              'line-opacity': 1,
              'line-width': ['case', ['boolean', ['feature-state', 'selected'], false], 6, 4]
            } : {
              'fill-color': theme.color,
              'fill-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.7, 0.5]
            }))

          theme.layers.push(this.map.addLayer({
            id: id,
            source: id,
            interactive: true,
            type: type,
            paint: paint,
            layout: {
              visibility: 'visible'
            }
          }))

          this.map.on('mousemove', id, (e) => {
              if(e.features.length > 0) {
                  this.map.getCanvas().style.cursor = "pointer" //crosshair
              }
          })

          this.map.on('mouseleave', id, () => {
              this.map.getCanvas().style.cursor = ""
          })

          this.map.on('click', id, (e) => {
              if(e.features.length > 0) {
                  this.onFeatureSelect(e.features[0], theme, e.lngLat)
              } else { // TODO 'click' without layer
                this.unselectFeature()
                this.panel.featureResult.unloadFeature()
              }
          })
        }

      }
    },
    updateThemesVisibility() {
      for(let t in this.themes) {
        const theme = this.themes[t]
        for(let g = 0; g < 3; g++) this.map.setLayoutProperty(g + '/' + theme.id, 'visibility', theme.visible ? 'visible' : 'none')
        this.queries[theme.query].needed = theme.visible
      }

      this.panel.featureResult.unloadFeature()

      this.onMapMove()
    },
    async onMapMove() {
      const codename = btoa(Math.random().toString()).substr(10, 5)
      this.currentCodename = codename
      console.log(codename + ' : onMapMove ')

      const {lng, lat} = this.map.getCenter()
      this.currentZoom = this.map.getZoom()
      window.history.pushState(config.appName, config.appName, "/" + utils.round6Digits(this.currentZoom) + "/" + utils.round6Digits(lat) + "/" + utils.round6Digits(lng))

      if(!this.dispZoomMore) {
        const sw = this.map.getBounds()._sw
        const ne = this.map.getBounds()._ne
        const bounds = sw.lat + ',' + sw.lng + ',' + ne.lat + ',' + ne.lng

        this.loading = 20

        this.panel.issueAnalyzer.clear()

        // TODO lancer en parallèle
        for(let q in this.queries) {
          let query = this.queries[q]
          let launch = query.bounds !== bounds && query.needed // ne refait la requête que si la carte a bougé
          while(launch) {
            console.log(codename + ' : launching query ' + q)
            query.loading = true
            const response = await fetch(env.getServerUrl() + "/data?bounds=" + bounds + "&filter=" + query.filter)
            if(codename !== this.currentCodename) return
            
            const data = await response.json()
            if(codename !== this.currentCodename) return

            if(data.error !== undefined) {
              console.log(codename + ' : query error ' + data.error)
              this.loading += 5
            } else {
              query.loading = false
              query.cache = data
              query.bounds = bounds
              this.loading += 1 / this.queries.length * (100 - 20)
              launch = false

              // application de la donnée aux thèmes concernés (visible ou pas)
              for(let t in this.themes) {
                const theme = this.themes[t]
                if(theme.query === q) {
                  this.loadGeojson(theme, data, codename)
                }
              }
            }
          }
        }

        this.loading = 0
      }
    },
    loadGeojson(theme, geojson, codename) {
      if(geojson.features !== undefined) {
        console.log(codename + ' : loading ' + geojson.features.length + ' features to theme ' + theme.id)
        
        this.panel.issueAnalyzer.analyzeFeature(geojson.features, theme.label)
        
        let added = [0, 0, 0]
        // ajout des nouvelles données aux données déjà chargées (contrôle sur l'id osm)
        for(let f in geojson.features) {
          let feature = geojson.features[f]
          feature.id = feature.properties.id

          if(!theme.dataCacheIds.has(feature.id)) {
            if(theme.values.indexOf(feature.properties[theme.key]) > -1) {
              theme.dataCacheIds.add(feature.id)
              let g = 0
              switch(feature.geometry.type) {
                case 'Point': g = 0; break;
                case 'LineString': g = 1; break;
                case 'Polygon': g = 2; break;
                case 'MultiPoint': g = 0; break;
                case 'MultiLineString': g = 1; break;
                case 'MultiPolygon': g = 2; break;
                default: g = 0;
              }
              theme.geojsons[g].features.push(feature)
              added[g]++
            }
          }
        }
        for(let g = 0; g < 3; g++) {
          this.map.getSource(g + '/' + theme.id).setData(theme.geojsons[g])
          console.log(codename + ' : ' + added[g] + ' features of type ' + g + ' added to theme ' + theme.id)
        }
      }
    },
    onFeatureSelect(feature, theme, lngLat) {
      feature.id = feature.properties.id
      this.selectFeature(feature)
      this.panel.themeSelect.collapse()
      this.panel.featureResult.loadFeature(feature, theme, lngLat)
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
    },
    flyTo(coords) {
      this.map.flyTo({
        center: coords,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
      })
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

#queries {
  position: absolute;
  left: 320px;
  top: 15px;
  z-index: 1030;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.query {
  flex: auto;
  color: black;
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
