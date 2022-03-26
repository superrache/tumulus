<template>
    <div class="cat" v-if="issues.length > 0">
        <h3>Problèmes identifiés</h3>
        <div id="issues">
            <div class="issue"
                v-for="i in issues"
                :key="i"
                :style="{ 'background-color': importances[i.importance]}">
                <a target="_blank" :href="'https://www.openstreetmap.org/edit?' + i.type + '=' + i.id + '&hashtags=tumulus'">{{i.message}}</a>
            </div>
        </div>
        <button @click="login" :disabled="authenticated">Se connecter</button>
        <span>{{userName}}</span>
        <button @click="logout" :disabled="!authenticated">Se déconnecter</button>
        <button @click="autoRepair" :disabled="!authenticated">Auto-repair</button>
    </div>
</template>

<script>

import OsmAuth from 'osm-auth'
import OsmRequest from 'osm-request'

const DEBUG = true

export default {
  name: 'IssueAnalyzer',
  data() {
    return {
        features: null,
        issues: [],
        importances: ["yellow", "orange", "red"],
        auth: null,
        authenticated: false,
        osmRequest: null,
        userName: ''
    }
  },
  created() {
    this.auth = OsmAuth({
        url: DEBUG ? 'https://www.openstreetmap.org' : 'https://www.openstreetmap.org',
        oauth_consumer_key: 'bTmTD4dsTPCymICqf9uMbr6XxaqiNJaprTruAzdy',
        oauth_secret: 'qgXfV5WWqGNOZwZfUB2Ngf2e3d6VlFQ0x4CwktvK',
        auto: true
    })

    this.osmRequest = new OsmRequest({
        endpoint: DEBUG ? 'https://master.apis.dev.openstreetmap.org' : 'https://www.openstreetmap.org',
        oauthConsumerKey: 'bTmTD4dsTPCymICqf9uMbr6XxaqiNJaprTruAzdy',
        oauthSecret: 'qgXfV5WWqGNOZwZfUB2Ngf2e3d6VlFQ0x4CwktvK'
    })

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

            if(properties.name === undefined) this.issues.push({id: feature.id, theme: theme, type: 'node', importance: 0, message: 'Pas de nom'})

            if(properties.wikipedia !== undefined && properties.wikipedia.indexOf(':') < 0) this.issues.push({id: feature.id, theme: theme, type: 'node', importance: 2, message: 'Langue manquante dans la référence wikipedia'})
            if(properties['artist:wikipedia'] !== undefined && properties['artist:wikipedia'].indexOf(':') < 0) this.issues.push({id: feature.id, theme: theme, type: 'node', importance: 2, message: 'Langue manquante dans la référence artist:wikipedia'})
            if(properties['subject:wikipedia'] !== undefined && properties['subject:wikipedia'].indexOf(':') < 0) this.issues.push({id: feature.id, theme: theme, type: 'node', importance: 2, message: 'Langue manquante dans la référence subject:wikipedia'})
 
            if(properties.wikipedia !== undefined && properties.wikidata === undefined) this.issues.push({id: feature.id, theme: theme, type: 'node', importance: 1, message: 'Référence wikipedia sans référence wikidata'})
            if(properties.wikidata !== undefined && properties.wikipedia === undefined) this.issues.push({id: feature.id, theme: theme, type: 'node', importance: 1, message: 'Référence wikidata sans référence wikipedia'})
            if(properties['artist:wikipedia'] !== undefined && properties['artist:wikidata'] === undefined) this.issues.push({id: feature.id, theme: theme, type: 'node', importance: 1, message: 'Référence artist:wikipedia sans référence artist:wikidata'})
            if(properties['artist:wikidata'] !== undefined && properties['artist:wikipedia'] === undefined) this.issues.push({id: feature.id, theme: theme, type: 'node', importance: 1, message: 'Référence artist:wikidata sans référence artist:wikipedia'})
            if(properties['subject:wikipedia'] !== undefined && properties['subject:wikidata'] === undefined) this.issues.push({id: feature.id, theme: theme, type: 'node', importance: 1, message: 'Référence subject:wikipedia sans référence subject:wikidata'})
            if(properties['subject:wikidata'] !== undefined && properties['subject:wikipedia'] === undefined) this.issues.push({id: feature.id, theme: theme, type: 'node', importance: 1, message: 'Référence subject:wikidata sans référence subject:wikipedia'})

        }
    },
    async login() {
        if(this.auth && !this.auth.bringPopupWindowToFront()) {
            this.auth.authenticate(function() {
                this.authenticated = this.auth.authenticated()
                this.auth.xhr({
                    method: 'GET',
                    path: '/api/0.6/user/details'
                }, function(err, res) {
                    const user = res.getElementsByTagName('user')[0]
                    if(user) {
                        this.userName = user.getAttribute('display_name')
                    }
                })
            })
        }
    },
    logout() {
        if(this.auth && this.auth.authenticated()) {
            this.auth.logout()
            this.userName = ''
            this.authenticated = this.auth.authenticated()
        }
    },
    async autoRepair() {
        await this.login()

        const comment = 'add and correct wiki attributes'
        const changesetId = await this.osmRequest.createChangeset('tumulus', comment)
        //const isChangesetStillOpen = await osmRequest.isChangesetStillOpen(changesetId)

        let changeset = '<osm><changeset>'
        changeset += '<tag k="created_by" v="tumulus 0.1.0"/>'
        changeset += '<tag k="comment" v="correct wikipedia tags"/>'

        for(let f in this.features) {
            const feature = this.features[f]
            const properties = feature.properties

            // manque la langue
            if(properties.wikipedia !== undefined && properties.wikipedia.indexOf(':') < 0) {
                // on teste 'fr'
                var lang = 'fr'
                const response = await fetch("https://" + lang + ".wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(properties.wikipedia))
                if(response.code === 200) {
                    console.log('wikipedia=' + lang + ':' + properties.wikipedia + ' [OK]')
                    // édition du node id=feature.id
                    let element = await this.osmRequest.fetchElement('node/' + feature.id)
                    properties.wikipedia = lang + ':' + properties.wikipedia
                    element = this.osmRequest.setTag(element, 'wikipedia', properties.wikipedia)
                    const newElementVersion = await this.osmRequest.sendElement(element, changesetId);
                    element = this.osmRequest.setVersion(element, newElementVersion)
                }
            }
 
        }

        changeset += '</changeset>'
        changeset += '</osm>'
        console.log(changeset)
        // PUT '/api/0.6/changeset/create'
        // récupérer l'id du changeset (text/plain)
        // PUT '/api/0.6/changeset/#id/close'

    }
  }
}

</script>

<style scoped>

.cat {
  background-color: #aaaaaa33;
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

a{
    text-decoration: none;
    color: black;
}

</style>
