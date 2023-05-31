<script>
export default {
  name: 'TsSelectDataDictionary',
  props: [
    'value',
    'code',
    'placeholder',
    'clearable',
    'multiple',
    'collapseTags',
    'filterable',
    'multipleLimit'
  ],
  data() {
    return {
      currentValue: '',
      options: []
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val !== this.currentValue) {
          this.currentValue = val
        }
      },
      immediate: true,
      deep: true
    },
    currentValue() {
      this.$emit('input', this.currentValue)
      this.$emit('change', this.currentValue)
    },
    code() {
      this.getData()
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.$axios.get(`search/FoodHeat?keyword=${this.code}`).then(req => {
        if (req.data.code === 200) {
          this.options = req.data.result.map(item => ({ label: item.name, value: item.desc }))
        } else {
          this.options = []
        }
        this.loading = false
      })
    }
  },
  render(ts) {
    return ts(
      'el-select',
      {
        ref: 'ts_dictionary',
        props: {
          value: this.value,
          placeholder: this.$props.placeholder || '请选择数据',
          clearable: this.$props.clearable || false,
          multiple: this.$props.multiple || false,
          collapseTags: this.$props.collapseTags || false,
          filterable: this.$props.filterable || false,
          multipleLimit: this.$props.multipleLimit || 3
        },
        style: {
          width: this.width ? this.width : '100%'
        },
        on: {
          input: value => {
            try {
              this.currentValue = value
            } catch (e) {
              console.log('👉👉👉-----------------', e)
            }
          }
        }
      },
      [
        this.options.map(item => ts('el-option', {
          props: {
            value: item.value,
            label: item.label
          }
        }))
      ]
    )
  }
}
</script>
