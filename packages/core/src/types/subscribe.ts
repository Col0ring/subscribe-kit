import { Keys, Tuple } from '@subscribe-kit/shared'

export type SubscribeKeys<T> =
  // computed early
  T extends T
    ? {
        [Key in Keys<T>]: T[Key] extends object
          ?
              | Key
              | [Key]
              | [
                  Key,
                  ...(SubscribeKeys<T[Key]> extends infer SK
                    ? SK extends readonly unknown[]
                      ? SK
                      : [SK]
                    : never)
                ]
          : Key | [Key]
      }[Keys<T>]
    : never

export type SubscribeValue<
  T,
  Key extends SubscribeKeys<T>
> = Key extends Keys<T>
  ? T[Key]
  : Key extends readonly [infer Head, ...infer Tail]
  ? Head extends Keys<T>
    ? Tail extends SubscribeKeys<T[Head]>
      ? SubscribeValue<T[Head], Tail>
      : T[Head]
    : never
  : never

export type SubscribeValues<T, Keys extends Tuple<SubscribeKeys<T>>> = {
  [K in keyof Keys]: K extends `${number}`
    ? SubscribeValue<T, Keys[K]>
    : Keys[K]
}

export interface SubscribeOptions {
  immediate?: boolean
}

export type SubscribeCallback<V> = (newValue: V, oldValue: V) => void

export interface SubscribeListener<V> {
  callback: SubscribeCallback<V>
  notified: boolean
  // property array
  paths?: PropertyKey[][]
}

export type Subscriber = {
  listeners: Set<SubscribeListener<any>>
  children: Record<PropertyKey, Subscriber>
  notified: boolean
}
