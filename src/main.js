import { createApp } from 'vue'
import i18n from './i18n'
import App from './App.vue'
import FeatureEditor from './components/FeatureEditor.vue'
import IssueAnalyzer from './components/IssueAnalyzer.vue'
import PlantNetAssistant from './components/PlantNetAssistant.vue'
import './registerServiceWorker'

const test = 3

switch(test) {
    case 0: {
        const app = createApp(App).use(i18n)
        app.mount('#app')
        break;
    }
    case 1: {
        let fe = createApp(FeatureEditor).use(i18n).mount('#app')
        fe.osmConnector = {
            connected: true,
            addEditedFeature: (o) => {return o}
        }
        fe.debug = true
        fe.loadFeature({properties: {
            name: 'toto',
            site_type: 'menhir',
            'ref:mhs': '125645'
        }})
    
        setTimeout(function() {fe.loadFeature({
            properties: {
                highway: 'residential',
                name: 'la rue',
                'junction': 'no',
                ref: 'D412',
                traffic_lights: 'yes'
            }
          })}, 2000)
        break
    }
    case 2: {
        let ia = createApp(IssueAnalyzer).use(i18n).mount('#app')
        ia.issues = [
            {
                feature: {
                    id: 12,
                    properties: {
                        name: 'Nom de l\'élément',
                        tata: 'toto'
                    }
                },
                theme: {
                    color: '#0450B4',
                    visible: true
                },
                importance: 2,
                message: `Langue manquante dans la référence`,
                repaired: 1
            },
            {
                feature: {
                    id: 15,
                    properties: {
                        name: 'Nom de l\'élément',
                        tata: 'toto'
                    }
                },
                theme: {
                    color: '#6FB1A0',
                    visible: true
                },
                importance: 2,
                message: `Langue manquante dans la référence`,
                repaired: 2
            }
        ]
        break
    }
    case 3: {
        let pna = createApp(PlantNetAssistant).use(i18n).mount('#app')
        pna.components = {
                osmConnector: {
                connected: true,
                addEditedFeature: (o) => {return o}
            }
        }
        pna.debug = true
        pna.loadFeature({properties: {
            natural: 'tree'
        }})
        pna.results = [{
                score: 0.5,
                species: {
                    scientificNameWithoutAuthor: 'Quercus rotundifolia',
                    scientificNameAuthorship: 'Lam.',
                    scientificName: 'Quercus rotundifolia Lam.',
                    commonNames: ['Chêne vert']
                },
                images: [{
                    url: {
                        m: 'https://bs.plantnet.org/image/m/e1071ed609e6646cfb0fc9363a6c16c726721eb3'
                    }
                }]
            }, {
                score: 0.3,
                species: {
                    scientificNameWithoutAuthor: 'Quercus rotundifolia',
                    scientificNameAuthorship: 'Lam.',
                    scientificName: 'Quercus rotundifolia Lam.',
                    commonNames: ['Chêne vert']
                },
                images: [{
                    url: {
                        m: 'https://bs.plantnet.org/image/m/e1071ed609e6646cfb0fc9363a6c16c726721eb3'
                    }
                }]
            }
        ]
    
        break
    }
}
