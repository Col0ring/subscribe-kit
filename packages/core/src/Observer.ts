import type {
  SubscribeKeys,
  SubscriberCallback,
  SubscriberCallbackWithSubscribeValues,
  SubscribeValue,
} from './type'
import { encodeSubscribeKey } from './utils'

export class Observer<T> {
  private initialValues: T
  private values: T
  private subscribers = new Map<
    SubscribeKeys<T>,
    Set<SubscriberCallbackWithSubscribeValues<T>>
  >()

  constructor(initialValues: T) {
    this.initialValues = initialValues
    this.values = this.initialValues
  }

  resetValues() {
    this.values = this.initialValues
    return this
  }

  setValues() {
    return this
  }

  unsubscribe<N extends SubscribeKeys<T>>(
    name: N,
    callback: SubscriberCallback<SubscribeValue<T, N>>
  ) {
    const subscriberSet = this.subscribers.get(name)
    if (subscriberSet) {
      subscriberSet.delete(callback as SubscriberCallbackWithSubscribeValues<T>)
    }
    return this
  }

  subscribe<N extends SubscribeKeys<T>>(
    name: N,
    callback: SubscriberCallback<SubscribeValue<T, N>>
  ) {
    encodeSubscribeKey(name)
    const subscriberSet = this.subscribers.get(name) || new Set()
    subscriberSet.add(callback as SubscriberCallbackWithSubscribeValues<T>)
    this.subscribers.set(name, subscriberSet)
    return this
  }
}
