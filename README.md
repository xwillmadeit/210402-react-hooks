# react hooks 原理

## 开发

```
yarn
yarn start
```

源码在 [src/use.js](https://github.com/xwillmadeit/210402-react-hooks/blob/master/src/use.js)

## useState

```js
import render from './render'

// 初始化 hooks 数组，用于存放所有 useState 的值
const hooksState = []
// 初始化 hooks 数组下标，从第一项开始对每个 useState 进行存放
let hooksIndex = 0

/**
 * custom useState
 */
function useState(initialState) {
  hooksState[hooksIndex] = hooksState[hooksIndex] || initialState
  // 暂存当前 index 值，给 setState 使用
  const currentIndex = hooksIndex

  function setState(newState) {
    // 调用 setState 时需要找到 hooksState 数组中对应的 index 进行操作，这个 index 是 useState 时决定的
    hooksState[currentIndex] = newState
    // 每次调用 setState，函数组件会重新运行，会重新走 useState，此时需要重置 index，从头开始
    hooksIndex = 0
    // 模拟组件重新渲染
    render()
  }

  return [hooksState[hooksIndex++], setState]
}

export { useState }
```

相关资料：[Getting Closure on React Hooks](https://www.youtube.com/watch?v=KJP1E-Y-xyo)

## React.memo/useMemo/useCallback

思考这个组件有什么问题？

```js
import React from 'react'

function Number({ data, addNumber }) {
  console.log('Number render')
  return (
    <>
      <h1>number component</h1>
      <h2>{data.number}</h2>
      <button onClick={addNumber}>add + 10</button>
    </>
  )
}

function App() {
  const [count, setCount] = React.useState(0)
  const [number, setNumber] = React.useState(10)
  let data = { number }
  let addNumber = () => setNumber(number + 10)

  return (
    <div className="App">
      <h1>count component</h1>
      <h2>{count}</h2>
      <button onClick={() => setCount(count + 1)}>add + 1</button>

      <hr />

      <Number data={data} addNumber={addNumber} />
    </div>
  )
}

export default App
```

当点击 add + 1 按钮时，Number 组件也会被重新渲染。如何优化？

React.Memo + useMemo + useCallback，三个必须一起用。

```js
import React from 'react'

function Number({ data, addNumber }) {
  console.log('Number render')
  return (
    <>
      <h1>number component</h1>
      <h2>{data.number}</h2>
      <button onClick={addNumber}>add + 10</button>
    </>
  )
}

// React.memo 类似 PureComponent，会进行 props 浅比较
Number = React.memo(Number)

function App() {
  const [count, setCount] = React.useState(0)
  const [number, setNumber] = React.useState(10)
  // let data = { number } // 这样写 Number 组件会重新渲染，因为 App 组件每次 render 都会生成新的 data 对象，Memo 使用的是浅比较
  let data = React.useMemo(() => ({ number }), [number]) // useMemo 可用于缓存对象
  // let addNumber = () => setNumber(number + 10) // 这样写 Number 组件会重新渲染，因为 App 组件每次 render 都会导致新的 addNumber 函数被创建
  let addNumber = React.useCallback(() => setNumber(number + 10), [number]) // useCallback 可用于缓存函数
  return (
    <div className="App">
      <h1>count component</h1>
      <h2>{count}</h2>
      <button onClick={() => setCount(count + 1)}>add + 1</button>

      <hr />

      <Number data={data} addNumber={addNumber} />
    </div>
  )
}

export default App
```

手写 `useMemo` + `useCallback`

```js
import render from './render'

// 初始化 hooks 数组，用于存放所有 useState 的值
const hooksState = []
// 初始化 hooks 数组下标，从第一项开始对每个 useState 进行存放
let hooksIndex = 0

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

export { useMemo, useCallback }
```

## useEffect

```js
import render from './render'

// 初始化 hooks 数组，用于存放所有 useState 的值
const hooksState = []
// 初始化 hooks 数组下标，从第一项开始对每个 useState 进行存放
let hooksIndex = 0

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

export { useEffect }
```

PS：这里 useEffect 的实现会导致内部回调函数先于 render 执行，这显然是个 bug，这里暂时忽略。关于为什么 render 会先于 useEffect 执行的[解释](https://reactjs.org/docs/hooks-reference.html#useeffect)。

## useRef

```js
import render from './render'

// 初始化 hooks 数组，用于存放所有 useState 的值
const hooksState = []
// 初始化 hooks 数组下标，从第一项开始对每个 useState 进行存放
let hooksIndex = 0

function useRef(initialValue) {
  hooksState[hooksIndex] = hooksState[hooksIndex] || { current: initialValue }
  return hooksState[hooksIndex++]
}

export { useRef }
```

## useContext

```js
import render from './render'

// 初始化 hooks 数组，用于存放所有 useState 的值
const hooksState = []
// 初始化 hooks 数组下标，从第一项开始对每个 useState 进行存放
let hooksIndex = 0

function useContext(context) {
  hooksState[hooksIndex] =
    hooksState[hooksIndex] || context.Consumer._currentValue

  return hooksState[hooksIndex++]
}

export { useContext }
```

## useReducer

```js
import render from './render'

// 初始化 hooks 数组，用于存放所有 useState 的值
const hooksState = []
// 初始化 hooks 数组下标，从第一项开始对每个 useState 进行存放
let hooksIndex = 0

function useReducer(reducer, initialArg, init) {
  if (!hooksState[hooksIndex]) {
    let value = init ? init(initialArg) : initialArg
    const currentIndex = hooksIndex
    const dispatch = function (data) {
      value = reducer(value, data)
      hooksState[currentIndex] = [value, dispatch]
      hooksIndex = 0
      // 模拟组件重新渲染
      render()
    }
    hooksState[hooksIndex] = [value, dispatch]
  }

  return hooksState[hooksIndex++]
}

export { useReducer }
```

## 其他知识点

### hooks 必须在顶层使用

由于 react hooks 底层使用数组和索引在维护和查找对应的 hooks，所以必须确保每次组件重新渲染时，组件中的所有 hooks 顺序不会变。

```js
// 这样会导致组件中的 hooks 顺序发生错乱。
if (condition) {
  useEffect(() => {}, [])
}
```

官方解释 [Only Call Hooks at the Top Level](https://reactjs.org/docs/hooks-rules.html#explanation)

### 函数组件重新 render 导致组件内定义的 function 每次重新创建是否性能不佳？

函数组件不需要像 class 组件那样创建实例，绑定事件。在现代浏览器中该情况带来的性能消耗可忽略不计。可使用 useCallback/useMemo 等优化。

[Are Hooks slow because of creating functions in render?](https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render)
