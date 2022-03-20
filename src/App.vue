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
