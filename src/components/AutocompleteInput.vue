<template>
  <div id="container">
    <input
        type="search"
        v-model="innerValue"
        @input="onInput"
        @keyup.esc="escape"
        @keyup.enter="enter"
        @keydown.tab="enter"
        @keydown.up="up"
        @keydown.down="down"
        @change="onChange"
        @blur="blur"
    />
    <ul class="suggestions" v-if="suggestions.length > 0">
        <li class="suggestion"
            :class="{ 'suggestion-hovered': index === cursor }"
            v-for="(suggestion, index) in suggestions"
            :key="index"
            @click="selectItem(suggestion)"
            @mouseover="cursor = index"
        >
            <div>{{suggestion}}</div>
        </li>
    </ul>
  </div>
</template>

<script lang="ts">

export default {
  name: 'AutocompleteInput',
  props: {
    value: String,
    other: String,
    suggestionsFunction: Function
  },
  data () {
    return {
      innerValue: '' as string,
      suggestions: [] as string[],
      cursor: -1 as number
    }
  },
  mounted () {
    this.innerValue = this.value!
  },
/*  watch: {
    innerValue: function (value) { 
        this.$emit('input', value)
    }
  },*/
  methods: {
    async onInput() {
        this.suggestions = await this.suggestionsFunction(this.innerValue, this.other)
    },
    selectItem(suggestion) {
        if(suggestion) {
            this.innerValue = suggestion
            this.$emit('inputChanged', this.innerValue)
            this.suggestions = []
        }
    },
    onChange() {
        this.$emit('inputChanged', this.innerValue)
    },
    enter() {
      if(this.suggestions.length > 0) {
        this.selectItem(this.suggestions[this.cursor])
        this.$emit("inputChanged", this.innerValue)
        this.suggestions = []
      }
    },
    up() {
      if(this.cursor > -1) {
        this.cursor--
        this.$el.getElementsByClassName("suggestion")[this.cursor];
      }
    },
    down() {
      if(this.suggestions.length == 0) {
        this.onInput()
      } else if(this.cursor < this.suggestions.length) {
        this.cursor++
        this.$el.getElementsByClassName("suggestion")[this.cursor];
      }
    },
    escape() {
      this.suggestions = []
    },
    blur() {
      setTimeout(() => (this.suggestions = []), 200)
    }
  }
}

</script>

<style scoped>

#container {
  position: relative;
  display: grid;
  grid-template-columns: auto;
  justify-content: start;
}

input {
    width: 100%;
    height: 27px;
    font-size: 12px;
    border-radius: 5px;
    background-color: #444;
    color: white;
}

li { list-style: none;}

.suggestions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: auto;
  grid-row: 2;
  padding: 0px;
  text-align: left;
  border: 2px solid #ececec;
  border-top: none;
  border-radius: 2px;
  max-height: 400px;
  overflow-y: none;
  z-index: 9999;
}

.suggestion {
  padding: 5px;
  cursor: pointer;
  background-color: #333;
  border-bottom: 1px solid #ddd;
}

.suggestion:hover, .suggestion-hovered {
  background-color: orange;
}

</style>
