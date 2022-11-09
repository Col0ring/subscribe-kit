import { EnsureArray, SubscribeKeys, SubscribeMap } from './type'

export function ensureArray<T>(value: T): EnsureArray<T> {
  return (Array.isArray(value) ? value : [value]) as EnsureArray<T>
}

export function isPromise<T = any>(val: any): val is Promise<T> {
  return val instanceof Promise
}

export function encodeSubscribeKey<T>(
  subscribeMap: SubscribeMap<T>,
  name: SubscribeKeys<T>
): PropertyKey {
  ensureArray(name).forEach((prop) => {
    subscribeMap[prop]
  })
  return name as PropertyKey
}

export function decodeSubscribeKey(key: PropertyKey) {
  return
}
