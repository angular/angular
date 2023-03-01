/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WeakRef} from './weak_ref';

/**
 * Identifier for a `Producer`, which is a branded `number`.
 *
 * Note that `ProducerId` and `ConsumerId` are assigned from the same sequence, so the same `number`
 * will never be used for both.
 *
 * Branding provides additional type safety by ensuring that `ProducerId` and `ConsumerId` are
 * mutually unassignable without a cast. Since several `Map`s are keyed by these IDs, this prevents
 * `ProducerId`s from being inadvertently used to look up `Consumer`s or vice versa.
 */
export type ProducerId = number&{__producer: true};

/**
 * Identifier for a `Consumer`, which is a branded `number`.
 *
 * Note that `ProducerId` and `ConsumerId` are assigned from the same sequence, so the same `number`
 * will never be used for both.
 *
 * Branding provides additional type safety by ensuring that `ProducerId` and `ConsumerId` are
 * mutually unassignable without a cast. Since several `Map`s are keyed by these IDs, this prevents
 * `ConsumerId`s from being inadvertently used to look up `Producer`s or vice versa.
 */
export type ConsumerId = number&{__consumer: true};

/**
 * Tracks the currently active reactive context (or `null` if there is no active
 * context).
 */
let activeConsumer: Consumer|null = null;

/**
 * Counter tracking the next `ProducerId` or `ConsumerId`.
 */
let _nextReactiveId: number = 0;

/**
 * Get a new `ProducerId` or `ConsumerId`, allocated from the global sequence.
 *
 * The value returned is a type intersection of both branded types, and thus can be assigned to
 * either.
 */
export function nextReactiveId(): ProducerId&ConsumerId {
  return (_nextReactiveId++ as ProducerId & ConsumerId);
}

/**
 * Set `consumer` as the active reactive context, and return the previous `Consumer`
 * (if any) for later restoration.
 */
export function setActiveConsumer(consumer: Consumer|null): Consumer|null {
  const prevConsumer = activeConsumer;
  activeConsumer = consumer;
  return prevConsumer;
}

/**
 * A bidirectional edge in the producer-consumer dependency graph.
 */
export interface Edge {
  /**
   * Weakly held reference to the `Consumer` side of this edge.
   */
  readonly consumerRef: WeakRef<Consumer>;

  /**
   * Weakly held reference to the `Producer` side of this edge.
   */
  readonly producerRef: WeakRef<Producer>;

  /**
   * `trackingVersion` of the `Consumer` at which this dependency edge was last observed.
   *
   * If this doesn't match the `Consumer`'s current `trackingVersion`, then this dependency record
   * is stale, and needs to be cleaned up.
   */
  atTrackingVersion: number;

  /**
   * `valueVersion` of the `Producer` at the time this dependency was last accessed.
   *
   * This is used by `consumerPollValueStatus` to determine whether a `Consumer`'s dependencies have
   * semantically changed.
   */
  seenValueVersion: number;
}

/**
 * Represents a value that can be read reactively, and can notify readers (`Consumer`s)
 * when it changes.
 *
 * Producers maintain a weak reference to any `Consumer`s which may depend on the
 * producer's value.
 *
 * Implementers of `Producer` expose a monotonic `valueVersion` counter, and are responsible
 * for incrementing this version when their value semantically changes. Some Producers may
 * produce this value lazily and thus at times need to be polled for potential updates to
 * their value (and by extension their `valueVersion`). This is accomplished via the
 * `checkForChangedValue` method for Producers, which should perform whatever calculations
 * are necessary to ensure `valueVersion` is up to date.
 *
 * `Producer`s support two operations:
 *   * `producerNotifyConsumers`
 *   * `producerAccessed`
 */
export interface Producer {
  /**
   * Numeric identifier of this `Producer`.
   *
   * May also be used to satisfy the interface for `Consumer`.
   */
  readonly id: ProducerId;

  /**
   * A `WeakRef` to this `Producer` instance.
   *
   * An implementer provides this as a cached value to avoid the need to instantiate
   * multiple `WeakRef` instances for the same `Producer`.
   *
   * May also be used to satisfy the interface for `Consumer`.
   */
  readonly ref: WeakRef<Producer>;

  /**
   * A map of dependency `Edge`s to `Consumer`s, keyed by the `ConsumerId`.
   *
   * Used when the produced value changes to notify interested `Consumer`s.
   */
  readonly consumers: Map<ConsumerId, Edge>;

  /**
   * Monotonically increasing counter which increases when the value of this `Producer`
   * semantically changes.
   */
  readonly valueVersion: number;

  /**
   * Ensure that `valueVersion` is up to date for the `Producer`'s value.
   *
   * Some `Producer`s may produce values lazily, and thus require polling before their
   * `valueVersion` can be compared with the version captured during a previous read.
   */
  checkForChangedValue(): void;
}

/**
 * Notify all `Consumer`s of the given `Producer` that its value may have changed.
 */
export function producerNotifyConsumers(producer: Producer): void {
  for (const [consumerId, edge] of producer.consumers) {
    const consumer = edge.consumerRef.deref();
    if (consumer === undefined || consumer.trackingVersion !== edge.atTrackingVersion) {
      producer.consumers.delete(consumerId);
      consumer?.producers.delete(producer.id);
      continue;
    }

    consumer.notify();
  }
}

/**
 * Record a dependency on the given `Producer` by the current reactive `Consumer` if
 * one is present.
 */
export function producerAccessed(producer: Producer): void {
  if (activeConsumer === null) {
    return;
  }

  // Either create or update the dependency `Edge` in both directions.
  let edge = activeConsumer.producers.get(producer.id);
  if (edge === undefined) {
    edge = {
      consumerRef: activeConsumer.ref,
      producerRef: producer.ref,
      seenValueVersion: producer.valueVersion,
      atTrackingVersion: activeConsumer.trackingVersion,
    };
    activeConsumer.producers.set(producer.id, edge);
    producer.consumers.set(activeConsumer.id, edge);
  } else {
    edge.seenValueVersion = producer.valueVersion;
    edge.atTrackingVersion = activeConsumer.trackingVersion;
  }
}

/**
 * Checks if a `Producer` has a current value which is different than the value
 * last seen at a specific version by a `Consumer` which recorded a dependency on
 * this `Producer`.
 */
function producerPollStatus(producer: Producer, lastSeenValueVersion: number): boolean {
  // `producer.valueVersion` may be stale, but a mismatch still means that the value
  // last seen by the `Consumer` is also stale.
  if (producer.valueVersion !== lastSeenValueVersion) {
    return true;
  }

  // Trigger the `Producer` to update its `valueVersion` if necessary.
  producer.checkForChangedValue();

  // At this point, we can trust `producer.valueVersion`.
  return producer.valueVersion !== lastSeenValueVersion;
}

/**
 * Represents a reader that can depend on reactive values (`Producer`s) and receive
 * notifications when those values change.
 *
 * `Consumer`s do not wrap the reads they consume themselves, but rather can be set
 * as the active reader via `setActiveConsumer`.
 *
 * The set of dependencies of a `Consumer` is dynamic. Implementers expose a
 * monotonically increasing `trackingVersion` counter, which increments whenever
 * the `Consumer` is about to re-run any reactive reads it needs and establish a
 * new set of dependencies as a result.
 *
 * `Producer`s store the last `trackingVersion` they've seen from `Consumer`s which
 * have read them. This allows a `Producer` to identify whether its record of the
 * dependency is current or stale, by comparing the `Consumer`'s `trackingVersion`
 * to the version at which the dependency was established.
 */
export interface Consumer {
  /**
   * Numeric identifier of this `Producer`.
   *
   * May also be used to satisfy the interface for `Producer`.
   */
  readonly id: ConsumerId;

  /**
   * A `WeakRef` to this `Consumer` instance.
   *
   * An implementer provides this as a cached value to avoid the need to instantiate
   * multiple `WeakRef` instances for the same `Consumer`.
   *
   * May also be used to satisfy the interface for `Producer`.
   */
  readonly ref: WeakRef<Consumer>;

  /**
   * A map of `Edge`s to `Producer` dependencies, keyed by the `ProducerId`.
   *
   * Used to poll `Producer`s to determine if the `Consumer` has really updated
   * or not.
   */
  readonly producers: Map<ProducerId, Edge>;

  /**
   * Monotonically increasing counter representing a version of this `Consumer`'s
   * dependencies.
   */
  readonly trackingVersion: number;

  /**
   * Called when a `Producer` dependency of this `Consumer` indicates it may
   * have a new value.
   *
   * Notification alone does not mean the `Producer` has definitely produced a
   * semantically different value, only that it _may_ have changed. Before a
   * `Consumer` re-runs any computations or side effects, it should use the
   * `consumerPollValueStatus` method to poll the `Producer`s on which it depends
   * and determine if any of them have actually updated.
   */
  notify(): void;
}

/**
 * Function called to check the stale status of dependencies (producers) for a given consumer. This
 * is a verification step before refreshing a given consumer: if none of the the dependencies
 * reports a semantically new value, then the `Consumer` has not observed a real dependency change
 * (even though it may have been notified of one).
 */
export function consumerPollValueStatus(consumer: Consumer): boolean {
  for (const [producerId, edge] of consumer.producers) {
    const producer = edge.producerRef.deref();

    if (producer === undefined || edge.atTrackingVersion !== consumer.trackingVersion) {
      // This dependency edge is stale, so remove it.
      consumer.producers.delete(producerId);
      producer?.consumers.delete(consumer.id);
      continue;
    }

    if (producerPollStatus(producer, edge.seenValueVersion)) {
      // One of the dependencies reports a real value change.
      return true;
    }
  }

  // No dependency reported a real value change, so the `Consumer` has also not been
  // impacted.
  return false;
}
