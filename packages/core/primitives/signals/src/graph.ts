/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Required as the signals library is in a separate package, so we need to explicitly ensure the
// global `ngDevMode` type is defined.
declare const ngDevMode: boolean|undefined;


/**
 * The currently active consumer `ReactiveNode`, if running code in a reactive context.
 *
 * Change this via `setActiveConsumer`.
 */
let activeConsumer: ReactiveNode|null = null;
let inNotificationPhase = false;

type Version = number&{__brand: 'Version'};
type GraphEdgePackedNumber = number&{__brand: 'GraphEdgePackedNumber'};

/**
 * Global epoch counter. Incremented whenever a source signal is set.
 */
let epoch: Version = 1 as Version;

/**
 * Symbol used to tell `Signal`s apart from other functions.
 *
 * This can be used to auto-unwrap signals in various cases, or to auto-wrap non-signal values.
 */
export const SIGNAL = /* @__PURE__ */ Symbol('SIGNAL');

export function setActiveConsumer(consumer: ReactiveNode|null): ReactiveNode|null {
  const prev = activeConsumer;
  activeConsumer = consumer;
  return prev;
}

export function getActiveConsumer(): ReactiveNode|null {
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
  producerNode: undefined,
  producerNodeRef: undefined,
  nextProducerIndex: 0,
  liveConsumerNode: undefined,
  liveConsumerNodeRef: undefined,
  consumerAllowSignalWrites: false,
  consumerIsAlwaysLive: false,
  producerMustRecompute: () => false,
  producerRecomputeValue: () => {},
  consumerMarkedDirty: () => {},
  consumerOnSignalRead: () => {}
};

const MAX_INT_BYTES = 32;  // unsigned
const BYTES_PER_VERSION = 8;
const MAX_ARRAY_INDEX_BYTES = MAX_INT_BYTES - BYTES_PER_VERSION;
const ARRAY_INDEX_BYTE_MASK = 2 ** MAX_ARRAY_INDEX_BYTES - 1;
const VERSION_BYTE_MASK = 2 ** BYTES_PER_VERSION - 1;


function packValue(aVersion: Version, indexOfThis: number) {
  return (aVersion & VERSION_BYTE_MASK) +
      (((indexOfThis & ARRAY_INDEX_BYTE_MASK) << BYTES_PER_VERSION) >>> 0) as GraphEdgePackedNumber;
}

function updateVersion(aNumber: GraphEdgePackedNumber, aVersion: Version) {
  return packValue(aVersion, unpackIndexOfThis(aNumber));
}

function unpackVersion(aNumber: GraphEdgePackedNumber): Version {
  return (aNumber & VERSION_BYTE_MASK) as Version;
}

function updateIndexOfThis(aNumber: GraphEdgePackedNumber, anIndex: number) {
  return packValue(unpackVersion(aNumber), anIndex);
}

function unpackIndexOfThis(aNumber: number) {
  return (aNumber >> BYTES_PER_VERSION) & ARRAY_INDEX_BYTE_MASK;
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
   * Producers which are dependencies of this consumer.
   *
   * Uses the same indices as the `producerLastReadVersion` and `producerIndexOfThis` arrays.
   */
  producerNode: GraphEdgePackedNumber[]|undefined;
  producerNodeRef: ReactiveNode[]|undefined;

  /**
   * Index into the producer arrays that the next dependency of this node as a consumer will use.
   *
   * This index is zeroed before this node as a consumer begins executing. When a producer is read,
   * it gets inserted into the producers arrays at this index. There may be an existing dependency
   * in this location which may or may not match the incoming producer, depending on whether the
   * same producers were read in the same order as the last computation.
   */
  nextProducerIndex: number;

  /**
   * Array of consumers of this producer that are "live" (they require push notifications).
   *
   * `liveConsumerNode.length` is effectively our reference count for this node.
   */
  liveConsumerNode: GraphEdgePackedNumber[]|undefined;
  liveConsumerNodeRef: ReactiveNode[]|undefined;

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
}

interface ConsumerNode extends ReactiveNode {
  producerNode: NonNullable<ReactiveNode['producerNode']>;
  producerNodeRef: NonNullable<ReactiveNode['producerNodeRef']>;
}

interface ProducerNode extends ReactiveNode {
  liveConsumerNode: NonNullable<ReactiveNode['liveConsumerNode']>;
  liveConsumerNodeRef: NonNullable<ReactiveNode['liveConsumerNodeRef']>;
}

/**
 * Called by implementations when a producer's signal is read.
 */
export function producerAccessed(node: ReactiveNode): void {
  if (inNotificationPhase) {
    throw new Error(
        typeof ngDevMode !== 'undefined' && ngDevMode ?
            `Assertion error: signal read during notification phase` :
            '');
  }

  if (activeConsumer === null) {
    // Accessed outside of a reactive context, so nothing to record.
    return;
  }

  activeConsumer.consumerOnSignalRead(node);

  // This producer is the `idx`th dependency of `activeConsumer`.
  const idx = activeConsumer.nextProducerIndex++;

  assertConsumerNode(activeConsumer);

  let edgeNode = activeConsumer.producerNodeRef[idx];
  if (idx < activeConsumer.producerNode.length && edgeNode !== node) {
    // There's been a change in producers since the last execution of `activeConsumer`.
    // `edgeRef` holds a stale dependency which will be be removed and
    // replaced with `this`.
    //
    // If `activeConsumer` isn't live, then this is a no-op, since we can replace the producer in
    // `activeConsumer.producerNode` directly. However, if `activeConsumer` is live, then we need
    // to remove it from the stale producer's `liveConsumer`s.
    if (consumerIsLive(activeConsumer)) {
      producerRemoveLiveConsumer(edgeNode, activeConsumer.producerNode[idx]);

      // At this point, the only record of `staleProducer` is the reference at
      // `edgeRef` which will be overwritten below.
    }
  }

  edgeNode = activeConsumer.producerNodeRef[idx];
  if (edgeNode !== node) {
    activeConsumer.producerNodeRef[idx] = node;
    activeConsumer.producerNode[idx] = packValue(
        node.version,
        consumerIsLive(activeConsumer) ? producerAddLiveConsumer(node, activeConsumer, idx) : 0);
  } else {
    activeConsumer.producerNode[idx] =
        updateVersion(activeConsumer.producerNode[idx], node.version);
  }
}

/**
 * Increment the global epoch counter.
 *
 * Called by source producers (that is, not computeds) whenever their values change.
 */
export function producerIncrementEpoch(): void {
  epoch = ((epoch + 1) & VERSION_BYTE_MASK) as Version;
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
    node.dirty = false;
    node.lastCleanEpoch = epoch;
    return;
  }

  node.producerRecomputeValue(node);

  // After recomputing the value, we're no longer dirty.
  node.dirty = false;
  node.lastCleanEpoch = epoch;
}

/**
 * Propagate a dirty notification to live consumers of this producer.
 */
export function producerNotifyConsumers(node: ReactiveNode): void {
  if (node.liveConsumerNode === undefined) {
    return;
  }

  // Prevent signal reads when we're updating the graph
  const prev = inNotificationPhase;
  inNotificationPhase = true;
  try {
    for (let i = 0; i < node.liveConsumerNode.length; i++) {
      if (node.liveConsumerNodeRef![i].dirty) {
        continue;
      }

      consumerMarkDirty(node.liveConsumerNodeRef![i]);
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

/**
 * Prepare this consumer to run a computation in its reactive context.
 *
 * Must be called by subclasses which represent reactive computations, before those computations
 * begin.
 */
export function consumerBeforeComputation(node: ReactiveNode|null): ReactiveNode|null {
  node && (node.nextProducerIndex = 0);
  return setActiveConsumer(node);
}

/**
 * Finalize this consumer's state after a reactive computation has run.
 *
 * Must be called by subclasses which represent reactive computations, after those computations
 * have finished.
 */
export function consumerAfterComputation(
    node: ReactiveNode|null, prevConsumer: ReactiveNode|null): void {
  setActiveConsumer(prevConsumer);

  if (!node || node.producerNode === undefined || node.producerNodeRef === undefined) {
    return;
  }

  if (consumerIsLive(node)) {
    // For live consumers, we need to remove the producer -> consumer edge for any stale producers
    // which weren't dependencies after the recomputation.
    for (let i = node.nextProducerIndex; i < node.producerNode.length; i++) {
      producerRemoveLiveConsumer(node.producerNodeRef[i], node.producerNode[i]);
    }
  }

  // Truncate the producer tracking arrays.
  // Perf note: this is essentially truncating the length to `node.nextProducerIndex`, but
  // benchmarking has shown that individual pop operations are faster.
  while (node.producerNode.length > node.nextProducerIndex) {
    node.producerNode.pop();
    node.producerNodeRef.pop();
  }
}

/**
 * Determine whether this consumer has any dependencies which have changed since the last time
 * they were read.
 */
export function consumerPollProducersForChange(node: ReactiveNode): boolean {
  assertConsumerNode(node);

  // Poll producers for change.
  for (let i = 0; i < node.producerNode.length; i++) {
    const seenVersion = unpackVersion(node.producerNode[i]);

    // First check the versions. A mismatch means that the producer's value is known to have
    // changed since the last time we read it.
    if (seenVersion !== node.producerNodeRef[i].version) {
      return true;
    }

    // The producer's version is the same as the last time we read it, but it might itself be
    // stale. Force the producer to recompute its version (calculating a new value if necessary).
    producerUpdateValueVersion(node.producerNodeRef[i]);

    // Now when we do this check, `producer.version` is guaranteed to be up to date, so if the
    // versions still match then it has not changed since the last time we read it.
    if (seenVersion !== node.producerNodeRef[i].version) {
      return true;
    }
  }

  return false;
}

/**
 * Disconnect this consumer from the graph.
 */
export function consumerDestroy(node: ReactiveNode): void {
  assertConsumerNode(node);
  if (consumerIsLive(node)) {
    // Drop all connections from the graph to this node.
    for (let i = 0; i < node.producerNode.length; i++) {
      producerRemoveLiveConsumer(node.producerNodeRef[i], node.producerNode[i]);
    }
  }

  // Truncate all the arrays to drop all connection from this node to the graph.
  node.producerNode.length = node.producerNodeRef.length = 0;
  if (node.liveConsumerNode) {
    node.liveConsumerNode.length = node.liveConsumerNodeRef!.length = 0;
  }
}

/**
 * Add `consumer` as a live consumer of this node.
 *
 * Note that this operation is potentially transitive. If this node becomes live, then it becomes
 * a live consumer of all of its current producers.
 */
function producerAddLiveConsumer(
    node: ReactiveNode, consumer: ReactiveNode, indexOfThis: number): number {
  assertProducerNode(node);
  assertConsumerNode(node);
  if (node.liveConsumerNode.length === 0) {
    // When going from 0 to 1 live consumers, we become a live consumer to our producers.
    for (let i = 0; i < node.producerNode.length; i++) {
      node.producerNode[i] =
          packValue(0 as Version, producerAddLiveConsumer(node.producerNodeRef[i], node, i));
    }
  }

  node.liveConsumerNodeRef.push(consumer);
  return node.liveConsumerNode.push(packValue(0 as Version, indexOfThis)) - 1;
}

/**
 * Remove the live consumer
 */
function producerRemoveLiveConsumer(anEdgeNode: ReactiveNode, packedValue: number): void {
  assertProducerNode(anEdgeNode);
  assertConsumerNode(anEdgeNode);

  const indexOfThis = unpackIndexOfThis(packedValue);

  if (typeof ngDevMode !== 'undefined' && ngDevMode &&
      indexOfThis >= anEdgeNode.liveConsumerNode.length) {
    throw new Error(`Assertion error: active consumer index ${indexOfThis} is out of bounds of ${
        anEdgeNode.liveConsumerNode.length} consumers)`);
  }

  if (anEdgeNode.liveConsumerNode.length === 1) {
    // When removing the last live consumer, we will no longer be live. We need to remove
    // ourselves from our producers' tracking (which may cause consumer-producers to lose
    // liveness as well).
    for (let i = 0; i < anEdgeNode.producerNode.length; i++) {
      producerRemoveLiveConsumer(anEdgeNode.producerNodeRef[i], anEdgeNode.producerNode[i]);
    }
  }

  // Move the last value of `liveConsumers` into `indexOfThis`. Note that if
  // there's only a single live consumer, this is a no-op.
  const lastIdx = anEdgeNode.liveConsumerNode.length - 1;
  anEdgeNode.liveConsumerNode[indexOfThis] = anEdgeNode.liveConsumerNode[lastIdx];
  anEdgeNode.liveConsumerNodeRef[indexOfThis] = anEdgeNode.liveConsumerNodeRef[lastIdx];

  // Truncate the array.
  anEdgeNode.liveConsumerNode.length--;
  anEdgeNode.liveConsumerNodeRef.length--;

  // If the index is still valid, then we need to fix the index pointer from the producer to this
  // consumer, and update it from `lastIdx` to `idx` (accounting for the move above).
  if (indexOfThis < anEdgeNode.liveConsumerNode.length) {
    const consumerEdge = anEdgeNode.liveConsumerNodeRef[indexOfThis];
    const consumerEdgeIndexOfThis = unpackIndexOfThis(anEdgeNode.liveConsumerNode[indexOfThis]);
    assertConsumerNode(consumerEdge);
    consumerEdge.producerNode[consumerEdgeIndexOfThis] =
        updateIndexOfThis(consumerEdge.producerNode[consumerEdgeIndexOfThis], indexOfThis);
  }
}

function consumerIsLive(node: ReactiveNode): boolean {
  return node.consumerIsAlwaysLive || (node?.liveConsumerNode?.length ?? 0) > 0;
}


function assertConsumerNode(node: ReactiveNode): asserts node is ConsumerNode {
  node.producerNode ??= [];
  node.producerNodeRef ??= [];
}

function assertProducerNode(node: ReactiveNode): asserts node is ProducerNode {
  node.liveConsumerNode ??= [];
  node.liveConsumerNodeRef ??= [];
}
