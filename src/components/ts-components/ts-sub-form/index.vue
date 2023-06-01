<template>
  <div style="padding: 20px 0;margin-bottom: 30px">
    <div style="
      border-radius: 8px;
      padding: 0 10px 10px;
  " :style="{border: transverseDataList.length > 0 ? '1px solid rgb(193, 193, 193)' : 'none'}"
    >
      <div v-for="(Item, I) in transverseDataList" :key="I" style="
       border: 1px solid rgb(193, 193, 193);border-radius: 8px;position: relative;padding-top: 20px;margin-top: 10px;
  "
      >
        <div style="cursor:pointer;width: 20px;position: absolute;left: 4px;top: 4px;height: 20px;text-align: center;background: #30303080;border-radius: 50%;line-height: 20px;color: white;" @mouseenter="onMouseOver"
             @mouseleave="onMouseOut( $event, I+1)" @click="ts_delete_rows(I)"
        >
          {{ I+1 }}
        </div>
        <div style="width: 100vw;display: table-cell;">
          <div v-for="(col,index) in Item" :key="index" style="width: 99%;">
            <el-form-item :label="col.__config__.label">
              <render :sync-data.sync="col._data" :sync-data-key="col.__config__.prop" :current-data="col" />
            </el-form-item>
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top: 10px">
      <el-button v-if="canEdit && addButton && tableData.length > 0"
                 size="small" icon="el-icon-plus" style="float: left;" @click="ts_add_rows"
      >
        添加
      </el-button>
      <render style="display: none" />
    </div>
  </div>
</template>

<script>
import render from './ts-render'

export default {
  name: 'TsSubForm',
  components: {
    render
  },
  props: {
    tableData: {
      type: Array,
      default() {
        return []
      }
    },
    value: {
      type: Array,
      default() {
        return []
      }
    },
    addButton: {
      type: Boolean,
      default() {
        return true
      }
    },
    deleteButton: {
      type: Boolean,
      default() {
        return true
      }
    },
    canEdit: {
      type: Boolean,
      default() {
        return true
      }
    },
    displayShow: {
      type: String, // vertical
      default: 'transverse'
    }
  },
  data() {
    return {
      ts_sustain_type: ['el-input', 'el-radio-group', 'el-checkbox-group',
        'el-input-number', 'el-select', 'el-cascader', 'el-switch',
        'el-slider', 'el-time-select', 'el-date-picker', 'el-upload', 'el-rate', 'el-color-picker'],
      ts_get_data_type: ['el-radio-group', 'el-select', 'el-checkbox-group', 'el-cascader'],
      ts_local_data: [],
      ts_current_row: null,
      ts_current_rows: [],
      syncData: [],
      ts_whether_add: false,
      transverseDataList: []
    }
  },
  watch: {
    value: {
      handler(val) {
        this.syncData = val
        this.ts_render_rows()
      },
      deep: true
    },
    syncData: {
      handler(val) {
        this.$emit('input', val)
      },
      deep: true
    }
  },
  created() {
    this.syncData = this.value
    this.ts_render_rows()
  },
  methods: {
    ts_render_rows() {
      if (this.ts_execute_down() && !this.ts_whether_add) {
        const _that = this
        const _columns = this.deepClone(this.tableData)
        this.ts_current_rows.push(_columns)
        this.syncData.forEach(_data => {
          _columns.forEach(item => {
            item._ts_way_bind_ = item.__config__.prop
            item._data = _data
          })
          this.transverseDataList.push(_columns)
        })
      }
    },
    ts_add_rows() {
      this.ts_whether_add = true
      const _columns = this.deepClone(this.tableData)
      this.ts_current_rows.push(_columns)
      const _data = {}
      _columns.forEach(item => {
        _data[item.__config__.prop] = ''
        item._ts_way_bind_ = item.__config__.prop
        item.__config__.tag === 'el-checkbox-group' && (_data[item.__config__.prop] = [])
        item._data = _data
      })
      this.syncData.push(_data)
      this.transverseDataList.push(_columns)
    },
    ts_cycle_rows(_columns, _data, _rows, _add) {
      this.ts_whether_add = true
      const _that = this
      _columns.forEach(item => {
        if (this.contains(_that.ts_sustain_type, item.__config__.tag)) {
          _that.ts_get_parent_data(item)
          _add && (_data[item.__config__.prop] = '')
          !_that.canEdit && (item.disabled = true)
          item.__config__.tag === 'el-checkbox-group' && (_data[item.__config__.prop] = [])
          item._ts_way_bind_ = item.__config__.prop
          _rows[item.__config__.prop] = <render
              syncData={_data} syncDataKey={item.__config__.prop} current-data={item}>
            </render>
        } else {
          _rows[item.__config__.prop] = <span>{ item.__config__.label }</span>
        }
      })
    },
    ts_delete_rows(_row) {
      this.transverseDataList.splice(_row, 1)
    },
    ts_get_parent_data(_item) {
      this.ts_whether_add = true
      if (this.isNotNull(_item.__slot__)
          && this.contains(this.ts_get_data_type, _item.__config__.tag)
          && _item.__config__.tag !== 'el-cascader') {
        _item.__slot__.options = this.$parent[_item.__config__.data] != null
          ? this.$parent[_item.__config__.data] : _item.__slot__.options
      } else if (this.isNotNull(_item.options) && _item.__config__.tag === 'el-cascader') {
        // eslint-disable-next-line max-len
        _item.options = this.$parent[_item.__config__.data] != null ? this.$parent[_item.__config__.data] : _item.options
      }
    },
    ts_execute_down() {
      return this.syncData != null
          && this.syncData.length > 0
          && this.tableData != null
          && this.tableData.length > 0
    },
    deepClone(source) {
      if (!source && typeof source !== 'object') {
        throw new Error('error arguments', 'deepClone')
      }
      const targetObj = source.constructor === Array ? [] : {}
      Object.keys(source).forEach(keys => {
        if (source[keys] && typeof source[keys] === 'object') {
          targetObj[keys] = this.deepClone(source[keys])
        } else {
          targetObj[keys] = source[keys]
        }
      })
      return targetObj
    },
    contains(array, value) {
      for (let i = 0; i < array.length; i++) {
        if (array[i] === value) {
          return true
        }
      }
      return false
    },
    isNotNull(value) {
      return !this.isNull(value)
    },
    isNull(value) {
      return Object.is(value, '') || Object.is(value, null) || Object.is(value, undefined)
    },
    // 鼠标移入
    onMouseOver(el) {
      el.currentTarget.innerText = '-'
      el.currentTarget.className = 'ts-del-active'
    },
    // 鼠标移出
    onMouseOut(el, index) {
      el.currentTarget.innerText = index
      el.currentTarget.className = ''
    }
  }
}
</script>

  <style>
  .ts-del-active {
    background: #f9393980!important;
  }
  </style>
