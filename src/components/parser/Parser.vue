<script>
import { deepClone } from '@/utils/index'
import render from '@/components/render/render.js'

const ruleTrigger = {
  'el-input': 'blur',
  'el-input-number': 'blur',
  'el-select': 'change',
  'el-radio-group': 'change',
  'el-checkbox-group': 'change',
  'el-cascader': 'change',
  'el-time-picker': 'change',
  'el-date-picker': 'change',
  'el-rate': 'change'
}

const layouts = {
  colFormItem(h, scheme) {
    const config = scheme.__config__
    const listeners = buildListeners.call(this, scheme)

    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'
    const child = renderChildren.apply(this, arguments)
    return (
      <el-col span={config.span}>
        <el-form-item label-width={labelWidth} prop={scheme.__vModel__}
          label={config.showLabel ? config.label : ''}>
          <render that={this} conf={scheme} on={listeners}>{{ child }}</render>
        </el-form-item>
      </el-col>
    )
  },
  rowFormItem(h, scheme) {
    let child = renderChildren.apply(this, arguments)
    if (scheme.type === 'flex') {
      child = <el-row type={scheme.type} justify={scheme.justify} align={scheme.align}>
              {child}
            </el-row>
    }
    return (
      <el-col span={scheme.span}>
        <el-row gutter={scheme.gutter}>
          {child}
        </el-row>
      </el-col>
    )
  },
  raw(h, scheme) {
    const child = renderChildren.apply(this, arguments)
    const listeners = buildListeners.call(this, scheme)
    return (
      <render conf={scheme} on={listeners}>{child}</render>
    )
  },
  tsCard(h, scheme) {
    const cardBody = renderChildren.apply(this, arguments)
    return (
      <el-col span={scheme.span}>
        <el-row gutter={scheme.gutter}>
          <el-card className="box-card">
            <div slot="header" className="clearfix">
              <span>{scheme.__config__.label}</span>
            </div>
            <div>{cardBody}</div>
          </el-card>
        </el-row>
      </el-col>
    )
  },
  tsSteps(h, scheme) {
    const { children } = scheme // 获取子节点
    const exportPane = []
    const listeners = buildListeners.call(this, scheme)
    const { active } = scheme
    const stepList = []
    for (let i = 0; i < children.length; i++) {
      stepList.push([<el-step title={children[i].title} description={children[i].description}></el-step>])
    }
    return (<div style="margin-bottom: 20px;">
      <render conf={scheme} on={listeners}>
        {stepList}
      </render>
      {(active != null && active < children.length)
        ? <div style="margin-top: 20px;">
          {renderChildren.call(this, h, { children: children[active], tag: 'el-steps' })}
      </div>
        : ''}
      <div>
        <el-button size="small" onClick={() => { if (--scheme.active < 1) scheme.active = 0 }}>
          上一步
        </el-button>
        <el-button size="small" onClick={() => { if (++scheme.active > stepList.length) scheme.active = 0 }}>
          下一步
        </el-button>
      </div>
    </div>)
  },
  tsElTabs(h, scheme) {
    const { children } = scheme // 获取子节点
    const exportPane = []
    const listeners = buildListeners.call(this, scheme)
    for (let i = 0; i < children.length; i++) {
      const child = renderTabsChildren.call(this, h, children[i])
      exportPane.push([<el-tab-pane label={children[i].label} name={children[i].name}>
        {child}
      </el-tab-pane>])
    }
    return <el-col span={scheme.span}>
      <el-row gutter={scheme.gutter}>
        <render conf={scheme} on={listeners}>
          {exportPane}
        </render>
      </el-row>
    </el-col>
  },
  tsSubform(h, scheme) {
    const config = scheme.__config__
    const data = JSON.parse(JSON.stringify(config.children))
    data.forEach(item => {
      item.__config__.prop = item.__vModel__
    })
    const tableData = data
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'
    return (
    <el-col span={config.span}>
      <el-form-item label-width={labelWidth}
                    label={config.showLabel ? config.label : ''}>
        <ts-sub-form
          table-data={tableData}
          value={config.defaultValue}
          displayShow={scheme.displayShow}
          addButton={scheme.addButton}
          canEdit={scheme.canEdit}
          deleteButton={scheme.deleteButton}
        ></ts-sub-form>
      </el-form-item>
    </el-col>
    )
  }
}

function renderTabsChildren(h, scheme, a) {
  const config = scheme.children
  if (!Array.isArray(config)) return null
  return renderFormItem.call(this, h, config)
}

function renderFrom(h) {
  const { formConfCopy } = this

  return (
    <el-row gutter={formConfCopy.gutter}>
      <el-form
        size={formConfCopy.size}
        label-position={formConfCopy.labelPosition}
        disabled={formConfCopy.disabled}
        label-width={`${formConfCopy.labelWidth}px`}
        ref={formConfCopy.formRef}
        // model不能直接赋值 https://github.com/vuejs/jsx/issues/49#issuecomment-472013664
        props={{ model: this[formConfCopy.formModel] }}
        rules={this[formConfCopy.formRules]}
      >
        {renderFormItem.call(this, h, formConfCopy.fields)}
        {formConfCopy.formBtns && formBtns.call(this, h)}
      </el-form>
    </el-row>
  )
}

function formBtns(h) {
  return <el-col>
    <el-form-item size="large">
      <el-button type="primary" onClick={this.submitForm}>提交</el-button>
      <el-button onClick={this.resetForm}>重置</el-button>
    </el-form-item>
  </el-col>
}

function renderFormItem(h, elementList) {
  return elementList.map(scheme => {
    const config = scheme.__config__
    const layout = layouts[config.layout]

    if (layout) {
      return layout.call(this, h, scheme)
    }
    throw new Error(`没有与${config.layout}匹配的layout`)
  })
}

function renderChildren(h, scheme) {
  const config = scheme.__config__
  let children
  if (scheme.tag === 'el-steps') {
    children = scheme.children.children || []
  } else if (scheme.__config__.tag === 'el-card') {
    children = scheme.__config__.children.cardBody
  } else {
    children = config.children
  }
  if (!Array.isArray(children)) return null
  // return renderFormItem.call(this, h, config.children)
  return children.map((el, i) => {
    const layout = layouts[el.__config__.layout]
    if (layout) {
      return layout.call(this, h, el, i, config.children)
    }
    // return renderFormItem.call(this)
    return renderFormItem.call(this, h, children)
  })
}

function setValue(event, config, scheme) {
  this.$set(config, 'defaultValue', event)
  this.$set(this[this.formConf.formModel], scheme.__vModel__, event)
}

function buildListeners(scheme) {
  const config = scheme.__config__
  const methods = this.formConf.__methods__ || {}
  const tiger = scheme.tiger || {}
  const listeners = {}
  Object.keys(tiger).forEach(key => {
    const start = tiger[key].split('{')
    const eng = start[1].split('}')
    listeners[key] = (value, that) => {
      eval(eng[0])
    }
  })
  // 给__methods__中的方法绑定this和event
  Object.keys(methods).forEach(key => {
    listeners[key] = event => methods[key].call(this, event)
  })
  // 响应 render.js 中的 vModel $emit('input', val)
  listeners.input = event => setValue.call(this, event, config, scheme)

  return listeners
}

export default {
  components: {
    render
  },
  props: {
    formConf: {
      type: Object,
      required: true
    }
  },
  data() {
    const data = {
      formConfCopy: deepClone(this.formConf),
      [this.formConf.formModel]: {},
      [this.formConf.formRules]: {}
    }
    this.initFormData(data.formConfCopy.fields, data[this.formConf.formModel])
    this.buildRules(data.formConfCopy.fields, data[this.formConf.formRules])
    return data
  },
  methods: {
    initFormData(componentList, formData) {
      if (Array.isArray(componentList)) {
        componentList.forEach(cur => {
          if (cur.__config__.tag === 'ts-sub-form') {
            const config = cur.__config__
            config.defaultValue = [{ field102: '111', field103: '222' }, { field102: '333', field103: '444' }]
            formData[config.formId] = config.defaultValue
          } else {
            const config = cur.__config__
            if (cur.__vModel__) formData[cur.__vModel__] = config.defaultValue
            if (config.children) this.initFormData(config.children, formData)
          }
        })
      } else {
        componentList.cardBody.forEach(cur => {
          const config = cur.__config__
          if (cur.__vModel__) formData[cur.__vModel__] = config.defaultValue
          if (config.children) this.initFormData(config.children, formData)
        })
      }
    },
    buildRules(componentList, rules) {
      if (Array.isArray(componentList)) {
        componentList.forEach(cur => {
          const config = cur.__config__
          if (Array.isArray(config.regList)) {
            if (config.required) {
              const required = { required: config.required, message: cur.placeholder }
              if (Array.isArray(config.defaultValue)) {
                required.type = 'array'
                required.message = `请至少选择一个${config.label}`
              }
              required.message === undefined && (required.message = `${config.label}不能为空`)
              config.regList.push(required)
            }
            rules[cur.__vModel__] = config.regList.map(item => {
              item.pattern && (item.pattern = eval(item.pattern))
              item.trigger = ruleTrigger && ruleTrigger[config.tag]
              return item
            })
          }
          if (config.children) this.buildRules(config.children, rules)
        })
      }
    },
    resetForm() {
      this.formConfCopy = deepClone(this.formConf)
      this.$refs[this.formConf.formRef].resetFields()
    },
    submitForm() {
      this.$refs[this.formConf.formRef].validate(valid => {
        if (!valid) return false
        // 触发sumit事件
        this.$emit('submit', this[this.formConf.formModel])
        return true
      })
    },
    changeData(key, value) {
      this.formConfCopy.fields.forEach(ts => {
        if (ts.__vModel__ === key) {
          this.$set(ts, 'defaultValue', value)
          ts.props = {
            value
          }
          this.$set(this[this.formConfCopy.formModel], ts.__vModel__, value) // 校验赋值
        }
      })
    }
    // changeFormData(key, value) {
    //   this.formConfCopy.fields.forEach(ts => {
    //     if (ts.__vModel__ === key) {
    //       this.$set(ts, 'defaultValue', value)
    //       ts.props = {
    //         value
    //       }
    //       this.$set(this[this.formConfCopy.formModel], ts.__vModel__, value) // 校验赋值
    //     }
    //   })
    // }
  },
  render(h) {
    return renderFrom.call(this, h)
  }
}
</script>
