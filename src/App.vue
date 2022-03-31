<template>
  <div id="app">
    <div id="sidebar">
      <div id="sidebar-resizer"></div>
      <div id="panel">
        <a id="title" href="">
          <img v-bind:src="require('./img/megalith.svg')" width="40" /> tumulus
        </a>

        <Search ref="search" />
        <ThemeSelect id="themeSelect" ref="themeSelect" />
        <FeatureResult ref="featureResult" />
        <IssueAnalyzer ref="issueAnalyzer" />
      </div>
    </div>

    <div id="main-content">
      <Map id="map" ref="map" />

      <div id="loading" v-show="loading.length > 0">
        <div id="loading-masker"></div>
        <div id="loading-message">{{loading}}</div>
      </div>

      <div id="zoomMore" v-show="dispZoomMore">Zoomez plus pour voir les données</div>

      <OSMConnector id="osmConnector" ref="osmConnector" />

    </div>

  </div>
</template>

<script>
import Search from './Search.vue'
import ThemeSelect from './ThemeSelect.vue'
import FeatureResult from './FeatureResult.vue'
import IssueAnalyzer from './IssueAnalyzer.vue'
import Map from './Map.vue'
import OSMConnector from './OSMConnector.vue'

export default {
  name: 'App',
  components: {
    Map,
    OSMConnector,
    Search,
    ThemeSelect,
    FeatureResult,
    IssueAnalyzer
  },
  data () {
    return {
      map: null,
      themeSelect: null,
      osmConnector: null,
      issueAnalyzer: null,
      loading: '',
      sidebar: null
    }
  },
  async created () {
    if(window.location.origin.indexOf('herokuapp.com') > 0) {
      await fetch('https://dept-quiz.herokuapp.com/stat?feature=tumulus')
    }
  },
  mounted() {
    console.log('app mounted, linking components')

    // liens entre les composants
    this.map = this.$refs.map
    this.map.app = this

    this.$refs.search.map = this.map

    this.themeSelect = this.$refs.themeSelect
    this.themeSelect.load(this.map)
    this.map.themeSelect = this.themeSelect

    this.map.featureResult = this.$refs.featureResult

    this.issueAnalyzer = this.$refs.issueAnalyzer
    this.issueAnalyzer.osmConnector = this.$refs.osmConnector
    this.map.issueAnalyzer = this.issueAnalyzer

    this.themeSelect.map = this

    this.search = this.$refs.search
    this.themeSelect = this.$refs.themeSelect
    this.issueAnalyzer = this.$refs.issueAnalyzer

    // resizer
    this.sidebar = this.$el.querySelector("#sidebar")
    let resizer = this.$el.querySelector("#sidebar-resizer")
    resizer.addEventListener("mousedown", () => {
      document.addEventListener("mousemove", this.onSidebarResize, false);
      document.addEventListener("mouseup", () => {
        document.removeEventListener("mousemove", this.onSidebarResize, false);
      }, false);
    })
  },
  computed: {
    dispZoomMore() {
      if(this.map) return this.map.currentZoom < this.map.maxZoomToGetData
      else return false
    }
  },
  methods: {
    onSidebarResize(e) {
      console.log('onSidebarResize')
      if(window.innerWidth < 641) { // mobile
        this.sidebar.style.height = `${window.innerHeight - e.y}px`
      } else { // desktop
        this.sidebar.style.width = `${e.x}px`
      }
      this.map.map.resize()
    }
  }
}
</script>

<style>

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
  color: #5eb793;
}

body {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
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
  font-family: Ubuntu, Arial, Helvetica, sans-serif;
}

#sidebar {
  position: relative;
  min-width: 235px;
  max-width: 85%;
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

#sidebar-resizer:hover {
  background-color: #777;
}

#panel {
  color: white;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

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
    height: 5px;
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
  display: flex;
  flex-direction: column;
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
  font-weight: 700;
  margin: 5px;
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
  padding-top:20px;
  padding-bottom:20px;
  z-index: 24;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
}

#osmConnector {
  position: absolute;
  top: 15px;
  right: 50px;
  z-index: 30;
}

</style>
