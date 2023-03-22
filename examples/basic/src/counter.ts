import { Store } from '@subscribe-kit/core'

const store = new Store({
  initialValues: {
    counter: 0,
    foo: {
      bar: 1,
    },
  },
})

export function setupCounter(element: HTMLButtonElement) {
  store.observer.subscribe(
    ['counter', ['foo', 'bar']],
    (value, oldValue) => {
      console.log(store.values, value, oldValue)
      const [counter] = value
      element.innerHTML = `count is ${counter}`
    },
    {
      immediate: true,
    }
  )
  const setCounter = () => {
    store.setValues((draft) => {
      draft.counter++
      draft.foo.bar++
    })
    store.setValue(['counter'], store.values.counter + 1)
  }
  element.addEventListener('click', () => setCounter())
}
