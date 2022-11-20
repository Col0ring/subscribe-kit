# Subscribe-Kit

A subscribe toolkit.

## Packages

- [core](./packages/core)
- [react](./packages/react)

## Usage

### Basic

```js
import { Store } from '@subscribe-kit/core'

const store = new Store({
  initialValues: {
    counter: 0,
  },
})

function setupCounter(element) {
  store.observer.subscribe(
    ['counter'],
    (value, oldValue) => {
      element.innerHTML = `count is ${value}`
    },
    {
      // call the callback function immediately
      immediate: true,
    }
  )
  const setCounter = () => {
    store.setValue(['counter'], store.values.counter + 1)
    // or
    // store.setValues((draft) => {
    //   draft.counter++
    // })
  }
  element.addEventListener('click', () => {
    setCounter()
  })
}
```

### With React

```jsx
import { Store } from '@subscribe-kit/core'
import { createWatch } from '@subscribe-kit/react'
const store = new Store({
  initialValues: {
    count: 0,
  },
})
const { useWatch } = createWatch({
  store,
})

function Counter() {
  const count = useWatch('count')
  return (
    <button onClick={() => store.setValue('count', count + 1)}>
      count is {count}
    </button>
  )
}
```

## License

[MIT](./LICENSE)
