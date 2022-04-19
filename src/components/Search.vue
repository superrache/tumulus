<template>
    <div class="cat">
        <div id="input-results-container">
            <input id="input"
                ref="input"
                @input="updateInput"
                @keyup.enter="enter"
                v-model="inputStr"
                placeholder="Rechercher"
                type="search"
                autofocus
            />
            <div id="results" v-if="results.length > 0">
                <div class="result"
                    v-for="r in results"
                    :key="r.place_id"
                    @click="onResultClic($event, r)">
                    {{r.display_name}}
                </div>
            </div>
        </div>
        <button id="clear" @click="clear" title="Effacer la recherche">
<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="52px" height="52px" viewBox="0 0 52 52" enable-background="new 0 0 52 52" fill="#ccc" xml:space="preserve">
<path d="M26,2C12.7,2,2,12.7,2,26s10.7,24,24,24s24-10.7,24-24S39.3,2,26,2z M30.9,26.8l7.8,7.8c0.4,0.4,0.4,1,0,1.4
l-2.8,2.8c-0.4,0.4-1,0.4-1.4,0L26.7,31c-0.4-0.4-1-0.4-1.4,0l-7.8,7.8c-0.4,0.4-1,0.4-1.4,0L13.3,36c-0.4-0.4-0.4-1,0-1.4l7.8-7.8
c0.4-0.4,0.4-1,0-1.4l-7.9-7.9c-0.4-0.4-0.4-1,0-1.4l2.8-2.8c0.4-0.4,1-0.4,1.4,0l7.9,7.9c0.4,0.4,1,0.4,1.4,0l7.8-7.8
c0.4-0.4,1-0.4,1.4,0l2.8,2.8c0.4,0.4,0.4,1,0,1.4l-7.8,7.8C30.6,25.8,30.6,26.4,30.9,26.8z"/>
</svg>
        </button>
    </div>
</template>

<script>

import * as config from '../const/config.js'

export default {
  name: 'Search',
  data() {
    return {
        map: null,
        results: [],
        inputStr: ''
    }
  },
  methods: {
    async updateInput(e) {
        const q = e.target.value
        if(q.length > 2) {
            const url = config.nominatimInstance + '/search.php?format=jsonv2&q=' + encodeURIComponent(q)
            const response = await fetch(url)
            this.results = await response.json()
        }
      //this.$emit("update:modelValue", e.target.value);
    },
    onResultClic(e, result) {
        this.map.flyTo([result.lon, result.lat])
        this.results = []
    },
    enter() { // entrer => premier résultat
    console.log('enter')
        if(this.results.length > 0) {
            let result = this.results[0]
            this.map.flyTo([result.lon, result.lat])
            this.results = []
        }
    },
    clear() {
        this.inputStr = ''
        this.results = []
        this.$refs.input.focus()
    }
  }
}

</script>

<style scoped>

.cat {
  background-color: #444;
  border-radius: 10px;
  padding: 7px;
  margin: 5px 0px 10px 0px;
  display: flex;
  justify-content: right;
}

#input-results-container {
    width: 100%;
}

#input {
    width: 100%;
    height: 27px;
    font-size: 16px;
    border-radius: 5px;
    background-color: #444;
    color: white;
}

#clear {
    position: relative;
    width: 20px;
    height: 20px;
    border-radius: 100%;
    margin: 4px;
    margin-right: 0px;
    padding: 1px;
}

#clear svg {
    width: 18px;
    height: 18px;
}

#input:hover, #input:active {
    background-color: #555;
}

#results {
    position: relative;
    float:left;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 150px;
    background-color: #333;
    color: #ffffff;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    user-select: none;
    padding: 5px;
    overflow: auto;
}

.result {
    padding: 5px;
    border-radius: 5px;
}

.result:hover {
    background-color: #5599ff;
}

</style>
