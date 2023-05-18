import {
  getValueByPath,
  Store,
  SubscribeKeys,
  SubscribeValue,
  SubscribeValues,
} from '@subscribe-kit/core'
import { ensureArray, Tuple } from '@subscribe-kit/shared'
import { useCallback, useRef } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store'
import { useMemoizedEqualValue } from './hooks/useMemoizedEqualValue'

export interface CreateWatchOptions<T extends Record<PropertyKey, any>> {
  store: Store<T>
}

export function createWatch<T extends Record<PropertyKey, any>>(
  options: CreateWatchOptions<T>
) {
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
    const pathsValueRef = useRef<any[]>([])
    const subscribe = useCallback(
      (listener: () => void) => {
        const unsubscribe = memoizedKey
          ? store.observer.subscribe(memoizedKey as any, listener, {
              immediate: true,
            })
          : store.observer.subscribe(listener, {
              immediate: true,
            })
        return unsubscribe
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [memoizedKey, store]
    )
    const getSnapshot = useCallback(() => {
      if (memoizedKey) {
        const path = ensureArray(memoizedKey) as PropertyKey[] | PropertyKey[][]
        const isPaths = path.some((p) => Array.isArray(p))
        if (isPaths) {
          const paths = path.map((p) => ensureArray(p) as PropertyKey[])
          const newValue = paths.map((p) => getValueByPath(p, store.values))
          if (
            newValue.length !== pathsValueRef.current.length ||
            newValue.some(
              (item, index) => item !== pathsValueRef.current[index]
            )
          ) {
            pathsValueRef.current = newValue
          }
          return pathsValueRef.current
        }
        return getValueByPath(path as PropertyKey[], store.values)
      }
      return store.values
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memoizedKey, store])
    const value: any = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
    return value
  }
  return {
    useWatch,
  } as const
}
