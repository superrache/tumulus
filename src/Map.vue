<template>
  <div id="map" ref="map">

  </div>

</template>

<script>

import { Map, NavigationControl, GeolocateControl, Marker } from 'maplibre-gl'
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
      selectedMarker: null,
      selectedSourceId: null,
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
          let slashes = param.split('/')
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

    console.log('map mounted')
    this.map.on('load', this.onMapLoad)
  },
  methods: {
    updateAppUrl() {
      const {lng, lat} = this.map.getCenter()
      this.currentZoom = this.map.getZoom()
      window.history.pushState(config.appName, config.appName, 
        '/' + utils.round6Digits(this.currentZoom)
        + '/' + utils.round6Digits(lat)
        + '/' + utils.round6Digits(lng) 
        + '&themes=' + this.themesSelection
        + (this.selectedFeatureId !== null ? '&id=' + encodeURIComponent(this.selectedFeatureId) : '')
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
        theme.markers = {}

        // 1 layer et 1 source par theme et par type de géométrie (0=point, 1=polyline, 2=polygon)
        // on affiche uniquement les polylignes et polygones, les point étant affichés sous forme de markers
        // la layer ajoutée en dernier est affichée au-dessus des autres
        for(let g = 2; g >= 1; g--) {
          const id = g + '/' + theme.id
          theme.sources.push(this.map.addSource(id, {
              type: "geojson",
              data: theme.geojsons[g],
              promoteId: 'id'
          }))

          const type = (g === 1 ? 'line' : 'fill')
          const paint = (g === 1 ? {
              'line-color': ['case', ['boolean', ['feature-state', 'selected'], false], "yellow", theme.color],
              'line-opacity': 1,
              'line-width': 4
            } : {
              'fill-color': ['case', ['boolean', ['feature-state', 'selected'], false], "yellow", theme.color],
              'fill-opacity': 0.5
            })

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

          this.map.on('mousemove', id, (e) => { if(e.features.length > 0) { this.map.getCanvas().style.cursor = "pointer" } })
          this.map.on('mouseleave', id, () => { this.map.getCanvas().style.cursor = "" })
          this.map.on('click', id, (e) => { if(e.features.length > 0) { this.onFeatureLayerSelect(e.features[0], theme, e.lngLat) } })
        }

        let style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = '.marker-' + theme.id + ' { background-color: ' + theme.color + '; }';
        document.getElementsByTagName('head')[0].appendChild(style);
      }
    },
    updateThemesVisibility() {
      for(let q in this.queries) this.queries[q].needed = false

      this.themesSelection = ''
      for(let t in this.themes) {
        const theme = this.themes[t]
        for(let g = 2; g >= 1; g--) {
          this.map.setLayoutProperty(g + '/' + theme.id, 'visibility', theme.visible ? 'visible' : 'none')
        }

        for(let m in theme.markers) {
          let marker = theme.markers[m]
          marker.getElement().style.visibility = (theme.visible ? 'visible' : 'hidden')
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
        //console.log(codename + ' : loading ' + geojson.features.length + ' features to theme ' + theme.id)
        
        this.issueAnalyzer.analyzeFeature(geojson.features, theme.label)
        
        let added = [0, 0, 0]
        // ajout des nouvelles données aux données déjà chargées (contrôle sur l'id osm)
        for(let f in geojson.features) {
          let feature = geojson.features[f]
          feature.id = feature.properties.id

          if(!theme.dataCacheIds.has(feature.id)) {
            if(theme.values.indexOf(feature.properties[theme.key]) > -1) {
              theme.dataCacheIds.add(feature.id)
              let g = utils.getGeometryInteger(feature)
              feature.properties.g = g // retenir le type de géométrie d'origine pour la sélection
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
        for(let g = 1; g < 3; g++) {
          this.map.getSource(g + '/' + theme.id).setData(theme.geojsons[g])
          if(added[g] > 0) console.log(codename + ' : ' + added[g] + ' features of type ' + g + ' added to theme ' + theme.id)
        }

        const bounds = this.map.getBounds()

        for(let feature of theme.geojsons[0].features) {
          const lngLat = feature.geometry.coordinates

          if(utils.pointInBounds(lngLat, bounds)) {
            if(theme.markers[feature.id] === undefined) {
              const el = document.createElement('div')
              el.className = 'feature-marker marker-' + theme.id
              el.style.visibility = (theme.visible ? 'visible' : 'hidden')

              if(theme.icon !== undefined) {
                const icon = document.createElement('img')
                icon.src = window.location.origin + '/svg/' + theme.icon + '.svg'
                el.appendChild(icon)
              }
              
              const options = {
                element: el,
                clickTolerance: 2
              }

              const marker = new Marker(options).setLngLat(lngLat).addTo(this.map)
              marker.feature = feature
              marker.theme = theme
              marker.lngLat = lngLat

              el.addEventListener('click', (e) => {
                this.onMarkerSelect(marker)
                e.stopPropagation() // pour ne pas cliquer en plus sur la potentielle layer sous le marker
              })

              theme.markers[feature.id] = marker
            }
          } else {
            if(theme.markers[feature.id] !== undefined) { // le point est hors-champ et son marker avait été ajouté à la carte, on doit le supprimer
              theme.markers[feature.id].remove()
              delete theme.markers[feature.id]
            }
          }
        }

      }
    },
    onMarkerSelect(marker) {
      this.selectFeature(marker.feature, marker.theme, marker.lngLat)
    },
    onFeatureLayerSelect(feature, theme, lngLat) {
      this.selectFeature(feature, theme, lngLat)
    },
    selectFeature(feature, theme, lngLat) {
      this.unselectFeature()
      this.themeSelect.collapse()

      feature.id = feature.properties.id
      this.selectedFeatureId = feature.id
      console.log('select ' + this.selectedFeatureId)
      this.featureResult.loadFeature(feature, theme, lngLat)

      // que la sélection provienne du marker ou de la layer, il faut déterminer les 2 pour pouvoir les mettre en valeur
      let marker = theme.markers[this.selectedFeatureId]
      if(marker !== undefined) {
        this.selectedMarker = marker
        this.selectedMarker.getElement().style.outline = '4px solid yellow'
      } else {
        marker = null
      }
      
      if(feature.properties.g > 0) {
        let sourceId = feature.properties.g + '/' + theme.id
        this.selectedSourceId = sourceId
        this.map.setFeatureState(
          { source: this.selectedSourceId, 
            id: this.selectedFeatureId },
          { selected: true }
        )
      }

      this.updateAppUrl()
    },
    unselectFeature() {
      if(this.selectedFeatureId !== null) {
        console.log('unselect ' + this.selectedFeatureId)
        if(this.selectedMarker !== null) {
          this.selectedMarker.getElement().style.outline = '2px solid white'
          this.selectedMarker = null
        }
        if(this.selectedSourceId !== null) {
          this.map.setFeatureState(
            { source: this.selectedSourceId, id: this.selectedFeatureId },
            { selected: false }
          )
        }
        this.selectedFeatureId = null
        this.updateAppUrl()
      }
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
