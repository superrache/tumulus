<template>
    <section id="panel"
        v-on:scroll.prevent="handleScroll"
        :style="{ 'max-height': computedPanelMaxHeight }"
      >
      <div id="handle"></div>

      <h1>tumulus</h1>
      
      <div class="cat" v-if="properties !== null">
        <h3 v-if="properties.hasOwnProperty('name')">{{properties.name}}</h3>
        <div class="type">{{type}}</div>
        <div class="normal" v-if="properties.hasOwnProperty('wikipedia')"><a target="_blank" :href="'https://wikipedia.org/wiki/' + properties.wikipedia">Wikipedia</a></div>
        <div class="normal" v-if="properties.hasOwnProperty('wikidata')"><a target="_blank" :href="'https://www.wikidata.org/wiki/' + properties.wikidata">Wikidata {{properties.wikidata}}</a></div>
        <div class="normal" v-if="properties.hasOwnProperty('start_date')">Date : {{properties.start_date}}</div>
        <div class="normal" v-if="properties.hasOwnProperty('fixme')">Note : {{properties.fixme}}</div>
        <div class="normal" v-if="properties.hasOwnProperty('description')">Description : {{properties.description}}</div>
        <div class="normal" v-if="properties.hasOwnProperty('inscription')">Inscription : {{properties.inscription}}</div>
        <div class="small">{{properties.id}}</div>
      </div>
    </section>
</template>

<script>

export default {
  name: 'Panel',
  data () {
    return {
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
      properties: {},
      scrollPosition: 0,
      isRealScroll: true,
      windowWidth: 0,
      mobilePanelMaxHeight: 300
    }
  },
  created() {
    var self = this
    window.addEventListener('resize', function() {
      self.windowWidth = window.innerWidth
    })
    this.windowWidth = window.innerWidth
  },
  computed: {
    type() {
      var type = this.types[this.properties.historic]
      if(this.properties.historic === 'memorial') {
        // TODO https://wiki.openstreetmap.org/wiki/FR:Tag:historic%3Dmemorial
        if(this.properties.memorial !== undefined) type = this.properties.memorial
      }
      return type
    },
    computedPanelMaxHeight() {
      var value = ''
      if(this.windowWidth < 641)
        value = this.mobilePanelMaxHeight + 'px'
      else
        value = '100vh'
      console.log('computedPanelMaxHeight=' + value)
      return value
    }
  },
  methods: {
    handleScroll(e) {
      if(e.srcElement.scrollTop !== 0 && this.isRealScroll) {
        var currentScrollPosition = e.srcElement.scrollTop
        var diff = currentScrollPosition - this.scrollPosition
        this.mobilePanelMaxHeight += diff
        this.isRealScroll = false
        this.scrollPosition = currentScrollPosition
      }
      this.isRealScroll = true
    },
    loadFeature(feature) {
      console.log(feature.properties)
      this.properties = feature.properties

      if(this.properties['name'] === undefined) {
        if(this.properties['wikipedia']) {
          this.properties.name = this.properties.wikipedia
        }
      }

      // https://en.wikipedia.org/w/api.php?action=query&prop=info|extracts|pageimages|images&inprop=url&exsentences=1&titles=india
    }
  }
}

</script>

<style scoped>

#panel {
  z-index: 1005;
  position: absolute;
  bottom: 0px;
  width: 100%;
  height: auto;
  background-color: #000012bb;
  text-align: center;
  padding: 5px;
  box-shadow: 0px -1px 6px 0px rgba(0,0,0,0.75);
  overflow-y: auto;
  user-select: text;
}

#handle {
  position: relative;
  margin: auto;
  margin-bottom: 10px;
  width: 60px;
  height: 5px;
  background-color: #888;
  border-radius: 10px;
  cursor: move;
  visibility: visible;
}

@media only screen and (min-width: 641px) {
  #panel {
    left: 0px;
    top: 0px;
    width: 300px;
  }

  #handle {
    visibility: hidden;
  }
}

h1 {
  font-size: 2.5em;
  padding: 0px;
  margin: 5px;
}

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
