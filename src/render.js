import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import Context from './context'

export default function render() {
  ReactDOM.render(
    <Context.Provider value={{ greet: 'hello world' }}>
      <App />
    </Context.Provider>,
    document.getElementById('root')
  )
}
