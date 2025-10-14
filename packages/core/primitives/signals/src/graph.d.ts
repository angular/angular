/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
type Version = number & {
    __brand: 'Version';
};
export type ReactiveHookFn = (node: ReactiveNode) => void;
/**
 * Symbol used to tell `Signal`s apart from other functions.
 *
 * This can be used to auto-unwrap signals in various cases, or to auto-wrap non-signal values.
 */
export declare const SIGNAL: unique symbol;
export declare function setActiveConsumer(consumer: ReactiveNode | null): ReactiveNode | null;
export declare function getActiveConsumer(): ReactiveNode | null;
export declare function isInNotificationPhase(): boolean;
export interface Reactive {
    [SIGNAL]: ReactiveNode;
}
export declare function isReactive(value: unknown): value is Reactive;
export declare const REACTIVE_NODE: ReactiveNode;
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
export declare function producerAccessed(node: ReactiveNode): void;
/**
 * Increment the global epoch counter.
 *
 * Called by source producers (that is, not computeds) whenever their values change.
 */
export declare function producerIncrementEpoch(): void;
/**
 * Ensure this producer's `version` is up-to-date.
 */
export declare function producerUpdateValueVersion(node: ReactiveNode): void;
/**
 * Propagate a dirty notification to live consumers of this producer.
 */
export declare function producerNotifyConsumers(node: ReactiveNode): void;
/**
 * Whether this `ReactiveNode` in its producer capacity is currently allowed to initiate updates,
 * based on the current consumer context.
 */
export declare function producerUpdatesAllowed(): boolean;
export declare function consumerMarkDirty(node: ReactiveNode): void;
export declare function producerMarkClean(node: ReactiveNode): void;
/**
 * Prepare this consumer to run a computation in its reactive context and set
 * it as the active consumer.
 *
 * Must be called by subclasses which represent reactive computations, before those computations
 * begin.
 */
export declare function consumerBeforeComputation(node: ReactiveNode | null): ReactiveNode | null;
/**
 * Prepare this consumer to run a computation in its reactive context.
 *
 * We expose this mainly for code where we manually batch effects into a single
 * consumer. In those cases we may wish to "reopen" a consumer multiple times
 * in initial render before finalizing it. Most code should just call
 * `consumerBeforeComputation` instead of calling this directly.
 */
export declare function resetConsumerBeforeComputation(node: ReactiveNode): void;
/**
 * Finalize this consumer's state and set previous consumer as the active consumer after a
 * reactive computation has run.
 *
 * Must be called by subclasses which represent reactive computations, after those computations
 * have finished.
 */
export declare function consumerAfterComputation(node: ReactiveNode | null, prevConsumer: ReactiveNode | null): void;
/**
 * Finalize this consumer's state after a reactive computation has run.
 *
 * We expose this mainly for code where we manually batch effects into a single
 * consumer. In those cases we may wish to "reopen" a consumer multiple times
 * in initial render before finalizing it. Most code should just call
 * `consumerAfterComputation` instead of calling this directly.
 */
export declare function finalizeConsumerAfterComputation(node: ReactiveNode): void;
/**
 * Determine whether this consumer has any dependencies which have changed since the last time
 * they were read.
 */
export declare function consumerPollProducersForChange(node: ReactiveNode): boolean;
/**
 * Disconnect this consumer from the graph.
 */
export declare function consumerDestroy(node: ReactiveNode): void;
export declare function runPostProducerCreatedFn(node: ReactiveNode): void;
export declare function setPostProducerCreatedFn(fn: ReactiveHookFn | null): ReactiveHookFn | null;
export {};
