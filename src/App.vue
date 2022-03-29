<template>
  <Map ref="map" />
</template>

<script>
import Map from './Map.vue'

export default {
  name: 'App',
  components: {
    Map
  },
  async created () {
    if(window.location.origin.indexOf('herokuapp.com') > 0) {
      await fetch('https://dept-quiz.herokuapp.com/stat?feature=tumulus')

      if(location.protocol !== 'https:') {
       location.replace('https:' + location.href.substring(location.protocol.length))
      }
    }

    console.log(location.pathname)
    
    const params = location.pathname.split('/')
    if(params.length >= 4) {
      let map = this.$refs.map
      map.startingZoom = params[1]
      map.center = { lat: params[2], lng: params[3] }
    }

  }
}
</script>

<style>

html {
  box-sizing: border-box;
}

body,
.innerbodywrapper{
  overflow-x: hidden;
  position: fixed;
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  user-select: none;
  font-family: Ubuntu, Arial, Helvetica, sans-serif;
  color: white;
}

#app {
  width: 100%;
  height: 100%;
  text-align: left;
}

</style>
