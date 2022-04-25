<template>

    <div class="cat" 
      v-if="props !== null">
      <div id="feature-title" :style="{ 'background-color': theme.color }">
        <h3>{{name}}</h3>
        <div class="type">{{type}}</div>
      </div>

      <div class="normal" v-if="props.hasOwnProperty('alt_name')">Aussi appelé : {{props.alt_name}}</div>
      <div class="normal" v-if="props.tourism === 'attraction'">Attraction touristique</div>

      <img v-if="props.hasOwnProperty('image')" :src="props.image"/>

      <div class="normal" v-if="props.hasOwnProperty('start_date')" v-html="dateDescription"></div>

      <div class="normal" v-if="props.hasOwnProperty('artist_name')">Artiste : {{props.artist_name}}</div>
      <div class="normal" v-if="props.hasOwnProperty('architect')">Architecte : {{props.architect}}</div>
      <div class="normal" v-if="props.hasOwnProperty('artwork_subject')">Sujet de l'oeuvre : {{props.artwork_subject}}</div>
      <div class="normal" v-if="props.hasOwnProperty('material')">Matériau : {{material}}</div>

      <div class="normal" v-if="props.hasOwnProperty('historic')" v-html="historicDescription"></div>

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

      <div class="normal" v-if="props.hasOwnProperty('heritage')">Niveau de protection du patrimoine : {{props['heritage']}}</div>
      <div class="normal" v-if="props.hasOwnProperty('heritage:operator')">Opérateur de protection du patrimoine : {{heritageOperator}}</div>
      
      <div class="normal" v-if="props.hasOwnProperty('mhs:inscription_date')">Date d'inscription : {{dispDate(props['mhs:inscription_date'])}}</div>

      <div class="normal" v-if="props.hasOwnProperty('ref:whc')">Référence UNSECO {{props['ref:whc']}}</div>
      <div class="normal" v-if="props.hasOwnProperty('ref:mhs')"><a target="_blank" :href="'https://www.pop.culture.gouv.fr/notice/merimee/' + props['ref:mhs']">Base Mérimée {{props['ref:mhs']}}</a></div>
      <div class="normal" v-if="props.hasOwnProperty('website')"><a target="_blank" :href="props['website']">{{props['website']}}</a></div>
      <div class="normal" v-if="props.hasOwnProperty('heritage:website')"><a target="_blank" :href="props['heritage:website']">{{props['heritage:website']}}</a></div>

      <div class="normal" v-if="props.hasOwnProperty('fixme')">Note : {{props.fixme}}</div>
      <div class="normal" v-if="props.hasOwnProperty('description')">Description : {{props.description}}</div>
      <div class="normal" v-if="props.hasOwnProperty('inscription')">Inscription : {{props.inscription}}</div>
      <div class="normal" v-if="props.hasOwnProperty('source')">Source : {{props.source}}</div>
      
      <div class="small">
        <a target="_blank" :href="'https://www.openstreetmap.org/' + id.split('/')[0] + '/' + id.split('/')[1]">Voir sur OpenStreetMap</a>
        &nbsp;
        <a target="_blank" :href="'https://www.openstreetmap.org/edit?' + id.split('/')[0] + '=' + id.split('/')[1] + '&hashtags=tumulus#map=20/' + props.lat + '/' + props.lng">Editer avec iD</a>
      </div>
    </div>

</template>

<script>

//import * as env from './utils/env.js'
import ExpandableImage from './ExpandableImage.vue'
import * as config from '../const/config.js'
import * as types from '../const/types.js'
import {wikipediaApi} from '../utils/WikiApi.js'

export default {
  name: 'FeatureResult',
  components: {
    ExpandableImage
  },
  data () {
    return {
      components: null,
      debug: config.DEBUG,
      id: '',
      props: null,
      wikis: [],
      theme: {}
    }
  },
  computed: {
    name() {
      if(this.props.name !== undefined) {
        return this.props.name
      } else {
        if(this.props.wikipedia !== undefined) {
          const s = this.props.wikipedia.split(':')
          if(s.length > 1) return s[1]
          else return this.props.wikipedia
        } else {
          return this.type
        }
      }
    },
    type() {
      let type = types.historicTypes[this.props.historic]
      if(!type && this.props.man_made) type = types.manMadeTypes[this.props.man_made]
      if(!type && this.props.amenity) type = types.amenityTypes[this.props.amenity]
      if(!type && this.props.military) type = types.militaryTypes[this.props.military]

      if(this.props.historic === 'memorial' && this.props.memorial) {
        type = types.memorialTypes[this.props.memorial]
        if(!type) type = this.props.memorial
      }
      
      if(this.props.tourism === 'artwork') {
        type = 'Oeuvre d\'art'
        if(this.props.artwork_type) {
          type = types.artworkTypes[this.props.artwork_type]
          if(!type) type = this.props.artwork_type
        }
      }

      if(this.props.railway === 'abandoned') {
        type = types.railwayTypes[this.props.railway]
      }
      
      return type
    },
    dateDescription() {
      let dd = 'Date : '
      if(this.props.end_date !== undefined) dd += 'de ' + this.props.start_date + ' à ' + this.props.end_date
      else dd += this.props.start_date
      return dd
    },
    historicDescription() {
      let hd = ''
      if(this.props.historic === 'archaeological_site' && this.props.site_type !== undefined) hd += 'Type de site : ' + types.archaeologicalSiteType[this.props.site_type] + '<br/>'
      if(this.props.site_type === 'megalith' && this.props.megalith_type !== undefined) hd += 'Type de mégalithe : ' + types.megalithType[this.props.megalith_type] + '<br/>'
      if(this.props.moved !== undefined) hd += 'Déplacé : ' + (this.props.moved === 'yes' ? 'Oui' : 'Non') + '<br/>'
      return hd
    },
    material() {
      let m = types.materialTypes[this.props.material]
      if(m === undefined) m = this.props.material
      return m
    },
    heritageOperator() {
      let ho = types.heritageOperators[this.props['heritage:operator']]
      if(ho) return ho
      return this.props['heritage:operator']
    }
  },
  methods: {
    isLoaded(other) {
      return other.properties.id === this.id
    },
    loadFeature(feature, theme) {
      this.id = feature.id
      this.props = feature.properties
      this.theme = theme

      this.wikis = []
      this.loadWikiData('wikipedia', 'wikidata', '')
      this.loadWikiData('subject:wikipedia', 'subject:wikidata', 'Sujet : ')
      this.loadWikiData('artist:wikipedia', 'artist:wikidata', 'Artiste : ')
      this.loadWikiData('architect:wikipedia', 'architect:wikidata', 'Architecte : ')
    },
    unloadFeature() {
      this.id = null
      this.props = null
      this.wikis = []
    },
    async loadWikiData(wikipediaKey, wikidataKey, titlePrefix) {
      if(this.props[wikipediaKey] !== undefined) {
        const data = await wikipediaApi(this.props[wikipediaKey])
        if(data !== null) {
          data.displaytitle = titlePrefix + data.displaytitle
          this.wikis.push(data)
        }
      } else {
        if(this.props[wikidataKey] !== undefined) {
          this.wikis.push({
            displaytitle: titlePrefix,
            wikibase_item: this.props[wikidataKey]
          })
        }
      }
    },
    dispDate(date) {
      return date
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

#feature-title {
  margin: 0px;
  margin-bottom: 5px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  padding: 5px;
}

h3 {
  margin: 5px 5px 5px 5px;
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

</style>
