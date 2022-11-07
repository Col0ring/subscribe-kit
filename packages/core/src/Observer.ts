import type {
  SubscribeKeys,
  SubscribeMap,
  SubscriberCallback,
  SubscriberCallbackWithSubscribeValues,
  SubscribeValue,
} from './type'
import { encodeSubscribeKey } from './utils'

export class Observer<T> {
  private initialValues: T
  private values: T
  private subscriberMap = {} as SubscribeMap<T>

  constructor(initialValues: T) {
    this.initialValues = initialValues
    this.values = this.initialValues
  }

  private notify() {}

  resetValues() {
    this.values = this.initialValues
    return this
  }

  setValues<N extends SubscribeKeys<T>>() {
    return this
  }

  unsubscribe<N extends SubscribeKeys<T>>(
    name: N,
    callback: SubscriberCallback<T, SubscribeValue<T, N>, N>
  ) {
    const subscriberSet = this.subscriberMap[name]
    if (subscriberSet) {
      subscriberSet.delete(callback as SubscriberCallbackWithSubscribeValues<T>)
    }
    return this
  }

  subscribe<N extends SubscribeKeys<T>>(
    name: N,
    callback: SubscriberCallback<T, SubscribeValue<T, N>, N>
  ) {
    encodeSubscribeKey<T>(this.subscriberMap, name)
    const subscriberSet = this.subscribers.get(name) || new Set()
    subscriberSet.add(callback as SubscriberCallbackWithSubscribeValues<T>)
    this.subscribers.set(name, subscriberSet)
    return this
  }
}
