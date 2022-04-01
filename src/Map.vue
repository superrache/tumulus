<template>
  <div id="map" ref="map">

  </div>

</template>

<script>

import { Map, NavigationControl, GeolocateControl } from 'maplibre-gl'
import along from '@turf/along'
import length from '@turf/length'
import pointOnFeature from '@turf/point-on-feature'

import * as env from './utils/env.js'
import * as utils from './utils/utils.js'
import * as config from './config.js'

export default {
  name: 'Map',
  data () {
    return {
      app: null,
      map: null,
      style: config.style,
      center: config.startingPosition,
      zoom: config.startingZoom,
      maxZoomToGetData: 13,
      currentZoom: 0,
      currentCodename: '',
      selectedFeatureId: null,
      selectedLayerId: null,
      queries: config.queries,
      themes: config.themes,
      themesSelection: '',
      // external components
      themeSelect: null,
      featureResult: null,
      issueAnalyzer: null
    }
  },
  mounted() {
    // prise en compte des paramètres de l'URL
    console.log('params ' + location.pathname)
    let params = location.pathname.split('&')
    if(params.length > 0) {
      for(let p in params) {
        let param = params[p]
        if(p == 0) {
          console.log(param)
          let slashes = param.split('/')
          console.log(slashes)
          if(slashes.length >= 4) {
            this.zoom = slashes[1]
            this.center = [ slashes[3], slashes[2] ]
          }
        } else {
          let kv = param.split('=')
          if(kv.length === 2) {
            switch(kv[0]) {
              case 'themes': {
                let themesParam = kv[1].split(',')
                console.log(kv[1])
                for(let t in this.themes) {
                  let theme = this.themes[t]
                  theme.visible = themesParam.indexOf(t) > -1
                }
                break;
              }
              case 'id': {
                let id = kv[1]
                console.log('TODO select ' + id)
                break;
              }
              default:
                break;
            }
          }
        }
      }
    }

    this.map = new Map({
      container: this.$refs.map,
      style: this.style,
      center: this.center,
      zoom: this.zoom
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

    // Chargement des images
    for(let t in this.themes) {
      const theme = this.themes[t]
      if(theme.icon !== undefined) {
        console.log('loading icon ' + theme.icon)
        this.map.loadImage(window.location.origin + '/img/' + theme.icon + '.png', (error, image) => {
          if(error) {
            console.log(error)
            throw error
          } else {
            this.map.addImage(theme.icon, image, { 'sdf': true })
            console.log(theme.icon + ' added')
          }
        })
      }
    }

    console.log('map mounted')
    this.map.on('load', this.onMapLoad)
  },
  methods: {
    updateAppUrl() {
      console.log('updateAppUrl ' + this.selectedFeatureId)
      const {lng, lat} = this.map.getCenter()
      this.currentZoom = this.map.getZoom()
      window.history.pushState(config.appName, config.appName, 
        '/' + utils.round6Digits(this.currentZoom)
        + '/' + utils.round6Digits(lat)
        + '/' + utils.round6Digits(lng) 
        + '&themes=' + this.themesSelection
        + (this.selectedFeatureId !== null ? '&id=' + this.selectedFeatureId.replace('/', '-') : '')
      )
    },
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
        // la layer ajoutée en dernier est affichée au-dessus des autres
        for(let g = 2; g >= 0; g--) {
          const id = g + '/' + theme.id
          theme.sources.push(this.map.addSource(id, {
              type: "geojson",
              data: theme.geojsons[g]
          }))

          const type = (g === 0 ? 'circle' : (g === 1 ? 'line' : 'fill'))
          const paint = (g === 0 ? {
              'circle-color': theme.color,
              'circle-opacity': 1,
              'circle-radius': ['case', ['boolean', ['feature-state', 'selected'], false], 14, 12],
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

          if(g === 0 && theme.icon !== undefined) {
            theme.layers.push(this.map.addLayer({
              id: 'symbol/' + id,
              source: id,
              interactive: true,
              type: "symbol",
              "layout": {
                  "icon-image": theme.icon,
                  "icon-size": 1.0,
                  "icon-allow-overlap": true,
                  "icon-ignore-placement": true,
                  visibility: 'visible'
              },
              "paint": {
                  "icon-color": "#000000"
              }
            }))
          }

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
                this.featureResult.unloadFeature()
              }
          })
        }

      }
    },
    updateThemesVisibility() {
      for(let q in this.queries) {
        this.queries[q].needed = false
      }

      this.themesSelection = ''
      for(let t in this.themes) {
        const theme = this.themes[t]
        for(let g = 0; g < 3; g++) {
          this.map.setLayoutProperty(g + '/' + theme.id, 'visibility', theme.visible ? 'visible' : 'none')
          if(g === 0 && theme.icon !== undefined) this.map.setLayoutProperty('symbol/' + g + '/' + theme.id, 'visibility', theme.visible ? 'visible' : 'none')
        }
        this.queries[theme.query].needed = this.queries[theme.query].needed || theme.visible
        this.themesSelection += (theme.visible ? ((this.themesSelection.length > 0 ? ',' : '') + theme.id) : '')
      }

      if(this.featureResult !== null) this.featureResult.unloadFeature()

      this.onMapMove()
    },
    async onMapMove() {
      const codename = btoa(Math.random().toString()).substr(10, 5)
      this.currentCodename = codename
      console.log(codename + ' : onMapMove ')

      this.updateAppUrl()

      if(!this.app.dispZoomMore) {
        const sw = this.map.getBounds()._sw
        const ne = this.map.getBounds()._ne
        const bounds = sw.lat + ',' + sw.lng + ',' + ne.lat + ',' + ne.lng

        this.app.loading = 'Chargement de la carte ...'

        this.issueAnalyzer.clear()

        // TODO lancer en parallèle
        for(let q in this.queries) {
          let query = this.queries[q]
          let launch = query.bounds !== bounds && query.needed // ne refait la requête que si la carte a bougé
          while(launch) {
            console.log(codename + ' : launching query ' + q)
            this.app.loading = 'Recherche des données OpenStreetMap : ' + query.label + (config.DEBUG ? ' (' + codename + ')' : '')
            const response = await fetch(env.getServerUrl() + "/data?bounds=" + bounds + "&filter=" + query.filter)
            if(codename !== this.currentCodename) return
            
            const data = await response.json()
            if(codename !== this.currentCodename) return

            if(data.error !== undefined) {
              console.log(codename + ' : query error ' + data.error)
            } else {
              query.cache = data
              query.bounds = bounds
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

        this.app.loading = ''
      }
    },
    loadGeojson(theme, geojson, codename) {
      if(geojson.features !== undefined) {
        console.log(codename + ' : loading ' + geojson.features.length + ' features to theme ' + theme.id)
        
        this.issueAnalyzer.analyzeFeature(geojson.features, theme.label)
        
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

              // on rajoute en plus un point pour les polylignes et les polygones
              if(g >= 1) {
                let pointFeature = (g == 2 ? pointOnFeature(feature) 
                  : along(feature, length(feature) / 2))
                pointFeature.properties = feature.properties
                pointFeature.id = feature.id
                theme.geojsons[0].features.push(pointFeature)
                added[0]++
              }

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
      this.themeSelect.collapse()
      this.featureResult.loadFeature(feature, theme, lngLat)
    },
    selectFeature(feature) {
      this.unselectFeature(feature)
      this.selectedFeatureId = feature.id
      this.selectedLayerId = feature.layer.id
      console.log('select ' + this.selectedFeatureId)
      this.map.setFeatureState(
        { source: this.selectedLayerId, id: this.selectedFeatureId },
        { selected: true }
      )
      this.updateAppUrl()
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
      this.updateAppUrl()
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

#map {
  height: 100%;
}

</style>
