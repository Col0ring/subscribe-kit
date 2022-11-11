import {
  AnyFunction,
  ensureArray,
  isFunction,
  isObject,
  warning,
} from '@subscribe-kit/shared'
import { Store } from './Store'
import type {
  SubscribeCallback,
  SubscribeKeys,
  SubscribeOptions,
  Subscriber,
  SubscribeValue,
} from './types/subscribe'

export class Observer<T> {
  private _subscriber: Subscriber = {
    children: {},
    listeners: new Set(),
    notified: false,
  }

  private _store: Store<T>

  constructor(store: Store<T>) {
    this._store = store
  }

  // called by Store
  private _receive(paths: PropertyKey[][], values: T, oldValues: T) {
    const notifyQueue = this._getNotifyQueue(paths, values, oldValues)
    notifyQueue.forEach((fn) => fn())
  }

  // called by Store
  private _getNotifyQueue(
    paths: PropertyKey[][],
    values: T,
    oldValues: T,
    _subscriber = this._subscriber
  ) {
    const notifyQueue: AnyFunction[] = []
    paths.forEach((path) => {
      let value = values as any
      let oldValue = oldValues as any
      let subscriber = _subscriber as Subscriber | undefined
      for (const p of path) {
        subscriber = subscriber?.children[p]
        if (!subscriber) {
          return
        }
        value = value?.[p]
        oldValue = oldValue?.[p]
        if (!subscriber.notified) {
          const prevSubscriber = subscriber
          subscriber.notified = true
          notifyQueue.push(() => {
            prevSubscriber.notified = false
            if (value !== oldValue) {
              prevSubscriber.listeners.forEach((cb) => cb(value, oldValue))
            }
          })
        }
      }
      // if change the parent path
      if (subscriber?.children) {
        const childKeys = Object.keys(subscriber.children)
        notifyQueue.push(
          ...this._getNotifyQueue(
            childKeys.map((p) => [p]),
            value,
            oldValue,
            subscriber
          )
        )
      }
    })
    return notifyQueue
  }
  subscribe(
    callback: SubscribeCallback<T>,
    options?: SubscribeOptions
  ): () => void
  subscribe<K extends SubscribeKeys<T>>(
    key: K,
    callback: SubscribeCallback<SubscribeValue<T, K>>,
    options?: SubscribeOptions
  ): () => void
  subscribe<K extends SubscribeKeys<T>>(
    keyOrCallback: K | SubscribeCallback<T>,
    callbackOrOptions?:
      | SubscribeCallback<SubscribeValue<T, K>>
      | SubscribeOptions,
    options?: SubscribeOptions
  ) {
    let subscriber = this._subscriber
    let value = this._store.values as Record<PropertyKey, any> | undefined
    if (isFunction(keyOrCallback)) {
      const callback = keyOrCallback
      const { immediate } = (callbackOrOptions as SubscribeOptions) || {}
      subscriber.listeners.add(callback)
      if (immediate) {
        callback(value, value)
      }
      return () => {
        subscriber.listeners.delete(callback)
      }
    } else {
      const { immediate } = options || {}
      const key = keyOrCallback
      const callback = callbackOrOptions as SubscribeCallback<
        SubscribeValue<T, K>
      >

      const path = ensureArray(key) as PropertyKey[]
      let invalidValue = false
      path.forEach((p) => {
        subscriber.children = subscriber.children || {}
        subscriber.children[p] =
          subscriber.children[p] ||
          ({
            listeners: new Set(),
            children: {},
            notified: false,
          } as Subscriber)
        subscriber = subscriber.children[p]
        if (isObject(value)) {
          value = value[p]
        } else {
          value = undefined
          invalidValue = true
        }
      })
      subscriber.listeners.add(callback)

      warning(
        !invalidValue,
        `The property path value: [${path.toString()}] is invalid`
      )

      if (immediate) {
        callback(value as SubscribeValue<T, K>, value as SubscribeValue<T, K>)
      }

      return () => {
        subscriber.listeners.delete(callback)
      }
    }
  }
}
