<template>
    <div class="cat" v-if="originalFeature && 'natural' in originalFeature.properties && ['tree', 'shrub'].includes(originalFeature.properties['natural'])">
      <h3 class="collapsible" @click="collapsed = !collapsed">{{$t('plantNetAssistant')}}</h3>
  
      <div :style="{ 'display': collapsed ? 'none' : 'block'}">
        <div v-if="!connected">{{$t('connectToEdit')}}</div>

        <div v-if="connected">
          <div>
            <label id="camera_label" for="camera_input">
              <img src="/ui/plantnet/camera.svg" width=50/>
            </label>
            <input id="camera_input" type="file" name="picture" accept="image/*" capture="environment" />
          </div>

          <div class="organs">
            <div class="organ"
              v-for="(organ, b) in organs"
              :key="b"
              v-on:click="onOrganSelect($event, b)"
              :style="{ 'display': collapsed ? 'none' : 'block', 'opacity': organ.selected ? '1' : '0.5' }">
              <img v-if="organ.icon !== undefined" :src="'/ui/plantnet/' + organ.icon" width=50 />
            </div>
          </div>

          <button v-on:click="onIdentify">{{$t('plantNetIdentify')}}</button>

          <div>
            <pre id="results" style="white-space: break-spaces;">
            </pre>
        </div>

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
        collapsed: false,
        organs: {
          leaf: { selected: true, icon: 'leaf.svg' },
          flower: { selected: false, icon: 'flower.svg' },
          fruit: { selected: false, icon: 'fruit.svg' },
          bark: { selected: false, icon: 'bark.svg' }
        },
        organ: 'leaf'
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
      onOrganSelect(e, id) {
          for(let b in this.organs) {
            let organ = this.organs[b]
            organ.selected = (b === id)
            if(b === id) {
              console.log('select organ ' + id)
              this.organ = b
            }
          }
      },
      async onIdentify() {
        console.log('plantnet identication')

        const imageFile = document.querySelector('#camera_input').files[0]
        // TODO: disable identify button until files.length > 0
        
        const form = new FormData()
        form.append('organs', this.organ) // only one, TODO: could be several
        //form.append('lang', this.$parent.$data.locale)
        form.append('images', imageFile)

        const url = new URL(config.plantNetApiUrl)
        url.searchParams.append('include-related-images', 'true')
        url.searchParams.append('api-key', config.plantNetApiKey)

        fetch(url.toString(), {
          method: 'post',
          mode: 'no-cors',
          body: form
        }).then((response) => {
          if (response.ok) {
            response.json().then((r) => {
              document.getElementById('results').innerHTML = JSON.stringify(r)
            }).catch(console.error)
          }
        }).catch((error) => {
          console.error(error)
        })
        
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
      }
    }
  }
  
  </script>
  
  <style scoped>
  
  .cat {
    background-color: #70b555;
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
    background-color: #80b565;
  }
  
  .collapsible:active {
    background-color: #90b575;
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

  #camera_input {
    display: none;
  }

  #camera_label {
    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 5px;
    padding-top: 45px;
    cursor: pointer;
    background-color: #555;
    border: none;
    border-radius: 5px;
  }

  #camera_label:hover {
    background-color: #FE7434;
    color: black;
    outline: solid 1px white;
  }

  #camera_label:active {
    background-color: #FF9454;
  }
  .organs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  height: 50px;
  margin: 0px auto;
  position: relative;
}

.organ {
  margin: 2px;
  cursor: pointer;
  border-radius: 10px;
  padding: 5px;
  padding-bottom: 1px;
  position: relative;
  text-align: center;
  width: 50px;
  height: 50px;
}

.organ:hover {
  outline: solid 1px white;
}

.organ img {
  width: 100%;
  border-radius: 10px;
}


  </style>
  