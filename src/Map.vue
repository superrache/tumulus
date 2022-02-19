<template>
    <div id="map_container">
      <div id="map" ref="map">
      </div>

      <Panel id="panel" ref="panel" />
    </div>
</template>

<script>

import { Map, NavigationControl, GeolocateControl } from 'maplibre-gl'

import * as env from './utils/env.js'

import Panel from './Panel.vue'

const geojsonSourceId = "geojson"
const geojsonLayerId = "geojson-layer"

export default {
  name: 'Map',
  components: {
    Panel
  },
  data () {
    return {
      map: null,
      zoom: 14,
      center: { lat: 47.2143, lng: -1.5587 },
      geojson: null,
      panel: null
    }
  },
  mounted () {
    this.panel = this.$refs.panel

    this.map = new Map({
      container: this.$refs.map,
      style: 'https://api.jawg.io/styles/3425c3c4-29a2-494c-a977-e9232dd8cf26.json?access-token=UG9wQV1RcEgsXwkTX9M9qfBUV0ZckAfUhlqa3W4hK16gVbTFDUSMXrn60H1hEE6d',
      center: [this.center.lng, this.center.lat],
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

    this.map.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/cat.png', (error, image) => {
      if(error) throw error
      this.map.addImage('megalith', image)
    })

    this.map.on('moveend', this.onMapMove)
    this.onMapMove()
  },
  methods: {
    async onMapMove() {
      const sw = this.map.getBounds()._sw
      const ne = this.map.getBounds()._ne
      const bounds = sw.lat + ',' + sw.lng + ',' + ne.lat + ',' + ne.lng
      const response = await fetch(env.getServerUrl() + "/data?bounds=" + bounds)
      const data = await response.json()
      this.loadGeojson(data)
    },
    removeCurrentGeojson() {
        if(this.map.getLayer(geojsonLayerId)) this.map.removeLayer(geojsonLayerId)
        if(this.map.getSource(geojsonSourceId)) this.map.removeSource(geojsonSourceId)

        this.geojson = null
    },
    loadGeojson(geojson) {
        this.removeCurrentGeojson()

        this.geojson = geojson

        this.map.addSource(geojsonSourceId, {
            type: "geojson",
            data: this.geojson,
            generateId: false
        })

        this.map.addLayer({
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
        })

        this.map.on('click', geojsonLayerId, (e) => {
            if(e.features.length > 0) {
                this.onFeatureSelect(e.features[0])
            }
        })
    },
    onFeatureSelect(feature) {
      console.log(feature)
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

</style>
