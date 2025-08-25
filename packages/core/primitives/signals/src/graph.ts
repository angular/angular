/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Required as the signals library is in a separate package, so we need to explicitly ensure the
// global `ngDevMode` type is defined.
declare const ngDevMode: boolean | undefined;

/**
 * The currently active consumer `ReactiveNode`, if running code in a reactive context.
 *
 * Change this via `setActiveConsumer`.
 */
let activeConsumer: ReactiveNode | null = null;
let inNotificationPhase = false;

type Version = number & {__brand: 'Version'};

/**
 * Global epoch counter. Incremented whenever a source signal is set.
 */
let epoch: Version = 1 as Version;

export type ReactiveHookFn = (node: ReactiveNode) => void;

/**
 * If set, called after a producer `ReactiveNode` is created.
 */
let postProducerCreatedFn: ReactiveHookFn | null = null;

/**
 * Symbol used to tell `Signal`s apart from other functions.
 *
 * This can be used to auto-unwrap signals in various cases, or to auto-wrap non-signal values.
 */
export const SIGNAL: unique symbol = /* @__PURE__ */ Symbol('SIGNAL');

export function setActiveConsumer(consumer: ReactiveNode | null): ReactiveNode | null {
  const prev = activeConsumer;
  activeConsumer = consumer;
  return prev;
}

export function getActiveConsumer(): ReactiveNode | null {
  return activeConsumer;
}

export function isInNotificationPhase(): boolean {
  return inNotificationPhase;
}

export interface Reactive {
  [SIGNAL]: ReactiveNode;
}

export function isReactive(value: unknown): value is Reactive {
  return (value as Partial<Reactive>)[SIGNAL] !== undefined;
}

export const REACTIVE_NODE: ReactiveNode = {
  version: 0 as Version,
  lastCleanEpoch: 0 as Version,
  dirty: false,
  producers: undefined,
  producersTail: undefined,
  consumers: undefined,
  consumersTail: undefined,
  recomputing: false,
  consumerAllowSignalWrites: false,
  consumerIsAlwaysLive: false,
  kind: 'unknown',
  producerMustRecompute: () => false,
  producerRecomputeValue: () => {},
  consumerMarkedDirty: () => {},
  consumerOnSignalRead: () => {},
};

interface ReactiveLink {
  producer: ReactiveNode;
  consumer: ReactiveNode;
  lastReadVersion: number;
  prevConsumer: ReactiveLink | undefined;
  nextConsumer: ReactiveLink | undefined;
  nextProducer: ReactiveLink | undefined;
}

/**
 * A producer and/or consumer which participates in the reactive graph.
 *
 * Producer `ReactiveNode`s which are accessed when a consumer `ReactiveNode` is the
 * `activeConsumer` are tracked as dependencies of that consumer.
 *
 * Certain consumers are also tracked as "live" consumers and create edges in the other direction,
 * from producer to consumer. These edges are used to propagate change notifications when a
 * producer's value is updated.
 *
 * A `ReactiveNode` may be both a producer and consumer.
 */
export interface ReactiveNode {
  /**
   * Version of the value that this node produces.
   *
   * This is incremented whenever a new value is produced by this node which is not equal to the
   * previous value (by whatever definition of equality is in use).
   */
  version: Version;

  /**
   * Epoch at which this node is verified to be clean.
   *
   * This allows skipping of some polling operations in the case where no signals have been set
   * since this node was last read.
   */
  lastCleanEpoch: Version;

  /**
   * Whether this node (in its consumer capacity) is dirty.
   *
   * Only live consumers become dirty, when receiving a change notification from a dependency
   * producer.
   */
  dirty: boolean;

  /**
   * Whether this node is currently rebuilding its producer list.
   */
  recomputing: boolean;

  /**
   * Producers which are dependencies of this consumer.
   */
  producers: ReactiveLink | undefined;

  /**
   * Points to the last linked list node in the `producers` linked list.
   *
   * When this node is recomputing, this is used to track the producers that we have accessed so far.
   */
  producersTail: ReactiveLink | undefined;

  /**
   * Linked list of consumers of this producer that are "live" (they require push notifications).
   *
   * The length of this list is effectively our reference count for this node.
   */
  consumers: ReactiveLink | undefined;
  consumersTail: ReactiveLink | undefined;

  /**
   * Whether writes to signals are allowed when this consumer is the `activeConsumer`.
   *
   * This is used to enforce guardrails such as preventing writes to writable signals in the
   * computation function of computed signals, which is supposed to be pure.
   */
  consumerAllowSignalWrites: boolean;

  readonly consumerIsAlwaysLive: boolean;

  /**
   * Tracks whether producers need to recompute their value independently of the reactive graph (for
   * example, if no initial value has been computed).
   */
  producerMustRecompute(node: unknown): boolean;
  producerRecomputeValue(node: unknown): void;
  consumerMarkedDirty(node: unknown): void;

  /**
   * Called when a signal is read within this consumer.
   */
  consumerOnSignalRead(node: unknown): void;

  /**
   * A debug name for the reactive node. Used in Angular DevTools to identify the node.
   */
  debugName?: string;

  /**
   * Kind of node. Example: 'signal', 'computed', 'input', 'effect'.
   *
   * ReactiveNode has this as 'unknown' by default, but derived node types should override this to
   * make available the kind of signal that particular instance of a ReactiveNode represents.
   *
   * Used in Angular DevTools to identify the kind of signal.
   */
  kind: string;
}

/**
 * Called by implementations when a producer's signal is read.
 */
export function producerAccessed(node: ReactiveNode): void {
  if (inNotificationPhase) {
    throw new Error(
      typeof ngDevMode !== 'undefined' && ngDevMode
        ? `Assertion error: signal read during notification phase`
        : '',
    );
  }

  if (activeConsumer === null) {
    // Accessed outside of a reactive context, so nothing to record.
    return;
  }

  activeConsumer.consumerOnSignalRead(node);

  const prevProducerLink = activeConsumer.producersTail;

  // If the last producer we accessed is the same as the current one, we can skip adding a new
  // link
  if (prevProducerLink !== undefined && prevProducerLink.producer === node) {
    return;
  }

  let nextProducerLink: ReactiveLink | undefined = undefined;
  const isRecomputing = activeConsumer.recomputing;
  if (isRecomputing) {
    // If we're incrementally rebuilding the producers list, we want to check if the next producer
    // in the list is the same as the one we're trying to add.

    // If the previous producer is defined, then the next producer is just the one that follows it.
    // Otherwise, we should check the head of the producers list (the first node that we accessed the last time this consumer was run).
    nextProducerLink =
      prevProducerLink !== undefined ? prevProducerLink.nextProducer : activeConsumer.producers;
    if (nextProducerLink !== undefined && nextProducerLink.producer === node) {
      // If the next producer is the same as the one we're trying to add, we can just update the
      // last read version, update the tail of the producers list of this rerun, and return.
      activeConsumer.producersTail = nextProducerLink;
      nextProducerLink.lastReadVersion = node.version;
      return;
    }
  }

  const prevConsumerLink = node.consumersTail;

  // If the producer we're accessing already has a link to this consumer, we can skip adding a new
  // link. This can short circuit the creation of a new link in the case where the consumer reads alternating ReeactiveNodes
  if (
    prevConsumerLink !== undefined &&
    prevConsumerLink.consumer === activeConsumer &&
    // However, we have to make sure that the link we've discovered isn't from a node that is incrementally rebuilding its producer list
    (!isRecomputing || isValidLink(prevConsumerLink, activeConsumer))
  ) {
    // If we found an existing link to the consumer we can just return.
    return;
  }

  // If we got here, it means that we need to create a new link between the producer and the consumer.
  const isLive = consumerIsLive(activeConsumer);
  const newLink = {
    producer: node,
    consumer: activeConsumer,
    // instead of eagerly destroying the previous link, we delay until we've finished recomputing
    // the producers list, so that we can destroy all of the old links at once.
    nextProducer: nextProducerLink,
    prevConsumer: prevConsumerLink,
    lastReadVersion: node.version,
    nextConsumer: undefined,
  };
  activeConsumer.producersTail = newLink;
  if (prevProducerLink !== undefined) {
    prevProducerLink.nextProducer = newLink;
  } else {
    activeConsumer.producers = newLink;
  }

  if (isLive) {
    producerAddLiveConsumer(node, newLink);
  }
}

/**
 * Increment the global epoch counter.
 *
 * Called by source producers (that is, not computeds) whenever their values change.
 */
export function producerIncrementEpoch(): void {
  epoch++;
}

/**
 * Ensure this producer's `version` is up-to-date.
 */
export function producerUpdateValueVersion(node: ReactiveNode): void {
  if (consumerIsLive(node) && !node.dirty) {
    // A live consumer will be marked dirty by producers, so a clean state means that its version
    // is guaranteed to be up-to-date.
    return;
  }

  if (!node.dirty && node.lastCleanEpoch === epoch) {
    // Even non-live consumers can skip polling if they previously found themselves to be clean at
    // the current epoch, since their dependencies could not possibly have changed (such a change
    // would've increased the epoch).
    return;
  }

  if (!node.producerMustRecompute(node) && !consumerPollProducersForChange(node)) {
    // None of our producers report a change since the last time they were read, so no
    // recomputation of our value is necessary, and we can consider ourselves clean.
    producerMarkClean(node);
    return;
  }

  node.producerRecomputeValue(node);

  // After recomputing the value, we're no longer dirty.
  producerMarkClean(node);
}

/**
 * Propagate a dirty notification to live consumers of this producer.
 */
export function producerNotifyConsumers(node: ReactiveNode): void {
  if (node.consumers === undefined) {
    return;
  }

  // Prevent signal reads when we're updating the graph
  const prev = inNotificationPhase;
  inNotificationPhase = true;
  try {
    for (
      let link: ReactiveLink | undefined = node.consumers;
      link !== undefined;
      link = link.nextConsumer
    ) {
      const consumer = link.consumer;
      if (!consumer.dirty) {
        consumerMarkDirty(consumer);
      }
    }
  } finally {
    inNotificationPhase = prev;
  }
}

/**
 * Whether this `ReactiveNode` in its producer capacity is currently allowed to initiate updates,
 * based on the current consumer context.
 */
export function producerUpdatesAllowed(): boolean {
  return activeConsumer?.consumerAllowSignalWrites !== false;
}

export function consumerMarkDirty(node: ReactiveNode): void {
  node.dirty = true;
  producerNotifyConsumers(node);
  node.consumerMarkedDirty?.(node);
}

export function producerMarkClean(node: ReactiveNode): void {
  node.dirty = false;
  node.lastCleanEpoch = epoch;
}

/**
 * Prepare this consumer to run a computation in its reactive context and set
 * it as the active consumer.
 *
 * Must be called by subclasses which represent reactive computations, before those computations
 * begin.
 */
export function consumerBeforeComputation(node: ReactiveNode | null): ReactiveNode | null {
  if (node) resetConsumerBeforeComputation(node);

  return setActiveConsumer(node);
}

/**
 * Prepare this consumer to run a computation in its reactive context.
 *
 * We expose this mainly for code where we manually batch effects into a single
 * consumer. In those cases we may wish to "reopen" a consumer multiple times
 * in initial render before finalizing it. Most code should just call
 * `consumerBeforeComputation` instead of calling this directly.
 */
export function resetConsumerBeforeComputation(node: ReactiveNode): void {
  node.producersTail = undefined;
  node.recomputing = true;
}

/**
 * Finalize this consumer's state and set previous consumer as the active consumer after a
 * reactive computation has run.
 *
 * Must be called by subclasses which represent reactive computations, after those computations
 * have finished.
 */
export function consumerAfterComputation(
  node: ReactiveNode | null,
  prevConsumer: ReactiveNode | null,
): void {
  setActiveConsumer(prevConsumer);

  if (node) finalizeConsumerAfterComputation(node);
}

/**
 * Finalize this consumer's state after a reactive computation has run.
 *
 * We expose this mainly for code where we manually batch effects into a single
 * consumer. In those cases we may wish to "reopen" a consumer multiple times
 * in initial render before finalizing it. Most code should just call
 * `consumerAfterComputation` instead of calling this directly.
 */
export function finalizeConsumerAfterComputation(node: ReactiveNode): void {
  node.recomputing = false;

  // We've finished incrementally rebuilding the producers list, now if there are any producers
  // that are after producersTail, they are stale and should be removed.
  const producersTail = node.producersTail as ReactiveLink | undefined;
  let toRemove = producersTail !== undefined ? producersTail.nextProducer : node.producers;
  if (toRemove !== undefined) {
    if (consumerIsLive(node)) {
      // For each stale link, we first unlink it from the producers list of consumers
      do {
        toRemove = producerRemoveLiveConsumerLink(toRemove);
      } while (toRemove !== undefined);
    }

    // Now, we can truncate the producers list to remove all stale links.
    if (producersTail !== undefined) {
      producersTail.nextProducer = undefined;
    } else {
      node.producers = undefined;
    }
  }
}

/**
 * Determine whether this consumer has any dependencies which have changed since the last time
 * they were read.
 */
export function consumerPollProducersForChange(node: ReactiveNode): boolean {
  // Poll producers for change.
  for (let link = node.producers; link !== undefined; link = link.nextProducer) {
    const producer = link.producer;
    const seenVersion = link.lastReadVersion;

    // First check the versions. A mismatch means that the producer's value is known to have
    // changed since the last time we read it.
    if (seenVersion !== producer.version) {
      return true;
    }

    // The producer's version is the same as the last time we read it, but it might itself be
    // stale. Force the producer to recompute its version (calculating a new value if necessary).
    producerUpdateValueVersion(producer);

    // Now when we do this check, `producer.version` is guaranteed to be up to date, so if the
    // versions still match then it has not changed since the last time we read it.
    if (seenVersion !== producer.version) {
      return true;
    }
  }

  return false;
}

/**
 * Disconnect this consumer from the graph.
 */
export function consumerDestroy(node: ReactiveNode): void {
  if (consumerIsLive(node)) {
    // Drop all connections from the graph to this node.
    let link = node.producers;
    while (link !== undefined) {
      link = producerRemoveLiveConsumerLink(link);
    }
  }

  // Truncate all the linked lists to drop all connection from this node to the graph.
  node.producers = undefined;
  node.producersTail = undefined;
  node.consumers = undefined;
  node.consumersTail = undefined;
}

/**
 * Add `consumer` as a live consumer of this node.
 *
 * Note that this operation is potentially transitive. If this node becomes live, then it becomes
 * a live consumer of all of its current producers.
 */
function producerAddLiveConsumer(node: ReactiveNode, link: ReactiveLink): void {
  const consumersTail = node.consumersTail;
  const wasLive = consumerIsLive(node);
  if (consumersTail !== undefined) {
    link.nextConsumer = consumersTail.nextConsumer;
    consumersTail.nextConsumer = link;
  } else {
    link.nextConsumer = undefined;
    node.consumers = link;
  }
  link.prevConsumer = consumersTail;
  node.consumersTail = link;
  if (!wasLive) {
    for (
      let link: ReactiveLink | undefined = node.producers;
      link !== undefined;
      link = link.nextProducer
    ) {
      producerAddLiveConsumer(link.producer, link);
    }
  }
}

function producerRemoveLiveConsumerLink(link: ReactiveLink): ReactiveLink | undefined {
  const producer = link.producer;
  const nextProducer = link.nextProducer;
  const nextConsumer = link.nextConsumer;
  const prevConsumer = link.prevConsumer;
  link.nextConsumer = undefined;
  link.prevConsumer = undefined;
  if (nextConsumer !== undefined) {
    nextConsumer.prevConsumer = prevConsumer;
  } else {
    producer.consumersTail = prevConsumer;
  }
  if (prevConsumer !== undefined) {
    prevConsumer.nextConsumer = nextConsumer;
  } else {
    producer.consumers = nextConsumer;
    if (!consumerIsLive(producer)) {
      let producerLink = producer.producers;
      while (producerLink !== undefined) {
        producerLink = producerRemoveLiveConsumerLink(producerLink);
      }
    }
  }
  return nextProducer;
}

function consumerIsLive(node: ReactiveNode): boolean {
  return node.consumerIsAlwaysLive || node.consumers !== undefined;
}

export function runPostProducerCreatedFn(node: ReactiveNode): void {
  postProducerCreatedFn?.(node);
}

export function setPostProducerCreatedFn(fn: ReactiveHookFn | null): ReactiveHookFn | null {
  const prev = postProducerCreatedFn;
  postProducerCreatedFn = fn;
  return prev;
}

// While a ReactiveNode is recomputing, it may not have destroyed previous links
// This allows us to check if a given link will be destroyed by a reactivenode if it were to finish running immediately without accesing any more producers
function isValidLink(checkLink: ReactiveLink, consumer: ReactiveNode): boolean {
  const producersTail = consumer.producersTail;
  if (producersTail !== undefined) {
    let link = consumer.producers!;
    do {
      if (link === checkLink) {
        return true;
      }
      if (link === producersTail) {
        break;
      }
      link = link.nextProducer!;
    } while (link !== undefined);
  }
  return false;
}
