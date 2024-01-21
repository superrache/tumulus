<template>
    <div class="cat" v-if="originalFeature && theme.id === 'plant'">
      <h3 class="collapsible" @click="collapsed = !collapsed">{{$t('plantNetAssistant')}}</h3>
  
      <div :style="{ 'display': collapsed ? 'none' : 'block'}">
        <div v-if="!connected">{{$t('connectToEdit')}}</div>

        <div v-if="connected">

          <div class="cameras">
            <div>
              <label id="camera_label" for="camera_input">
                <img src="/ui/plantnet/camera.svg" width=50/>
              </label>
              <input id="camera_input" type="file" name="picture" accept="image/*" capture="environment" v-on:change="onFileInput" />
            </div>
            <div v-show="imageLoaded">
              <img :src="imagePreview" height="70"/>
            </div>
          </div>

          <div class="organs">
            <div class="organ"
              v-for="(organ, b) in organs"
              :key="b"
              v-on:click="onOrganSelect($event, b)"
              :style="{ 'opacity': organ.selected ? '1' : '0.5' }">
              <img v-if="organ.icon !== undefined" :src="'/ui/plantnet/' + organ.icon" width=50 />
            </div>
          </div>

          <div id="buttons">
            <button v-on:click="onIdentify" :disabled="!imageLoaded">{{$t('plantNetIdentify')}}</button>
            <button v-on:click="onSave" :disabled="!readyToSend">{{$t('plantNetSave')}}</button>
          </div>

          <div class="results">
            <div class="result"
              :class="{ result_selected: result.selected }"
              v-for="(result, r) in results"
              :key="r"
              v-on:click="onResultSelect($event, r)">
              <img class="result-image" v-if="result.imageUrl !== ''" :src="result.imageUrl"/>
              <div class="result-info">
                <div class="result-label-title">{{ `${this.localizedSpeciesKey}=${result[this.localizedSpeciesKey]}` }}</div>
                <div>{{ `genus=${result['genus']}` }}</div>
                <div>{{ `species=${result['species']}` }}</div>
                <div>{{ `score: ${(result.score * 100)}%` }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
    </div>
  </template>
  
  <script>
  
  import * as env from '../utils/env.js'

  export default {
    name: 'PlantNetAssistant',
    components: {

    },
    data () {
      return {
        components: null,
        debug: false,
        theme: {},
        originalFeature: null,
        collapsed: false,
        imageLoaded: false,
        imageFile: undefined,
        imagePreview: undefined,
        organs: {
          leaf: { selected: true, icon: 'leaf.svg' },
          flower: { selected: false, icon: 'flower.svg' },
          fruit: { selected: false, icon: 'fruit.svg' },
          bark: { selected: false, icon: 'bark.svg' }
        },
        organ: 'leaf',
        results: [],
        localizedSpeciesKey: 'species:en',
        editedProperties: [],
        readyToSend: false
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
      loadFeature(feature, theme) {
        if(feature !== null && feature.properties !== null && theme.id === 'plant') {
          console.log('PlantNetAssistant load feature')
          this.originalFeature = feature
          this.theme = theme
          this.editedProperties = []
          this.readyToSend = false
        }
      },
      unloadFeature() {
        this.originalFeature = null
        this.theme = ''
      },
      onFileInput() {
        this.imageLoaded = true
        this.imageFile = document.querySelector('#camera_input').files[0]
        this.imagePreview = URL.createObjectURL(this.imageFile)
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

        // save current language to save result in the good osm key
        let lang = this.$parent.$data.locale
        this.localizedSpeciesKey = `species:${this.debug ? 'fr' : lang}`

        const form = new FormData()
        form.append('organs', this.organ) // only one, TODO: could be several
        form.append('image', this.imageFile)
        form.append('lang', lang)

        const url = new URL(`${env.getServerUrl()}/plantnet-identify`)

        fetch(url.toString(), {
          method: 'post',
          body: form
        }).then((response) => {
          if (response.ok) {
            response.json().then((r) => {
              this.results = []
              for(let i in r.results) {
                if(i > 12) break
                let res = r.results[i]
                let result = {}
                if('species' in res) {
                  let species = res['species']
                  if('commonNames' in species && species['commonNames'].length > 0) result[this.localizedSpeciesKey] = species['commonNames'][0]
                  if('genus' in species && 'scientificNameWithoutAuthor' in species['genus']) result['genus'] = species['genus']['scientificNameWithoutAuthor']
                  if('scientificNameWithoutAuthor' in species) result['species'] = species['scientificNameWithoutAuthor']
                }
                  /* TODO: how to get these info from plantnet?
                  this.editedProperties['leaf_cycle'] = ''
                  this.editedProperties['leaf_type'] = ''*/

                result['imageUrl'] = res.images.length > 0 && res.images[0].url.m !== undefined ? res.images[0].url.m : ''
                result['score'] = res['score']
                this.results.push(result)
              }
            }).catch(console.error)
          }
        }).catch((error) => {
          console.error(error)
        })
        
      },
      onResultSelect(e, id) {
        for(let r = 0; r < this.results.length; r++) {
          let result = this.results[r]
          result.selected = (r === id)
          if(r === id) {
            console.log('select result')

            // edit this feature osm properties from plantnet infos
            this.editedProperties = this.originalFeature.properties
            
            if(this.localizedSpeciesKey in result) {
              this.editedProperties[this.localizedSpeciesKey] = result[this.localizedSpeciesKey]
            }
            if('genus' in result) {
              this.editedProperties['genus'] = result['genus']
            }
            if('species' in result) {
              this.editedProperties['species'] = result['species']
            }

            this.readyToSend = true
          }
        }
      },
      onSave() {
        let feature = this.originalFeature
        feature.properties = this.editedProperties
        // save the feature
        this.components.osmConnector.addEditedFeature(feature)
        if(this.components.featureResult.isLoaded(feature)) this.components.featureResult.loadFeature(feature, 'plant')
        if(this.components.featureEditor.isLoaded(feature)) this.components.featureEditor.loadFeature(feature)
        this.readyToSend = false
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
  .cameras {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
  height: 50px;
  margin: 0px auto;
  position: relative;
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

.result {
  position: relative;
  margin: 5px;
  cursor: pointer;
  padding: 5px;
  border-radius: 10px;
}

.result:hover {
  box-shadow: 0 0 0 1pt grey;
}

.result_selected {
  background-color: #FF9454;
}

.result-image {
  border-radius: 10px;
  width: 100%;
  height: auto;
}

.result-info {
  position: absolute;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  bottom: 0;
  left: 0;
  padding-left: 15px;
  font-size: 17px;
  z-index: 5;
}

.result-label-title {
  font-weight: bold;
}

  </style>
  