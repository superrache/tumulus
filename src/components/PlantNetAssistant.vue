<template>
    <div class="cat" v-if="originalFeature && 'natural' in originalFeature.properties && ['tree', 'shrub'].includes(originalFeature.properties['natural'])">
      <h3 class="collapsible" @click="collapsed = !collapsed">{{$t('plantNetAssistant')}}</h3>
  
      <div :style="{ 'display': collapsed ? 'none' : 'block'}">
        <div v-if="!connected">{{$t('connectToEdit')}}</div>

        <div v-if="connected">
            <input type="file" id="picture" name="picture" accept="image/*" capture="environment" />
    
            <div id="buttons">
                <button @click="save(true)" :disabled="!editing">{{$t('save')}}</button>
                <button @click="cancel">{{$t('cancel')}}</button>
            </div>
    </div>
      </div>
  
    </div>
  </template>
  
  <script>
  
  import * as config from '../const/config.js' 
  
  export default {
    name: 'PlantNetAssistant',
    components: {

    },
    data () {
      return {
        components: null,
        originalFeature: null,
        originalProperties: null,
        editedProperties: [],
        editing: false,
        collapsed: false
      }
    },
    computed: {
      connected() {
        return this.components && this.components.osmConnector && this.components.osmConnector.connected
      }
    },
    methods: {
      isLoaded(other) {
        return this.originalFeature?.properties.id === other.properties.id
      },
      loadFeature(feature) {
        if(feature !== null && feature.properties !== null) {
          this.editedProperties = []
  
          this.$nextTick(() => { // on attend que vue refasse le rendu avec editedProperties vide
            this.originalFeature = feature
            this.originalProperties = feature.properties
            for(let key in this.originalProperties) {
                if(key !== 'g' && key !== 't' && key !== 'id' && key !== 'lng' && key !== 'lat') this.editedProperties.push({key: key, value: this.originalProperties[key]})
            }
            this.editing = false
          })
        }
      },
      unloadFeature() {
        if(this.editing) {
          if(confirm(this.$t('selectedObjectIsEditingAreYouSure'))) {
            this.save(false)
          }
        }
        this.originalFeature = null
        this.originalProperties = null
        this.editedProperties = []
        this.editing = false
      },
      save(updateUI) {
        console.log('save feature id = ' + this.originalFeature.id)
        
        const newProperties = {}
        let editedKeys = []
        for(let e in this.editedProperties) {
          let editedProperty = this.editedProperties[e]
            console.log(editedProperty.key + '=' + editedProperty.value)
            newProperties[editedProperty.key] = editedProperty.value
            
            // cette clé a-t-elle été éditée ? elle n'existait pas dans l'original ou elle est différente entre props originale et éditée
            if(this.originalProperties[editedProperty.key] === undefined || newProperties[editedProperty.key] !== this.originalProperties[editedProperty.key])
                editedKeys.push(editedProperty.key)
        }
  
        // on ajoute les propriétés internes 'g' et 'id'
        newProperties.id = this.originalFeature.properties.id
        newProperties.g = this.originalFeature.properties.g
        newProperties.t = this.originalFeature.properties.t
      
        this.originalFeature.properties = newProperties
  
        this.components.map.updateFeature(this.originalFeature)
  
        if(updateUI) {
          this.components.osmConnector.addEditedFeature(this.originalFeature)
          this.components.featureResult.updateFeature(this.originalFeature)
          this.components.featureEditor.updateFeature(this.originalFeature)
          this.loadFeature(this.originalFeature) // reset
  
          this.components.issueAnalyzer.setEditedKeys(this.originalFeature.id, editedKeys)
        }
      },
      cancel() {
        this.loadFeature(this.originalFeature)
      },
      identify() {
        config.plantNetApi
      }
    }
  }
  
  </script>
  
  <style scoped>
  
  .cat {
    background-color: #8eb533;
    border-radius: 10px;
    padding: 5px;
    margin: 5px 0px 10px 0px;
  }
  
  .collapsible {
    margin: 5px 5px 5px 5px;
    padding: 5px;
    padding-top: 7px;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .collapsible:hover {
    background-color: #9eb543;
  }
  
  .collapsible:active {
    background-color: #aeb553;
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
  
  .left {
    text-align: left;
  }
  
  .right {
    text-align: right;
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
  