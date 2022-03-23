<template>

    <div class="cat" 
      v-if="properties !== null">
      <div id="title" :style="{ 'background-color': theme.color }">
        <h3>{{name}}</h3>
        <div class="type">{{type}}</div>
      </div>

      <img v-if="properties.hasOwnProperty('image')" :src="properties.image" width="280"/>

      <div class="normal" v-if="properties.hasOwnProperty('start_date')">Date : {{properties.start_date}}</div>
      <div class="normal" v-if="properties.hasOwnProperty('artist_name')">Artiste : {{properties.artist_name}}</div>
      <div class="normal" v-if="properties.hasOwnProperty('artwork_subject')">Sujet de l'oeuvre : {{properties.artwork_subject}}</div>
      <div class="normal" v-if="properties.hasOwnProperty('material')">Matériau : {{properties.material}}</div>

      <div v-for="w in wikis" :key="w.pageId">
        <div class="subtitle" v-html="w.displaytitle"></div>

        <div v-if="w.hasOwnProperty('thumbnail') && w.hasOwnProperty('originalimage')">
          <ExpandableImage :thumbnail="w.thumbnail.source" :original="w.originalimage.source" />
        </div>
        
        <div class="normal" v-if="w.hasOwnProperty('extract_html') && w.hasOwnProperty('content_urls')">
          <span v-html="w.extract_html"></span>
          <a target="_blank" :href="w.content_urls.desktop.page">Lire la suite ...</a>
        </div>
        <div class="normal" v-if="w.hasOwnProperty('wikibase_item')">
          <a target="_blank" :href="'https://www.wikidata.org/wiki/' + w.wikibase_item">Voir sur wikidata</a>
        </div>      
      </div>

      <div class="normal" v-if="properties.hasOwnProperty('ref:mhs')"><a target="_blank" :href="'https://www.pop.culture.gouv.fr/notice/merimee/' + properties['ref:mhs']">Base Mérimée {{properties['ref:mhs']}}</a></div>
      <div class="normal" v-if="properties.hasOwnProperty('website')"><a target="_blank" :href="properties['website']">{{properties['website']}}</a></div>

      <div class="normal" v-if="properties.hasOwnProperty('fixme')">Note : {{properties.fixme}}</div>
      <div class="normal" v-if="properties.hasOwnProperty('description')">Description : {{properties.description}}</div>
      <div class="normal" v-if="properties.hasOwnProperty('inscription')">Inscription : {{properties.inscription}}</div>
      <div class="normal" v-if="properties.hasOwnProperty('source')">Source : {{properties.source}}</div>
      
      <div class="small"><a target="_blank" :href="'https://www.openstreetmap.org/edit?' + elementType + '=' + id + '&hashtags=tumulus#map=20/' + lngLat.lat + '/' + lngLat.lng">Editer sur OpenStreetMap</a></div>
    </div>

    <div class="cat" v-show="DEBUG" v-if="properties !== null">
      <div class="normal">key=value</div>
      <div class="small"
          v-for="p in Object.keys(properties)"
          :key="p">
        {{p}}={{properties[p]}}
      </div>
    </div>
</template>

<script>

//import * as env from './utils/env.js'
import ExpandableImage from './ExpandableImage.vue'

export default {
  name: 'FeatureResult',
  components: {
    ExpandableImage
  },
  data () {
    return {
      DEBUG: true,
      historicTypes: {
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
      memorialTypes: {
        'plaque': 'Plaque commémorative',
        'war_memorial': 'Mémorial de guerre',
        'statue': 'Statue',
        'bust': 'Buste',
        'stele': 'Stèle',
        'stone': 'Pierre'
      },
      artworkTypes: {
        'architecture': 'Bâtiment remarquable',
        'mural': 'Oeuvre d\'art mural',
        'mural_painting': 'Peinture murale',
        'painting': 'Peinture',
        'sculpture': 'Sculpture',
        'statue': 'Statue',
        'bust': 'Buste',
        'stone': 'Rocher',
        'installation': 'Installation artistique',
        'graffiti': 'Graffiti',
        'tilework': 'Carrelage',
        'mosaic': 'Mosaïc',
        'azulejo': 'Azulejo',
        'land_art': 'Land art',
        'landart': 'Land art',
        'streetart': 'Streetart',
        'street_art': 'Streetart',
        'fountain': 'Fontaine',
        'column': 'Colonne',
        'stele': 'Stèle'
      },
      id: '',
      lngLat: {lng: 0, lat: 0},
      elementType: '',
      properties: null,
      wikis: [],
      theme: {}
    }
  },
  computed: {
    name() {
      if(this.properties.name !== undefined) {
        return this.properties.name
      } else {
        if(this.properties.wikipedia !== undefined) {
          const s = this.properties.wikipedia.split(':')
          if(s.length > 1) return s[1]
          else return this.properties.wikipedia
        } else {
          return this.type
        }
      }
    },
    type() {
      let type = this.historicTypes[this.properties.historic]
     
      if(this.properties.historic === 'memorial' && this.properties.memorial !== undefined) {
        type = this.memorialTypes[this.properties.memorial]
        if(type === undefined) type = this.properties.memorial
      }
      
      if(this.properties.tourism === 'artwork') {
        type = 'Oeuvre d\'art'
        if(this.properties.artwork_type !== undefined) {
          type = this.artworkTypes[this.properties.artwork_type]
          if(type === undefined) type = this.properties.artwork_type
        }
      }
      
      return type
    }
  },
  methods: {
    loadFeature(feature, theme, lngLat) {
      console.log('loadFeature')

      this.id = feature.id
      this.elementType = 'node' // TODO
      this.lngLat = lngLat
      this.properties = feature.properties
      this.theme = theme

      this.wikis = []
      this.loadWikiData('wikipedia', 'wikidata', '')
      this.loadWikiData('subject:wikipedia', 'subject:wikidata', 'Sujet : ')
      this.loadWikiData('artist:wikipedia', 'artist:wikidata', 'Artiste : ')

      //this.getImageURL()
    },
    unloadFeature() {
      console.log('unloadFeature')
      this.id = null
      this.properties = null
      this.wikis = []
    },
    async loadWikiData(wikipediaKey, wikidataKey, titlePrefix) {
      if(this.properties[wikipediaKey] !== undefined) {
        console.log('has ' + wikipediaKey + '=' + this.properties[wikipediaKey])
        const s = this.properties[wikipediaKey].split(':')
        if(s.length > 1) {
          const response = await fetch("https://" + s[0] + ".wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(s[1]))
          const data = await response.json()
          data.displaytitle = titlePrefix + data.displaytitle
          this.wikis.push(data)
        } else {
          console.log('il manque la lang fr: ou en: sur le wiki osm id=' + this.properties.id)
        }
      } else {
        if(this.properties[wikidataKey] !== undefined) {
          this.wikis.push({
            displaytitle: titlePrefix,
            wikibase_item: this.properties[wikidataKey]
          })
        }
      }
    }
    /*async getImageURL() {
      this.imageURL = ''
      if(this.properties.wikidata !== undefined) {
        const response = await fetch(env.getServerUrl() + "/image?type=wikidata&width=280&ref=" + this.properties.wikidata)
        const data = await response.json()
        this.imageURL = data.image
      }
    }*/

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

#title {
  margin: 0px;
  margin-bottom: 5px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 5px;
}

h3 {
  margin: 5px 5px 5px 5px;
  font-size: 1.5em;
}

.type {
  padding: 1px 5px;
}

img {
  padding-left: 5px;
}

.subtitle {
  padding: 5px 5px;
  font-weight: 700;
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
