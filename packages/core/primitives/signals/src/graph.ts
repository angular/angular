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
  nextProducerIndex: 0,
  liveConsumerNode: undefined,
  consumerAllowSignalWrites: false,
  consumerIsAlwaysLive: false,
  producerMustRecompute: () => false,
  producerRecomputeValue: () => {},
  consumerMarkedDirty: () => {},
  consumerOnSignalRead: () => {}
};

export const GRAPH_EDGE_NODE = 0;
export const GRAPH_EDGE_VERSION = 1;
export const GRAPH_EDGE_INDEX_OF_THIS = 2;

/**
 * Represents an edge of the graph.
 */
export interface GraphEdge extends Array<any> {
  /**
   * The node related to.
   */
  [GRAPH_EDGE_NODE]: ReactiveNode;

  /**
   * The version of the edge.
   */
  [GRAPH_EDGE_VERSION]: Version|undefined;

  /**
   * index of the owner of this array in the relation target node.
   */
  [GRAPH_EDGE_INDEX_OF_THIS]: number;
}

function createGraphEdge(
    node: ReactiveNode, version: Version|undefined, indexOfThis: number): GraphEdge {
  return [node, version, indexOfThis];
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
  producerNode: GraphEdge[]|undefined;

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
  liveConsumerNode: GraphEdge[]|undefined;

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
}

interface ProducerNode extends ReactiveNode {
  liveConsumerNode: NonNullable<ReactiveNode['liveConsumerNode']>;
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

  if (idx < activeConsumer.producerNode.length &&
      activeConsumer.producerNode[idx]?.[GRAPH_EDGE_NODE] !== node) {
    // There's been a change in producers since the last execution of `activeConsumer`.
    // `edgeRef` holds a stale dependency which will be be removed and
    // replaced with `this`.
    //
    // If `activeConsumer` isn't live, then this is a no-op, since we can replace the producer in
    // `activeConsumer.producerNode` directly. However, if `activeConsumer` is live, then we need
    // to remove it from the stale producer's `liveConsumer`s.
    if (consumerIsLive(activeConsumer)) {
      producerRemoveLiveConsumer(activeConsumer.producerNode[idx]);

      // At this point, the only record of `staleProducer` is the reference at
      // `edgeRef` which will be overwritten below.
    }
  }

  if (activeConsumer.producerNode[idx]?.[GRAPH_EDGE_NODE] !== node) {
    activeConsumer.producerNode[idx] = createGraphEdge(
        node, node.version,
        consumerIsLive(activeConsumer) ? producerAddLiveConsumer(node, activeConsumer, idx) : 0);
  } else {
    activeConsumer.producerNode[idx][GRAPH_EDGE_VERSION] = node.version;
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
      if (node.liveConsumerNode[i][GRAPH_EDGE_NODE].dirty) {
        continue;
      }

      consumerMarkDirty(node.liveConsumerNode[i][GRAPH_EDGE_NODE]);
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

  if (!node || node.producerNode === undefined) {
    return;
  }

  if (consumerIsLive(node)) {
    // For live consumers, we need to remove the producer -> consumer edge for any stale producers
    // which weren't dependencies after the recomputation.
    for (let i = node.nextProducerIndex; i < node.producerNode.length; i++) {
      producerRemoveLiveConsumer(node.producerNode[i]);
    }
  }

  // Truncate the producer tracking arrays.
  // Perf note: this is essentially truncating the length to `node.nextProducerIndex`, but
  // benchmarking has shown that individual pop operations are faster.
  while (node.producerNode.length > node.nextProducerIndex) {
    node.producerNode.pop();
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
    // First check the versions. A mismatch means that the producer's value is known to have
    // changed since the last time we read it.
    if (node.producerNode[i][GRAPH_EDGE_VERSION] !==
        node.producerNode[i][GRAPH_EDGE_NODE].version) {
      return true;
    }

    // The producer's version is the same as the last time we read it, but it might itself be
    // stale. Force the producer to recompute its version (calculating a new value if necessary).
    producerUpdateValueVersion(node.producerNode[i][GRAPH_EDGE_NODE]);

    // Now when we do this check, `producer.version` is guaranteed to be up to date, so if the
    // versions still match then it has not changed since the last time we read it.
    if (node.producerNode[i][GRAPH_EDGE_VERSION] !==
        node.producerNode[i][GRAPH_EDGE_NODE].version) {
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
      producerRemoveLiveConsumer(node.producerNode[i]);
    }
  }

  // Truncate all the arrays to drop all connection from this node to the graph.
  node.producerNode.length = 0;
  if (node.liveConsumerNode) {
    node.liveConsumerNode.length = 0;
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
      node.producerNode[i][GRAPH_EDGE_INDEX_OF_THIS] =
          producerAddLiveConsumer(node.producerNode[i][GRAPH_EDGE_NODE], node, i);
    }
  }

  return node.liveConsumerNode.push(createGraphEdge(consumer, undefined, indexOfThis)) - 1;
}

/**
 * Remove the live consumer
 */
function producerRemoveLiveConsumer(anEdge: GraphEdge): void {
  assertProducerNode(anEdge[GRAPH_EDGE_NODE]);
  assertConsumerNode(anEdge[GRAPH_EDGE_NODE]);

  if (typeof ngDevMode !== 'undefined' && ngDevMode &&
      anEdge[GRAPH_EDGE_INDEX_OF_THIS] >= anEdge[GRAPH_EDGE_NODE].liveConsumerNode.length) {
    throw new Error(`Assertion error: active consumer index ${
        anEdge[GRAPH_EDGE_INDEX_OF_THIS]} is out of bounds of ${
        anEdge[GRAPH_EDGE_NODE].liveConsumerNode.length} consumers)`);
  }

  if (anEdge[GRAPH_EDGE_NODE].liveConsumerNode.length === 1) {
    // When removing the last live consumer, we will no longer be live. We need to remove
    // ourselves from our producers' tracking (which may cause consumer-producers to lose
    // liveness as well).
    for (let i = 0; i < anEdge[GRAPH_EDGE_NODE].producerNode.length; i++) {
      producerRemoveLiveConsumer(anEdge[GRAPH_EDGE_NODE].producerNode[i]);
    }
  }

  // Move the last value of `liveConsumers` into `anEdge[GRAPH_EDGE_INDEX_OF_THIS]`. Note that if
  // there's only a single live consumer, this is a no-op.
  const lastIdx = anEdge[GRAPH_EDGE_NODE].liveConsumerNode.length - 1;
  anEdge[GRAPH_EDGE_NODE].liveConsumerNode[anEdge[GRAPH_EDGE_INDEX_OF_THIS]] =
      anEdge[GRAPH_EDGE_NODE].liveConsumerNode[lastIdx];

  // Truncate the array.
  anEdge[GRAPH_EDGE_NODE].liveConsumerNode.length--;

  // If the index is still valid, then we need to fix the index pointer from the producer to this
  // consumer, and update it from `lastIdx` to `idx` (accounting for the move above).
  if (anEdge[GRAPH_EDGE_INDEX_OF_THIS] < anEdge[GRAPH_EDGE_NODE].liveConsumerNode.length) {
    const consumerEdge = anEdge[GRAPH_EDGE_NODE].liveConsumerNode[anEdge[GRAPH_EDGE_INDEX_OF_THIS]];
    assertConsumerNode(consumerEdge[GRAPH_EDGE_NODE]);
    consumerEdge[GRAPH_EDGE_NODE]
        .producerNode[consumerEdge[GRAPH_EDGE_INDEX_OF_THIS]][GRAPH_EDGE_INDEX_OF_THIS] =
        anEdge[GRAPH_EDGE_INDEX_OF_THIS];
  }
}

function consumerIsLive(node: ReactiveNode): boolean {
  return node.consumerIsAlwaysLive || (node?.liveConsumerNode?.length ?? 0) > 0;
}


function assertConsumerNode(node: ReactiveNode): asserts node is ConsumerNode {
  node.producerNode ??= [];
}

function assertProducerNode(node: ReactiveNode): asserts node is ProducerNode {
  node.liveConsumerNode ??= [];
}
