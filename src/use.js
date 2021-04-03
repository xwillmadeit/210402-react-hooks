import render from './render'

// 初始化 hooks 数组，用于存放所有 useState 的值
const hooks = []
// 初始化 hooks 数组下标，从第一项开始对每个 useState 进行存放
let index = 0

/**
 * custom useState
 */
function useState(initialState) {
  hooks[index] = hooks[index] || initialState
  // 暂存当前 index 值，给 setState 使用
  const currentIndex = index

  function setState(newState) {
    // 调用 setState 时需要找到 hooks 数组中对应的 index 进行操作，这个 index 是 useState 时决定的
    hooks[currentIndex] = newState
    // 每次调用 setState，函数组件会重新运行，会重新走 useState，此时需要重置 index，从头开始
    index = 0
    // 模拟组件重新渲染
    render()
  }

  return [hooks[index++], setState]
}

/**
 * custom useMemo
 */
function useMemo(factory, deps) {
  const [lastValue, lastDeps] = hooks[index] || []
  let hasChanged = true

  if (hooks[index]) {
    hasChanged = deps.some((val, index) => !Object.is(val, lastDeps[index]))
  }

  // 第一次 render 或 依赖数组里面有一个值发生改变，则执行 factory，否则用老的值
  if (hasChanged) {
    const value = factory()
    hooks[index] = [value, deps]
    index++
    return value
  }

  index++
  return lastValue
}

/**
 * custom useCallback
 */
function useCallback(callback, deps) {
  const [lastCallback, lastDeps] = hooks[index] || []
  let hasChanged = true

  if (hooks[index]) {
    hasChanged = deps.some((val, index) => !Object.is(val, lastDeps[index]))
  }

  // 第一次 render 或 依赖数组里面有一个值发生改变，则返回新的 callback，否则用老的值
  if (hasChanged) {
    hooks[index] = [callback, deps]
    index++
    return callback
  }

  index++
  return lastCallback
}

function useEffect(callback, deps) {
  const lastDeps = hooks[index]
  let hasChanged = true

  if (lastDeps) {
    hasChanged = deps.some((val, index) => !Object.is(val, lastDeps[index]))
  }

  // 第一次渲染或者依赖数组中有值变了，则执行 callback
  if (hasChanged) {
    hooks[index] = deps
    callback()
  }

  index++
}

function useRef(initialValue) {
  hooks[index] = hooks[index] || { current: initialValue }
  return hooks[index++]
}

function useContext(context) {
  hooks[index] = hooks[index] || context.Consumer._currentValue

  return hooks[index++]
}

function useReducer(reducer, initialArg, init) {
  if (!hooks[index]) {
    let value = init ? init(initialArg) : initialArg
    const currentIndex = index
    const dispatch = function (data) {
      value = reducer(value, data)
      hooks[currentIndex] = [value, dispatch]
      index = 0
      // 模拟组件重新渲染
      render()
    }
    hooks[index] = [value, dispatch]
  }

  return hooks[index++]
}

export {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useContext,
  useReducer,
}
