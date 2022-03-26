<template>
    <div class="panel">
        <button @click="login" :disabled="authenticated">Se connecter</button>
        <span>{{userName}}</span>
        <button @click="logout" :disabled="!authenticated">Se déconnecter</button>
    </div>
</template>

<script>

import OsmAuth from 'osm-auth'
import OsmRequest from 'osm-request'

const DEBUG = true

export default {
  name: 'OSMConnector',
  data() {
    return {
        features: null,
        auth: null,
        authenticated: false,
        osmRequest: null,
        userName: ''
    }
  },
  created() {
    this.auth = OsmAuth({
        //url: DEBUG ? 'https://www.openstreetmap.org' : 'https://www.openstreetmap.org',
        oauth_consumer_key: 'bTmTD4dsTPCymICqf9uMbr6XxaqiNJaprTruAzdy',
        oauth_secret: 'qgXfV5WWqGNOZwZfUB2Ngf2e3d6VlFQ0x4CwktvK',
        auto: true,
        //singlepage: true, // Load the auth-window in the current window, with a redirect,
        landing: window.location.href // Come back to the current page
    })

    this.osmRequest = new OsmRequest({
        endpoint: DEBUG ? 'https://master.apis.dev.openstreetmap.org' : 'https://www.openstreetmap.org',
        oauthConsumerKey: 'bTmTD4dsTPCymICqf9uMbr6XxaqiNJaprTruAzdy',
        oauthSecret: 'qgXfV5WWqGNOZwZfUB2Ngf2e3d6VlFQ0x4CwktvK'
    })
  },
  methods: {
    login() {
        if(this.auth && !this.auth.bringPopupWindowToFront()) {
            let self = this
            this.auth.authenticate(function() {
                console.log('authentication terminated')
                console.log(self.authenticated = self.auth.authenticated())
                if(self.authenticated) {
                    self.auth.xhr({
                        method: 'GET',
                        path: '/api/0.6/user/details'
                    }, function(err, res) {
                        if(err) {
                            console.log('error retrieving OpenStreetMap user details')
                            console.log(err)
                        } else {
                            const user = res.getElementsByTagName('user')[0]
                            if(user) {
                                self.userName = user.getAttribute('display_name')
                            }
                        }
                    })
                }
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
    async autoRepair(features) {
        this.features = features

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

.panel {
  z-index: 1006;
  position: absolute;
  top: 5px;
  right: 50px;
  border-radius: 10px;
  background-color: #000012dd;
  box-shadow: 0px -1px 6px 0px rgba(0,0,0,0.75);
  padding: 5px;
  text-align: center;
  overflow: hidden;
  user-select: none;
}

</style>
