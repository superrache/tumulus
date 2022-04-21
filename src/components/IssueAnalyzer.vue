<template>
    <div class="cat" v-if="issues.length > 0">
        <h3>Problèmes identifiés</h3>
        <div id="issues">
            <div class="issue"
                v-for="issue in issues"
                :key="issue"
                :style="{ 'background-color': issue.theme.color}"
                @click="selectFeature(issue)">
                <div class="importance" :class="importances[issue.importance]"></div>
                <span class="name">{{issue.feature.properties.name}}</span>
                <br/>
                <span class="message">{{issue.message}}</span>
                <button title="Carte" @click="selectFeature(issue)" :disabled="!issue.theme.visible">C</button>
                <button title="Editer" @click="editFeature(issue)">E</button>
                <button title="Réparer" @click="autoRepairFeature(issue)" :disabled="typeof issue.autoRepair !== 'function' || !connected" :class="issue.repaired !== undefined && issue.repaired ? 'repaired' : ''">R</button>
            </div>
        </div>
        <button @click="autoRepairAll" :disabled="!connected">Tout réparer automatiquement</button>
    </div>
</template>

<script>

import * as wikipediaWithoutWikidata from '../issues/WikipediaWithoutWikidata.js'
import * as wikidataWithoutWikipedia from '../issues/WikidataWithoutWikipedia.js'
import * as wikipediaMissingLanguage from '../issues/WikipediaMissingLanguage.js'
import * as badUseOfAge from '../issues/BadUseOfAge.js'
import * as archeologicalSiteMissingSiteType from '../issues/ArcheologicalSiteMissingSiteType.js'
import * as mhs from '../issues/Mhs.js'
import * as monumentWithoutHeritage from '../issues/MonumentWithoutHeritage.js'

export default {
  name: 'IssueAnalyzer',
  data() {
    return {
        components: null,
        issues: [],
        importances: ["missing-data", "warning", "error"]
    }
  },
  computed: {
      connected() {
          return this.components && this.components.osmConnector && this.components.osmConnector.connected
      }
  },
  methods: {
    clear() {
        this.issues = []
    },
    analyzeFeature(features, theme) {
        for(let f in features) {
            const feature = features[f]

            feature.lang = this.components.map.countryCode

            this.issues.push(...wikipediaWithoutWikidata.detect(feature, theme))
            this.issues.push(...wikidataWithoutWikipedia.detect(feature, theme))
            this.issues.push(...wikipediaMissingLanguage.detect(feature, theme))
            this.issues.push(...badUseOfAge.detect(feature, theme))
            this.issues.push(...archeologicalSiteMissingSiteType.detect(feature, theme))
            this.issues.push(...mhs.detect(feature, theme))
            this.issues.push(...monumentWithoutHeritage.detect(feature, theme))
        }
    },
    selectFeature(issue) {
        this.components.map.selectFeature(issue.feature, issue.theme)
    },
    editFeature(issue) {
        this.components.featureEditor.loadFeature(issue.feature)
    },
    async autoRepairFeature(issue) {
        this.components.editorLog.add('Tentative de réparation du problème : ' + issue.message + ' sur l\'élément ' + issue.feature.id)
        const feature = await issue.autoRepair()
        if(feature !== null) {
            this.components.editorLog.addInline(' <span style="color: lightgreen;">[Réussi]</span>')
            issue.repaired = true
            this.components.osmConnector.addEditedFeature(feature)
        } else {
            this.components.editorLog.addInline(' <span style="color: #ffaaaa;">[Echec]</span>')
        }
    },
    async autoRepairAll() {
        this.components.editorLog.clear()

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
    color: white;
    cursor: pointer;
    user-select: none;
    padding: 5px;
    margin: 2px 0px;
}

.issue:hover, .issue:active {
    text-decoration: underline;
}

.repaired {
    text-decoration: line-through;
}

button {
    margin-left: 2px;
}

.importance {
  margin: 2px;
  width: 15px;
  height: 15px;
  border-radius: 100%;
}

.missing-data {
  background-color: yellow;
}

.warning {
  background-color: orange;
}

.error {
  background-color: red;
}

.name {
    font-size: 12px;
    font-weight: 700;
}

.message {
    font-size: 10px;
}

</style>
