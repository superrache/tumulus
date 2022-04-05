<template>
    <div class="cat">
        <h3 class="collapsible" @click="collapsed = !collapsed">{{collapsed ? '+' : '-'}} Thématiques</h3>
        <div class="theme"
            v-for="t in Object.keys(themes)"
            :key="t"
            v-on:click="toogleThemeVisibility($event, t)"
            :style="{ 'display': collapsed ? 'none' : 'block', 'background-color': themes[t].color, 'opacity': themes[t].visible ? '1' : '0.3' }">
            <img v-if="themes[t].icon !== undefined" :src="'/svg/' + themes[t].icon + '.svg'" width=16 /> {{themes[t].label}}<span class="right" v-if="themes[t].markers !== undefined && Object.keys(themes[t].markers).length > 0">{{Object.keys(themes[t].markers).length}}</span>
        </div>
    </div>
</template>

<script>

export default {
  name: 'ThemeSelect',
  data () {
    return {
        themes: {
          loading: {
            id: "loading",
            label: "...",
            color: "transparent"
          }
        },
        updateThemesVisibility: null,
        collapsed: false
    }
  },
  methods: {
      load(map) {
        this.updateThemesVisibility = map.updateThemesVisibility
        this.themes = map.themes
      },
      toogleThemeVisibility(e, id) {
          for(let t in this.themes) {
            if(t === id) {
              this.themes[t].visible = !this.themes[t].visible
              console.log('toogleThemeVisibility ' + id + ' to ' + (this.themes[t].visible ? 'visible' : 'invisible'))
            }
          }
          this.updateThemesVisibility()
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

.collapsible {
  margin: 5px 5px 10px 5px;
  padding: 5px;
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
  font-weight: 500;
  padding: 3px;
  padding-left: 5px;
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
