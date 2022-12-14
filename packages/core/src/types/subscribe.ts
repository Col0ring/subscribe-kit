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

export type ChangedPathsArray = PropertyKey[][][]

export type ChangedPaths = PropertyKey[][]

export interface SubscribeCallbackOptions<
  C extends ChangedPaths | ChangedPathsArray
> {
  changedPaths: C
}

export type SubscribeCallback<
  V,
  C extends ChangedPaths | ChangedPathsArray = ChangedPaths | ChangedPathsArray
> = (newValue: V, oldValue: V, options: SubscribeCallbackOptions<C>) => void

export interface SubscribeListenerHandler<V = any> {
  callback: SubscribeCallback<V, any[]>
  notified: boolean
  // property array
  paths?: PropertyKey[][]
}
export interface SubscribeListener<V = any> {
  handler: SubscribeListenerHandler<V>
  pathIndex?: number
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
  changedPaths: ChangedPaths
}

export interface ListenerHandler {
  handler: SubscribeListenerHandler
  value: any
  oldValue: any
  changedPaths: ChangedPaths | ChangedPathsArray
}
