import Vue from 'vue'
import App from './App.vue'
import router from '@/router'
import '@/styles/index.scss'
import '@/icons'
import axios from 'axios'
import Tinymce from '@/components/tinymce/index.vue'
import tsText from '@/components/ts-components/ts-text.vue'
import tsLineChart from '@/components/ts-components/ts-line-chart.vue'
import tsIframe from '@/components/ts-components/ts-iframe.vue'
import tsSelectDataDictionary from '@/components/ts-components/ts-select-data-dictionary.vue'
import tsUniversalSelect from '@/components/ts-components/ts-universal-select.vue'
import tsSubForm from '@/components/ts-components/ts-sub-form/index.vue'

Vue.component('tinymce', Tinymce)
Vue.component('tsText', tsText)
Vue.component('tsLineChart', tsLineChart)
Vue.component('tsIframe', tsIframe)
Vue.component('tsSelectDataDictionary', tsSelectDataDictionary)
Vue.component('tsUniversalSelect', tsUniversalSelect)
Vue.component('tsSubForm', tsSubForm)

Vue.config.productionTip = false
Vue.prototype.$axios = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
