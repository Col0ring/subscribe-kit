import { Store } from '@subscribe-kit/core'
import { createSubscribeContext } from '@subscribe-kit/react'
import './App.css'
import reactLogo from './assets/react.svg'
const subscribeStore = new Store({
  initialValues: {
    count: 0,
    inputs: [] as any[],
  },
})
const { withSubscribeProvider, useSubscribeContext, useWatch } =
  createSubscribeContext({
    store: subscribeStore,
  })

function App() {
  const { store } = useSubscribeContext()
  const count = useWatch('count')
  const inputs = useWatch(['inputs'])
  const input1 = useWatch(['inputs', 0])
  const input2 = useWatch(['inputs', 1])
  const input3 = useWatch(['inputs', 0, 0])
  const input4 = useWatch(['inputs', 1, 4])
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
      <h2>{inputs}</h2>
      <h2>{input1}</h2>
      <h2>{input2}</h2>
      <h2>{input3}</h2>
      <h2>{input4}</h2>
      <div className="card">
        <button
          onClick={() =>
            store.setValues((draft) => {
              draft.inputs = ['input1', 'input2']
            })
          }
        >
          change input
        </button>
        <button
          onClick={() =>
            store.setValues((draft) => {
              draft.inputs = [
                ['input1', 'input2'],
                ['input3', 'input3'],
              ]
            })
          }
        >
          change input2
        </button>
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

export default withSubscribeProvider(App)
