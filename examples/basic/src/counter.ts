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
    'counter',
    (value, oldValue) => {
      console.log(value, oldValue)
      element.innerHTML = `count is ${value}`
    },
    {
      immediate: true,
    }
  )
  const setCounter = () => {
    store.setValues((draft) => {
      draft.counter++
    })
  }
  element.addEventListener('click', () => setCounter())
}
