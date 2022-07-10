import { createApp } from 'vue'
import App from './App.vue'
import FeatureEditor from './components/FeatureEditor.vue'
import IssueAnalyzer from './components/IssueAnalyzer.vue'
import './registerServiceWorker'

const test = 0

switch(test) {
    case 0: {
        createApp(App).mount('#app')
        break;
    }
    case 1: {
        let fe = createApp(FeatureEditor).mount('#app')
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
        break;
    }
    case 2: {
        let ia = createApp(IssueAnalyzer).mount('#app')
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
    }
}
