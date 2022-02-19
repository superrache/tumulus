<template>
  <Map/>
</template>

<script>
import Map from './Map.vue'

export default {
  name: 'App',
  components: {
    Map
  },
  async created () {
    if (window.location.origin.indexOf('herokuapp.com') > 0) {
      await fetch('https://dept-quiz.herokuapp.com/stat?feature=tumulus')
    }
  }
}
</script>

<style>
html,
body {
  font-family: Ubuntu;
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  background-color: #343434;
  overflow: hidden;
}

#app {
  user-select: none;
  color: white;
  width: 100%;
  height: 100%;
  margin: 0;
}

</style>
