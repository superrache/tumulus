import { createApp } from 'vue'
import App from './App.vue'
import FeatureEditor from './components/FeatureEditor.vue'

const testFeatureEditor = false

if(testFeatureEditor) {
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
} else {
    createApp(App).mount('#app')
}

