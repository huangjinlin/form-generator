import Vue from 'vue'
import { loadScriptQueue } from '@/utils/loadScript'
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
Vue.prototype.$axios = axios

const $previewApp = document.getElementById('previewApp')
const childAttrs = {
  file: '',
  dialog: ' width="600px" class="dialog-width" v-if="visible" :visible.sync="visible" :modal-append-to-body="false" '
}

window.addEventListener('message', init, false)

function buildLinks(links) {
  let strs = ''
  links.forEach(url => {
    strs += `<link href="${url}" rel="stylesheet">`
  })
  return strs
}

function init(event) {
  if (event.data.type === 'refreshFrame') {
    const code = event.data.data
    const attrs = childAttrs[code.generateConf.type]
    let links = ''

    if (Array.isArray(code.links) && code.links.length > 0) {
      links = buildLinks(code.links)
    }

    $previewApp.innerHTML = `${links}<style>${code.css}</style><div id="app"></div>`

    if (Array.isArray(code.scripts) && code.scripts.length > 0) {
      loadScriptQueue(code.scripts, () => {
        newVue(attrs, code.js, code.html)
      })
    } else {
      newVue(attrs, code.js, code.html)
    }
  }
}

function newVue(attrs, main, html) {
  main = eval(`(${main})`)
  main.template = `<div>${html}</div>`
  new Vue({
    components: {
      child: main
    },
    data() {
      return {
        visible: true
      }
    },
    template: `<div><child ${attrs}/></div>`
  }).$mount('#app')
}
