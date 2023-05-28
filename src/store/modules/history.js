const state = {
  name: 'ts-designer',
  cursor: 0
}

const mutations = {
  // eslint-disable-next-line no-shadow
  SET_CURSOR: (state, cursor) => {
    state.cursor = cursor
  }
}

const actions = {
  openDB(name, version = 1) {
    // window.indexedDB.open
    // 这个方法接受两个参数，第一个参数是字符串，表示数据库的名字。如果指定的数据库不存在，就会新建数据库。
    // 第二个参数是整数，表示数据库的版本。如果省略，打开已有数据库时，默认为当前版本；新建数据库时，默认为1。
    const request = window.indexedDB.open(name, version)
    return new Promise((resolve, reject) => {
      // error事件表示打开数据库失败
      request.onerror = e => {
        reject(e.currentTarget.error.message)
      }
      // success事件表示成功打开数据库。
      request.onsuccess = e => {
        resolve(e.target.result)
      }
      // 如果指定的版本号，大于数据库的实际版本号，就会发生数据库升级事件upgradeneeded。
      // 新建数据库与打开数据库是同一个操作。如果指定的数据库不存在，就会新建。
      // 不同之处在于，后续的操作主要在upgradeneeded事件的监听函数里面完成，因为这时版本从无到有，所以会触发这个事件。
      request.onupgradeneeded = e => {
        const db = e.target.result
        // 先判断一下，这张表格是否存在，如果不存在再新建
        if (!db.objectStoreNames.contains('history')) {
          // 数据库新建成功以后，新增一张叫做history的表格，主键是id
          const store = db.createObjectStore('history', { keyPath: 'id' })
        }
      }
    })
  },
  clear({ commit }) {
    return new Promise((resolve, reject) => {
      actions.openDB(state.name).then(db => {
        const trans = db.transaction(['history'], 'readwrite')
        const historyStore = trans.objectStore('history')
        historyStore.clear()
        trans.oncomplete = e => {
          commit('SET_CURSOR', 0)
          resolve()
        }
      })
    })
  },
  updateLatest(data, selectedKey) {
    return new Promise((resolve, reject) => {
      actions.openDB(state.name).then(db => {
        const trans = db.transaction(['history'], 'readwrite')
        const historyStore = trans.objectStore('history')
        // put()方法自动更新了主键为1的记录。
        historyStore.put({
          id: state.cursor,
          data,
          selected: selectedKey
        })

        trans.oncomplete = e => {
          resolve()
        }
      })
    })
  },
  add({ commit }, data) {
    return new Promise((resolve, reject) => {
      actions.openDB(state.name).then(db => {
        // 新建一个事务。新建时必须指定表格名称和操作模式（"只读"或"读写"
        // 事务由IDBDatabase对象调用其transaction方法创建。IDBDatabase.transaction(storeNames, mode)
        // eslint-disable-next-line max-len
        // storeNames：就是在新的事务的作用域中的objectStore，生命成一组字符串数组的形式。意义在于指明用户希望访问的objectStore。如果仅想访问一个objectStore，那么仅需传入一个字符串而没必要传一个数组。
        // mode（可选）：即事务运行的模式，模式共有3种，readonly、readwrite、readwriteflush（Firefox特有），默认值为readonly。
        // 为了避免性能下降，如果不是要对数据库写入数据就不要用readwrite模式打开事务
        const trans = db.transaction(['history'], 'readwrite')
        // 通过IDBTransaction.objectStore(name)方法，拿到 IDBObjectStore 对象
        const historyStore = trans.objectStore('history')
        const id = state.cursor + 1
        const historyList = []
        historyStore.openCursor().onsuccess = e => {
          const cursor = e.target.result
          if (cursor) {
            historyList.push(cursor.value)
            cursor.continue()
          } else {
            for (let i = 0; i < historyList.length; i++) {
              if (historyList[i].id > state.cursor) {
                // IDBObjectStore.delete()方法用于删除记录。
                historyStore.delete(historyList[i].id)
              }
            }
            // 通过表格对象的add()方法，向表格写入一条记录
            historyStore.add({
              id,
              data: data.data
            })
          }
        }
        trans.oncomplete = e => {
          commit('SET_CURSOR', id)
          resolve()
        }
      })
    })
  },
  revoke({ commit }) {
    return new Promise((resolve, reject) => {
      actions.openDB(state.name).then(db => {
        // 新建一个事务。新建时必须指定表格名称和操作模式（"只读"或"读写"
        const trans = db.transaction(['history'], 'readwrite')
        // 通过IDBTransaction.objectStore(name)方法，拿到 IDBObjectStore 对象
        const historyStore = trans.objectStore('history')
        const cursor = 0; let data = []; let undo = false; const redo = true
        if (state.cursor > 1) {
          // objectStore.get()方法用于读取数据，参数是主键的值
          const request = historyStore.get(state.cursor - 1)
          request.onsuccess = e => {
            data = request.result.data
            undo = true
          }
        }
        trans.oncomplete = e => {
          commit('SET_CURSOR', state.cursor - 1)
          resolve({
            data, undo, redo
          })
        }
      })
    })
  },
  redo({ commit }) {
    return new Promise((resolve, reject) => {
      actions.openDB(state.name).then(db => {
        // 新建一个事务。新建时必须指定表格名称和操作模式（"只读"或"读写"
        const trans = db.transaction(['history'], 'readwrite')
        // 通过IDBTransaction.objectStore(name)方法，拿到 IDBObjectStore 对象
        const historyStore = trans.objectStore('history')
        const cursor = 0; let data = []; const undo = true; let redo = false
        const countRequest = historyStore.count()
        countRequest.onsuccess = () => {
          const count = countRequest.result
          if (state.cursor < count) {
            // objectStore.get()方法用于读取数据，参数是主键的值
            const request = historyStore.get(state.cursor + 1)
            request.onsuccess = e => {
              data = request.result.data
              redo = state.cursor + 1 !== count
            }
          }
        }
        trans.oncomplete = e => {
          commit('SET_CURSOR', state.cursor + 1)
          resolve({
            data, undo, redo
          })
        }
      })
    })
  }
}

export default {
  namespaced: true, // namespaced: true 的方式使其成为带命名空间的模块。保证在变量名一样的时候，添加一个父级名拼接。
  state,
  mutations,
  actions
}
