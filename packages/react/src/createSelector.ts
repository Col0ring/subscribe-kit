import { useCallback } from 'react'
import { Store } from '@subscribe-kit/core'
import { identity } from '@subscribe-kit/shared'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'

export interface CreateSelectorOptions<T extends Record<PropertyKey, any>> {
  store: Store<T>
}

export function createSelector<T extends Record<PropertyKey, any>>(
  options: CreateSelectorOptions<T>
) {
  const { store } = options
  function useSelector(): T
  function useSelector<R>(
    selector: (values: T) => R,
    isEqual?: (a: R, b: R) => boolean
  ): R
  function useSelector<R>(
    selector: (values: T) => R = identity,
    isEqual?: (a: R, b: R) => boolean
  ): T | R {
    const subscribe = useCallback(
      (listener: () => void) => {
        const unsubscribe = store.observer.subscribe(listener)
        return unsubscribe
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [store]
    )

    const getSnapshot = useCallback(() => {
      return store.values
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store])

    return useSyncExternalStoreWithSelector(
      subscribe,
      getSnapshot,
      getSnapshot,
      selector,
      isEqual
    )
  }

  return {
    useSelector,
  } as const
}
