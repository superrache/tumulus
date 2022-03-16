<template>
    <section id="panel"
        v-on:scroll.prevent="handleScroll"
        :style="{ 'max-height': computedPanelMaxHeight }"
      >
      <div id="handle"></div>

      <table>
        <tr>
          <td><img v-bind:src="require('./img/megalith.svg')" width="40" /></td>
          <td><h1>tumulus</h1></td>
        </tr>
      </table>
      
      <ThemeSelect id="themeSelect" ref="themeSelect" />
      <FeatureResult ref="featureResult" />
    </section>
</template>

<script>

import ThemeSelect from './ThemeSelect.vue'
import FeatureResult from './FeatureResult.vue'

export default {
  name: 'Panel',
  components: {
    ThemeSelect,
    FeatureResult
  },
  data () {
    return {
      themeSelect: null,
      featureResult: null,
      scrollPosition: 0,
      isRealScroll: true,
      windowWidth: 0,
      mobilePanelMaxHeight: 300
    }
  },
  created() {
    var self = this
    window.addEventListener('resize', function() {
      self.windowWidth = window.innerWidth
    })
    this.windowWidth = window.innerWidth
  },
  mounted() {
    this.themeSelect = this.$refs.themeSelect
    this.featureResult = this.$refs.featureResult
  },
  computed: {
    computedPanelMaxHeight() {
      var value = ''
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
        var currentScrollPosition = e.srcElement.scrollTop
        var diff = currentScrollPosition - this.scrollPosition
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
  padding: 5px;
  box-shadow: 0px -1px 6px 0px rgba(0,0,0,0.75);
  overflow-y: auto;
  user-select: text;
}

#handle {
  position: relative;
  margin: auto;
  margin-bottom: 10px;
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
  }
}

h1 {
  font-size: 2.5em;
  padding: 0px;
  margin: 5px;
}

</style>
