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
        <button @click="autoRepair" :disabled="!osmConnector.connected">Auto-repair</button>
    </div>
</template>

<script>

import * as wikipediaWithoutWikidata from '../issues/WikipediaWithoutWikidata.js'

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
    analyzeFeature(features) {
        this.features = features

        for(let f in features) {
            const feature = features[f]

            this.issues.push(...wikipediaWithoutWikidata.detect(feature))


            /*if(props.wikipedia !== undefined && props.wikipedia.indexOf(':') < 0) this.issues.push({id: feature.id, importance: 2, message: 'Langue manquante dans la référence wikipedia'})
            if(props['artist:wikipedia'] !== undefined && props['artist:wikipedia'].indexOf(':') < 0) this.issues.push({id: feature.id, importance: 2, message: 'Langue manquante dans la référence artist:wikipedia'})
            if(props['architect:wikipedia'] !== undefined && props['architect:wikipedia'].indexOf(':') < 0) this.issues.push({id: feature.id, importance: 2, message: 'Langue manquante dans la référence architect:wikipedia'})
            if(props['subject:wikipedia'] !== undefined && props['subject:wikipedia'].indexOf(':') < 0) this.issues.push({id: feature.id, importance: 2, message: 'Langue manquante dans la référence subject:wikipedia'})
 
            if(props.wikipedia !== undefined && props.wikidata === undefined) this.issues.push({id: feature.id, importance: 1, message: 'Référence wikipedia sans référence wikidata'})
            if(props.wikidata !== undefined && props.wikipedia === undefined) this.issues.push({id: feature.id, importance: 1, message: 'Référence wikidata sans référence wikipedia'})
            if(props['artist:wikipedia'] !== undefined && props['artist:wikidata'] === undefined) this.issues.push({id: feature.id, importance: 1, message: 'Référence artist:wikipedia sans référence artist:wikidata'})
            if(props['artist:wikidata'] !== undefined && props['artist:wikipedia'] === undefined) this.issues.push({id: feature.id, importance: 1, message: 'Référence artist:wikidata sans référence artist:wikipedia'})
            if(props['architect:wikipedia'] !== undefined && props['architect:wikidata'] === undefined) this.issues.push({id: feature.id, importance: 1, message: 'Référence architect:wikipedia sans référence architect:wikidata'})
            if(props['architect:wikidata'] !== undefined && props['architect:wikipedia'] === undefined) this.issues.push({id: feature.id, importance: 1, message: 'Référence architect:wikidata sans référence architect:wikipedia'})
            if(props['subject:wikipedia'] !== undefined && props['subject:wikidata'] === undefined) this.issues.push({id: feature.id, importance: 1, message: 'Référence subject:wikipedia sans référence subject:wikidata'})
            if(props['subject:wikidata'] !== undefined && props['subject:wikipedia'] === undefined) this.issues.push({id: feature.id, importance: 1, message: 'Référence subject:wikidata sans référence subject:wikipedia'})

            if(props['age'] !== undefined) this.issues.push({id: feature.id, importance: 1, message: 'Attribut age peut-être mal utilisé (à remplacer par start_date)'})

            if(props['historic'] === 'archaeological_site' && props['site_type'] === undefined) this.issues.push({id: feature.id, importance: 2, message: 'Attribut site_type manquant pour le site archéologique'})
*/
        }
    },
    async autoRepair() {
        for(let i in this.issues) {
            let issue = this.issues[i]
            if(typeof issue.autoRepair == 'function') {
                console.log('repairing ' + issue.id + ' ' + issue.message)
                const feature = await issue.autoRepair()
                if(feature !== null) {
                    console.log(feature)
                    console.log('[OK]')
                    this.osmConnector.addEditedFeature(feature)
                } else {
                    console.log('[NOK]')
                }
            }
        }
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
