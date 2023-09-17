<template>
  <div class="cat" v-if="changeset !== null" >
    <div id="thanks">
        <h3>Merci pour votre contribution à OpenStreetMap</h3>
        <button id="close" @click="close" title="Fermer">
            <img src="/ui/clear.svg" width=18 />  
        </button>
    </div>
    <div>
        <a target="_blank" :href="'https://www.openstreetmap.org/changeset/' + changeset">Groupe de modifications {{changeset}}</a>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ChangesetThanks',
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
