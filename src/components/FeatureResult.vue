<template>

    <div class="cat" 
      v-if="props !== null">
      <div id="feature-title" :style="{ 'background-color': theme.color }">
        <h3>{{name}}</h3>
        <div class="type">{{type}}</div>
      </div>

      <div class="normal" v-if="'alt_name' in props">{{$t('altName') + ' ' + props.alt_name}}</div>
      <div class="normal" v-if="props.tourism === 'attraction'">{{$t('touristAttraction')}}</div>

      <img v-if="props.hasOwnProperty('image')" :src="props.image"/>

      <div class="normal" v-if="'start_date' in props" v-html="dateDescription"></div>
      <div class="normal" v-if="'survey:date' in props">{{$t('surveyDate') + ' ' + dispDate(props['survey:date'])}}</div>

      <div class="normal" v-if="'artist_name' in props">{{$t('artist') + ' ' + props.artist_name}}</div>
      <div class="normal" v-if="'architect' in props">{{$t('architect') + ' ' + props.architect}}</div>
      <div class="normal" v-if="'artwork_subject' in props">{{$t('artworkSubject') + ' ' + props.artwork_subject}}</div>
      <div class="normal" v-if="'material' in props">{{$t('material') + ' ' + material}}</div>

      <div class="normal" v-if="'historic' in props" v-html="historicDescription"></div>

      <div class="normal" v-if="trValue('genus') !== ''">{{$t('genus') + ' ' + trValue('genus')}}</div>
      <div class="normal" v-if="trValue('species') !== ''">{{$t('species') + ' ' + trValue('species')}}</div>
      <div class="normal" v-if="trValue('taxon') !== ''">{{$t('taxon') + ' ' + trValue('taxon')}}</div>
      <div class="normal" v-if="'leaf_cycle' in props">{{$t('leaf_cycle') + ' ' + trValue('leaf_cycle')}}</div>
      <div class="normal" v-if="'leaf_type' in props">{{$t('leaf_type') + ' ' + trValue('leaf_type')}}</div>

      <div v-for="w in wikis" :key="w.pageId">
        <div class="subtitle" v-html="w.displaytitle"></div>

        <div v-if="'thumbnail' in w && 'originalimage' in w">
          <ExpandableImage :thumbnail="w.thumbnail.source" :original="w.originalimage.source" />
        </div>
        
        <div class="normal" v-if="'extract_html' in w && 'content_urls' in w">
          <span v-html="w.extract_html"></span>
          <a target="_blank" :href="w.content_urls.desktop.page">{{$t('readMore')}}</a>
        </div>
        <div class="normal" v-if="'wikibase_item' in w">
          <a target="_blank" :href="'https://www.wikidata.org/wiki/' + w.wikibase_item">{{$t('seeOnWikidata')}}</a>
        </div>
      </div>

      <div class="normal" v-if="'heritage' in props">{{$t('heritageLevel') + ' ' + props['heritage']}}</div>
      <div class="normal" v-if="'heritage:operator' in props">{{$t('heritageOperator') + ' ' + trValue('heritage:operator')}}</div>
      
      <div class="normal" v-if="'mhs:inscription_date' in props">{{$t('inscriptionDate') + ' ' + dispDate(props['mhs:inscription_date'])}}</div>

      <div class="normal" v-if="'ref:whc' in props">{{$t('unescoReference') + ' ' + props['ref:whc']}}</div>
      <div class="normal" v-if="'ref:mhs' in props"><a target="_blank" :href="'https://www.pop.culture.gouv.fr/notice/merimee/' + props['ref:mhs']">{{$t('merimeeDatabase') + ' ' + props['ref:mhs']}}</a></div>
      <div class="normal" v-if="'website' in props"><a target="_blank" :href="props['website']">{{props['website']}}</a></div>
      <div class="normal" v-if="'heritage:website' in props"><a target="_blank" :href="props['heritage:website']">{{props['heritage:website']}}</a></div>

      <div class="normal" v-if="'fixme' in props">{{$t('note') + ' ' + props.fixme}}</div>
      <div class="normal" v-if="'description' in props">{{$t('description') + ' ' + props.description}}</div>
      <div class="normal" v-if="'inscription' in props">{{$t('inscription') + ' ' + props.inscription}}</div>
      <div class="normal" v-if="'source' in props">{{$t('source') + ' ' + props.source}}</div>
      
      <div class="small">
        <a target="_blank" :href="'https://www.openstreetmap.org/' + id.split('/')[0] + '/' + id.split('/')[1]">{{$t('seeOnOpenStreetMap')}}</a>
        &nbsp;
        <a target="_blank" :href="'https://www.openstreetmap.org/edit?' + id.split('/')[0] + '=' + id.split('/')[1] + '&hashtags=tumulus#map=20/' + props.lat + '/' + props.lng">{{$t('editWithID')}}</a>
      </div>
    </div>

</template>

<script>

//import * as env from './utils/env.js'
import ExpandableImage from './ExpandableImage.vue'
import * as config from '../const/config.js'
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
          //return this.type
          return ''
        }
      }
    },
    type() {
      let type = this.trValue('historic')
      if(!type && this.props.man_made) type = this.trValue('man_made')
      if(!type && this.props.amenity) type = this.trValue('amenity')
      if(!type && this.props.military) type = this.trValue('military')
      if(!type && this.props.natural) type = this.trValue('natural')

      if(this.props.historic === 'memorial' && this.props.memorial) {
        if(this.props.memorial) type = this.trValue('memorial')
        else type = this.props.memorial
      }
      
      if(this.props.tourism === 'artwork') {
        if(this.props.artwork_type) type = this.trValue('artwork_type')
        else type = this.$t('artwork')
      }

      if(this.props.railway === 'abandoned') {
        type = this.$t('abandoned_railway')
      }
      
      return type
    },
    dateDescription() {
      let dd = this.$t('date')
      if(this.props.end_date !== undefined) dd += this.$t('from') + ' ' + this.dispDate(this.props.start_date) + ' ' + this.$t('to') + ' ' + this.dispDate(this.props.end_date)
      else dd += this.props.start_date
      return dd
    },
    historicDescription() {
      let hd = ''
      if(this.props.historic === 'archaeological_site' && this.props.site_type !== undefined) hd += this.$t('siteType') + this.trValue('site_type') + '<br/>'
      if(this.props.site_type === 'megalith' && this.props.megalith_type !== undefined) hd += this.$t('megalithType') + this.trValue('megalith_type') + '<br/>'
      if(this.props.moved !== undefined) hd += this.$t('moved') + (this.props.moved === 'yes' ? this.$t('yes') : this.$t('no')) + '<br/>'
      return hd
    },
    material() {
      let m = this.trValue('material')
      if(m === '') m = this.props.material
      return m
    }
  },
  methods: {
    trValue(key) {
      // first, try a locale value from osm, for eg. 'species:fr'
      const localeKey = `${key}:${this.$parent.$data.locale}`
      if(localeKey in this.props) return this.props[localeKey]
      // then look for a translation of the value
      if(key in this.props) {
        if(this.$te(this.props[key])) return this.$t(this.props[key]) // $te() = a translation exists
        else return this.props[key]
      }
      return ''
      //return this.props[key] !== undefined ? `${this.props[key]} => ${this.$t(this.props[key])}` : ''
    },
    isLoaded(other) {
      return other.properties.id === this.id
    },
    loadFeature(feature, theme) {
      this.theme = theme
      this.updateFeature(feature)
    },
    updateFeature(feature) {
      this.id = feature.id
      this.props = feature.properties

      this.wikis = []
      this.loadWikiData('wikipedia', 'wikidata', '')
      this.loadWikiData('subject:wikipedia', 'subject:wikidata', this.$t('artworkSubject'))
      this.loadWikiData('artist:wikipedia', 'artist:wikidata', this.$t('artist'))
      this.loadWikiData('architect:wikipedia', 'architect:wikidata', this.$t('architect'))
      this.loadWikiData('species:wikipedia', 'species:wikidata', this.$t('species'))
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
  padding-right: 5px;
  width: 100%;
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
