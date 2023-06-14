import { Subscriber } from './types'

/**
 * @param path
 * @param values
 * @returns
 */
export function getValueByPath(
  path: PropertyKey[],
  values: Record<PropertyKey, any>
) {
  let value: typeof values | undefined = values
  for (const p of path) {
    value = value?.[p]
    if (!value) {
      return value
    }
  }
  return value
}

/**
 * Get value (init if subscriber not exist) and subscriber
 * @param path
 * @param values
 * @param _subscriber
 * @returns
 */
export function getValueAndSubscriberByPath(
  path: PropertyKey[],
  values: Record<PropertyKey, any>,
  _subscriber: Subscriber
) {
  let subscriber = _subscriber
  let value: typeof values | undefined = values
  path.forEach((p) => {
    subscriber.children = subscriber.children || {}
    subscriber.children[p] =
      subscriber.children[p] ||
      ({
        listeners: new Set(),
        children: {},
        notified: false,
      } as Subscriber)
    subscriber = subscriber.children[p]
    value = value?.[p]
  })
  return {
    value,
    subscriber,
  }
}
