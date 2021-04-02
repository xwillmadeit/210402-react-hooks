import reactDom from 'react-dom'
import App from './App'

// 初始化 hooks 数组，用于存放所有 useState 的值
const hooksState = []
// 初始化 hooks 数组下标，从第一项开始对每个 useState 进行存放
let hooksIndex = 0

function useState(initialState) {
  const state = hooksState[hooksIndex] || initialState
  // 暂存当前 index 值，给 setState 使用
  const currentIndex = hooksIndex

  function setState(newState) {
    // 调用 setState 时需要找到 hooksState 数组中对应的 index 进行操作，这个 index 是 useState 时决定的
    hooksState[currentIndex] = newState
    // 每次调用 setState，函数组件会重新运行，会重新走 useState，此时需要重置 index，从头开始
    hooksIndex = 0
    // 模拟组件重新渲染
    reactDom.render(<App />, document.getElementById('root'))
  }

  hooksIndex++

  return [state, setState]
}

export default useState
