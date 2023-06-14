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

### React

#### createWatch

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

#### createSelector

```jsx
import { Store } from '@subscribe-kit/core'
import { createSelector } from '@subscribe-kit/react'
const store = new Store({
  initialValues: {
    count: 0,
  },
})
const { useSelector } = createSelector({
  store,
})

function Counter() {
  const count = useSelector((state) => state.count)
  return (
    <button onClick={() => store.setValue('count', count + 1)}>
      count is {count}
    </button>
  )
}
```

## Types

### @subscribe-kit/core

#### Store

```ts
declare class Store<T = any> {
  get values(): ReadonlyDeep<T>
  get observer(): Observer<T>
  constructor(options?: StoreOptions<T>)
  resetValues(): void
  setValue<K extends SubscribeKeys<T>>(
    key: K,
    value: SubscribeValue<T, K>
  ): void
  setValues(recipe: (draft: T) => T | void): void
  setValues(recipe: (draft: T) => Promise<T | void>): void
}
```

#### Observer

```ts
declare class Observer<T> {
  constructor(store: Store<T>)
  subscribe(
    callback: SubscribeCallback<T>,
    options?: SubscribeOptions
  ): () => void
  subscribe<K extends SubscribeKeys<T>>(
    key: K,
    callback: SubscribeCallback<SubscribeValue<T, K>>,
    options?: SubscribeOptions
  ): () => void
  subscribe<K extends Tuple<SubscribeKeys<T>>>(
    keys: K,
    callback: SubscribeCallback<SubscribeValues<T, K>>,
    options?: SubscribeOptions
  ): () => void
}
```

### @subscribe-kit/react

#### createWatch

```ts
interface CreateWatchOptions<T> {
  store: Store<T>
}

declare function createWatch<T = any>(
  options: CreateWatchOptions<T>
): {
  readonly useWatch: {
    (): T
    <K extends SubscribeKeys<T>>(key: K): SubscribeValue<T, K>
    <K_1 extends Tuple<SubscribeKeys<T>, SubscribeKeys<T>>>(
      keys: K_1
    ): SubscribeValues<T, K_1>
  }
}
```

#### createSelector

```ts
interface CreateSelectorOptions<T extends Record<PropertyKey, any>> {
  store: Store<T>
}
declare function createSelector<T extends Record<PropertyKey, any>>(
  options: CreateSelectorOptions<T>
): {
  readonly useSelector: {
    (): T
    <R>(
      selector: (values: T) => R,
      isEqual?: ((a: R, b: R) => boolean) | undefined
    ): R
  }
}
```

## License

[MIT](./LICENSE)
