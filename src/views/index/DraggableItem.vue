<script>
import draggable from 'vuedraggable'
import render from '@/components/render/render'

const components = {
  itemBtns(h, currentItem, index, list) {
    const { copyItem, deleteItem } = this.$listeners
    return [
      <span class="drawing-item-copy" title="复制" onClick={event => {
        copyItem(currentItem, list); event.stopPropagation()
      }}>
        <i class="el-icon-copy-document" />
      </span>,
      <span class="drawing-item-delete" title="删除" onClick={event => {
        deleteItem(index, list); event.stopPropagation()
      }}>
        <i class="el-icon-delete" />
      </span>
    ]
  }
}
const layouts = {
  colFormItem(h, currentItem, index, list) {
    const { activeItem } = this.$listeners
    const config = currentItem.__config__
    const child = renderChildren.apply(this, arguments)
    let className = this.activeId === config.formId ? 'drawing-item active-from-item' : 'drawing-item'
    if (this.formConf.unFocusedComponentBorder) className += ' unfocus-bordered'
    let labelWidth = config.labelWidth ? `${config.labelWidth}px` : null
    if (config.showLabel === false) labelWidth = '0'
    return (
      <el-col span={config.span} class={className}
        nativeOnClick={event => { activeItem(currentItem); event.stopPropagation() }}>
        <el-form-item label-width={labelWidth}
          label={config.showLabel ? config.label : ''} required={config.required}>
          <render key={config.renderKey} conf={currentItem} onInput={ event => {
            this.$set(config, 'defaultValue', event)
          }}>
            {child}
          </render>
        </el-form-item>
        {components.itemBtns.apply(this, arguments)}
      </el-col>
    )
  },
  rowFormItem(h, currentItem, index, list) {
    const { activeItem } = this.$listeners
    const config = currentItem.__config__
    const className = this.activeId === config.formId
      ? 'drawing-row-item active-from-item'
      : 'drawing-row-item'
    let child = renderChildren.apply(this, arguments)
    if (currentItem.type === 'flex') {
      child = <el-row type={currentItem.type} justify={currentItem.justify} align={currentItem.align}>
              {child}
            </el-row>
    }
    return (
      <el-col span={config.span}>
        <el-row gutter={config.gutter} class={className}
          nativeOnClick={event => { activeItem(currentItem); event.stopPropagation() }}>
          <span class="component-name">{config.componentName}</span>
          <draggable list={config.children || []} animation={340}
            group="componentsGroup" class="drag-wrapper">
            {child}
          </draggable>
          {components.itemBtns.apply(this, arguments)}
        </el-row>
      </el-col>
    )
  },
  raw(h, currentItem, index, list) {
    const config = currentItem.__config__
    const child = renderChildren.apply(this, arguments)
    return <render key={config.renderKey} conf={currentItem} onInput={ event => {
      this.$set(config, 'defaultValue', event)
    }}>
      {child}
    </render>
  },
  tsCard(h, currentItem, index, list) {
    const { activeItem } = this.$listeners
    const config = currentItem.__config__
    let className = this.activeId === config.formId
      ? 'drawing-row-item active-from-item'
      : 'drawing-row-item'
    if (this.formConf.unFocusedComponentBorder) className += ' unfocus-bordered'
    const tsCardHeader = []
    const tsCardBody = []
    config.children.cardHeader.forEach(item => {
      const layout = layouts[item.__config__.layout]
      tsCardHeader.push(layout.call(this, h, item, index, config.children.cardHeader))
    })
    config.children.cardBody.forEach(item => {
      const layout = layouts[item.__config__.layout]
      tsCardBody.push(layout.call(this, h, item, index, config.children.cardBody))
    })
    //   <draggable list={config.children.cardHeader || []} animation={340}
    //   group="componentsGroup" className="drag-wrapper">
    //     {tsCardHeader}
    // </draggable>
    return (
      <el-col span={config.span} class={className}
              nativeOnClick={event => { activeItem(currentItem); event.stopPropagation() }}>
        <el-form-item label-width={config.showLabel ? `${config.labelWidth}px` : '0px'}
                      label={config.showLabel ? config.label : ''} required={config.required}>
          <el-card className="box-card">
            <div slot="header" className="clearfix">
              <div style="display: flex">
                <span>{config.label}</span>
              </div>
            </div>
            <draggable style="height:60px" list={config.children.cardBody || []}
                       animation={340} group="componentsGroup" className="drag-wrapper">
              {tsCardBody}
            </draggable>
          </el-card>
        </el-form-item>
        {components.itemBtns.apply(this, arguments)}
      </el-col>
    )
  },
  tsSteps(h, currentItem, index, list) {
    const { activeItem } = this.$listeners
    const config = currentItem.__config__
    const { children } = currentItem // 获取子节点
    const className = this.activeId === config.formId
      ? 'drawing-row-item active-from-item'
      : 'drawing-row-item'
    const stepList = []
    let stepChild = []
    const { active } = currentItem
    for (let i = 0; i < children.length; i++) {
      const child = renderChildren.call(this, h, currentItem, index, list, children[i])
      stepList.push([
        <el-step title={children[i].title}
                 description={children[i].description} nativeOnClick = {() => { config.active = i }} />
      ])
      if (i === active) {
        stepChild = [
          <div className="ts-step-child">
            <draggable list={children[i].children || []} animation={100} group="componentsGroup"
                       className="drag-wrapper">
              {child}
              <div style="clear:both;height: 60px"></div>
            </draggable>
          </div>
        ]
      }
    }
    // 这里的上一步只是做演示，没有做特殊的控制。
    return <el-col span={config.span}>
      <el-row gutter={config.gutter} class={className}
              nativeOnClick={event => { activeItem(currentItem); event.stopPropagation() }}>
        <span className="component-name">{config.componentName}</span>
        <el-steps active={currentItem.active} finish-status={currentItem['finish-status']}>
          {stepList}
        </el-steps>
        {stepChild}
        <el-row type="flex" justify="center">
          <el-button size="small" onClick={() => { if (--currentItem.active < 1) currentItem.active = 0 }}>
            上一步
          </el-button>
          <el-button size="small" onClick={() => { if (++currentItem.active > stepList.length) currentItem.active = 0 }}>
            下一步
          </el-button>
        </el-row>
        {components.itemBtns.apply(this, arguments)}
      </el-row>
    </el-col>
  }
}

function renderChildren(h, currentItem, index, list, children) {
  const config = currentItem.__config__
  if (currentItem.__config__.tag === 'el-steps') {
    children = children.children
  } else {
    children = config.children
  }
  if (!Array.isArray(children)) return null
  return children.map((el, i) => {
    const layout = layouts[el.__config__.layout]
    if (layout) {
      return layout.call(this, h, el, i, children)
    }
    return layoutIsNotFound.call(this)
  })
}

function layoutIsNotFound() {
  throw new Error(`没有与${this.currentItem.__config__.layout}匹配的layout`)
}

export default {
  components: {
    render,
    draggable
  },
  props: [
    'currentItem',
    'index',
    'drawingList',
    'activeId',
    'formConf'
  ],
  render(h) {
    const layout = layouts[this.currentItem.__config__.layout]

    if (layout) {
      return layout.call(this, h, this.currentItem, this.index, this.drawingList)
    }
    return layoutIsNotFound.call(this)
  }
}
</script>
