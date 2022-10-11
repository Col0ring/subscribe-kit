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

export type SubscriberCallback<T> = (newValue: T, oldValue: T) => void
export type SubscriberCallbackWithSubscribeValues<T> = SubscriberCallback<
  SubscribeValue<T, SubscribeKeys<T>>
>

export type SubscribeKeys<T> =
  // computed early
  T extends T
    ? {
        // for array
        [Key in Keys<T>]: number extends Key
          ? T[Key] extends object
            ?
                | typeof Number
                | [typeof Number]
                | [
                    typeof Number,
                    ...(SubscribeKeys<T[Key]> extends readonly unknown[]
                      ? SubscribeKeys<T[Key]>
                      : [SubscribeKeys<T[Key]>])
                  ]
            : typeof Number | [typeof Number]
          : // for tuple , object and others
          T[Key] extends object
          ?
              | Key
              | [Key]
              | [
                  Key,
                  ...(SubscribeKeys<T[Key]> extends readonly unknown[]
                    ? SubscribeKeys<T[Key]>
                    : [SubscribeKeys<T[Key]>])
                ]
          : Key | [Key]
      }[Keys<T>]
    : never

export type SubscribeValue<
  T,
  Key extends SubscribeKeys<T>
> = Key extends Keys<T>
  ? T[Key]
  : Key extends typeof Number
  ? number extends Keys<T>
    ? T[number]
    : never
  : Key extends readonly [infer Head, ...infer Tail]
  ? // for array
    Head extends typeof Number
    ? number extends Keys<T>
      ? Tail extends SubscribeKeys<T[number]>
        ? SubscribeValue<T[number], Tail>
        : T[number]
      : never
    : // for tuple , object and others
    Head extends Keys<T>
    ? Tail extends SubscribeKeys<T[Head]>
      ? SubscribeValue<T[Head], Tail>
      : T[Head]
    : never
  : never
