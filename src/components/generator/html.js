/* eslint-disable max-len */
import ruleTrigger from './ruleTrigger'

let confGlobal
let someSpanIsNot24

export function dialogWrapper(str) {
  return `<el-dialog v-bind="$attrs" v-on="$listeners" @open="onOpen" @close="onClose" title="Dialog Titile">
    ${str}
    <div slot="footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="handelConfirm">确定</el-button>
    </div>
  </el-dialog>`
}

export function vueTemplate(str) {
  return `<template>
    <div>
      ${str}
    </div>
  </template>`
}

export function vueScript(str) {
  return `<script>
    ${str}
  </script>`
}

export function cssStyle(cssStr) {
  return `<style>
    ${cssStr}
  </style>`
}

function buildFormTemplate(scheme, child, type) {
  let labelPosition = ''
  if (scheme.labelPosition !== 'right') {
    labelPosition = `label-position="${scheme.labelPosition}"`
  }
  const disabled = scheme.disabled ? `:disabled="${scheme.disabled}"` : ''
  let str = `<el-form ref="${scheme.formRef}" :model="${scheme.formModel}" :rules="${scheme.formRules}" size="${scheme.size}" ${disabled} label-width="${scheme.labelWidth}px" ${labelPosition}>
      ${child}
      ${buildFromBtns(scheme, type)}
    </el-form>`
  if (someSpanIsNot24) {
    str = `<el-row :gutter="${scheme.gutter}">
        ${str}
      </el-row>`
  }
  return str
}

function buildFromBtns(scheme, type) {
  let str = ''
  if (scheme.formBtns && type === 'file') {
    str = `<el-form-item size="large">
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>`
    if (someSpanIsNot24) {
      str = `<el-col :span="24">
          ${str}
        </el-col>`
    }
  }
  return str
}

// span不为24的用el-col包裹
function colWrapper(scheme, str) {
  if (someSpanIsNot24 || scheme.__config__.span !== 24) {
    return `<el-col :span="${scheme.__config__.span}">
      ${str}
    </el-col>`
  }
  return str
}

const layouts = {
  colFormItem(scheme) {
    const config = scheme.__config__
    let labelWidth = ''
    let label = `label="${config.label}"`
    if (config.labelWidth && config.labelWidth !== confGlobal.labelWidth) {
      labelWidth = `label-width="${config.labelWidth}px"`
    }
    if (config.showLabel === false) {
      labelWidth = 'label-width="0"'
      label = ''
    }
    const required = !ruleTrigger[config.tag] && config.required ? 'required' : ''
    const tagDom = tags[config.tag] ? tags[config.tag](scheme) : null
    let str = `<el-form-item ${labelWidth} ${label} prop="${scheme.__vModel__}" ${required}>
        ${tagDom}
      </el-form-item>`
    str = colWrapper(scheme, str)
    return str
  },
  rowFormItem(scheme) {
    const config = scheme.__config__
    const type = scheme.type === 'default' ? '' : `type="${scheme.type}"`
    const justify = scheme.type === 'default' ? '' : `justify="${scheme.justify}"`
    const align = scheme.type === 'default' ? '' : `align="${scheme.align}"`
    const gutter = scheme.gutter ? `:gutter="${scheme.gutter}"` : ''
    const children = config.children.map(el => layouts[el.__config__.layout](el))
    let str = `<el-row ${type} ${justify} ${align} ${gutter}>
      ${children.join('\n')}
    </el-row>`
    str = colWrapper(scheme, str)
    return str
  },
  raw(scheme) {
    let str = ''
    const config = scheme.__config__
    const tagDom = tags[config.tag] ? tags[config.tag](scheme) : null
    str = `${tagDom}`
    return str
  },
  tsCard(scheme) {
    const cardBody = buildElCardChild(scheme)
    return `<el-row><el-col :span=${scheme.__config__.span}><el-card :body-style="{ padding: '0px' }">
      <div slot="header" className="clearfix"><span>${scheme.__config__.label}</span>
      </div><div style="padding: 14px;">${cardBody}</div></el-card><el-col/></el-row>`
  },
  tsSteps(scheme) {
    const config = scheme.__config__
    const tagDom = tags[config.tag] ? tags[config.tag](scheme) : null
    let str = tagDom
    str = colWrapper(scheme, str)
    return str
  },
  tsElTabs(scheme) {
    const config = scheme.__config__
    const tagDom = tags[config.tag] ? tags[config.tag](scheme) : null
    let str = tagDom
    str = colWrapper(scheme, str)
    return str
  },
  tsSubform(scheme) {
    const dataName = `:table-data="other.subForm${scheme.__config__.formId}"`
    const value = `v-model="other.subForm${scheme.__config__.formId}Data"`
    const addButton = `:addButton="other.addButton${scheme.__config__.formId}"`
    const deleteButton = `:deleteButton="other.deleteButton${scheme.__config__.formId}"`
    const displayShow = `:displayShow="other.displayShow${scheme.__config__.formId}"`
    const canEdit = `:canEdit="other.canEdit${scheme.__config__.formId}"`
    return `<ts-sub-form ${dataName} ${value} ${addButton} ${deleteButton} ${displayShow} ${canEdit}></ts-sub-form>`
  }
}

// el-card 子级
function buildElCardChild(scheme) {
  const { cardBody } = scheme.__config__.children
  const actionChildren = cardBody.map(el => layouts[el.__config__.layout](el))
  return actionChildren.join('\n')
}

function createFun(el) {
  if (!el.tiger) {
    return null
  }
  const funObj = {}
  // eslint-disable-next-line guard-for-in,no-restricted-syntax
  for (const funKey in el.tiger) {
    funObj[funKey] = `@${funKey}="${el.__vModel__}${funKey}"`
  }
  return funObj
}

const tags = {
  'el-button': el => {
    const {
      tag, disabled
    } = attrBuilder(el)
    const type = el.type ? `type="${el.type}"` : ''
    const icon = el.icon ? `icon="${el.icon}"` : ''
    const round = el.round ? 'round' : ''
    const size = el.size ? `size="${el.size}"` : ''
    const plain = el.plain ? 'plain' : ''
    const circle = el.circle ? 'circle' : ''
    let child = buildElButtonChild(el)

    if (child) child = `\n${child}\n` // 换行
    return `<${tag} ${type} ${icon} ${round} ${size} ${plain} ${disabled} ${circle}>${child}</${tag}>`
  },
  'el-input': el => {
    const {
      tag, disabled, vModel, clearable, placeholder, width
    } = attrBuilder(el)
    const maxlength = el.maxlength ? `:maxlength="${el.maxlength}"` : ''
    const showWordLimit = el['show-word-limit'] ? 'show-word-limit' : ''
    const readonly = el.readonly ? 'readonly' : ''
    const prefixIcon = el['prefix-icon'] ? `prefix-icon='${el['prefix-icon']}'` : ''
    const suffixIcon = el['suffix-icon'] ? `suffix-icon='${el['suffix-icon']}'` : ''
    const showPassword = el['show-password'] ? 'show-password' : ''
    const type = el.type ? `type="${el.type}"` : ''
    const autosize = el.autosize && el.autosize.minRows
      ? `:autosize="{minRows: ${el.autosize.minRows}, maxRows: ${el.autosize.maxRows}}"`
      : ''
    let child = buildElInputChild(el)

    if (child) child = `\n${child}\n` // 换行
    return `<${tag} ${vModel} ${type} ${placeholder} ${maxlength} ${showWordLimit} ${readonly} ${disabled} ${clearable} ${prefixIcon} ${suffixIcon} ${showPassword} ${autosize} ${width}>${child}</${tag}>`
  },
  'el-input-number': el => {
    const {
      tag, disabled, vModel, placeholder
    } = attrBuilder(el)
    const controlsPosition = el['controls-position'] ? `controls-position=${el['controls-position']}` : ''
    const min = el.min ? `:min='${el.min}'` : ''
    const max = el.max ? `:max='${el.max}'` : ''
    const step = el.step ? `:step='${el.step}'` : ''
    const stepStrictly = el['step-strictly'] ? 'step-strictly' : ''
    const precision = el.precision ? `:precision='${el.precision}'` : ''

    return `<${tag} ${vModel} ${placeholder} ${step} ${stepStrictly} ${precision} ${controlsPosition} ${min} ${max} ${disabled}></${tag}>`
  },
  'el-select': el => {
    const {
      tag, disabled, vModel, clearable, placeholder, width
    } = attrBuilder(el)
    const Fun = createFun(el)
    let FunString = ''
    // eslint-disable-next-line no-restricted-syntax,guard-for-in
    for (const funKey in Fun) {
      FunString += `${Fun[funKey]} `
    }
    const filterable = el.filterable ? 'filterable' : ''
    const multiple = el.multiple ? 'multiple' : ''
    let child = buildElSelectChild(el)

    if (child) child = `\n${child}\n` // 换行
    return `<${tag} ${vModel} ${FunString} ${placeholder} ${disabled} ${multiple} ${filterable} ${clearable} ${width}>${child}</${tag}>`
  },
  'el-radio-group': el => {
    const { tag, disabled, vModel } = attrBuilder(el)
    const size = `size="${el.size}"`
    let child = buildElRadioGroupChild(el)

    if (child) child = `\n${child}\n` // 换行
    return `<${tag} ${vModel} ${size} ${disabled}>${child}</${tag}>`
  },
  'el-checkbox-group': el => {
    const { tag, disabled, vModel } = attrBuilder(el)
    const size = `size="${el.size}"`
    const min = el.min ? `:min="${el.min}"` : ''
    const max = el.max ? `:max="${el.max}"` : ''
    let child = buildElCheckboxGroupChild(el)

    if (child) child = `\n${child}\n` // 换行
    return `<${tag} ${vModel} ${min} ${max} ${size} ${disabled}>${child}</${tag}>`
  },
  'el-switch': el => {
    const { tag, disabled, vModel } = attrBuilder(el)
    const activeText = el['active-text'] ? `active-text="${el['active-text']}"` : ''
    const inactiveText = el['inactive-text'] ? `inactive-text="${el['inactive-text']}"` : ''
    const activeColor = el['active-color'] ? `active-color="${el['active-color']}"` : ''
    const inactiveColor = el['inactive-color'] ? `inactive-color="${el['inactive-color']}"` : ''
    const activeValue = el['active-value'] !== true ? `:active-value='${JSON.stringify(el['active-value'])}'` : ''
    const inactiveValue = el['inactive-value'] !== false ? `:inactive-value='${JSON.stringify(el['inactive-value'])}'` : ''

    return `<${tag} ${vModel} ${activeText} ${inactiveText} ${activeColor} ${inactiveColor} ${activeValue} ${inactiveValue} ${disabled}></${tag}>`
  },
  'el-cascader': el => {
    const {
      tag, disabled, vModel, clearable, placeholder, width
    } = attrBuilder(el)
    const options = el.options ? `:options="${el.__vModel__}Options"` : ''
    const props = el.props ? `:props="${el.__vModel__}Props"` : ''
    const showAllLevels = el['show-all-levels'] ? '' : ':show-all-levels="false"'
    const filterable = el.filterable ? 'filterable' : ''
    const separator = el.separator === '/' ? '' : `separator="${el.separator}"`

    return `<${tag} ${vModel} ${options} ${props} ${width} ${showAllLevels} ${placeholder} ${separator} ${filterable} ${clearable} ${disabled}></${tag}>`
  },
  'el-slider': el => {
    const { tag, disabled, vModel } = attrBuilder(el)
    const min = el.min ? `:min='${el.min}'` : ''
    const max = el.max ? `:max='${el.max}'` : ''
    const step = el.step ? `:step='${el.step}'` : ''
    const range = el.range ? 'range' : ''
    const showStops = el['show-stops'] ? `:show-stops="${el['show-stops']}"` : ''

    return `<${tag} ${min} ${max} ${step} ${vModel} ${range} ${showStops} ${disabled}></${tag}>`
  },
  'el-time-picker': el => {
    const {
      tag, disabled, vModel, clearable, placeholder, width
    } = attrBuilder(el)
    const startPlaceholder = el['start-placeholder'] ? `start-placeholder="${el['start-placeholder']}"` : ''
    const endPlaceholder = el['end-placeholder'] ? `end-placeholder="${el['end-placeholder']}"` : ''
    const rangeSeparator = el['range-separator'] ? `range-separator="${el['range-separator']}"` : ''
    const isRange = el['is-range'] ? 'is-range' : ''
    const format = el.format ? `format="${el.format}"` : ''
    const valueFormat = el['value-format'] ? `value-format="${el['value-format']}"` : ''
    const pickerOptions = el['picker-options'] ? `:picker-options='${JSON.stringify(el['picker-options'])}'` : ''

    return `<${tag} ${vModel} ${isRange} ${format} ${valueFormat} ${pickerOptions} ${width} ${placeholder} ${startPlaceholder} ${endPlaceholder} ${rangeSeparator} ${clearable} ${disabled}></${tag}>`
  },
  'el-date-picker': el => {
    const {
      tag, disabled, vModel, clearable, placeholder, width
    } = attrBuilder(el)
    const startPlaceholder = el['start-placeholder'] ? `start-placeholder="${el['start-placeholder']}"` : ''
    const endPlaceholder = el['end-placeholder'] ? `end-placeholder="${el['end-placeholder']}"` : ''
    const rangeSeparator = el['range-separator'] ? `range-separator="${el['range-separator']}"` : ''
    const format = el.format ? `format="${el.format}"` : ''
    const valueFormat = el['value-format'] ? `value-format="${el['value-format']}"` : ''
    const type = el.type === 'date' ? '' : `type="${el.type}"`
    const readonly = el.readonly ? 'readonly' : ''

    return `<${tag} ${type} ${vModel} ${format} ${valueFormat} ${width} ${placeholder} ${startPlaceholder} ${endPlaceholder} ${rangeSeparator} ${clearable} ${readonly} ${disabled}></${tag}>`
  },
  'el-rate': el => {
    const { tag, disabled, vModel } = attrBuilder(el)
    const max = el.max ? `:max='${el.max}'` : ''
    const allowHalf = el['allow-half'] ? 'allow-half' : ''
    const showText = el['show-text'] ? 'show-text' : ''
    const showScore = el['show-score'] ? 'show-score' : ''

    return `<${tag} ${vModel} ${max} ${allowHalf} ${showText} ${showScore} ${disabled}></${tag}>`
  },
  'el-color-picker': el => {
    const { tag, disabled, vModel } = attrBuilder(el)
    const size = `size="${el.size}"`
    const showAlpha = el['show-alpha'] ? 'show-alpha' : ''
    const colorFormat = el['color-format'] ? `color-format="${el['color-format']}"` : ''

    return `<${tag} ${vModel} ${size} ${showAlpha} ${colorFormat} ${disabled}></${tag}>`
  },
  'el-upload': el => {
    const { tag } = el.__config__
    const disabled = el.disabled ? ':disabled=\'true\'' : ''
    const action = el.action ? `:action="${el.__vModel__}Action"` : ''
    const multiple = el.multiple ? 'multiple' : ''
    const listType = el['list-type'] !== 'text' ? `list-type="${el['list-type']}"` : ''
    const accept = el.accept ? `accept="${el.accept}"` : ''
    const name = el.name !== 'file' ? `name="${el.name}"` : ''
    const autoUpload = el['auto-upload'] === false ? ':auto-upload="false"' : ''
    const beforeUpload = `:before-upload="${el.__vModel__}BeforeUpload"`
    const fileList = `:file-list="${el.__vModel__}fileList"`
    const ref = `ref="${el.__vModel__}"`
    let child = buildElUploadChild(el)

    if (child) child = `\n${child}\n` // 换行
    return `<${tag} ${ref} ${fileList} ${action} ${autoUpload} ${multiple} ${beforeUpload} ${listType} ${accept} ${name} ${disabled}>${child}</${tag}>`
  },
  tinymce: el => {
    const { tag, vModel, placeholder } = attrBuilder(el)
    const height = el.height ? `:height="${el.height}"` : ''
    const branding = el.branding ? `:branding="${el.branding}"` : ''
    return `<${tag} ${vModel} ${placeholder} ${height} ${branding}></${tag}>`
  },
  'ts-text': el => {
    const {
      clearable, placeholder, width
    } = attrBuilder(el)
    const text = el.__slot__.span
    // console.log("el",el)
    // console.log('text', text);
    const { style } = el
    let styles = ''
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const key in style) {
      styles += `${key}:${style[key]};`
    }
    return `<div ${clearable} style="${styles}" ${placeholder}><span>${text}</span></div>`
  },
  'el-image': el => {
    const {
      src, fit, style
    } = el
    // 因为这里样式并不是很复杂，就不单独写在css.js里面了
    let styles = ''
    const { tag } = attrBuilder(el)
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const key in style) {
      styles += `${key}:${style[key]};`
    }
    const previewSrcList = `:preview-src-list="${confGlobal.formModel}.${el.__vModel__}"`
    return `<${tag} style=${styles} src="${src}" ${previewSrcList} fit="${fit}"></${tag}>`
  },
  'ts-iframe': el => {
    const { tag } = attrBuilder(el)
    const src = `src="${el.src}"`
    const width = `width="${el.width}"`
    const height = `height="${el.height}"`
    return `<${tag} ${src} ${width} ${height} />`
  },
  'el-table': el => {
    const {
      tag
    } = attrBuilder(el)
    const child = elTableColumn(el)
    return `<${tag} :data="${confGlobal.formModel}.${el.__vModel__}">${child}</${tag}>`
  },
  'el-collapse': el => {
    const {
      tag, vModel
    } = attrBuilder(el)
    const accordion = `:accordion="${el.accordion}"`
    let child = buildElCollapseChild(el)
    if (child) child = `\n${child}\n` // 换行
    return `<${tag} ${vModel} ${accordion} >${child}</${tag}>`
  },
  'el-steps': el => {
    const config = el.__config__
    const status = config['finish-status'] ? `finish-status=${config['finish-status']} ` : ''
    const finishText = config['finish-text'] ? config['finish-text'] : '已完成！'
    const step = buildElStepsChild(el)
    const child = buildElStepChild(el)
    const stepsLength = el.children.length
    return `
    <div>
      <el-steps :active="${confGlobal.formModel}.steps_${config.formId}" ${status}>
        ${step}
      </el-steps>
      ${child}
      <el-row type="flex" justify="center" style="clear:both;margin-bottom:10px;">
        <el-button size="small" v-if="${confGlobal.formModel}.steps_${config.formId} > 0" @click="${confGlobal.formModel}.steps_${config.formId}--">上一步</el-button>
        <el-button size="small" v-if="${confGlobal.formModel}.steps_${config.formId} < ${stepsLength}" @click="tsStepClick" type="primary">下一步</el-button>
      </el-row>
      <div v-if="${confGlobal.formModel}.steps_${config.formId}==${stepsLength}">完成啦啦啦啦啦啦啦</div>
    </div>
    `
  },
  'el-tabs': el => {
    const { tag, vModel } = attrBuilder(el)
    const type = el.type ? `type="${el.type}"` : ''
    const closable = el.closable ? `type="${el.closable}"` : ''
    const tabPosition = el['tab-position'] ? `tab-position="${el['tab-position']}"` : ''
    const child = exportTabsChild(el)
    return `<${tag} ${type} ${vModel} ${closable} ${tabPosition}>${child}</${tag}>`
  },
  'ts-sub-form': el => {
    const dataName = `:table-data="other.subForm${el.__config__.formId}"`
    const value = `v-model="other.subForm${el.__config__.formId}Data"`
    const addButton = `:addButton="other.addButton${el.__config__.formId}"`
    const deleteButton = `:deleteButton="other.deleteButton${el.__config__.formId}"`
    const displayShow = `:displayShow="other.displayShow${el.__config__.formId}"`
    const canEdit = `:canEdit="other.canEdit${el.__config__.formId}"`
    return `<ts-sub-form ${dataName} ${value} ${addButton} ${deleteButton} ${displayShow} ${canEdit}></ts-sub-form>`
  }
}
function exportTabsChild(scheme) {
  const childrenList = []
  const { children } = scheme
  for (let i = 0; i < children.length; i++) {
    let childHtml = []
    for (let j = 0; j < children[i].children.length; j++) {
      if (children[i].children[j]) {
        const oneChildHtml = layouts[children[i].children[j].__config__.layout](children[i].children[j])
        childHtml.push(oneChildHtml)
      }
    }
    childHtml = childHtml.join('\n')
    childrenList.push(
      `<el-tab-pane label='${children[i].label}'>
          ${childHtml}
        </el-tab-pane>`
    )
  }
  return childrenList.join('\n')
}
// 获取steps下的step
function buildElStepsChild(el) {
  const stepTitle = []
  const { children } = el
  for (let i = 0; i < children.length; i++) {
    stepTitle.push(`<el-step title="${children[i].title}" description="${children[i].description}">12333333333333333332</el-step>`)
  }
  return stepTitle.join('\n')
}

// 获取step下的子元素
function buildElStepChild(el) {
  const config = el.__config__
  const stepChildes = []
  const { children } = el
  for (let i = 0; i < children.length; i++) {
    if (children[i].children.length > 0) {
      let childHtml = []
      for (let j = 0; j < children[i].children.length; j++) {
        if (children[i].children[j]) {
          const oneChildHtml = layouts[children[i].children[j].__config__.layout](children[i].children[j])
          childHtml.push(oneChildHtml)
        }
      }
      childHtml = childHtml.join('\n')
      stepChildes.push(
        `<div v-show="${confGlobal.formModel}.steps_${config.formId}===${i}" label='${children[i].title}'>
          ${childHtml}
        </div>`
      )
    }
  }
  return stepChildes.join('\n')
}

// el-collapse 子级
function buildElCollapseChild(scheme) {
  const children = []
  const collapses = scheme.__config__.children
  if (collapses && collapses.length) {
    for (let i = 0; i < collapses.length; i++) {
      const actionChildren = collapses[i].__config__.children.map(el => layouts[el.__config__.layout](el))
      children.push(`<el-collapse-item title="${collapses[i].title}" name="${collapses[i].name}" :disabled="${collapses[i].disabled}">
        ${actionChildren}
      </el-collapse-item>`)
    }
  }
  return children.join('\n')
}

function elTableColumn(scheme) {
  const children = []
  const config = scheme.__config__
  if (config.children.length > 0) {
    const { tag } = scheme.__config__.children[0].__config__
    config.children.forEach(ts => {
      ts.prop && children.push(`<${tag} label="${ts.label}" align="${ts.align}" prop="${ts.prop}"></${tag}>`)
      // 这里的话我没有做判断  只是写一个简单的逻辑  没有做任何判断  这里可以给操作加一个特殊的标志
      if (!ts.prop) {
        const actionChildren = ts.__config__.children.map(el => layouts[el.__config__.layout](el))
        children.push(`<${tag} label="操作">\n<template slot-scope="scope">${actionChildren}</template></${tag}>`)
      }
    })
  }
  return children.join('\n')
}

function attrBuilder(el) {
  return {
    tag: el.__config__.tag,
    vModel: `v-model="${confGlobal.formModel}.${el.__vModel__}"`,
    clearable: el.clearable ? 'clearable' : '',
    placeholder: el.placeholder ? `placeholder="${el.placeholder}"` : '',
    width: el.style && el.style.width ? ':style="{width: \'100%\'}"' : '',
    disabled: el.disabled ? ':disabled=\'true\'' : ''
  }
}

// el-buttin 子级
function buildElButtonChild(scheme) {
  const children = []
  const slot = scheme.__slot__ || {}
  if (slot.default) {
    children.push(slot.default)
  }
  return children.join('\n')
}

// el-input 子级
function buildElInputChild(scheme) {
  const children = []
  const slot = scheme.__slot__
  if (slot && slot.prepend) {
    children.push(`<template slot="prepend">${slot.prepend}</template>`)
  }
  if (slot && slot.append) {
    children.push(`<template slot="append">${slot.append}</template>`)
  }
  return children.join('\n')
}

// el-select 子级
function buildElSelectChild(scheme) {
  const children = []
  const slot = scheme.__slot__
  if (slot && slot.options && slot.options.length) {
    children.push(`<el-option v-for="(item, index) in ${scheme.__vModel__}Options" :key="index" :label="item.label" :value="item.value" :disabled="item.disabled"></el-option>`)
  }
  return children.join('\n')
}

// el-radio-group 子级
function buildElRadioGroupChild(scheme) {
  const children = []
  const slot = scheme.__slot__
  const config = scheme.__config__
  if (slot && slot.options && slot.options.length) {
    const tag = config.optionType === 'button' ? 'el-radio-button' : 'el-radio'
    const border = config.border ? 'border' : ''
    children.push(`<${tag} v-for="(item, index) in ${scheme.__vModel__}Options" :key="index" :label="item.value" :disabled="item.disabled" ${border}>{{item.label}}</${tag}>`)
  }
  return children.join('\n')
}

// el-checkbox-group 子级
function buildElCheckboxGroupChild(scheme) {
  const children = []
  const slot = scheme.__slot__
  const config = scheme.__config__
  if (slot && slot.options && slot.options.length) {
    const tag = config.optionType === 'button' ? 'el-checkbox-button' : 'el-checkbox'
    const border = config.border ? 'border' : ''
    children.push(`<${tag} v-for="(item, index) in ${scheme.__vModel__}Options" :key="index" :label="item.value" :disabled="item.disabled" ${border}>{{item.label}}</${tag}>`)
  }
  return children.join('\n')
}

// el-upload 子级
function buildElUploadChild(scheme) {
  const list = []
  const config = scheme.__config__
  if (scheme['list-type'] === 'picture-card') list.push('<i class="el-icon-plus"></i>')
  else list.push(`<el-button size="small" type="primary" icon="el-icon-upload">${config.buttonText}</el-button>`)
  if (config.showTip) list.push(`<div slot="tip" class="el-upload__tip">只能上传不超过 ${config.fileSize}${config.sizeUnit} 的${scheme.accept}文件</div>`)
  return list.join('\n')
}

/**
 * 组装html代码。【入口函数】
 * @param {Object} formConfig 整个表单配置
 * @param {String} type 生成类型，文件或弹窗等
 */
export function makeUpHtml(formConfig, type) {
  const htmlList = []
  confGlobal = formConfig
  // 判断布局是否都沾满了24个栅格，以备后续简化代码结构
  someSpanIsNot24 = formConfig.fields.some(item => item.__config__.span !== 24)
  // 遍历渲染每个组件成html
  formConfig.fields.forEach(el => {
    htmlList.push(layouts[el.__config__.layout](el))
  })
  const htmlStr = htmlList.join('\n')
  // 将组件代码放进form标签
  let temp = buildFormTemplate(formConfig, htmlStr, type)
  // dialog标签包裹代码
  if (type === 'dialog') {
    temp = dialogWrapper(temp)
  }
  confGlobal = null
  return temp
}
