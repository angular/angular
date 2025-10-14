/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../di';
import { BlockSummary } from '../hydration/interfaces';
import { TNode } from '../render3/interfaces/node';
import { LView, TView } from '../render3/interfaces/view';
import { DeferBlockTrigger, DehydratedDeferBlock, HydrateTriggerDetails, TDeferBlockDetails, TDeferDetailsFlags, TriggerType } from './interfaces';
/**
 * Schedules triggering of a defer block for `on idle` and `on timer` conditions.
 */
export declare function scheduleDelayedTrigger(scheduleFn: (callback: VoidFunction, injector: Injector) => VoidFunction): void;
/**
 * Schedules prefetching for `on idle` and `on timer` triggers.
 *
 * @param scheduleFn A function that does the scheduling.
 */
export declare function scheduleDelayedPrefetching(scheduleFn: (callback: VoidFunction, injector: Injector) => VoidFunction, trigger: DeferBlockTrigger): void;
/**
 * Schedules hydration triggering of a defer block for `on idle` and `on timer` conditions.
 */
export declare function scheduleDelayedHydrating(scheduleFn: (callback: VoidFunction, injector: Injector) => VoidFunction, lView: LView, tNode: TNode): void;
/**
 * Trigger prefetching of dependencies for a defer block.
 *
 * @param tDetails Static information about this defer block.
 * @param lView LView of a host view.
 * @param tNode TNode that represents a defer block.
 */
export declare function triggerPrefetching(tDetails: TDeferBlockDetails, lView: LView, tNode: TNode): void;
/**
 * Trigger loading of defer block dependencies if the process hasn't started yet.
 *
 * @param tDetails Static information about this defer block.
 * @param lView LView of a host view.
 */
export declare function triggerResourceLoading(tDetails: TDeferBlockDetails, lView: LView, tNode: TNode): Promise<unknown>;
/**
 * Attempts to trigger loading of defer block dependencies.
 * If the block is already in a loading, completed or an error state -
 * no additional actions are taken.
 */
export declare function triggerDeferBlock(triggerType: TriggerType, lView: LView, tNode: TNode): void;
/**
 * The core mechanism for incremental hydration. This triggers or
 * queues hydration for all the blocks in the tree that need to be hydrated
 * and keeps track of all those blocks that were hydrated along the way.
 *
 * Note: the `replayQueuedEventsFn` is only provided when hydration is invoked
 * as a result of an event replay (via JsAction). When hydration is invoked from
 * an instruction set (e.g. `deferOnImmediate`) - there is no need to replay any
 * events.
 */
export declare function triggerHydrationFromBlockName(injector: Injector, blockName: string, replayQueuedEventsFn?: Function): Promise<void>;
/**
 * The core mechanism for incremental hydration. This triggers
 * hydration for all the blocks in the tree that need to be hydrated
 * and keeps track of all those blocks that were hydrated along the way.
 *
 * Note: the `replayQueuedEventsFn` is only provided when hydration is invoked
 * as a result of an event replay (via JsAction). When hydration is invoked from
 * an instruction set (e.g. `deferOnImmediate`) - there is no need to replay any
 * events.
 */
export declare function triggerHydrationForBlockQueue(injector: Injector, hydrationQueue: string[], replayQueuedEventsFn?: Function): Promise<void>;
export declare function deferBlockHasErrored(deferBlock: DehydratedDeferBlock): boolean;
/**
 * Determines whether specific trigger types should be attached during an instruction firing
 * to ensure the proper triggers for a given type are used.
 */
export declare function shouldAttachTrigger(triggerType: TriggerType, lView: LView, tNode: TNode): boolean;
/** Whether a given defer block has `hydrate` triggers. */
export declare function hasHydrateTriggers(flags: TDeferDetailsFlags | null | undefined): boolean;
/**
 * Retrives a Defer Block's list of hydration triggers
 */
export declare function getHydrateTriggers(tView: TView, tNode: TNode): Map<DeferBlockTrigger, HydrateTriggerDetails | null>;
/**
 * Loops through all defer block summaries and ensures all the blocks triggers are
 * properly initialized
 */
export declare function processAndInitTriggers(injector: Injector, blockData: Map<string, BlockSummary>, nodes: Map<string, Comment>): void;
