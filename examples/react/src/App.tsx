import reactLogo from './assets/react.svg'
import { createSelector, createWatch } from '@subscribe-kit/react'
import { Store } from '@subscribe-kit/core'

import './App.css'

const store = new Store({
  initialValues: {
    count: 0,
  },
})

const { useSelector } = createSelector({
  store,
})

const { useWatch } = createWatch({
  store,
})
const wait = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function App() {
  const count = useSelector((state) => state.count)
  const count2 = useWatch('count')
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
        <button
          onClick={() => {
            store.setValues((draft) => {
              return {
                ...draft,
                count: draft.count + 1,
              }
            })
            // store.setValue('count', count + 1)
          }}
        >
          count is {count}
        </button>
        <button
          onClick={() => {
            // async
            store.setValues(async (draft) => {
              await wait(1000)
              draft.count += 1
            })
          }}
        >
          count is {count2}
        </button>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
