<template>
    <div class="cat" v-if="issues.length > 0">
        <h3>Problèmes identifiés</h3>
        <div id="issues">
            <div class="issue"
                v-for="issue in issues"
                :key="issue"
                :style="{ 'background-color': issue.theme.color, 'opacity': issue.theme.visible ? '1' : '0.3' }"
                @click="editFeature(issue)">
                <div class="importance" :class="importances[issue.importance]"></div>
                <div class="text">
                    <div class="name">{{issue.feature.properties.name}}</div>
                    <div class="message">{{issue.message}}</div>
                </div>
                <div class="buttons">
                    <button class="little" title="Editer" @click="editFeature(issue)" :disabled="!connected" :class="issue.manuallyRepaired === undefined ? '' : (issue.manuallyRepaired == 1 ? 'repaired' : '')">
                        <img src="/ui/edit.svg" width=18 />
                    </button>
                    <button class="little" title="Réparer" @click="autoRepairFeature(issue)" :disabled="typeof issue.autoRepair !== 'function' || !connected" :class="issue.autoRepaired === undefined ? '' : (issue.autoRepaired == 1 ? 'repaired' : 'irreparable')">
                        <img src="/ui/repair.svg" width=18 />
                    </button>
                    <button class="little" title="Masquer" @click="deleteIssue(issue)">
                        <img src="/ui/clear.svg" width=18 />
                    </button>
                </div>
            </div>
        </div>
        <button id="autorepairall" @click="autoRepairAll" :disabled="!connected">
            <img src="/ui/repair.svg" width=18 />
            <span>Tout réparer automatiquement</span>
        </button>
    </div>
</template>

<script lang="ts">

import * as wikipediaWithoutWikidata from '../issues/WikipediaWithoutWikidata'
import * as wikidataWithoutWikipedia from '../issues/WikidataWithoutWikipedia'
import * as wikipediaMissingLanguage from '../issues/WikipediaMissingLanguage'
import * as badUseOfAge from '../issues/BadUseOfAge'
import * as archeologicalSiteMissingSiteType from '../issues/ArcheologicalSiteMissingSiteType'
import * as mhs from '../issues/Mhs'
import * as monumentWithoutHeritage from '../issues/MonumentWithoutHeritage'
import * as invader from '../issues/Invader'

export default {
  name: 'IssueAnalyzer',
  data() {
    return {
        components: null,
        issues: [],
        importances: ["missing-data", "warning", "error"],
        editingIssue: null
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
    deleteIssue(issue) {
        this.issues.splice(this.issues.indexOf(issue), 1)
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
            this.issues.push(...invader.detect(feature, theme))
        }
    },
    editFeature(issue) {
        this.components.map.selectFeature(issue.feature, issue.theme)
        this.editingIssue = issue
    },
    async autoRepairFeature(issue) {
        this.components.editorLog.add('Tentative de réparation du problème : ' + issue.message + ' sur l\'élément ' + issue.feature.id)
        const reparation = await issue.autoRepair()
        if(reparation !== null) {
            this.components.editorLog.addInline(reparation.message + ' <span style="color: lightgreen;">[Réussi]</span>')
            issue.autoRepaired = 1
            let feature = reparation.feature
            this.components.osmConnector.addEditedFeature(feature)
            if(this.components.featureResult.isLoaded(feature)) this.components.featureResult.loadFeature(feature, issue.theme)
            if(this.components.featureEditor.isLoaded(feature)) this.components.featureEditor.loadFeature(feature)
        } else {
            this.components.editorLog.addInline(' <span style="color: #ffaaaa;">[Echec]</span>')
            issue.autoRepaired = 2
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
    },
    setEditedKeys(featureId, editedKeys) {
        console.log("setEditedKeys")
        console.log(editedKeys)
        if(this.editingIssue !== null && featureId === this.editingIssue.feature.id) {
            if(editedKeys.indexOf(this.editingIssue.repairedIfEdited) > -1) {
                this.editingIssue.manuallyRepaired = true
                for(let i in this.issues) {
                    let issue = this.issues[i]
                    if(issue.feature.id === featureId && issue.message === this.editingIssue.message) {
                        issue.manuallyRepaired = true
                    }
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
  position: relative;
  display: flex;
  flex-direction: column;
}

h3 {
  margin: 5px 5px 5px 5px;
}

.issue {
    font-size: 12px;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    user-select: none;
    padding: 5px;
    margin: 5px 0px;
    position: relative;
    display: flex;
    align-items: center;
}

.issue:hover, .issue:active {
    text-decoration: underline;
}

.importance {
  margin: 2px;
  width: 15px;
  height: 15px;
  margin: 5px;
  border-radius: 100%;
}

.text {
    margin: 5px;
    padding-right: 65px;
}

.buttons {
    position: absolute;
    right: 5px;
    margin: 5px;
}

.repaired {
    background-color: #00aa00;
}

.irreparable {
    background-color: #ff5555;
}

.little {
    width: 24px;
    height: 24px;
    border-radius: 20%;
    margin: 4px;
    margin-right: 0px;
    padding: 3px;
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
    font-size: 12px;
}

#autorepairall {
    margin: 5px 0px;
    padding-bottom: 8px;
}

#autorepairall > img, #autorepairall > span {
    vertical-align: middle;
    padding-right: 5px;
}

</style>
