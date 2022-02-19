<template>
    <section id="panel"
        v-on:scroll.prevent="handleScroll"
        :style="{ 'max-height': computedPanelMaxHeight }"
      >
      <div id="handle"></div>

      <h1>tumulus</h1>
      
      <div class="cat">
        <h3>{{featureName}}</h3>
      </div>
    </section>
</template>

<script>

export default {
  name: 'Panel',
  data () {
    return {
      featureName: 'sample',
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
  background-color: #000012bb;
  text-align: center;
  padding: 5px;
  box-shadow: 0px -1px 6px 0px rgba(0,0,0,0.75);
  overflow-y: auto;
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
  font-size: 3em;
  padding: 0px;
  margin: 5px;
}

h3 {
  font-size: 1.2em;
  font-weight: 100;
  padding: 2px;
  margin: 4px;
  margin-top: 5px;
}

.cat {
  background-color: #aaaaaa33;
  border-radius: 10px;
  padding: 5px;
  margin: 5px 5px 10px 5px;
}

#slider {
  position: relative;
  top: 0px;
  width: 50%;
  margin: auto;
  margin-bottom: 15px;
}

#modes {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  margin: 0px auto;
  position: relative;
  text-align: center;
}

.mode {
  width: 80px;
  height: 80px;
  margin: 4px;
  padding: 0px;
  cursor: pointer;
  background-color: lightsalmon;
  border: 5px solid transparent;
  border-radius: 10px;
  display: inline-block;
  position: relative;
  flex-direction: row;
}

.mode:hover {
  background-color: orange;
}

.selected {
  background-color: orangered;
  box-shadow: 3px 3px 11px -3px #000000;
}

.mode h3 {
  font-size: 16px;
}

.mode img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
}

.mode:hover .tooltip {
  display:inline-block;
  position: absolute;
  background-color: #000000cc;
  color: white;
  opacity: 1;
}

.tooltip {
  display: none;
  opacity: 0;
  text-align: center;
  padding: 1px;
  z-index: 10;
  width: 50px;
  left: 15px;
  bottom: 0px;
  border-radius: 5px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  font-size: 12px;
  line-height: 1.5;
}

#details {
  padding-left: 16px;
  font-size: 1.1em;
  font-weight: 100;
}

</style>
