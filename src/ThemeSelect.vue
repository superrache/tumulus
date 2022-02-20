<template>
    <div class="cat">
        <h3>Thématiques</h3>
        <div class="theme"
            v-for="t in Object.keys(map.themes)"
            :key="t"
            v-on:click="onThemeClic($event, t)"
            :style="{ 'background-color': map.themes[t].color, 'opacity': map.themes[t].visible ? '1' : '0.3' }">
            {{map.themes[t].label}}
        </div>
    </div>
</template>
color
<script>

export default {
  name: 'ThemeSelect',
  data () {
    return {
        map: {
            themes: {}
        }
    }
  },
  methods: {
      onThemeClic(e, id) {
          console.log('select theme ' + id)
          for(var t in this.map.themes) {
            this.map.themes[t].visible = (t === id)
          }
          this.map.onMapMove()
      }
  }
}

</script>

<style scoped>

.cat {
  background-color: #aaaaaa33;
  border-radius: 10px;
  padding: 5px;
  margin: 5px 5px 10px 5px;
}

.theme {
  font-size: 1.2em;
  font-weight: 500;
  padding: 2px;
  margin: 0px 5px;
}

.theme:hover {
    cursor: pointer;
}

</style>
