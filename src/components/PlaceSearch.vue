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
            <img src="/ui/clear.svg" width=18 />
        </button>
    </div>
</template>

<script>

import * as nominatim from '../utils/Nominatim.js'

export default {
  name: 'PlaceSearch',
  data() {
    return {
        components: null,
        results: [],
        inputStr: ''
    }
  },
  methods: {
    async updateInput(e) {
        const q = e.target.value
        if(q.length > 2) {
            this.results = await nominatim.search(q)
        }
      //this.$emit("update:modelValue", e.target.value);
    },
    onResultClic(e, result) {
        this.go(result)
    },
    enter() { // entrer => premier résultat
        if(this.results.length > 0) {
            this.go(this.results[0])
        }
    },
    go(result) {
        this.components.map.flyTo([result.lon, result.lat])
        this.results = []
        this.components.issueAnalyzer.clear() // il y a des chances qu'on s'éloigne donc les anciens issues n'ont plus de sens
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
