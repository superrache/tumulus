import { createApp } from 'vue'
import App from './App.vue'
import FeatureEditor from './FeatureEditor.vue'

const testFeatureEditor = false

if(testFeatureEditor) {
    let fe = createApp(FeatureEditor).mount('#app')
    fe.osmConnector = {
        connected: true
    }
    fe.loadFeature({
        name: 'toto',
        site_type: 'menhir',
        'ref:mhs': '125645'
    })
} else {
    createApp(App).mount('#app')
}

