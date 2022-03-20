<template>
    <div class="cat">
        <h3>Thématiques</h3>
        <div class="theme"
            v-for="t in Object.keys(map.themes)"
            :key="t"
            v-on:click="toogleThemeVisibility($event, t)"
            :style="{ 'background-color': map.themes[t].color, 'opacity': map.themes[t].visible ? '1' : '0.3' }">
            {{map.themes[t].label}}
        </div>
    </div>
</template>

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
      toogleThemeVisibility(e, id) {
          console.log('toogleThemeVisibility ' + id)
          for(var t in this.map.themes) {
            if(t === id) {
              this.map.themes[t].visible = !this.map.themes[t].visible
            }
          }
          this.map.updateThemesVisibility()
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

h3 {
  margin: 5px 5px 10px 5px;
}

.theme {
  font-size: 1.2em;
  font-weight: 500;
  padding: 3px;
  padding-left: 5px;
  margin: 5px;
  border-radius: 5px;
}

.theme:hover {
    cursor: pointer;
}

</style>
