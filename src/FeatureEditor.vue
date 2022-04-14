<template>
    <div class="cat" v-if="osmConnector !== null && osmConnector.connected" >
        <h3>Editeur d'attributs</h3>
        <table>
            <tr>
                <th>Clé</th>
                <th>Valeur</th>
            </tr>
            <tr v-for="(property, index) in editedProperties"
                :key="index">
              <td>
                <AutocompleteInput :ref="`input-key-${index}`" v-model:value="property.key" :suggestionsFunction="onInputKey" @inputChanged="onInputChange" />
              </td>
              <td>
                <AutocompleteInput :ref="`input-value-${index}`" v-model:value="property.value" v-model:other="property.key" :suggestionsFunction="onInputValue" @inputChanged="onInputChange" />
              </td>
              <td>
                <button @click="onDeleteTag($event, index)">x</button>
              </td>
            </tr>
        </table>

        <div id="buttons">
          <button @click="save">Enregistrer</button>
          <button @click="cancel">Annuler</button>
        </div>
    </div>
</template>

<script>

import * as config from './config.js' 
import AutocompleteInput from './AutocompleteInput.vue'

export default {
  name: 'FeatureEditor',
  components: {
    AutocompleteInput
  },
  data () {
    return {
      osmConnector: null,
      originalFeature: null,
      originalProperties: null,
      editedProperties: []
    }
  },
  methods: {
    loadFeature(feature) {      
      if(feature !== null && feature.properties !== null) {
        this.editedProperties = []

        this.$nextTick(() => { // on attend que vue refasse le rendu avec editedProperties vide
          this.originalFeature = feature
          this.originalProperties = feature.properties
          for(let key in this.originalProperties) {
              if(key !== 'g' && key !== 'id') this.editedProperties.push({key: key, value: this.originalProperties[key]})
          }
          this.editedProperties.push({key: '', value: ''})

        })
      }
    },
    unloadFeature() {
      this.originalFeature = null
      this.originalProperties = null
      this.editedProperties = []
    },
    async onInputKey(searchTerm) {
      const url = `${config.tagInfoInstance}/api/4/keys/all?page=1&rp=10&sortname=count_all&sortorder=desc&query=${encodeURIComponent(searchTerm)}`
      const response = await fetch(url)
      const json = await response.json()
      const suggestions = []
      for(let d of json.data) {
        suggestions.push(d.key)
      }
      return suggestions
    },
    async onInputValue(searchTerm, key) {
      const url = `${config.tagInfoInstance}/api/4/key/values?page=1&rp=10&sortname=count_all&sortorder=desc&key=${key}&query=${encodeURIComponent(searchTerm)}`
      const response = await fetch(url)
      const json = await response.json()
      const suggestions = []
      for(let d of json.data) {
        suggestions.push(d.value)
      }
      return suggestions
    },
    onInputChange() {      
      this.forceUpdateModeleFromVue()

      // ajout d'une ligne vide à la fin si nécessaire
      let last = this.editedProperties[this.editedProperties.length - 1]
      if(last.key !== '' || last.value !== '') this.editedProperties.push({key: '', value: ''})
    },
    onDeleteTag(e, index) {
      if(this.editedProperties.length > 1) this.editedProperties.splice(index, 1)
      this.forceUpdateVueFromModele()
    },
    forceUpdateModeleFromVue() {
      for(let e in this.editedProperties) {
        let property = this.editedProperties[e]
        property.key = this.$refs[`input-key-${e}`][0].innerValue
        property.value = this.$refs[`input-value-${e}`][0].innerValue
      }
    },
    forceUpdateVueFromModele() {
      for(let e in this.editedProperties) {
        let property = this.editedProperties[e]
        this.$refs[`input-key-${e}`][0].innerValue = property.key
        this.$refs[`input-value-${e}`][0].innerValue = property.value
      }
    },
    save() {
      console.log('save feature id = ' + this.originalFeature.id)
      
      const newProperties = {}
      for(let e in this.editedProperties) {
        let editedProperty = this.editedProperties[e]
        if(editedProperty.key !== '') {
            console.log(editedProperty.key + '=' + editedProperty.value)
            newProperties[editedProperty.key] = editedProperty.value
        }
      }

      // on ajoute les propriétés internes 'g' et 'id'
      newProperties.id = this.originalFeature.properties.id
      newProperties.g = this.originalFeature.properties.g
    
      this.originalFeature.properties = newProperties
      this.osmConnector.addEditedFeature(this.originalFeature)

      this.loadFeature(this.originalFeature) // reset
    },
    cancel() {
      this.loadFeature(this.originalFeature)
    }
  }
}

</script>

<style scoped>

.cat {
  background-color: #565;
  border-radius: 10px;
  padding: 5px;
  margin: 5px 0px 10px 0px;
}

h3 {
  margin: 5px;
}

.normal {
  padding: 5px 5px;
}

.small {
  padding: 0px 5px;
  font-size: 0.7em;
}

#buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  margin: 0px auto;
  margin-top: 5px;
  margin-bottom: 2px;
  position: relative;
}

#buttons button {
  margin-right: 5px;
}

</style>
