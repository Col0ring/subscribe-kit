import { Store } from '@subscribe-kit/core'
import { createWatch } from '@subscribe-kit/react'
import './App.css'
import reactLogo from './assets/react.svg'
const store = new Store({
  initialValues: {
    count: 0,
  },
})

store.observer.subscribe((value, oldValue, { changedPaths }) => {
  console.log(value, oldValue, changedPaths)
})

store.observer.subscribe('count', (value, oldValue, { changedPaths }) => {
  console.log(value, oldValue, changedPaths)
})
const { useWatch } = createWatch({
  store,
})

function App() {
  const count = useWatch('count')
  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => store.setValue('count', count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
