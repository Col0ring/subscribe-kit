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

// TODO
// export type ChangedPath<
//   T,
//   P extends SubscribeKeys<T>
// > = SubscribeKeys<T> extends infer K
//   ? K extends K
//     ? K extends readonly unknown[]
//       ? EnsureArray<P>[number] extends K[number]
//         ? K
//         : never
//       : never
//     : never
//   : never

export interface SubscribeCallbackOptions {
  changedPaths: PropertyKey[][]
}

export type SubscribeCallback<V> = (
  newValue: V,
  oldValue: V,
  options: SubscribeCallbackOptions
) => void

export interface SubscribeListener<V = any> {
  callback: SubscribeCallback<V>
  notified: boolean
  // property array
  paths?: PropertyKey[][]
}

export interface Subscriber {
  listeners: Set<SubscribeListener>
  children: Record<PropertyKey, Subscriber>
  notified: boolean
}

export interface ChangedSubscriber {
  subscriber: Subscriber
  value: any
  oldValue: any
  changedPaths: PropertyKey[][]
}

export interface ListenerHandler {
  listener: SubscribeListener
  value: any
  oldValue: any
  multiple: boolean
  changedPaths: PropertyKey[][]
}
