<template>
    <div class="panel">
        <button @click="onLogin" v-show="!authenticated">
            <img class="user-img" src="https://www.openstreetmap.org/assets/osm_logo-d4979005d8a03d67bbf051b4e7e6ef1b26c6a34a5cd1b65908e2947c360ca391.svg"/> Se connecter
        </button>
        <button id="user" v-show="authenticated">
            <img class="user-img" src="https://www.openstreetmap.org/assets/osm_logo-d4979005d8a03d67bbf051b4e7e6ef1b26c6a34a5cd1b65908e2947c360ca391.svg"/> {{userName}} {{Object.keys(editedFeatures).length}}
        </button>

        <nav id="menu">
            <a target="_blank" :href="'https://www.openstreetmap.org/user/' + userName"><div class="item">Mon compte</div></a>
            <div class="item" @click="sendEdits">Enregistrer</div>
            <div class="item" @click="onLogout">Se déconnecter</div>
        </nav>
    </div>
   
</template>

<script>

import OsmAuth from 'osm-auth'
import OsmRequest from 'osm-request'
import * as config from './config.js'

export default {
  name: 'OSMConnector',
  data() {
    return {
        auth: null,
        authenticated: false,
        osmRequest: null,
        userName: '',
        editedFeatures: {}
    }
  },
  created() {
    this.auth = OsmAuth({
        url: config.DEBUG ? config.osmApiDebug.instance : config.osmApiProd.instance,
        oauth_consumer_key: config.DEBUG ? config.osmApiDebug.oauthConsumerKey : config.osmApiProd.oauthConsumerKey,
        oauth_secret: config.DEBUG ? config.osmApiDebug.oauthSecret : config.osmApiProd.oauthSecret,
        //auto: true,
        //singlepage: true, // Load the auth-window in the current window, with a redirect,
        //landing: window.location.href // Come back to the current page
    })

    this.osmRequest = new OsmRequest({
        endpoint: config.DEBUG ? config.osmApiDebug.instance : config.osmApiProd.instance,
        oauthConsumerKey: config.DEBUG ? config.osmApiDebug.oauthConsumerKey : config.osmApiProd.oauthConsumerKey,
        oauthSecret: config.DEBUG ? config.osmApiDebug.oauthSecret : config.osmApiProd.oauthSecret
    })
  },
  computed: {
      connected() {
          return this.userName !== ''
      }
  },
  methods: {
    update() {
        this.authenticated = this.auth.authenticated()
        if(this.authenticated) {
            this.auth.xhr({
                method: 'GET',
                path: '/api/0.6/user/details'
            }, this.done)
        }
    },
    done(err, res) {
        if(err) {
            this.userName = 'erreur'
            return
        }

        const user = res.getElementsByTagName('user')[0]
        if(user) {
            this.userName = user.getAttribute('display_name')
        }
    },
    onLogin() {
        if(!this.auth.bringPopupWindowToFront()) {
            let self = this
            this.auth.authenticate(function() {
                self.update()
            })
        }
    },
    onLogout() {
        this.auth.logout()
        this.userName = ''
        this.update()
    },
    addEditedFeature(feature) {
        this.editedFeatures[feature.id] = feature
    },
    async autoRepair(features) {
        for(let f in features) {
            const feature = features[f]
            const properties = feature.properties

            // manque la langue
            if(properties.wikipedia !== undefined && properties.wikipedia.indexOf(':') < 0) {
                // on teste 'fr'
                var lang = 'fr'
                const response = await fetch("https://" + lang + ".wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(properties.wikipedia))
                if(response.code === 200) {
                    console.log('wikipedia=' + lang + ':' + properties.wikipedia + ' [OK]')
                    // édition du node id=feature.id
                    properties.wikipedia = lang + ':' + properties.wikipedia
                    this.addEditedFeature(feature)
                }
            }
        }
    },
    async sendEdits() {
        if(Object.keys(this.editedFeatures).length) {
            console.log('sending ' + Object.keys(this.editedFeatures).length + ' features to OSM')
            const comment = 'add and correct wiki attributes'
            const changesetId = await this.osmRequest.createChangeset('tumulus', comment)
            console.log('changeset created changesetId=' + changesetId)

            for(let f in this.editedFeatures) {
                const feature = this.editedFeatures[f]
                const properties = feature.properties
                
                console.log('get element ' + feature.id)
                let element = await this.osmRequest.fetchElement(feature.id) // id=node/123456789
                
                console.log('setTags')
                element = this.osmRequest.setTags(element, properties) // pas sûr du format de properties
                
                console.log('sendElement')
                const newElementVersion = await this.osmRequest.sendElement(element, changesetId)
                element = this.osmRequest.setVersion(element, newElementVersion)
            }

            console.log('closeChangeset')
            await this.osmRequest.closeChangeset(changesetId)

            this.editedFeatures = []
        }
    }
  }
}

</script>

<style scoped>

.panel {
  border-radius: 10px;
  background-color: #000012dd;
  box-shadow: 0px -1px 6px 0px rgba(0,0,0,0.75);
  padding: 5px;
  text-align: center;
  overflow: hidden;
  user-select: none;
}

a {
    text-decoration: none;
}

.user-img {
    width: 20px;
    margin-bottom: -5px;
}

#user + #menu:active,
#user:focus + #menu {
    visibility: visible;
}

#menu {
    visibility: hidden;
    position: fixed;
    z-index: 31;
    top: 48px;
    right: 15px;
    width: 200px;
    border-radius: 10px;
    box-shadow: 0px -1px 6px 0px rgba(0,0,0,0.75);
    background-color: #000012dd;
    color: white;
}

.item {
    color: white;
    text-decoration: none;
    padding: 5px 5px;
    margin: 5px;
    border-radius: 5px;
    cursor: pointer;
}

.item:hover {
    background-color: dodgerblue;
    color: black;
}

</style>
