import { createSubscribeContext } from '@subscribe-kit/react'
import './App.css'
import reactLogo from './assets/react.svg'
const { withSubscribeProvider, useSubscribeContext, useWatch } =
  createSubscribeContext({
    initialValues: {
      foo: {
        a: {
          b: 0,
        },
      },
      count: 0,
    },
  })

function App() {
  const { store } = useSubscribeContext()
  const count = useWatch(['foo', 'a', 'b'])
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
          onClick={() =>
            store.setValues((draft) => {
              draft.foo.a.b++
            })
          }
        >
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
