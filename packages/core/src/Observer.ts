import type { DeepGet, DeepKeys } from 'types-kit'
import type { SubscriberCallback } from './type'

export class Observer<T> {
  // TODO: ts performance
  private subscribers = new Map<DeepKeys<T>, Set<SubscriberCallback<any>>>()
  subscribe<N extends DeepKeys<T>>(
    name: N,
    callback: SubscriberCallback<DeepGet<T, N>>
  ) {
    const subscriberSet = this.subscribers.get(name) || new Set()
    subscriberSet.add(callback)
    this.subscribers.set(name, subscriberSet)
    return () => {
      subscriberSet.delete(callback)
    }
  }
}
