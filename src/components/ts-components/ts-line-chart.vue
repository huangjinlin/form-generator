<template>
  <div className="chart" />
</template>

<script>
// eslint-disable-next-line import/no-extraneous-dependencies
import { merge } from 'lodash'
import * as echarts from 'echarts'

export default {
  name: 'TsLineChart',
  props: {
    title: {
      type: Object,
      default: () => ({
        text: '*****数据',
        subtext: '*****公司',
        left: 'center'
      })
    },
    tooltip: {
      type: Object,
      default: () => ({
        trigger: 'item'
      })
    },
    legend: {
      type: Object,
      default: () => ({
        orient: 'vertical',
        left: 'left'
      })
    },
    seriesData: {
      type: Array,
      required: true,
      default: () => []
    },
    extraOption: {
      type: Object,
      default: () => ({})
    },
    color: {
      type: Array,
      default: () => (['#f75981', '#90e2a9', '#fe883a', '#2d90d1'])
    },
    // eslint-disable-next-line vue/require-default-prop
    name: [String],
    type: {
      type: String,
      default: () => ('pie')
    },
    radius: {
      type: String,
      default: () => ('50%')
    }
  },
  data() {
    return {
      chart: null,
      BASIC_OPTION: {
        title: this.title,
        tooltip: this.tooltip,
        legend: this.legend,
        series: [
          {
            name: '水果购买占比',
            type: 'pie',
            radius: '50%',
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            data: []
          }
        ]
      }
    }
  },
  watch: {
    seriesData: {
      deep: true,
      handler() {
        this.updateChartView()
      }
    }
  },
  mounted() {
    this.chart = echarts.init(this.$el)
    this.updateChartView()
  },
  beforeDestroy() {
  },
  methods: {
    updateChartView() {
      if (!this.chart) return
      const fullOption = this.assembleDataToOption()
      this.chart.setOption(fullOption, true)
    },
    assembleDataToOption() {
      const formatter = name => {
        const total = this.seriesData.reduce((acc, cur) => acc + cur.value, 0)
        const data = this.seriesData.find(item => item.name === name) || {}
        const percent = data.value
          ? `${Math.round((data.value / total) * 100)}%`
          : '0%'

        return `${name} ${percent}`
      }
      return merge(
        {},
        this.BASIC_OPTION,
        { color: this.color },
        {
          legend: { formatter },
          series: [{
            data: this.seriesData, name: this.name, type: this.type, radius: this.radius
          }]
        },
        this.extraOption
      )
    }
  }
}
</script>
