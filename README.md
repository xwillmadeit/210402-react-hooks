# react hooks 原理

## 开发

```
yarn
yarn start
```

## useState

[src/useState.js](https://github.com/xwillmadeit/210402-react-hooks/blob/master/src/useState.js)

```js
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
```

相关资料：[Getting Closure on React Hooks](https://www.youtube.com/watch?v=KJP1E-Y-xyo)

## useMemo/useCallback

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
