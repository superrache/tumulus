<template>
    <div class="cat" v-if="issues.length > 0">
        <h3>Problèmes identifiés</h3>
        <div id="issues">
            <div class="issue"
                v-for="i in issues"
                :key="i"
                :style="{ 'background-color': importances[i.importance]}">
                <a target="_blank" :href="'https://www.openstreetmap.org/edit?' + i.id.split('/')[0] + '=' + i.id.split('/')[1] + '&hashtags=tumulus'">{{i.message}}</a>
            </div>
        </div>
        <button @click="autoRepair">Auto-repair</button>
    </div>
</template>

<script>

export default {
  name: 'IssueAnalyzer',
  data() {
    return {
        features: null,
        issues: [],
        importances: ["yellow", "orange", "red"],
        osmConnector: null
    }
  },
  methods: {
    clear() {
        this.issues = []
    },
    analyzeFeature(features, theme) {
        this.features = features

        for(let f in features) {
            const feature = features[f]
            const properties = feature.properties

            //if(properties.name === undefined) this.issues.push({id: feature.id, theme: theme, importance: 0, message: 'Pas de nom'})

            if(properties.wikipedia !== undefined && properties.wikipedia.indexOf(':') < 0) this.issues.push({id: feature.id, theme: theme, importance: 2, message: 'Langue manquante dans la référence wikipedia'})
            if(properties['artist:wikipedia'] !== undefined && properties['artist:wikipedia'].indexOf(':') < 0) this.issues.push({id: feature.id, theme: theme, importance: 2, message: 'Langue manquante dans la référence artist:wikipedia'})
            if(properties['subject:wikipedia'] !== undefined && properties['subject:wikipedia'].indexOf(':') < 0) this.issues.push({id: feature.id, theme: theme, importance: 2, message: 'Langue manquante dans la référence subject:wikipedia'})
 
            if(properties.wikipedia !== undefined && properties.wikidata === undefined) this.issues.push({id: feature.id, theme: theme, importance: 1, message: 'Référence wikipedia sans référence wikidata'})
            if(properties.wikidata !== undefined && properties.wikipedia === undefined) this.issues.push({id: feature.id, theme: theme, importance: 1, message: 'Référence wikidata sans référence wikipedia'})
            if(properties['artist:wikipedia'] !== undefined && properties['artist:wikidata'] === undefined) this.issues.push({id: feature.id, theme: theme, importance: 1, message: 'Référence artist:wikipedia sans référence artist:wikidata'})
            if(properties['artist:wikidata'] !== undefined && properties['artist:wikipedia'] === undefined) this.issues.push({id: feature.id, theme: theme, importance: 1, message: 'Référence artist:wikidata sans référence artist:wikipedia'})
            if(properties['subject:wikipedia'] !== undefined && properties['subject:wikidata'] === undefined) this.issues.push({id: feature.id, theme: theme, importance: 1, message: 'Référence subject:wikipedia sans référence subject:wikidata'})
            if(properties['subject:wikidata'] !== undefined && properties['subject:wikipedia'] === undefined) this.issues.push({id: feature.id, theme: theme, importance: 1, message: 'Référence subject:wikidata sans référence subject:wikipedia'})

        }
    },
    autoRepair() {
        this.osmConnector.autoRepair(this.features)
    }
  }
}

</script>

<style scoped>

.cat {
  background-color: #444;
  border-radius: 10px;
  padding: 7px;
  padding-right: 15px;
  margin: 5px 0px 10px 0px;
}

.issue {
    font-size: 12px;
    border-radius: 5px;
    color: black;
    cursor: pointer;
    user-select: none;
    padding: 5px;
    margin: 2px 0px;
}

.issue:hover, .issue:active {
    text-decoration: underline;
}

a {
    text-decoration: none;
    color: black;
}

</style>
