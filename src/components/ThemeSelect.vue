<template>
    <div class="cat">
        <h3 class="collapsible" @click="collapsed = !collapsed">{{(collapsed ? '+' : '-') + ' ' + $t('thematics')}}</h3>
        <div class="theme"
            v-for="(theme, t) in themes"
            :key="t"
            v-on:click="toogleThemeVisibility($event, t)"
            :style="{ 'display': collapsed ? 'none' : 'block', 'background-color': theme.color, 'opacity': theme.visible ? '1' : '0.3' }">
            <img v-if="theme.icon !== undefined" :src="'/theme/' + theme.icon + '.svg'" width=16 /> {{$t(theme.label)}}<span class="right" v-if="theme.markers !== undefined && Object.keys(theme.markers).length > 0">{{Object.keys(theme.markers).length}}</span>
        </div>
    </div>
</template>

<script>

export default {
  name: 'ThemeSelect',
  data () {
    return {
        components: null,
        themes: {
          loading: {
            id: "loading",
            label: "thematics",
            color: "transparent"
          }
        },
        collapsed: false
    }
  },
  methods: {
      load() {
        this.themes = this.components.map.themes
      },
      toogleThemeVisibility(e, id) {
          for(let t in this.themes) {
            if(t === id) {
              this.themes[t].visible = !this.themes[t].visible
              console.log('toogleThemeVisibility ' + id + ' to ' + (this.themes[t].visible ? 'visible' : 'invisible'))
            }
          }
          this.components.map.updateThemesVisibility()
      },
      collapse() {
        this.collapsed = true
      }
  }
}

</script>

<style scoped>

.cat {
  background-color: #444;
  border-radius: 10px;
  padding: 5px;
  margin: 5px 0px 10px 0px;
}

h3 {
  font-weight: 700;
  font-family: Helvetica, sans-serif;
}

.collapsible {
  margin: 5px 5px 5px 5px;
  padding: 5px;
  padding-top: 7px;
  border-radius: 5px;
  cursor: pointer;
}

.collapsible:hover {
  background-color: #555;
}

.collapsible:active {
  background-color: #777;
}

.theme {
  font-size: 1.2em;
  font-family: Helvetica, sans-serif;
  font-weight: 500;
  padding: 5px 5px 3px 3px;
  margin: 5px;
  border-radius: 5px;
}

.theme:hover {
    cursor: pointer;
    outline: solid 1px white;
}

.right {
  float: right;
}

</style>
