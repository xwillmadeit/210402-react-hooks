import React from 'react'
import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useContext,
  useReducer,
} from './use'
import Context from './context'
import TestReducer from './TestReducer'

function init(initialValue) {
  return { reducerValue: initialValue }
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { reducerValue: state.reducerValue + 1 }
    case 'decrement':
      return { reducerValue: state.reducerValue - 1 }
    case 'reset':
      return init(action.payload)
    default:
      throw new Error()
  }
}

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
  const [count, setCount] = useState(0)
  const [number, setNumber] = useState(10)
  // let data = { number } // 这样写 Number 组件会重新渲染，因为 App 组件每次 render 都会生成新的 data 对象，Memo 使用的是浅比较
  let data = useMemo(() => ({ number }), [number]) // useMemo 可用于缓存对象
  // let addNumber = () => setNumber(number + 10) // 这样写 Number 组件会重新渲染，因为 App 组件每次 render 都会导致新的 addNumber 函数被创建
  let addNumber = useCallback(() => setNumber(number + 10), [number]) // useCallback 可用于缓存函数

  useEffect(() => {
    console.log('did mount')
  }, [])

  useEffect(() => {
    console.log('deps changed')
  }, [number, count])

  const inputRef = useRef(null)
  const context = useContext(Context)

  const [reducerState, dispatch] = useReducer(reducer, 100, init)

  return (
    <div className="App">
      <h1>Greet from Context：{context.greet}</h1>

      <hr />

      <h1>count component</h1>
      <h2>{count}</h2>
      <button onClick={() => setCount(count + 1)}>add + 1</button>

      <hr />

      <Number data={data} addNumber={addNumber} />

      <hr />

      <h1>test useRef</h1>
      <input ref={inputRef} type="text" />
      <button onClick={() => inputRef.current.focus()}>focus input node</button>

      <hr />

      <TestReducer
        state={reducerState}
        increment={() => dispatch({ type: 'increment' })}
        decrement={() => dispatch({ type: 'decrement' })}
      />
    </div>
  )
}

export default App
