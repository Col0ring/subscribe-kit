type TupleKeys<T extends readonly unknown[]> = T extends readonly [
  any,
  ...infer Tail
]
  ? TupleKeys<Tail> | Tail['length'] | `${Tail['length']}`
  : never

type ArrayKeys<T extends readonly unknown[]> = T extends readonly [
  any,
  ...any[]
]
  ? TupleKeys<T>
  : number

type Keys<T> = T extends readonly unknown[]
  ? // unknown[] extends readonly unknown[], but readonly unknown[] not extends unknown[]
    ArrayKeys<T> extends infer K
    ? K extends keyof T
      ? K
      : never
    : never
  : keyof T

export type EnsureArray<T> = T extends readonly unknown[] ? T : [T]

export type SubscribeKeys<T, P = any> =
  // computed early
  T extends T
    ? {
        [Key in Keys<T>]: Key extends P
          ? T[Key] extends object
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
          : never
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

type ChangedPath<
  T,
  P extends SubscribeKeys<T>
> = SubscribeKeys<T> extends infer K
  ? K extends K
    ? K extends readonly unknown[]
      ? EnsureArray<P>[number] extends K[number]
        ? K
        : never
      : never
    : never
  : never

export type SubscriberCallback<T, V, P extends SubscribeKeys<T>> = (
  newValue: V,
  oldValue: V,
  options: {
    changedPath: ChangedPath<T, P>
  }
) => void
export type SubscriberCallbackWithSubscribeValues<
  T,
  K extends SubscribeKeys<T> = SubscribeKeys<T>
> = SubscriberCallback<T, SubscribeValue<T, SubscribeKeys<T>>, K>

export type SubscribeMap<T> = {
  [P in Keys<T>]: T[P] extends object
    ? SubscribeMap<T[P]>
    : {
        subscribers: Set<SubscriberCallback<T, T[P], SubscribeKeys<T, P>>>
        children: Record<PropertyKey, SubscribeMap<T[P]>>
      }
}
