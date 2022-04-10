<template>
    <div class="cat" v-if="osmConnector !== null && osmConnector.connected && props !== null">
        <h3>Editeur d'attributs</h3>
        <table  >
            <tr>
                <th>key</th>
                <th>value</th>
            </tr>
            <tr v-for="(props, index) in editedProperties"
                :key="index">
                <td><input v-model="props.key" @change="onInputChange($event, index)"/></td>
                <td><input v-model="props.value" @change="onInputChange($event, index)"/></td>
                <td><button @click="onDeleteTag($event, index)">x</button></td>
            </tr>
        </table>
    </div>
</template>

<script>

export default {
  name: 'FeatureEditor',
  data () {
    return {
      osmConnector: null,
      id: '',
      originalProperties: null,
      editedProperties: null
    }
  },
  methods: {
    loadFeature(feature) {
        this.id = feature.id
        this.originalProperties = feature.properties

        this.editedProperties = []
        for(let key in this.originalProperties) {
            if(key !== 'g') this.editedProperties.push({key: key, value: this.originalProperties[key]})
        }
        this.editedProperties.push({key: '', value: ''})
    },
    unloadFeature() {
      this.id = null
      this.originalProperties = null
      this.editedProperties = null
    },
    onDeleteTag(e, index) {
        if(this.editedProperties.length > 1) this.editedProperties.splice(index, 1)
    },
    onInputChange(e, index) {
        if(index === this.editedProperties.length - 1) {
            this.editedProperties.push({key: '', value: ''})
        }
    }
  }
}

</script>

<style scoped>

.cat {
  background-color: #aaaaaa33;
  border-radius: 10px;
  padding: 0px 0px 10px 0px;
  margin: 5px 0px 10px 0px;
}
.normal {
  padding: 5px 5px;
}

.small {
  padding: 0px 5px;
  font-size: 0.7em;
}

a {
  color: aquamarine;
}

</style>
