import {
  Store,
  StoreOptions,
  SubscribeCallback,
  SubscribeKeys,
  SubscribeValue,
} from '@subscribe-kit/core'
import { ensureArray } from '@subscribe-kit/shared'
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useMemoizedEqualValue } from './hooks/useMemoizedEqualValue'

export interface SubscribeProviderProps {
  children: React.ReactNode
}
export interface SubscribeContextOptions<T> {
  store: Store<T>
}
export interface SubscribeContextValue<T> extends SubscribeContextOptions<T> {}

export function createSubscribeContext<T = any>(
  options: SubscribeContextOptions<T>
) {
  const SubscribeContext = createContext<SubscribeContextValue<T> | null>(null)
  const SubscribeProvider: React.FC<SubscribeProviderProps> = ({
    children,
  }) => {
    const ctx: SubscribeContextValue<T> = useMemo(() => {
      return {
        store: options.store,
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
      <SubscribeContext.Provider value={ctx}>
        {children}
      </SubscribeContext.Provider>
    )
  }
  function useSubscribeContext() {
    const ctx = useContext(SubscribeContext)
    if (!ctx) {
      throw Error('useSubscribeContext must be used inside a  SubscribeContext')
    }
    return ctx
  }

  function withSubscribeProvider<P>(
    Component: React.ComponentType<P>,
    providerProps?: StoreOptions<T>
  ) {
    const WrappedComponent: React.FC<P> = (props) => {
      return (
        <SubscribeProvider {...providerProps}>
          <Component {...(props as P & JSX.IntrinsicAttributes)} />
        </SubscribeProvider>
      )
    }
    return WrappedComponent
  }

  function useWatch(): T
  function useWatch<K extends SubscribeKeys<T>>(key: K): SubscribeValue<T, K>
  function useWatch<K extends SubscribeKeys<T>>(key?: K) {
    const { store } = useSubscribeContext()
    const memoizedKey = useMemoizedEqualValue(key)
    const [value, setValue] = useState<T | SubscribeValue<T, K> | undefined>(
      () => {
        if (memoizedKey) {
          const path = ensureArray(key) as PropertyKey[]
          let initialValue = store.values as Record<PropertyKey, any>
          for (const p of path) {
            if (!initialValue) {
              return
            }
            initialValue = initialValue[p]
          }
          return initialValue
        }
        return store.values
      }
    )

    useEffect(() => {
      const callback: SubscribeCallback<T | SubscribeValue<T, K>> = (v) => {
        setValue(v)
      }
      const unsubscribe = memoizedKey
        ? store.observer.subscribe(memoizedKey, callback, {
            immediate: true,
          })
        : store.observer.subscribe(callback, {
            immediate: true,
          })
      return unsubscribe
    }, [store, memoizedKey])

    return value
  }

  return {
    SubscribeContext,
    SubscribeProvider,
    useSubscribeContext,
    useWatch,
    withSubscribeProvider,
  } as const
}
