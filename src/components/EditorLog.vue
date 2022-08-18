<template>
  <div class="cat" v-if="log !== null" >
    <div id="log">
        <h3>{{$t('changeLog')}}</h3>
        <button id="close" @click="close" :title="$t('close')">
            <img src="/ui/clear.svg" width=18 />      
        </button>
    </div>
    <div class="console" v-html="log"></div>
  </div>
</template>

<script>

export default {
  name: 'EditorLog',
  data () {
    return {
      log: null
    }
  },
  methods: {
    add(message) {
      if(this.log === null) this.log = ''
      this.log += '<br/>' + message
    },
    addInline(message) {
      this.log += message
    },
    clear() {
      this.log = ''
    },
    close() {
      this.log = null
    }
  }
}

</script>

<style scoped>

.cat {
  background-color: black;
  border-radius: 10px;
  padding: 5px;
  margin: 5px 0px 10px 0px;
}

#log {
  width: 100%;
  display: flex;
  justify-content: right;
}

#log h3 {
    width: 100%;
}

#close {
    position: relative;
    width: 20px;
    height: 20px;
    border-radius: 100%;
    margin: 4px;
    margin-right: 0px;
    padding: 1px;
}

#close svg {
    width: 18px;
    height: 18px;
}

h3 {
  margin: 5px;
}

.console {
  font-style: Consolas,Lucida Console,Lucida Sans Typewriter,monaco,Bitstream Vera Sans Mono,monospace;
  font-size: 10px;
}

</style>
