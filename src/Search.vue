<template>
    <div class="cat">
        <input id="input"
            :type="text"
            v-model="searchText"
            @input="updateInput"
            placeholder="Rechercher"
        />
        <span id="button">Aller</span>
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
        searchText: '',
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
  margin: 5px 5px 10px 5px;
}

#input {
    width: 187px;
    height: 27px;
    font-family: Arial;
    font-size: 16px;
    border-radius: 5px;
}

#button {
  border-radius: 5px;
  font-family: Arial;
  color: #ffffff;
  font-size: 16px;
  background: #3377ff;
  padding: 7px 15px 7px 15px;
  text-decoration: none;
  cursor: pointer;
  user-select: none;
  float: right;
}

#button:hover {
  background: #5599ff;
  text-decoration: none;
}

#button:active {
  background-color: #4488ff;
  text-decoration: none;
}

#results {
    position: relative;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 150px;
    background-color: #00001277;
    font-family: Arial;
    color: #ffffff;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    user-select: none;
    padding: 5px;
    overflow: auto;
}

.result {
}

.result:hover {
    background-color: #5599ff;
}

</style>
