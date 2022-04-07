<template>

    <div class="cat" 
      v-if="properties !== null">
      <div id="feature-title" :style="{ 'background-color': theme.color }">
        <h3>{{name}}</h3>
        <div class="type">{{type}}</div>
      </div>

      <img v-if="properties.hasOwnProperty('image')" :src="properties.image"/>

      <div class="normal" v-if="properties.hasOwnProperty('start_date')">Date : {{properties.start_date}}</div>
      <div class="normal" v-if="properties.hasOwnProperty('artist_name')">Artiste : {{properties.artist_name}}</div>
      <div class="normal" v-if="properties.hasOwnProperty('artwork_subject')">Sujet de l'oeuvre : {{properties.artwork_subject}}</div>
      <div class="normal" v-if="properties.hasOwnProperty('material')">Matériau : {{properties.material}}</div>

      <div class="normal" v-if="properties.hasOwnProperty('historic')" v-html="historicDescription"></div>

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
      
      <div class="small">
        <a target="_blank" :href="'https://www.openstreetmap.org/' + id.split('/')[0] + '/' + id.split('/')[1]">Voir sur OpenStreetMap</a>
        &nbsp;
        <a target="_blank" :href="'https://www.openstreetmap.org/edit?' + id.split('/')[0] + '=' + id.split('/')[1] + '&hashtags=tumulus#map=20/' + lngLat.lat + '/' + lngLat.lng">Editer</a>
      </div>
    </div>

    <div class="cat" v-show="debug" v-if="properties !== null">
      <div class="normal">key=value</div>
      <div class="small"
          v-for="p in Object.keys(properties)"
          :key="p">
          <span v-if="p !== 'g'">{{p}}={{properties[p]}}</span>
      </div>
    </div>
</template>

<script>

//import * as env from './utils/env.js'
import ExpandableImage from './ExpandableImage.vue'
import * as config from './config.js'
import * as types from './types.js'

export default {
  name: 'FeatureResult',
  components: {
    ExpandableImage
  },
  data () {
    return {
      debug: config.DEBUG,
      id: '',
      lngLat: {lng: 0, lat: 0},
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
      let type = types.historicTypes[this.properties.historic]
      
      if(this.properties.historic === 'yes') {
        if(this.properties.man_made !== undefined) type = types.manMadeTypes[this.properties.man_made]
        if(this.properties.amenity !== undefined) type = types.amenityTypes[this.properties.amenity]
        if(this.properties.military !== undefined) type = types.militaryTypes[this.properties.military]
      }

      if(this.properties.historic === 'memorial' && this.properties.memorial !== undefined) {
        type = types.memorialTypes[this.properties.memorial]
        if(type === undefined) type = this.properties.memorial
      }
      
      if(this.properties.tourism === 'artwork') {
        type = 'Oeuvre d\'art'
        if(this.properties.artwork_type !== undefined) {
          type = types.artworkTypes[this.properties.artwork_type]
          if(type === undefined) type = this.properties.artwork_type
        }
      }

      if(this.properties.railway === 'abandoned') {
        type = types.railwayTypes[this.properties.railway]
      }
      
      return type
    },
    historicDescription() {
      let hd = ''
      if(this.properties.historic === 'archaeological_site' && this.properties.site_type !== undefined) hd += 'Type de site : ' + types.archaeologicalSiteType[this.properties.site_type] + '<br/>'
      if(this.properties.site_type === 'megalith' && this.properties.megalith_type !== undefined) hd += 'Type de mégalithe : ' + types.megalithType[this.properties.megalith_type] + '<br/>'
      if(this.properties.moved !== undefined) hd += 'Déplacé : ' + (this.properties.moved === 'yes' ? 'Oui' : 'Non') + '<br/>'
      return hd
    }
  },
  methods: {
    loadFeature(feature, theme, lngLat) {
      this.id = feature.id
      this.lngLat = lngLat
      this.properties = feature.properties
      this.theme = theme

      this.wikis = []
      this.loadWikiData('wikipedia', 'wikidata', '')
      this.loadWikiData('subject:wikipedia', 'subject:wikidata', 'Sujet : ')
      this.loadWikiData('artist:wikipedia', 'artist:wikidata', 'Artiste : ')
    },
    unloadFeature() {
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

a {
  color: aquamarine;
}

</style>
