<template>
    <section id="panel"
        v-on:scroll.prevent="handleScroll"
        :style="{ 'max-height': computedPanelMaxHeight }"
      >
      <div id="handle"></div>

      <a id="title" href="">
        <img v-bind:src="require('./img/megalith.svg')" width="40" /> tumulus
      </a>
      
      <Search ref="search" />
      <ThemeSelect id="themeSelect" ref="themeSelect" />
      <FeatureResult ref="featureResult" />
      <IssueAnalyzer ref="issueAnalyzer" />
    </section>
</template>

<script>

import Search from './Search.vue'
import ThemeSelect from './ThemeSelect.vue'
import FeatureResult from './FeatureResult.vue'
import IssueAnalyzer from './IssueAnalyzer.vue'

export default {
  name: 'Panel',
  components: {
    Search,
    ThemeSelect,
    FeatureResult,
    IssueAnalyzer
  },
  data () {
    return {
      search: null,
      themeSelect: null,
      featureResult: null,
      issueAnalyzer: null,
      scrollPosition: 0,
      isRealScroll: true,
      windowWidth: 0,
      mobilePanelMaxHeight: 300
    }
  },
  created() {
    let self = this
    window.addEventListener('resize', function() {
      self.windowWidth = window.innerWidth
    })
    this.windowWidth = window.innerWidth
  },
  mounted() {
    this.search = this.$refs.search
    this.themeSelect = this.$refs.themeSelect
    this.featureResult = this.$refs.featureResult
    this.issueAnalyzer = this.$refs.issueAnalyzer
  },
  computed: {
    computedPanelMaxHeight() {
      let value = ''
      if(this.windowWidth < 641)
        value = this.mobilePanelMaxHeight + 'px'
      else
        value = '100vh'
      console.log('computedPanelMaxHeight=' + value)
      return value
    }
  },
  methods: {
    handleScroll(e) {
      if(e.srcElement.scrollTop !== 0 && this.isRealScroll) {
        let currentScrollPosition = e.srcElement.scrollTop
        let diff = currentScrollPosition - this.scrollPosition
        this.mobilePanelMaxHeight += diff
        this.isRealScroll = false
        this.scrollPosition = currentScrollPosition
      }
      this.isRealScroll = true
    }
  }
}

</script>

<style scoped>

#panel {
  z-index: 1005;
  position: absolute;
  bottom: 0px;
  width: 100%;
  height: auto;
  background-color: #000012dd;
  text-align: left;
  padding: 10px;
  box-shadow: 0px -1px 6px 0px rgba(0,0,0,0.75);
  overflow-y: auto;
  user-select: text;
}

#handle {
  position: relative;
  margin: auto;
  width: 60px;
  height: 5px;
  background-color: #888;
  border-radius: 10px;
  cursor: move;
  visibility: visible;
}

@media only screen and (min-width: 641px) {
  #panel {
    left: 0px;
    top: 0px;
    width: 300px;
  }

  #handle {
    visibility: hidden;
    height: 0px;
  }
}

#title {
  text-decoration: none;
  color: white;
  font-size: 2.5em;
  font-weight: 700;
  margin: 5px;
}

</style>
