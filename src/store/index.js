import Vue from 'vue'
import Vuex from 'vuex'
import history from './modules/history'

Vue.use(Vuex)

const store = new Vuex.Store({
  // 存放状态
  state: {
  },
  // state的计算属性
  getters: {
  },
  // 更改state中状态的逻辑，同步操作
  mutations: {
  },
  // 提交mutation，异步操作
  actions: {
  },
  // 如果将store分成一个个的模块的话，则需要用到modules。
  // 然后在每一个module中写state, getters, mutations, actions等。
  // modules：模块化vuex，可以让每一个模块拥有自己的state、mutation、action、getters,使得结构非常清晰，方便管理
  modules: {
    history
  }
})

export default store

// dispatch：异步操作，写法： this.$store.dispatch('actions方法名',值)
// commit：同步操作，写法：this.$store.commit('mutations方法名',值)
