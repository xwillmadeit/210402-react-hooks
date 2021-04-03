import React from 'react'

function TestReducer({ state, increment, decrement }) {
  return (
    <>
      Count: {state.reducerValue}
      <button onClick={decrement}>-</button>
      <button onClick={increment}>+</button>
    </>
  )
}

export default TestReducer
