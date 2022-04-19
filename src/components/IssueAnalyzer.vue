<template>
    <div class="cat" v-if="issues.length > 0">
        <h3>Problèmes identifiés</h3>
        <div id="issues">
            <div class="issue"
                v-for="issue in issues"
                :key="issue"
                :style="{ 'background-color': importances[issue.importance]}"
                @click="editFeature(issue)">
                {{issue.message}}
                <button @click="editFeature(issue)">E</button>
                <button @click="autoRepairFeature(issue)" :disabled="typeof issue.autoRepair !== 'function' || !connected">R</button>
            </div>
        </div>
        <button @click="autoRepairAll" :disabled="!connected">Tout réparer automatiquement</button>
    </div>
</template>

<script>

import * as wikipediaWithoutWikidata from '../issues/WikipediaWithoutWikidata.js'
import * as wikipediaMissingLanguage from '../issues/WikipediaMissingLanguage.js'

export default {
  name: 'IssueAnalyzer',
  data() {
    return {
        features: null,
        issues: [],
        importances: ["yellow", "orange", "red"],
        osmConnector: null,
        featureEditor: null
    }
  },
  computed: {
      connected() {
          return this.osmConnector.connected
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
            this.issues.push(...wikipediaMissingLanguage.detect(feature))
/*
            if(props['age'] !== undefined) this.issues.push({id: feature.id, importance: 1, message: 'Attribut age peut-être mal utilisé (à remplacer par start_date)'})

            if(props['historic'] === 'archaeological_site' && props['site_type'] === undefined) this.issues.push({id: feature.id, importance: 2, message: 'Attribut site_type manquant pour le site archéologique'})
*/
        }
    },
    editFeature(issue) {
        this.featureEditor.loadFeature(issue.feature)
    },
    async autoRepairFeature(issue) {
        console.log('repairing ' + issue.feature.id + ' ' + issue.message)
        const feature = await issue.autoRepair()
        if(feature !== null) {
            console.log(feature)
            console.log('[OK]')
            this.osmConnector.addEditedFeature(feature)
        } else {
            console.log('[NOK]')
        }
    },
    async autoRepairAll() {
        for(let i in this.issues) {
            let issue = this.issues[i]
            if(typeof issue.autoRepair == 'function') {
                await this.autoRepairFeature(issue)
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

</style>
