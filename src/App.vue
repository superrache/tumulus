<template>
  <div id="app">
    <div id="sidebar">
      <div id="sidebar-resizer"></div>
      <div id="panel">
        <a id="title" href="">
          <img v-bind:src="require('./img/megalith.svg')" width="40"/> tumulus
        </a>

        <select v-model="locale">
          <option>fr</option>
          <option>en</option>
        </select>

        <PlaceSearch ref="search"/>
        <BasemapSelect ref="basemapSelect"/>
        <ThemeSelect id="themeSelect" ref="themeSelect"/>
        <FeatureResult ref="featureResult"/>
        <ChangesetThanks ref="thanks"/>
        <EditorLog ref="editorLog"/>
        <FeatureEditor ref="featureEditor"/>
        <PlantNetAssistant ref="plantNetAssistant"/>
      </div>
    </div>
    
    <div id="main-content">
      <TumulusMap id="map" ref="map"/>

      <div id="bottombar">
        <IssueAnalyzer ref="issueAnalyzer"/>
      </div>

      <div id="loading" v-show="loading.length > 0">
        <div id="loading-masker"></div>
        <div id="loading-message">{{loading}}</div>
      </div>

      <button id="reload" v-show="!dispZoomMore && canReload" @click="reload">
        <img src="/ui/search.svg" width=18/>
        {{ $t('lookForDataInThisArea') }}
      </button>

      <div id="zoomMore" v-show="dispZoomMore">{{ $t('zoomMoreToSeeData') }}</div>

      <OSMConnector id="osmConnector" ref="osmConnector"/>

    </div>

    <CommentDialog id="comment-dialog" ref="commentDialog"></CommentDialog>

  </div>
</template>

<script>
import * as URLParameters from './utils/URLParameters.js'
import PlaceSearch from './components/PlaceSearch.vue'
import BasemapSelect from './components/BasemapSelect.vue'
import ThemeSelect from './components/ThemeSelect.vue'
import ChangesetThanks from './components/ChangesetThanks.vue'
import EditorLog from './components/EditorLog.vue'
import FeatureResult from './components/FeatureResult.vue'
import FeatureEditor from './components/FeatureEditor.vue'
import PlantNetAssistant from './components/PlantNetAssistant.vue'
import IssueAnalyzer from './components/IssueAnalyzer.vue'
import TumulusMap from './components/TumulusMap.vue'
import OSMConnector from './components/OSMConnector.vue'
import CommentDialog from './components/CommentDialog.vue'

export default {
  name: 'App',
  components: {
    TumulusMap,
    OSMConnector,
    PlaceSearch,
    BasemapSelect,
    ThemeSelect,
    ChangesetThanks,
    EditorLog,
    FeatureResult,
    FeatureEditor,
    PlantNetAssistant,
    IssueAnalyzer,
    CommentDialog
  },
  data () {
    return {
      locale: 'fr',
      components: null,
      loading: '',
      sidebar: null,
      canReload: true
    }
  },
  async created () {

  },
  watch: {
    locale (val) {
      this.$i18n.locale = val
    }
  },
  mounted() {
    console.log('app mounted, linking components')

    // liens entre les composants
    this.components = {
      app: this,
      map: this.$refs.map,
      osmConnector: this.$refs.osmConnector,
      basemapSelect: this.$refs.basemapSelect,
      search: this.$refs.search,
      themeSelect: this.$refs.themeSelect,
      thanks: this.$refs.thanks,
      editorLog: this.$refs.editorLog,
      featureResult: this.$refs.featureResult,
      featureEditor: this.$refs.featureEditor,
      plantNetAssistant: this.$refs.plantNetAssistant,
      issueAnalyzer: this.$refs.issueAnalyzer,
      commentDialog: this.$refs.commentDialog
    }

    this.components.map.components = this.components
    this.components.osmConnector.components = this.components
    this.components.basemapSelect.components = this.components
    this.components.search.components = this.components
    this.components.themeSelect.components = this.components
    this.components.featureResult.components = this.components
    this.components.featureEditor.components = this.components
    this.components.plantNetAssistant.components = this.components
    this.components.issueAnalyzer.components = this.components
    this.components.commentDialog.components = this.components

    // prise en compte des paramètres de l'URL et initialisation des composants
    URLParameters.applyURLParameters(this.components.map)
    this.components.basemapSelect.init()
    this.components.map.createMap()
    this.components.themeSelect.load()

    // resizer
    this.sidebar = this.$el.querySelector("#sidebar")
    let resizer = this.$el.querySelector("#sidebar-resizer")
    resizer.addEventListener("mousedown", () => {
      document.addEventListener("mousemove", this.onSidebarResize, false);
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", this.onSidebarResize, false);
      }, false);
    })
    resizer.addEventListener("touchstart", () => {
      document.addEventListener("touchmove", this.onSidebarResize, false);
      document.addEventListener("touchend", () => {
        document.removeEventListener("touchmove", this.onSidebarResize, false);
      }, false);
    })
  },
  computed: {
    dispZoomMore() {
      if(this.components && this.components.map) return this.components.map.currentZoom < this.components.map.maxZoomToGetData
      else return false
    }
  },
  methods: {
    reload() {
      if(this.components) {
        this.components.featureResult.unloadFeature()
        this.components.featureEditor.unloadFeature()
        this.components.plantNetAssistant.unloadFeature()
        this.components.map.reload()
      }
    },
    updateAppUrl() {
      URLParameters.updateAppUrl(this.components.map)
    },
    onSidebarResize(e) {
      let [x, y] = [e.x, e.y]
      if(e.type === 'touchmove') {
        [x, y] = [e.touches[0].clientX, e.touches[0].clientY]
      }
      if(window.innerWidth < 641) { // mobile
        this.sidebar.style.height = (window.innerHeight - y + 10) + 'px'
      } else { // desktop
        this.sidebar.style.width = (x + 2) + 'px'
      }
      this.components.map.map.resize()
    }
  }
}
</script>

<style>

/**
  Pour tous les composants
*/
div {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font: inherit;
  touch-action: pan-x pan-y;
  color: white;
}

li {
  cursor: pointer;
}

a {
  color: #FE7434;
}

a:hover {
  color: white;
  background-color: #FE7434;
}

body {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  font-family: sans-serif;
}

button {
  cursor: pointer;
  font-size: 16px;
  padding: 5px 10px;
  color: white;
  background-color: #555;
  border: none;
  border-radius: 5px;
}

button:hover:enabled {
  background-color: #FE7434;
  color: black;
  outline: solid 1px white;
}

button:active {
  background-color: #FF9454;
}

button:disabled {
  background-color: #777;
  color: #ccc;
}

.feature-marker {
  display: block;
  border: none;
  border-radius: 100%;
  outline: 2px solid white;
  cursor: pointer;
  padding: 3px;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.feature-marker:hover {
  width: 35px;
  height: 35px;
}

.feature-marker-new {
  outline: 4px solid dodgerblue;
}

.maplibregl-popup-tip {
  border: none;
}

.maplibregl-popup-content {
  background-color: #333;
  color: white;
  border-radius: 5px;
  font-size: 1em;
  padding: 2px 4px;
  text-align: center;
}

/* vaut pour la div #app dans le html et le container principal #app de ce composant */
#app {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  z-index: 0;
  touch-action: none;
  user-select: none;
}

#sidebar {
  position: relative;
  min-width: 235px;
  max-width: 85%;
  width: 25%;
  min-height: 100%;
  max-height: 100%;
  height: 100%;
  float: left;
  z-index: 10;
  background-color: #333;
  padding: 5px;
  padding-right: 7px;
  user-select: text;
}

#sidebar-resizer {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 5px;
  height: 100%;
  z-index: 11;
  cursor: col-resize;
  user-select: none;
  background-color: transparent;
}

#sidebar-resizer:hover, #sidebar-resizer:active {
  background-color: #777;
}

#bottombar {
  position: absolute;
  overflow-x: hidden;
  overflow-y: auto;
  width: 100%;
  min-height: 200px;
  max-height: 250px;
  bottom: 0px;
  z-index: 9;
  background-color: #333;
  padding: 5px;
  padding-right: 7px;
  user-select: text;
}

#panel {
  color: white;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

/* mobile sidebar */
@media only screen and (max-width: 641px) {
  #sidebar {
    min-width: 100%;
    max-width: 100%;
    width: 100%;
    height: 25%;
    min-height: 75px;
    max-height: 100%;
    position: absolute;
    bottom: 0px;
    padding-right: 0px;
  }

  #sidebar-resizer {
    position: relative;
    left: 40%;
    width: 20%;
    height: 10px;
    cursor: row-resize;
    background-color: #aaa;
    border-radius: 5px;
  }

  #panel {
    position: relative;
    top: 5px;
  }
}

#main-content {
  position: relative;
  overflow: hidden;
  height: 100%;
  z-index: 1;
  touch-action: none;
}

#map {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  height: 100%;
  width: 100%;
  user-select: none;
}

#title {
  text-decoration: none;
  color: white;
  font-size: 2.5em;
  font-family: Ubuntu, Helvetica, sans-serif;
  font-weight: 700;
  margin: 5px;
}

#reload {
  position: relative;
  top: 15px;
  left: 15px;
  width: 150px;
  text-align: left;
}

#loading {
  position: relative;
  top: 0px;
  left: 0px;
  height: 15px;
  z-index: 20;
  background: linear-gradient(to right, #aaa 8%, #ccc 18%, #aaa 33%);
  background-size: 800px 104px;
  animation-duration: 2s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  animation-name: placeHolderShimmer;
  animation-timing-function: linear;
}

@keyframes placeHolderShimmer {
  0% {
    background-position: -800px 0
  }
  100% {
    background-position: 800px 0
  }
}

#loading-message {
  color: white;
  background-color: transparent;
  font-size: 12px;
  text-align: center;
}

#zoomMore {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translate(-50%, 0%);
  width:180px;
  text-align:center;
  padding: 20px 10px;
  z-index: 24;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
}

#osmConnector {
  position: absolute;
  top: 20px;
  right: 50px;
  z-index: 30;
}

#comment-dialog {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 9999;
  background-color: rgb(0, 0, 0, 0.8);
}

</style>
