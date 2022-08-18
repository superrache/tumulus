<template>
    <div class="cat">
        <h3 class="collapsible" @click="collapsed = !collapsed">{{(collapsed ? '+' : '-') + ' ' + $t('basemap')}}</h3>
        <div class="basemaps">
          <div class="basemap"
            v-for="(basemap, b) in basemaps"
            :key="b"
            v-on:click="onBasemapSelect($event, b)"
            :style="{ 'display': collapsed ? 'none' : 'block', 'background-color': basemap.color, 'opacity': basemap.selected ? '1' : '0.5' }">
            <img v-if="basemap.icon !== undefined" :src="'/basemap-icon/' + basemap.icon" width=128 />
            <div class="basemap-label" :style="{ 'color': basemap.color }">{{$t(basemap.label)}}</div>
          </div>
        </div>
    </div>
</template>

<script>

import * as basemaps from '../const/basemaps.js'

export default {
  name: 'BasemapSelect',
  data () {
    return {
        components: null,
        basemaps: basemaps.basemaps,
        style: null,
        collapsed: true,
        currentBasemapId: null
    }
  },
  methods: {
    init() {
      this.style = this.basemaps.default.url
    },
    onBasemapSelect(e, id) {
        for(let b in this.basemaps) {
          let basemap = this.basemaps[b]
          basemap.selected = (b === id)
          if(b === id) {
            console.log('select basemap ' + id)
            this.saveBasemapIdInURL(id)
            this.selectBasemap(basemap, true)
          }
        }
    },
    selectBasemapById(id) {
      this.saveBasemapIdInURL(id)
      for(let b in this.basemaps) this.basemaps[b].selected = (b === id)
      this.selectBasemap(this.basemaps[id], false)
    },
    saveBasemapIdInURL(id) {
      this.currentBasemapId = (id === 'default' ? null : id)
      this.components.map.updateParams()
    },
    async selectBasemap(basemap, backupAndRestore) {
      // sauvegarde des sources et layers des thématiques     
      let themeSources = {}
      let themeLayers = []
      if(backupAndRestore) {
        let actualStyle = this.components.map.map.getStyle()
        for(let s in actualStyle.sources) {
          if(s.indexOf('1/') == 0 || s.indexOf('2/') == 0) {
            themeSources[s] = actualStyle.sources[s]
          }
        }
        for(let l in actualStyle.layers) {
          let layer = actualStyle.layers[l]
          console.log(layer)
          if(layer.id.indexOf('1/') == 0 || layer.id.indexOf('2/') == 0) {
            themeLayers.push(layer)
          }
        }
      }

      if(basemap.url !== undefined) {
        this.style = basemap.url
      } else {
        // on repart du style jawg de base
        let response = await fetch(this.basemaps.default.url)
        let style = await response.json()

        // on ajoute les sources custom
        for(let s in basemap.sources) style.sources[s] = basemap.sources[s]

        // on ajoute les layers custom
        let newLayers = [...basemap.layers]

        // on ajoute les layers jawg à partir de replaceUntilLayerId
        // en supprimant les layers except
        // et on applique le style forcePaint
        let found = false
        for(let layer of style.layers) {
          if(layer.id === basemap.replaceUntilLayerId) {
            found = true
          }
          if(found) {
            if(!basemap.except.includes(layer.id)) {
              if(basemap.forcePaint !== undefined && layer.paint !== undefined) {
                for(let p in basemap.forcePaint) {
                  if(layer.paint[p] !== undefined) {
                    layer.paint[p] = basemap.forcePaint[p]
                  }
                }
              }
              newLayers.push(layer)
            }
          }
        }
        style.layers = newLayers
        this.style = style
      }

      // suppression des sources et layers thématiques
      if(backupAndRestore) {
        console.log('suppressions...')
        console.log(themeLayers)
        for(let l in themeLayers) {
          console.log('remove layer ' + themeLayers[l].id)
          this.components.map.map.removeLayer(themeLayers[l].id)
        }
        for(let s in themeSources) this.components.map.map.removeSource(s)
      }
      
      console.log('apply new style')
      this.components.map.map.setStyle(this.style)

      // restauration des sources et layers thématiques
      if(backupAndRestore) {
        for(let s in themeSources) this.components.map.map.addSource(s, themeSources[s])
        for(let l in themeLayers) {
          console.log('read layer ' + themeLayers[l].id)
          this.components.map.map.addLayer(themeLayers[l])
        }
      }
    },
    collapse() {
      this.collapsed = true
    }
  }
}

</script>

<style scoped>

.cat {
  background-color: #444;
  border-radius: 10px;
  padding: 5px;
  margin: 5px 0px 10px 0px;
}

h3 {
  font-weight: 700;
  font-family: Helvetica, sans-serif;
}

.collapsible {
  margin: 5px 5px 5px 5px;
  padding: 5px;
  padding-top: 7px;
  border-radius: 5px;
  cursor: pointer;
}

.collapsible:hover {
  background-color: #555;
}

.collapsible:active {
  background-color: #777;
}

.basemaps {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  margin: 0px auto;
  position: relative;
}

.basemap {
  margin: 2px;
  cursor: pointer;
  border-radius: 10px;
  padding: 5px;
  padding-bottom: 1px;
  position: relative;
  text-align: center;
}

.basemap:hover {
  outline: solid 1px white;
}

.basemap img {
  width: 100%;
  border-radius: 10px;
}

.basemap-label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 1em;
  font-family: Helvetica, sans-serif;
  font-weight: 700;
  text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #fff;
}
</style>
