<template>
    <div id="map_container">
      <div id="map" ref="map"></div>
      <div id="zoomMore" v-show="dispZoomMore">Zoomez plus pour voir les données</div>

      <Panel id="panel" ref="panel" />
    </div>
</template>

<script>

import { Map, NavigationControl, GeolocateControl } from 'maplibre-gl'

import * as env from './utils/env.js'

import Panel from './Panel.vue'

export default {
  name: 'Map',
  components: {
    Panel
  },
  data () {
    return {
      map: null,
      startingZoom: 16,
      currentZoom: 0,
      center: { lat: 47.2143, lng: -1.5587 },
      panel: null,
      selectedFeatureId: null,
      selectedLayerId: null,
      themes: {
        memorial: {
          id: "memorial",
          label: "Mémorial",
          color: "brown",
          filter: '"historic"="memorial"'
        },
        archeo: {
          id: "archeo",
          label: "Site archéologique",
          color: "darkblue",
          filter: '"historic"="archaeological_site"'
        },
        shrine: {
          id: "shrine",
          label: "Element religieux",
          color: "blueviolet",
          filter: '"historic"="wayside_shrine"',
          visible: true
        }
      }
    }
  },
  computed: {
    dispZoomMore() {
      return this.currentZoom < 14
    }
  },
  mounted () {
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

    this.map.on('moveend', this.onMapMove)
    this.onMapMove()
  },
  methods: {
    async onMapMove() {
      this.currentZoom = this.map.getZoom()

      if(!this.dispZoomMore) {
        console.log('onMapMove')
        const sw = this.map.getBounds()._sw
        const ne = this.map.getBounds()._ne
        const bounds = sw.lat + ',' + sw.lng + ',' + ne.lat + ',' + ne.lng

        for(var t in this.themes) {
          const theme = this.themes[t]
          if(theme.visible) {
            const response = await fetch(env.getServerUrl() + "/data?bounds=" + bounds + "&filter=" + theme.filter)
            const data = await response.json()
            this.loadGeojson(theme, data)
          } else {
            this.removeGeojson(theme.id)
          }
        }
      }
    },
    removeGeojson(id) {
        if(this.map.getLayer(id)) this.map.removeLayer(id) // TODO juste changer la source sinon ?
        if(this.map.getSource(id)) this.map.removeSource(id)
    },
    loadGeojson(theme, geojson) {
        this.removeGeojson(theme.id)
        
        if(geojson.error === undefined) {
          theme.geojson = geojson
          console.log('load theme ' + theme.id + ' with ' + theme.geojson.features.length + ' features')

          this.map.addSource(theme.id, {
              type: "geojson",
              data: theme.geojson,
              generateId: false
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
              }
          })
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
