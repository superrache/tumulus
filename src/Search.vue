<template>
    <div class="cat">
        <input id="input"
            :type="text"
            @input="updateInput"
            placeholder="Rechercher"
        />
        <div id="results" v-if="results.length > 0">
            <div class="result"
                v-for="r in results"
                :key="r.place_id"
                v-on:click="onResultClic($event, r)">
                {{r.display_name}}
            </div>
        </div>
    </div>
</template>

<script>

export default {
  name: 'Search',
  data() {
    return {
        results: []
    }
  },
  methods: {
    async updateInput(e) {
        const q = e.target.value
        if(q.length > 2) {
            const url = 'https://nominatim.openstreetmap.org/search.php?format=jsonv2&q=' + encodeURIComponent(q)
            const response = await fetch(url)
            this.results = await response.json()
        }
      //this.$emit("update:modelValue", e.target.value);
    },
    onResultClic(e, result) {
        this.map.flyTo([result.lon, result.lat])
        this.results = []
    }
  }
}

</script>

<style scoped>

.cat {
  background-color: #aaaaaa33;
  border-radius: 10px;
  padding: 7px;
  padding-right: 15px;
  margin: 5px 0px 10px 0px;
}

#input {
    width: 100%;
    height: 27px;
    font-size: 16px;
    border-radius: 5px;
    background-color: #aaaaaa11;
    color: white;
}

#input:hover, #input:active {
    background-color: #aaaaaa33;
}

#results {
    position: relative;
    float:left;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 150px;
    background-color: #00001277;
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
