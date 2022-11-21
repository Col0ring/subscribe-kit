import { ensureArray, isFunction, Tuple } from '@subscribe-kit/shared'
import { Store } from './Store'
import type {
  ChangedSubscriber,
  ListenerHandler,
  SubscribeCallback,
  SubscribeKeys,
  SubscribeListener,
  SubscribeOptions,
  Subscriber,
  SubscribeValue,
  SubscribeValues,
} from './types/subscribe'
import { getValueAndSubscriberByPath, getValueByPath } from './utils'

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
  private _receive(changedPaths: PropertyKey[][], values: T, oldValues: T) {
    const changedSubscribers = this._getChangedSubscribers(
      changedPaths,
      values,
      oldValues
    )
    this._runSubscribers(changedSubscribers, values, oldValues)
  }

  private _runSubscribers(
    changedSubscribers: ChangedSubscriber[],
    values: T,
    oldValues: T
  ) {
    const listenerHandlers: ListenerHandler[] = []
    const handlerCache = new Map<SubscribeListener, ListenerHandler>()

    changedSubscribers.forEach(
      ({ subscriber, value, oldValue, changedPaths }) => {
        if (value !== oldValue) {
          subscriber.listeners.forEach((listener) => {
            // listener may be in other subscribers
            if (!listener.notified) {
              if (listener.paths) {
                const { callbackValues, callbackOldValues } =
                  listener.paths.reduce(
                    (prev, next) => {
                      prev.callbackValues.push(
                        getValueByPath(next, values as any)
                      )
                      prev.callbackOldValues.push(
                        getValueByPath(next, oldValues as any)
                      )
                      return prev
                    },
                    {
                      callbackValues: [] as any[],
                      callbackOldValues: [] as any[],
                    }
                  )

                const listenerHandler: ListenerHandler = {
                  value: callbackValues,
                  oldValue: callbackOldValues,
                  changedPaths,
                  multiple: true,
                  listener,
                }
                listenerHandlers.push(listenerHandler)
                handlerCache.set(listener, listenerHandler)
              } else {
                const listenerHandler: ListenerHandler = {
                  value,
                  oldValue,
                  changedPaths,
                  multiple: false,
                  listener,
                }
                listenerHandlers.push(listenerHandler)
                handlerCache.set(listener, listenerHandler)
              }
              listener.notified = true
            } else {
              const listenerHandler = handlerCache.get(listener)
              if (listenerHandler && listenerHandler.multiple) {
                listenerHandler.changedPaths.push(...changedPaths)
              }
            }
          })
        }
      }
    )
    // run callback
    listenerHandlers.forEach(({ value, oldValue, changedPaths, listener }) => {
      listener.callback(value, oldValue, { changedPaths })
    })

    // reset
    changedSubscribers.forEach(({ subscriber }) => {
      subscriber.notified = false
      subscriber.listeners.forEach((listener) => {
        listener.notified = false
      })
    })
  }

  private _getChangedSubscribers(
    changedPaths: PropertyKey[][],
    values: T,
    oldValues: T,
    _subscriber = this._subscriber
  ): ChangedSubscriber[] {
    const changedSubscribers: ChangedSubscriber[] = []
    const subscriberCache = new Map<Subscriber, ChangedSubscriber>()
    // root subscriber
    changedSubscribers.push({
      subscriber: _subscriber,
      value: values as any,
      oldValue: oldValues as any,
      changedPaths,
    })
    changedPaths.forEach((path) => {
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
          subscriber.notified = true
          const changedSubscriber: ChangedSubscriber = {
            subscriber,
            value,
            oldValue,
            changedPaths: [path],
          }
          changedSubscribers.push(changedSubscriber)
          subscriberCache.set(subscriber, changedSubscriber)
        } else {
          const changedSubscriber = subscriberCache.get(subscriber)
          if (changedSubscriber) {
            changedSubscriber.changedPaths.push(path)
          }
        }
      }
      // if change the parent path
      if (subscriber?.children) {
        const childKeys = Object.keys(subscriber.children)
        changedSubscribers.push(
          ...this._getChangedSubscribers(
            childKeys.map((p) => [p]),
            value,
            oldValue,
            subscriber
          )
        )
      }
    })
    return changedSubscribers
  }

  private _subscribeValues<K extends Tuple<SubscribeKeys<T>>>(
    keys: K,
    callback: SubscribeCallback<SubscribeValues<T, K>>,
    options?: SubscribeOptions
  ) {
    const paths = keys.map((key) => ensureArray(key) as PropertyKey[])
    const listener: SubscribeListener<SubscribeValues<T, K>> = {
      callback,
      notified: false,
      paths,
    }
    const { immediate } = options || {}
    const values: (Record<PropertyKey, any> | undefined)[] = []

    const unsubscribeListeners = paths.map((path) => {
      const { subscriber, value } = getValueAndSubscriberByPath(
        path,
        this._store.values as Record<PropertyKey, any>,
        this._subscriber
      )
      values.push(value)
      subscriber.listeners.add(listener)

      return () => {
        subscriber.listeners.delete(listener)
      }
    })
    if (immediate) {
      callback(
        values as SubscribeValues<T, K>,
        values as SubscribeValues<T, K>,
        { changedPaths: paths }
      )
    }
    return () => {
      unsubscribeListeners.forEach((unsubscribe) => unsubscribe())
    }
  }

  private _subscribeValue<K extends SubscribeKeys<T>>(
    key: K,
    callback: SubscribeCallback<SubscribeValue<T, K>>,
    options?: SubscribeOptions
  ) {
    const { immediate } = options || {}
    const listener: SubscribeListener<SubscribeValue<T, K>> = {
      callback,
      notified: false,
    }
    const path = ensureArray(key) as PropertyKey[]
    const { subscriber, value } = getValueAndSubscriberByPath(
      path,
      this._store.values as Record<PropertyKey, any>,
      this._subscriber
    )

    subscriber.listeners.add(listener)

    if (immediate) {
      callback(value as SubscribeValue<T, K>, value as SubscribeValue<T, K>, {
        changedPaths: [path],
      })
    }

    return () => {
      subscriber.listeners.delete(listener)
    }
  }

  private _subscribeRoot(
    callback: SubscribeCallback<T>,
    options?: SubscribeOptions
  ) {
    const { immediate } = options || {}
    const listener: SubscribeListener<T> = {
      callback,
      notified: false,
    }
    this._subscriber.listeners.add(listener)
    if (immediate) {
      callback(this._store.values as T, this._store.values as T, {
        changedPaths: [],
      })
    }
    return () => {
      this._subscriber.listeners.delete(listener)
    }
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
  subscribe<K extends Tuple<SubscribeKeys<T>>>(
    keys: K,
    callback: SubscribeCallback<SubscribeValues<T, K>>,
    options?: SubscribeOptions
  ): () => void
  subscribe<K extends SubscribeKeys<T> | Tuple<SubscribeKeys<T>>>(
    keyOrKeysOrCallback: K | SubscribeCallback<T>,
    callbackOrOptions?: SubscribeCallback<any> | SubscribeOptions,
    options?: SubscribeOptions
  ) {
    if (isFunction(keyOrKeysOrCallback)) {
      return this._subscribeRoot(
        keyOrKeysOrCallback,
        callbackOrOptions as SubscribeOptions
      )
    }
    const path = ensureArray(keyOrKeysOrCallback) as
      | PropertyKey[]
      | PropertyKey[][]
    const isPaths = path.some((p) => Array.isArray(p))
    if (isPaths) {
      return this._subscribeValues(
        path as Tuple<SubscribeKeys<T>>,
        callbackOrOptions as SubscribeCallback<any>,
        options
      )
    }
    // path
    return this._subscribeValue(
      path as SubscribeKeys<T>,
      callbackOrOptions as SubscribeCallback<any>,
      options
    )
  }
}
