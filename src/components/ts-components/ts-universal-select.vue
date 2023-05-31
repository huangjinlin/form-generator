<template>
  <el-select
    v-model="currentValue"
    :multiple="multiple"
    remote
    reserve-keyword
    :filterable="true"
    :placeholder="placeholder"
    :remote-method="remoteMethod"
    :loading="loading"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script>
export default {
  name: 'TsUniversalSelect',
  props: {
    value: {
      required: true
    },
    requestApi: {
      type: String,
      default: ''
    },
    requestType: {
      type: String,
      default: 'post'
    },
    requestKey: {
      type: String,
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请输入关键词'
    },
    label: {
      type: String,
      default: ''
    },
    field: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      currentValue: '',
      options: [],
      list: [],
      loading: false,
      cache: []
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val !== this.currentValue) {
          if (this.multiple) {
            if (Object.prototype.toString.call(val) === '[object String]') {
              try {
                this.currentValue = JSON.parse(val)
              } catch (e) {
                this.currentValue = val.split(',')
              }
            }
            if (Object.prototype.toString.call(val) === '[object Array]') {
              this.currentValue = val
            }
          } else {
            this.currentValue = val
          }
        }
      },
      immediate: true,
      deep: true
    },
    currentValue() {
      this.$emit('input', this.currentValue)
      this.$emit('change', this.currentValue)
    }
  },
  methods: {
    remoteMethod(query) {
      if (query !== '') {
        this.loading = true
        setTimeout(() => {
          this.getDate(query)
        }, 500)
      } else {
        this.options = this.cache
      }
    },
    getDate(query) {
      if (this.requestType === 'GET' || this.requestType === 'get') {
        this.$axios.get(`${this.requestApi}?${this.requestKey}=${query}`).then(req => {
          if (req.data.code === 200) {
            this.options = req.data.result.map(item => ({ label: item[this.label], value: item[this.field] }))
          } else {
            this.options = []
          }
          this.loading = false
        })
      } else {
        this.$axios.post(this.requestApi, { [this.requestKey]: query }).then(req => {
          if (req.data.code === 200) {
            this.options = req.data.result.map(item => ({ label: item[this.label], value: item[this.field] }))
          } else {
            this.options = []
          }
          this.loading = false
        })
      }
    }
  }
}
</script>
