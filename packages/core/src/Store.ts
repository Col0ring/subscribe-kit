import { ensureArray, isObject, isPromise } from '@subscribe-kit/shared'
import { enablePatches, produceWithPatches } from 'immer'
import { Observer } from './Observer'
import { SubscribeKeys, SubscribeValue } from './types/subscribe'

// immer patches
enablePatches()

export interface StoreOptions<T> {
  initialValues?: T
}

export class Store<T = any> {
  private _initialValues: T
  private _values: T
  private _observer = new Observer<T>(this)

  get values() {
    return this._values
  }

  get observer() {
    return this._observer
  }

  constructor(options?: StoreOptions<T>) {
    const { initialValues } = options || {}
    this._initialValues = initialValues || ({} as T)
    this._values = this._initialValues
  }

  private _notify(paths: PropertyKey[][], values: T, oldValues: T) {
    const observer = this._observer as unknown as {
      _receive: Observer<T>['_receive']
    }
    observer._receive(paths, values, oldValues)
  }

  resetValues() {
    this._values = this._initialValues
  }

  setValue<K extends SubscribeKeys<T>>(key: K, value: SubscribeValue<T, K>) {
    const [values, changes] = produceWithPatches(this._values, (draft) => {
      const path = ensureArray(key) as PropertyKey[]
      const lastPath = path[path.length - 1]
      const restPath = path.slice(0, -1)
      let draftValue = draft as Record<PropertyKey, any>
      let draftPrevValue: typeof draftValue | undefined
      restPath.forEach((p) => {
        draftPrevValue = draftValue
        draftValue = draftValue[p]
        if (!isObject(draftValue)) {
          draftPrevValue[p] = {}
          draftValue = draftPrevValue[p]
        }
      })
      draftValue[lastPath] = value
    })
    this._notify(
      changes.map(({ path }) => path),
      values,
      this._values
    )
    this._values = values
  }

  setValues(recipe: (draft: T) => T | void): void
  setValues(recipe: (draft: T) => Promise<T | void>): void
  setValues(recipe: (draft: T) => Promise<T | void> | T | void) {
    const result = produceWithPatches(
      this._values,
      recipe as (draft: T) => T | void
    )
    if (isPromise<typeof result>(result)) {
      result.then(([values, changes]) => {
        this._notify(
          changes.map(({ path }) => path),
          values,
          this._values
        )
        this._values = values
      })
    } else {
      const [values, changes] = result
      this._notify(
        changes.map(({ path }) => path),
        values,
        this._values
      )
      this._values = values
    }
  }
}
