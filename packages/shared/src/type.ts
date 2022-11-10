export type TupleKeys<T extends readonly unknown[]> = T extends readonly [
  any,
  ...infer Tail
]
  ? TupleKeys<Tail> | Tail['length'] | `${Tail['length']}`
  : never

export type ArrayKeys<T extends readonly unknown[]> = T extends readonly [
  any,
  ...any[]
]
  ? TupleKeys<T>
  : number

export type Keys<T> = T extends readonly unknown[]
  ? ArrayKeys<T> extends infer K
    ? K extends keyof T
      ? K
      : never
    : never
  : keyof T

export type EnsureArray<T> = T extends readonly unknown[] ? T : [T]

export type AnyFunction<P extends readonly any[] = any[], R = any> = (
  ...args: P
) => R
