import { isDev } from './constants'
import { AnyFunction, EnsureArray } from './type'

export function ensureArray<T>(value: T): EnsureArray<T> {
  return (Array.isArray(value) ? value : [value]) as EnsureArray<T>
}

export function isPromise<T = any>(val: any): val is Promise<T> {
  return val instanceof Promise
}

export function isObject<T = Record<PropertyKey, any>>(val: any): val is T {
  return typeof val === 'object' && val !== null
}

export function isFunction<T = AnyFunction>(val: any): val is T {
  return typeof val === 'function'
}

export function warning(valid: boolean, message: string) {
  if (isDev && !valid) {
    console.warn(message)
  }
}

/**
 * assert
 */
export function invariant(cond: any, message: string): asserts cond {
  if (!cond) {
    throw new Error(message)
  }
}
