<template>
    <div class="panel">
        <button @click="onLogin" v-show="!authenticated">
            <img class="user-img" src="https://www.openstreetmap.org/assets/osm_logo-d4979005d8a03d67bbf051b4e7e6ef1b26c6a34a5cd1b65908e2947c360ca391.svg"/> Se connecter
        </button>
        <button id="user" v-show="authenticated">
            <img class="user-img" src="https://www.openstreetmap.org/assets/osm_logo-d4979005d8a03d67bbf051b4e7e6ef1b26c6a34a5cd1b65908e2947c360ca391.svg"/> {{userName}} ({{modifications}})
        </button>

        <nav id="menu">
            <a target="_blank" :href="'https://www.openstreetmap.org/user/' + userName"><div class="item">Mon compte</div></a>
            <div class="item" @click="save" v-if="modifications > 0">Enregistrer {{modifications}} modifications</div>
            <div class="item" @click="onLogout">Se déconnecter</div>
        </nav>
    </div>
   
</template>

<script>

import OsmAuth from 'osm-auth'
import OsmRequest from 'osm-request'
import * as config from '../const/config.js'

export default {
  name: 'OSMConnector',
  data() {
    return {
        components: null,
        auth: null,
        authenticated: false,
        osmRequest: null,
        userName: '',
        editedFeatures: {}
    }
  },
  computed: {
      connected() {
          return this.userName !== ''
      },
      modifications() {
          return Object.keys(this.editedFeatures).length
      }
  },
  created() {
    this.auth = OsmAuth({
        url: config.osmApi.instance,
        oauth_consumer_key: config.osmApi.oauthConsumerKey,
        oauth_secret: config.osmApi.oauthSecret,
        //auto: true,
        //singlepage: true, // Load the auth-window in the current window, with a redirect,
        //landing: window.location.href // Come back to the current page
    })

    this.osmRequest = new OsmRequest({
        endpoint: config.osmApi.instance,
        oauthConsumerKey: config.osmApi.oauthConsumerKey,
        oauthSecret: config.osmApi.oauthSecret
    })
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
        console.log('osmConnector added edited feature ' + feature.id)
        this.editedFeatures[feature.id] = feature
    },
    save() {
        this.components.commentDialog.show('', this.sendEdits)
    },
    async sendEdits(comment) {
        if(this.modifications > 0) {
            console.log('sending ' + Object.keys(this.editedFeatures).length + ' features to OSM')
            const changesetId = await this.osmRequest.createChangeset(config.appName, comment)
            console.log('changeset created changesetId=' + changesetId)

            for(let f in this.editedFeatures) {
                const feature = this.editedFeatures[f]
                const newTags = {} // copie de feature.properties sans les propriétés internes 'id' et 'g'
                for(let key in feature.properties) {
                    if(key !== 'id' && key !== 'g') {
                        newTags[key] = feature.properties[key]
                    }
                }
                console.log(newTags)

                console.log('get element ' + feature.id)
                let fullId = config.osmApi.nodeIdToEdit !== undefined ? config.osmApi.nodeIdToEdit : feature.id
                let element = await this.osmRequest.fetchElement(fullId) // id au format node/123456789
                console.log(element)

                // tags à supprimer
                let tagsToRemove = []
                for(let index in element.tag) {
                    if(element.tag[index] !== undefined) {
                        let key = element.tag[index]['$'].k
                        if(newTags[key] === undefined) { // suppression d'un tag
                            tagsToRemove.push(key)
                            element = this.osmRequest.removeTag(element, key)
                        }
                    }
                }
                while(tagsToRemove.length > 0) {
                    let tag = tagsToRemove.pop()
                    console.log('removeTag ' + tag)
                    element = this.osmRequest.removeTag(element, tag)
                }

                console.log('setTags') // pour les créations et mises à jour
                element = this.osmRequest.setTags(element, newTags)
                
                console.log('sendElement')
                const newElementVersion = await this.osmRequest.sendElement(element, changesetId)
                element = this.osmRequest.setVersion(element, newElementVersion)
            }

            console.log('closeChangeset')
            await this.osmRequest.closeChangeset(changesetId)

            this.editedFeatures = {}

            this.components.thanks.changeset = changesetId
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
    top: 52px;
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