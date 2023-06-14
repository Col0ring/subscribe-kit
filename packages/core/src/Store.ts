import { ensureArray, isObject, isPromise } from '@subscribe-kit/shared'
import {
  createDraft,
  enablePatches,
  finishDraft,
  Patch,
  produceWithPatches,
} from 'immer'

import { SubscribeKeys, SubscribeValue } from './types/subscribe'
import { Observer } from './Observer'

let _immerPatched = false

export interface StoreOptions<T> {
  initialValues?: T
}

export class Store<
  T extends Record<PropertyKey, any> = Record<PropertyKey, any>
> {
  private _initialValues: T
  private _values: T
  private _observer = new Observer<T>(this)

  get values(): T {
    return this._values
  }

  get observer() {
    return this._observer
  }

  constructor(options?: StoreOptions<T>) {
    const { initialValues } = options || {}
    this._initialValues = initialValues || ({} as T)
    this._values = this._initialValues
    if (!_immerPatched) {
      // immer patches
      enablePatches()
      _immerPatched = true
    }
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
        // if value is not an object, and has a path after
        if (!isObject(draftValue)) {
          draftPrevValue[p] = {}
          draftValue = draftPrevValue[p]
        }
      })
      draftValue[lastPath] = value
    })
    const oldValues = this._values
    this._values = values
    this._notify(
      changes.map(({ path }) => path),
      values,
      oldValues
    )
  }

  setValues(recipe: (draft: T) => T | void): void
  setValues(recipe: (draft: T) => Promise<T | void>): void
  setValues(recipe: (draft: T) => Promise<T | void> | T | void) {
    const oldValues = this._values
    const draft = createDraft(this._values)
    let changes: Patch[] = []
    const draftStatus = recipe(draft)
    if (isPromise<typeof draftStatus>(draftStatus)) {
      draftStatus.then((promiseResult) => {
        let values = finishDraft(draft, (patches) => {
          changes.push(...patches)
        }) as T
        if (promiseResult !== undefined) {
          values = promiseResult
          changes = [{ path: [], op: 'replace', value: promiseResult }]
        }
        this._values = values
        this._notify(
          changes.map(({ path }) => path),
          values,
          oldValues
        )
      })
    } else {
      let values = finishDraft(draft, (patches) => {
        changes.push(...patches)
      }) as T
      if (draftStatus !== undefined) {
        values = draftStatus
        changes = [{ path: [], op: 'replace', value: values }]
      }
      this._values = values
      this._notify(
        changes.map(({ path }) => path),
        values,
        oldValues
      )
    }
  }
}
