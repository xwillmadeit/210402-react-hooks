import reactDom from 'react-dom'
import App from './App'

// 初始化 hooks 数组，用于存放所有 useState 的值
const hooksState = []
// 初始化 hooks 数组下标，从第一项开始对每个 useState 进行存放
let hooksIndex = 0

/**
 * custom useState
 */
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

/**
 * custom useMemo
 */
function useMemo(factory, deps) {
  const [lastValue, lastDeps] = hooksState[hooksIndex] || []
  let hasChanged = true

  if (hooksState[hooksIndex]) {
    hasChanged = deps.some((val, index) => !Object.is(val, lastDeps[index]))
  }

  // 第一次 render 或 依赖数组里面有一个值发生改变，则执行 factory，否则用老的值
  if (hasChanged) {
    const value = factory()
    hooksState[hooksIndex] = [value, deps]
    hooksIndex++
    return value
  }

  hooksIndex++
  return lastValue
}

/**
 * custom useCallback
 */
function useCallback(callback, deps) {
  const [lastCallback, lastDeps] = hooksState[hooksIndex] || []
  let hasChanged = true

  if (hooksState[hooksIndex]) {
    hasChanged = deps.some((val, index) => !Object.is(val, lastDeps[index]))
  }

  // 第一次 render 或 依赖数组里面有一个值发生改变，则返回新的 callback，否则用老的值
  if (hasChanged) {
    hooksState[hooksIndex] = [callback, deps]
    hooksIndex++
    return callback
  }

  hooksIndex++
  return lastCallback
}

function useEffect(callback, deps) {
  const lastDeps = hooksState[hooksIndex]
  let hasChanged = true

  if (lastDeps) {
    hasChanged = deps.some((val, index) => !Object.is(val, lastDeps[index]))
  }

  // 第一次渲染或者依赖数组中有值变了，则执行 callback
  if (hasChanged) {
    hooksState[hooksIndex] = deps
    callback()
  }

  hooksIndex++
}

export { useState, useMemo, useCallback, useEffect }
