<template>
  <div id="map" ref="map">

  </div>

</template>

<script lang="ts">

import { defineComponent } from 'vue'
import { Map, NavigationControl, GeolocateControl, Marker, Popup, type GeoJSONSource, LngLat } from 'maplibre-gl'
import * as turf from '@turf/turf'

import * as env from '../utils/env'
import * as utils from '../utils/utils'
import * as config from '../const/config'
import * as themes from '../const/themes'
import * as nominatim from '../utils/Nominatim'
import type { Feature, FeaturedMarker, Geojson, Theme } from '@/types/common'
import type { TumulusComponents } from '@/types/components'

export default defineComponent({
  name: 'TumulusMap',
  data () {
    return {
      components: null as TumulusComponents | null,
      map: null as Map | null,
      center: config.startingPosition as [number, number],
      zoom: config.startingZoom as number,
      bearing: 0 as number,
      pitch: 0 as number,
      pendingBasemapId: config.startingBasemap as string | null,
      currentZoom: 0 as number,
      maxZoomToGetData: 13 as number,
      previousBounds: '' as string,
      currentCodename: '' as string,
      selectedFeatureId: null as string | null,
      dontUnselect: false as boolean,
      pendingSelectedFeatureId: null as string | null,
      selectedMarker: null as Marker | null,
      selectedSourceId: null as string | null,
      queries: themes.queries,
      themes: themes.themes,
      themesSelection: '' as string,
      popup: null as Popup | null,
      countryCode: null as string | null,
      idCreator: 0 as number,
      addingMarker: null as Marker | null
    }
  },
  mounted() {
    console.log('map mounted')
  },
  methods: {
    createMap() {
      this.map = new Map({
        container: this.$refs.map as HTMLElement,
        style: this.components!.basemapSelect.style!,
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
        this.components!.basemapSelect.selectBasemapById(this.pendingBasemapId)
        this.pendingBasemapId = null
      }
    },
    onMapLoad() {
      console.log('map loaded')
      this.initThemes()
      this.updateThemesVisibility()
      this.map!.on('moveend', this.onMapMove)
      this.map!.on('click', this.unselectFeature)
    },
    initThemes() {
      for(let t in this.themes) {
        const theme = this.themes[t]
        console.log(`init theme ${theme.id}`)

        theme.dataCacheIds = new Set()
        theme.geojsons = [ {type: "FeatureCollection", features: []}, {type: "FeatureCollection", features: []}, {type: "FeatureCollection", features: []} ]
        theme.sources = []
        theme.layers = []
        theme.markers = {}

        // 1 layer et 1 source par theme et par type de géométrie (0=point, 1=polyline, 2=polygon)
        // on affiche uniquement les polylignes et polygones, les point étant affichés sous forme de markers
        // la layer ajoutée en dernier est affichée au-dessus des autres
        if(this.map) {
          for(let g = 2; g >= 1; g--) {
            const id = `${g}/${theme.id}`
            const source = this.map.addSource(id, {
                type: 'geojson',
                data: theme.geojsons[g] as any,
                promoteId: 'id'
            })
            theme.sources.push(source as any)
  
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
              paint: paint as any,
              layout: {
                visibility: 'visible'
              }
            }) as any)
  
            this.map.on('mousemove', id, (e) => { if(e.features!.length > 0) { this.map!.getCanvas().style.cursor = "pointer" } })
            this.map.on('mouseleave', id, () => { this.map!.getCanvas().style.cursor = "" })
            this.map.on('click', id, (e) => { this.onFeatureLayerSelect(e, theme) })
          }
        }

        let style = document.createElement('style')
        style.innerHTML = `.marker-${theme.id} { background-color: ${theme.color}; }`
        document.getElementsByTagName('head')[0].appendChild(style)
      }
    },
    updateThemesVisibility() {
      for(let q in this.queries) this.queries[q].needed = false

      this.themesSelection = ''
      for(const t in this.themes) {
        const theme = this.themes[t]
        for(let g = 2; g >= 1; g--) {
          this.map!.setLayoutProperty(`${g}/${theme.id}`, 'visibility', theme.visible ? 'visible' : 'none')
        }

        for(const m in theme.markers) {
          const marker = theme.markers[m]
          marker.getElement().style.visibility = (theme.visible ? 'visible' : 'hidden')
        }

        this.queries[theme.query].needed = this.queries[theme.query].needed || theme.visible
        this.themesSelection += (theme.visible ? ((this.themesSelection.length > 0 ? ',' : '') + theme.id) : '')
      }

      this.components!.featureResult.unloadFeature()
      this.components!.featureEditor.unloadFeature()
      this.components!.plantNetAssistant.unloadFeature()

      this.updateParams()
      this.onMapMove()
      this.reload()
    },
    generateBounds(): string {
      const bounds = this.map!.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      return utils.round6Digits(sw.lat) + ',' + utils.round6Digits(sw.lng) + ',' + utils.round6Digits(ne.lat) + ',' + utils.round6Digits(ne.lng)
    },
    async onMapMove() {
      this.updateParams()
      
      this.components!.app.canReload = true

      this.currentZoom = this.map!.getZoom()

      if(!this.components!.app.dispZoomMore && config.reloadOnMove) {
        let bounds = this.generateBounds()
        if(bounds !== this.previousBounds) { // on recharge que si ça a bougé (en mode géolocalisation de l'utilisateur, onMapMove est lancée toutes les 2s)
          this.previousBounds = bounds
          await this.reload()
        }
      }
    },
    async reload() {
      this.components!.app.canReload = false
      this.components!.app.loading = this.$t('loadingMap')

      const {lng, lat} = this.map!.getCenter()
      this.countryCode = await nominatim.getCountryCode({lat: utils.round6Digits(lat), lng: utils.round6Digits(lng)})

      this.components!.issueAnalyzer.clear()

      const codename = btoa(Math.random().toString()).substring(10, 5)
      this.currentCodename = codename
      console.log(`reload ${codename}`)

      let bounds = this.generateBounds()
      
      // TODO: lancer en parallèle
      for(let q in this.queries) {
        let query = this.queries[q]
        let launch = query.bounds !== bounds && query.needed // ne refait la requête que si la carte a bougé
        while(launch) {
          console.log(`${codename}: launching query ${q}`)
          this.components!.app.loading = `${this.$t('lookingForOSMData')}${query.label}${config.DEBUG ? ' (' + codename + ')' : ''}`
          const response = await fetch(`${env.getServerUrl()}/data?bounds=${bounds}&filters=${query.filters.join(",")}`)
          if(codename !== this.currentCodename) return
          
          const data = await response.json()
          if(codename !== this.currentCodename) return

          if(data.error !== undefined) {
            console.log(`${codename} : query error ${data.error}`)
          } else {
            query.cache = data
            query.bounds = bounds
            launch = false

            // application de la donnée aux thèmes concernés (visible ou pas)
            for(let t in this.themes) {
              const theme = this.themes[t]
              if(theme.query === q) {
                this.loadGeojson(theme, data)
                this.components!.issueAnalyzer.analyzeFeature(theme.geojsons![0].features, theme)
              }
            }
          }
        }
      }

      this.components!.app.loading = ''
    },
    addMarker(theme: Theme, lngLat: [number, number] | LngLat, isNewElement: boolean): {marker: FeaturedMarker, el: HTMLElement} {
      const el = document.createElement('div')
      el.className = `feature-marker marker-${theme.id} ${isNewElement ? 'feature-marker-new' : ''}`
      el.style.visibility = (theme.visible ? 'visible' : 'hidden')

      if(theme.icon !== undefined) {
        const icon = document.createElement('img')
        icon.src = `/theme/${theme.icon}.svg`
        el.appendChild(icon)
      }
      
      const options = {
        element: el,
        clickTolerance: 2,
        draggable: isNewElement
      }

      const marker = new Marker(options).setLngLat(lngLat).addTo(this.map!)
      return {marker: marker, el: el}
    },
    loadGeojson(theme: Theme, geojson: Geojson) {
      if(geojson.features !== undefined) {
        console.log(`loading ${geojson.features.length} features to theme ${theme.id}`)
        
        let added: Record<string, number> = {
          '0': 0,
          '1': 0,
          '2': 0
        }
        // ajout des nouvelles données aux données déjà chargées (contrôle sur l'id osm)
        for(const f in geojson.features) {
          const feature = geojson.features[f]
          feature.id = feature.properties.id

          if(!theme.dataCacheIds!.has(feature.id)) {
            if(theme.values.indexOf(feature.properties[theme.key]) > -1 || (theme.values.indexOf('!') > -1 && !feature.properties[theme.key])) {
              theme.dataCacheIds!.add(feature.id)
              const g = utils.getGeometryType(feature)
              const gn = parseInt(g)
              feature.properties.g = g // retenir le type de géométrie d'origine pour la sélection
              feature.properties.t = theme.id // retenir aussi le theme pour la mise à jour d'une feature après édition
              theme.geojsons![gn].features.push(feature)
              added[gn]++

              // on rajoute en plus un point pour les polylignes et les polygones
              if(Number(g) >= 1) {
                const pointFeature = (g == '2' ? turf.pointOnFeature(feature) 
                  : turf.along(feature, turf.length(feature) / 2))
                pointFeature.properties = feature.properties
                pointFeature.id = feature.id

                // on garde le centre pour pouvoir zoomer direct dessus en ouvrant l'éditeur iD
                const lng = pointFeature.geometry.coordinates[0], lat = pointFeature.geometry.coordinates[1]
                pointFeature.properties.lng = lng
                pointFeature.properties.lat = lat
                feature.properties.lng = lng
                feature.properties.lat = lat

                theme.geojsons![0].features.push(pointFeature)
                added[0]++
              } else {
                const lng = feature.geometry.coordinates[0], lat = feature.geometry.coordinates[1]
                feature.properties.lng = String(lng)
                feature.properties.lat = String(lat)
              }

            }
          }
        }

        for(let g = 1; g < 3; g++) {
          (this.map!.getSource(`${g}/${theme.id}`) as GeoJSONSource).setData(theme.geojsons![g] as any)
          //if(added[g] > 0) console.log(`${codename}: ${added[g]} features of type ${g} added to theme ${theme.id}`)
        }

        const bounds = this.map!.getBounds()

        for(const feature of theme.geojsons![0].features) {
          const lngLat = feature.geometry.coordinates as [number, number]

          if(utils.pointInBounds(lngLat, bounds)) {
            if(theme.markers![feature.id] === undefined) {
              const mel = this.addMarker(theme, lngLat, false)
              const marker = mel.marker
              marker.feature = feature
              marker.theme = theme
              marker.lngLat = lngLat

              mel.el.addEventListener('click', (e) => {
                this.onMarkerSelect(marker)
                e.stopPropagation() // pour ne pas cliquer en plus sur la potentielle layer sous le marker
              })

              this.setPopup(marker, feature)

              theme.markers![feature.id] = marker

              if(this.pendingSelectedFeatureId === feature.id) {
                this.pendingSelectedFeatureId = null
                this.selectFeature(feature, theme)
              }
            }
          } else {
            if(theme.markers![feature.id] !== undefined) { // le point est hors-champ et son marker avait été ajouté à la carte, on doit le supprimer
              theme.markers![feature.id].remove()
              delete theme.markers![feature.id]
            }
          }
        }

      }
    },
    setPopup(marker: FeaturedMarker, feature: Feature) {
      if(feature.properties.name !== undefined) {
        const popup = this.popup
        const el = marker.getElement()
        el.addEventListener('mouseenter', () => {
          popup!.setLngLat(marker.lngLat!).setHTML(`${feature.properties.name}`)
          marker.togglePopup()
        })
        el.addEventListener('mouseleave', () => marker.togglePopup())
        marker.setPopup(this.popup!)
      }
    },
    onMarkerSelect(marker: FeaturedMarker) {
      this.selectFeature(marker.feature!, marker.theme!)
    },
    onFeatureLayerSelect(e: any, theme: Theme) {
      if(e.features.length > 0) {
        this.selectFeature(e.features[0], theme)
        e.originalEvent.stopPropagation() // le stopPropagation ne fonctionne pas, c'est pour ça qu'on a en plus un dontUnselect
        this.dontUnselect = true
      }
    },
    selectFeature(feature: Feature, theme: Theme) {
      this.unselectFeature()
      this.components!.basemapSelect.collapse()
      this.components!.themeSelect.collapse()

      feature.id = feature.properties.id
      this.selectedFeatureId = feature.id
      console.log(`select ${this.selectedFeatureId}`)
      this.components!.featureResult.loadFeature(feature, theme)
      this.components!.featureEditor.loadFeature(feature)
      this.components!.plantNetAssistant.loadFeature(feature, theme)

      // que la sélection provienne du marker ou de la layer, il faut déterminer les 2 pour pouvoir les mettre en valeur
      let marker = theme.markers![this.selectedFeatureId]
      let geom = null
      if(marker !== undefined) {
        this.selectedMarker = marker
        this.selectedMarker.getElement().style.outline = '4px solid #ff7733'
        geom = {type: 'Point', coordinates: marker.lngLat}
      }
      
      if(Number(feature.properties.g) > 0) {
        let sourceId = `${feature.properties.g}/${theme.id}`
        this.selectedSourceId = sourceId
        this.map!.setFeatureState(
          { source: this.selectedSourceId, 
            id: this.selectedFeatureId },
          { selected: true }
        )
        geom = feature.geometry
      }

      // si la geométrie de l'objet sélectionnée (+ buffer de 15m) ne rentre pas dans l'extent de la carte, on zoom/centre sur l'objet
      if(geom !== null) {
        let buffered = turf.buffer(geom, 15, {units: 'meters'})
        let bounds = turf.bbox(buffered)
        if(!utils.bboxInBbox(bounds, utils.boundsToBbox(this.map!.getBounds()))) {
          this.map!.fitBounds(bounds, {
            essential: true,
            maxZoom: 16,
            easing: this.easing
          })
        }
      }

      this.updateParams()
    },
    easing(t: number): number {
      return t * (2 - t)
    },
    unselectFeature() {
      if(this.dontUnselect) {
        this.dontUnselect = false
        return
      }
      if(this.selectedFeatureId !== null) {
        console.log('unselect ' + this.selectedFeatureId)
        if(this.selectedMarker !== null) {
          this.selectedMarker.getElement().style.outline = '2px solid white'
          this.selectedMarker = null
        }
        if(this.selectedSourceId !== null) {
          this.map!.setFeatureState(
            { source: this.selectedSourceId, id: this.selectedFeatureId },
            { selected: false }
          )
        }
        this.components!.featureResult.unloadFeature()
        this.components!.featureEditor.unloadFeature()
        this.components!.plantNetAssistant.unloadFeature()
        this.selectedFeatureId = null
        this.updateParams()
      }
    },
    updateFeature(feature: Feature) {
      let themeId = feature.properties.t
      let theme = this.themes[themeId]

      // mise à jour de la feature dans la source de la layer
      let g = Number(feature.properties.g)
      let found = false
      for(let f in theme.geojsons![g].features) {
        let feat = theme.geojsons![g].features[f]
        if(feat.id === feature.id) {
          theme.geojsons![g].features[f] = feature
          found = true
          break
        }
      }
      try {
        if(found) (this.map!.getSource(`${g}/${themeId}`) as GeoJSONSource).setData(theme.geojsons![g] as any)
      } catch(e) { // échoue lorsque la thématique est masquée
        console.log('source non trouvée, peut-être masquée')
      }

      // mise à jour du marker
      let marker = theme.markers![feature.properties.id]
      if(marker) {
        marker.feature = feature
        this.setPopup(marker, feature)
      }
    },
    flyTo(coords: [number, number]) {
      this.map!.flyTo({
        center: coords,
        essential: true
      })
    },
    updateParams() { // appelée aussi par BasemapSelect
      this.components!.app.updateAppUrl()
    },
    createId(type: string): string {
      this.idCreator++
      return `${type}/new${this.idCreator}`
    },
    addPoint(themeId: string) {
      const theme = this.themes[themeId]
      // create a draggable theme-styled addingMarker
      this.addingMarker = this.addMarker(theme, this.map!.getCenter(), true).marker
    },
    cancelAddingPoint() {
      if(this.addingMarker) this.addingMarker.remove()
    },
    validateAddingPoint(themeId: string, initialProperties: Record<string, string>) { 
      if(this.addingMarker) {
        const theme = this.themes[themeId]
        const ll = this.addingMarker.getLngLat()
        const id = this.createId('node')
        const properties = initialProperties
        properties['id'] = id
        properties['g'] = '0' // point
        properties['t'] = themeId
        properties['lng'] = String(ll.lng)
        properties['lat'] = String(ll.lat)

        // remove the marker for adding the feature
        this.addingMarker.remove()

        const feature: Feature = {
          type: 'Feature',
          geometry: {
            coordinates: [ll.lng, ll.lat],
            type: 'Point'
          },
          id: id,
          lang: (this.$parent as any).$data.locale,
          properties: properties
        }

        // create a single feature geojson
        const oneFeatureGeojson: Geojson = {
          type: 'FeatureCollection',
          features: [feature]
        }
        // load the feature, pending selection
        this.pendingSelectedFeatureId = feature.id
        this.loadGeojson(theme, oneFeatureGeojson)
        return feature
      }
      return null
    }
  }
})

</script>

<style scoped>

@import url('maplibre-gl/dist/maplibre-gl.css');

#map {
  height: 100%;
}

</style>
@/types/tumulus