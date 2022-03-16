<template>
    <div class="cat" 
      v-if="properties !== null"
      :style="{ 'background-color': theme.color }">
      <h3 v-if="properties.hasOwnProperty('name')">{{properties.name}}</h3>
      <div class="type">{{type}}</div>
      <img :src="imageURL" width="280"/>
      <div class="normal" v-if="properties.hasOwnProperty('wikipedia')"><a target="_blank" :href="'https://wikipedia.org/wiki/' + properties.wikipedia">Wikipedia</a></div>
      <div class="normal" v-if="properties.hasOwnProperty('wikidata')"><a target="_blank" :href="'https://www.wikidata.org/wiki/' + properties.wikidata">Wikidata {{properties.wikidata}}</a></div>
      <div class="normal" v-if="properties.hasOwnProperty('ref:mhs')"><a target="_blank" :href="'https://www.pop.culture.gouv.fr/notice/merimee/' + properties['ref:mhs']">Base Mérimée {{properties['ref:mhs']}}</a></div>
      <div class="normal" v-if="properties.hasOwnProperty('start_date')">Date : {{properties.start_date}}</div>
      <div class="normal" v-if="properties.hasOwnProperty('fixme')">Note : {{properties.fixme}}</div>
      <div class="normal" v-if="properties.hasOwnProperty('description')">Description : {{properties.description}}</div>
      <div class="normal" v-if="properties.hasOwnProperty('inscription')">Inscription : {{properties.inscription}}</div>
      <div class="normal" v-if="properties.hasOwnProperty('source')">Source : {{properties.source}}</div>
      <div class="small"><a target="_blank" :href="'https://www.openstreetmap.org/node/' + id">OSM id={{id}}</a></div>
    </div>

    <div class="cat" v-show="DEBUG" v-if="properties !== null">
      <div class="normal">key=value</div>
      <div class="type"
          v-for="p in Object.keys(properties)"
          :key="p">
        {{p}}={{properties[p]}}
      </div>
    </div>
</template>

<script>

import * as env from './utils/env.js'

export default {
  name: 'FeatureResult',
  data () {
    return {
      DEBUG: true,
      types: {
        'yes': 'intérêt historique',
        'aircraft': 'Aéronef',
        'aqueduct': 'Aqueduc',
        'archaeological_site': 'Site archéologique',
        'battlefield': 'Champ de bataille',
        'bomb_crater': 'Cratère de bombe',
        'building': 'Bâtiment',
        'cannon': 'Canon',
        'castle': 'Château',
        'castle_wall': 'Mur défensif',
        'charcoal_pile': 'Tas de charbon',
        'church': 'Etablissement religieux',
        'city_gate': 'Porte de ville',
        'citywalls': 'Muraille',
        'farm': 'Ferme',
        'fort': 'Fort militaire',
        'gallows': 'Potence',
        'highwater_mark': 'Repère de crue',
        'locomotive': 'Locomotive',
        'manor': 'Manoir',
        'memorial': 'Mémorial',
        'mine': 'Mine',
        'mine_shaft': 'Mine',
        'milestone': 'Borne routière',
        'monastery': 'Monastère',
        'monument': 'Monument',
        'optical_telegraph': 'Télégraphe optique par sémaphore',
        'pillory': 'Pilori',
        'railway_car': 'Wagon',
        'ruins': 'Ruines',
        'rune_store': 'Pierre runique',
        'ship': 'Bateau ou sous-marin',
        'stone': 'Pierre',
        'tank': 'Tank',
        'tomb': 'Tombe',
        'tower': 'Tour',
        'vehicle': 'Véhicule',
        'wayside_cross': 'Croix ou calvaire',
        'wayside_shrine': 'Oratoire',
        'wreck': 'Epave'
      },
      id: '',
      properties: {},
      imageURL: '',
      theme: {}
    }
  },
  computed: {
    type() {
      var type = this.types[this.properties.historic]
      if(this.properties.historic === 'memorial' && this.properties.memorial !== undefined) {
        // TODO https://wiki.openstreetmap.org/wiki/FR:Tag:historic%3Dmemorial
        if(this.properties.memorial === 'plaque') type = 'Plaque commémorative'
        else if(this.properties.memorial === 'war_memorial') type = 'Mémorial de guerre'
        else if(this.properties.memorial === 'statue') type = 'Statue'
        else if(this.properties.memorial === 'bust') type = 'Buste'
        else if(this.properties.memorial === 'stele') type = 'Stèle'
        else if(this.properties.memorial === 'stone') type = 'Pierre'
        else type = this.properties.memorial
      }
      return type
    }
  },
  methods: {
    loadFeature(feature, theme) {
      this.id = feature.id
      this.properties = feature.properties
      this.theme = theme

      if(this.properties['name'] === undefined) {
        if(this.properties['wikipedia']) {
          this.properties.name = this.properties.wikipedia
        }
      }

      this.getImageURL()
    },
    unloadFeature() {
      console.log('unloadFeature')
      this.id = null
      this.properties = null
      this.imageURL = ''
    },
    async getImageURL() {
      if(this.properties.wikidata !== undefined) {
        const response = await fetch(env.getServerUrl() + "/image?type=wikidata&width=280&ref=" + this.properties.wikidata)
        const data = await response.json()
        this.imageURL = data.image
      }
    }

  }
}

</script>

<style scoped>

h3 {
  font-size: 1.2em;
  font-weight: 500;
  padding: 2px;
  margin: 4px;
}

.type {
  font-size: 1em;
  font-weight: 100;
}

.normal {

}

a {
  color: yellow;
}

.small {
  font-size: 0.7em;
  color: grey;
}

.cat {
  background-color: #aaaaaa33;
  border-radius: 10px;
  padding: 5px;
  margin: 5px 5px 10px 5px;
}

</style>
