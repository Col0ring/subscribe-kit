import {
  getValueByPath,
  Store,
  SubscribeCallback,
  SubscribeKeys,
  SubscribeValue,
  SubscribeValues,
} from '@subscribe-kit/core'
import { ensureArray, Tuple } from '@subscribe-kit/shared'
import { useEffect, useState } from 'react'
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
    const [value, setValue] = useState<any>(() => {
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
    })

    useEffect(() => {
      const callback: SubscribeCallback<any> = (v) => {
        setValue(v)
      }
      const unsubscribe = memoizedKey
        ? store.observer.subscribe(memoizedKey as any, callback, {
            immediate: true,
          })
        : store.observer.subscribe(callback, {
            immediate: true,
          })
      return unsubscribe
    }, [memoizedKey])
    return value
  }

  return {
    useWatch,
  } as const
}
