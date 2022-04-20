<template>
  <div id="map" ref="map">

  </div>

</template>

<script>

import { Map, NavigationControl, GeolocateControl, Marker, Popup } from 'maplibre-gl'
import along from '@turf/along'
import length from '@turf/length'
import pointOnFeature from '@turf/point-on-feature'

import * as env from '../utils/env.js'
import * as utils from '../utils/utils.js'
import * as config from '../const/config.js'
import * as themes from '../const/themes.js'
import * as nominatim from '../utils/Nominatim.js'

export default {
  name: 'Map',
  data () {
    return {
      components: null,
      map: null,
      center: config.startingPosition,
      zoom: config.startingZoom,
      bearing: 0,
      pitch: 0,
      pendingBasemapId: config.startingBasemap,
      currentZoom: 0,
      maxZoomToGetData: 13,
      previousBounds: '',
      currentCodename: '',
      selectedFeatureId: null,
      pendingSelectedFeatureId: null,
      selectedMarker: null,
      selectedSourceId: null,
      queries: themes.queries,
      themes: themes.themes,
      themesSelection: '',
      popup: null,
      countryCode: null
    }
  },
  mounted() {
    console.log('map mounted')
  },
  methods: {
    createMap() {
      this.map = new Map({
        container: this.$refs.map,
        style: this.components.basemapSelect.style,
        center: this.center,
        zoom: this.zoom,
        bearing: this.bearing,
        pitch: this.pitch
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

      this.map.on('load', this.onMapLoad)

      this.popup = new Popup({
        anchor: 'center',
        offset: [0, 35],
        closeButton: false,
        closeOnClick: false
      }).setText('Loading')

      if(this.pendingBasemapId) {
        this.components.basemapSelect.selectBasemapById(this.pendingBasemapId)
        this.pendingBasemapId = null
      }
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
              'line-color': ['case', ['boolean', ['feature-state', 'selected'], false], "#ff7733", theme.color],
              'line-opacity': 1,
              'line-width': 4
            } : {
              'fill-color': ['case', ['boolean', ['feature-state', 'selected'], false], "#ff7733", theme.color],
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
          this.map.on('click', id, (e) => { if(e.features.length > 0) { this.onFeatureLayerSelect(e.features[0], theme) } })
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

      this.components.featureResult.unloadFeature()
      this.components.featureEditor.unloadFeature()

      this.updateParams()
      this.onMapMove()
    },
    async onMapMove() {
      this.updateParams()

      this.currentZoom = this.map.getZoom()
      if(!this.components.app.dispZoomMore) {
        const sw = this.map.getBounds()._sw
        const ne = this.map.getBounds()._ne
        const bounds = utils.round6Digits(sw.lat) + ',' + utils.round6Digits(sw.lng) + ',' + utils.round6Digits(ne.lat) + ',' + utils.round6Digits(ne.lng)
        if(bounds !== this.previousBounds) { // on recharge que si ça a bougé (en mode géolocalisation de l'utilisateur, onMapMove est lancée toutes les 2s)
          this.previousBounds = bounds

          this.components.app.loading = 'Chargement de la carte ...'

          this.countryCode = await nominatim.getCountryCode({lat: utils.round6Digits(sw.lat), lng: utils.round6Digits(sw.lng)})

          this.components.issueAnalyzer.clear()

          const codename = btoa(Math.random().toString()).substr(10, 5)
          this.currentCodename = codename
          console.log(codename + ' : onMapMove ')
    
          // TODO lancer en parallèle
          for(let q in this.queries) {
            let query = this.queries[q]
            let launch = query.bounds !== bounds && query.needed // ne refait la requête que si la carte a bougé
            while(launch) {
              console.log(codename + ' : launching query ' + q)
              this.components.app.loading = 'Recherche des données OpenStreetMap : ' + query.label + (config.DEBUG ? ' (' + codename + ')' : '')
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
                    this.components.issueAnalyzer.analyzeFeature(theme.geojsons[0].features, theme)
                  }
                }
              }
            }
          }

          this.components.app.loading = ''
        }
      }
    },
    loadGeojson(theme, geojson, codename) {
      if(geojson.features !== undefined) {
        //console.log(codename + ' : loading ' + geojson.features.length + ' features to theme ' + theme.id)
        
        let added = [0, 0, 0]
        // ajout des nouvelles données aux données déjà chargées (contrôle sur l'id osm)
        for(let f in geojson.features) {
          const feature = geojson.features[f]
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

                // on garde le centre pour pouvoir zoomer direct dessus en ouvrant l'éditeur iD
                const lng = pointFeature.geometry.coordinates[0], lat = pointFeature.geometry.coordinates[1]
                pointFeature.properties.lng = lng
                pointFeature.properties.lat = lat
                feature.properties.lng = lng
                feature.properties.lat = lat

                theme.geojsons[0].features.push(pointFeature)
                added[0]++
              } else {
                const lng = feature.geometry.coordinates[0], lat = feature.geometry.coordinates[1]
                feature.properties.lng = lng
                feature.properties.lat = lat
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
                icon.src = '/svg/' + theme.icon + '.svg'
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

              if(feature.properties.name !== undefined) {
                const popup = this.popup
                el.addEventListener('mouseenter', () => {
                  popup.setLngLat(lngLat).setHTML(`${feature.properties.name}`)
                  marker.togglePopup()
                })
                el.addEventListener('mouseleave', () => marker.togglePopup())
                marker.setPopup(this.popup)
              }

              theme.markers[feature.id] = marker

              if(this.pendingSelectedFeatureId === feature.id) {
                this.pendingSelectedFeatureId = null
                this.selectFeature(feature, theme)
              }
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
      this.selectFeature(marker.feature, marker.theme)
    },
    onFeatureLayerSelect(feature, theme) {
      this.selectFeature(feature, theme)
    },
    selectFeature(feature, theme) {
      this.unselectFeature()
      this.components.basemapSelect.collapse()
      this.components.themeSelect.collapse()

      feature.id = feature.properties.id
      this.selectedFeatureId = feature.id
      console.log('select ' + this.selectedFeatureId)
      this.components.featureResult.loadFeature(feature, theme)
      this.components.featureEditor.loadFeature(feature)

      // que la sélection provienne du marker ou de la layer, il faut déterminer les 2 pour pouvoir les mettre en valeur
      let marker = theme.markers[this.selectedFeatureId]
      if(marker !== undefined) {
        this.selectedMarker = marker
        this.selectedMarker.getElement().style.outline = '4px solid #ff7733'
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

      this.updateParams()
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
      this.updateParams()
      }
    },
    flyTo(coords) {
      this.map.flyTo({
        center: coords,
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
      })
    },
    updateParams() { // appelée aussi par BasemapSelect
      this.components.app.updateAppUrl()
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
