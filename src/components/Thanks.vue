<template>
  <div class="cat" v-if="changeset !== null" >
    <div id="thanks">
        <h3>Merci pour votre contribution à OpenStreetMap</h3>
        <button id="close" @click="close" title="Fermer">
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="52px" height="52px" viewBox="0 0 52 52" enable-background="new 0 0 52 52" fill="#ccc" xml:space="preserve">
    <path d="M26,2C12.7,2,2,12.7,2,26s10.7,24,24,24s24-10.7,24-24S39.3,2,26,2z M30.9,26.8l7.8,7.8c0.4,0.4,0.4,1,0,1.4
    l-2.8,2.8c-0.4,0.4-1,0.4-1.4,0L26.7,31c-0.4-0.4-1-0.4-1.4,0l-7.8,7.8c-0.4,0.4-1,0.4-1.4,0L13.3,36c-0.4-0.4-0.4-1,0-1.4l7.8-7.8
    c0.4-0.4,0.4-1,0-1.4l-7.9-7.9c-0.4-0.4-0.4-1,0-1.4l2.8-2.8c0.4-0.4,1-0.4,1.4,0l7.9,7.9c0.4,0.4,1,0.4,1.4,0l7.8-7.8
    c0.4-0.4,1-0.4,1.4,0l2.8,2.8c0.4,0.4,0.4,1,0,1.4l-7.8,7.8C30.6,25.8,30.6,26.4,30.9,26.8z"/>
    </svg>        
        </button>
    </div>
    <div>
        <a target="_blank" :href="'https://www.openstreetmap.org/changeset/' + changeset">Groupe de modifications {{changeset}}</a>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Thanks',
  data () {
    return {
      changeset: null
    }
  },
  methods: {
    close() {
      this.changeset = null
    }
  }
}

</script>

<style scoped>

.cat {
  background-color: rgb(2, 113, 121);
  border-radius: 10px;
  padding: 5px;
  margin: 5px 0px 10px 0px;
}

#thanks {
  width: 100%;
  display: flex;
  justify-content: right;
}

#thanks h3 {
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

</style>
