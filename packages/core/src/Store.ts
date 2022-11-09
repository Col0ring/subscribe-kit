import { enablePatches, produceWithPatches } from 'immer'
import { Observer } from './Observer'
import { isPromise } from './utils'

// immer patches
enablePatches()

export interface StoreOptions<T> {
  initialValues?: T
}

export class Store<T> {
  private initialValues: T
  private _values: T
  observer = new Observer<T>()

  get values() {
    return this._values
  }

  constructor(options: StoreOptions<T> = {}) {
    const { initialValues } = options
    this.initialValues = initialValues || ({} as T)
    this._values = this.initialValues
  }

  private notify(values: T, oldValues: T, paths: PropertyKey[][]) {
    this.observers.forEach((observer) => {
      observer._receive(values, oldValues, paths)
    })
  }

  resetValues() {
    this._values = this.initialValues
    return this
  }

  setValues(recipe: (draft: T) => T | void): this
  setValues(recipe: (draft: T) => Promise<T | void>): this
  setValues(recipe: (draft: T) => Promise<T | void> | T | void) {
    const result = produceWithPatches(
      this._values,
      recipe as (draft: T) => T | void
    )
    if (isPromise<typeof result>(result)) {
      result.then(([values, changes]) => {
        this.notify(
          values,
          this._values,
          changes.map(({ path }) => path)
        )
        this._values = values
      })
    } else {
      const [values, changes] = result
      this.notify(
        values,
        this._values,
        changes.map(({ path }) => path)
      )
      this._values = values
    }
    return this
  }
}
