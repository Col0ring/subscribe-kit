import {
  getValueByPath,
  Store,
  SubscribeKeys,
  SubscribeValue,
  SubscribeValues,
} from '@subscribe-kit/core'
import { ensureArray, Tuple } from '@subscribe-kit/shared'
import { useSyncExternalStore } from 'react'
import { useMemoizedEqualValue } from './hooks/useMemoizedEqualValue'

export interface CreateWatchOptions<T> {
  store: Store<T>
}

export function createWatch<T = any>(options: CreateWatchOptions<T>) {
  const { store } = options
  function useWatch(): T
  function useWatch<K extends SubscribeKeys<T>>(key: K): SubscribeValue<T, K>
  function useWatch<K extends Tuple<SubscribeKeys<T>>>(
    keys: K
  ): SubscribeValues<T, K>
  function useWatch<K extends SubscribeKeys<T> | Tuple<SubscribeKeys<T>>>(
    keyOrKeys?: K
  ) {
    const memoizedKey = useMemoizedEqualValue(keyOrKeys)
    const value: any = useSyncExternalStore(
      (listener) => {
        const unsubscribe = memoizedKey
          ? store.observer.subscribe(memoizedKey as any, listener, {
              immediate: true,
            })
          : store.observer.subscribe(listener, {
              immediate: true,
            })
        return unsubscribe
      },
      () => {
        if (memoizedKey) {
          const path = ensureArray(keyOrKeys) as PropertyKey[] | PropertyKey[][]
          const isPaths = path.some((p) => Array.isArray(p))
          if (isPaths) {
            const paths = path.map((p) => ensureArray(p) as PropertyKey[])
            return paths.map((p) => getValueByPath(p, store.values))
          }
          return getValueByPath(path as PropertyKey[], store.values)
        }
        return store.values
      }
    )
    return value
  }
  return {
    useWatch,
  } as const
}
