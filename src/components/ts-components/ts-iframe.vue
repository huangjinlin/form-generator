<template>
  <iframe
    :width="width"
    :frameborder="frameborder"
    :scrolling="scrolling"
    :height="height"
    :src="src"
  />
</template>

<script>

export default {
  name: 'TsIframe',
  props: {
    src: { // 规定在 iframe 中显示的文档的 URL。
      type: String,
      required: true
    },
    width: { // 定义 iframe 的宽度。
      type: String,
      required: false,
      default: () => '100%'
    },
    height: { // 规定 iframe 的高度
      type: Number,
      required: false,
      default: () => 70
    },
    frameborder: { // 规定是否显示框架周围的边框。
      type: Number,
      required: false,
      default: () => 0
    },
    scrolling: { // 规定是否在 iframe 中显示滚动条。
      type: String,
      required: false,
      default: () => 'auto'
    }
  }
}
</script>
