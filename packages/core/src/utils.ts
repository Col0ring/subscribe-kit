import { SEPARATOR } from './constants'
import { SubscribeKeys } from './type'

export function encodeSubscribeKey<T>(key: SubscribeKeys<T>): PropertyKey {
  if (Array.isArray(key)) {
    return key.join(SEPARATOR)
  }
  return key as PropertyKey
}

export function decodeSubscribeKey(key: string) {
  return
}
