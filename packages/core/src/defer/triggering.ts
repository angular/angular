/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {afterNextRender} from '../render3/after_render/hooks';
import {Injector} from '../di';
import {internalImportProvidersFrom} from '../di/provider_collection';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {cleanupHydratedDeferBlocks} from '../hydration/cleanup';
import {BlockSummary, ElementTrigger, NUM_ROOT_NODES} from '../hydration/interfaces';
import {
  assertSsrIdDefined,
  getParentBlockHydrationQueue,
  isIncrementalHydrationEnabled,
} from '../hydration/utils';
import {PendingTasksInternal} from '../pending_tasks';
import {assertLContainer} from '../render3/assert';
import {getComponentDef, getDirectiveDef, getPipeDef} from '../render3/def_getters';
import {getTemplateLocationDetails} from '../render3/instructions/element_validation';
import {handleError} from '../render3/instructions/shared';
import {DirectiveDefList, PipeDefList} from '../render3/interfaces/definition';
import {TNode} from '../render3/interfaces/node';
import {INJECTOR, LView, TView, TVIEW} from '../render3/interfaces/view';
import {getCurrentTNode, getLView} from '../render3/state';
import {throwError} from '../util/assert';
import {
  invokeAllTriggerCleanupFns,
  invokeTriggerCleanupFns,
  storeTriggerCleanupFn,
} from './cleanup';
import {onViewport} from './dom_triggers';
import {onIdle} from './idle_scheduler';
import {
  DeferBlockBehavior,
  DeferBlockState,
  DeferBlockTrigger,
  DeferDependenciesLoadingState,
  HydrateTriggerDetails,
  LDeferBlockDetails,
  ON_COMPLETE_FNS,
  SSR_UNIQUE_ID,
  TDeferBlockDetails,
  TDeferDetailsFlags,
  TriggerType,
} from './interfaces';
import {DEHYDRATED_BLOCK_REGISTRY, DehydratedBlockRegistry} from './registry';
import {
  DEFER_BLOCK_CONFIG,
  DEFER_BLOCK_DEPENDENCY_INTERCEPTOR,
  renderDeferBlockState,
  renderDeferStateAfterResourceLoading,
  renderPlaceholder,
} from './rendering';
import {onTimer} from './timer_scheduler';
import {
  addDepsToRegistry,
  assertDeferredDependenciesLoaded,
  getLDeferBlockDetails,
  getPrimaryBlockTNode,
  getTDeferBlockDetails,
} from './utils';
import {ApplicationRef} from '../application/application_ref';

/**
 * Schedules triggering of a defer block for `on idle` and `on timer` conditions.
 */
export function scheduleDelayedTrigger(
  scheduleFn: (callback: VoidFunction, injector: Injector) => VoidFunction,
) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  renderPlaceholder(lView, tNode);

  // Exit early to avoid invoking `scheduleFn`, which would
  // add `setTimeout` call and potentially delay serialization
  // on the server unnecessarily.
  if (!shouldTriggerDeferBlock(TriggerType.Regular, lView)) return;

  const injector = lView[INJECTOR];
  const lDetails = getLDeferBlockDetails(lView, tNode);

  const cleanupFn = scheduleFn(
    () => triggerDeferBlock(TriggerType.Regular, lView, tNode),
    injector,
  );
  storeTriggerCleanupFn(TriggerType.Regular, lDetails, cleanupFn);
}

/**
 * Schedules prefetching for `on idle` and `on timer` triggers.
 *
 * @param scheduleFn A function that does the scheduling.
 */
export function scheduleDelayedPrefetching(
  scheduleFn: (callback: VoidFunction, injector: Injector) => VoidFunction,
  trigger: DeferBlockTrigger,
) {
  if (typeof ngServerMode !== 'undefined' && ngServerMode) return;

  const lView = getLView();
  const injector = lView[INJECTOR];

  // Only trigger the scheduled trigger on the browser
  // since we don't want to delay the server response.
  const tNode = getCurrentTNode()!;
  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);

  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    const lDetails = getLDeferBlockDetails(lView, tNode);
    const prefetch = () => triggerPrefetching(tDetails, lView, tNode);
    const cleanupFn = scheduleFn(prefetch, injector);
    storeTriggerCleanupFn(TriggerType.Prefetch, lDetails, cleanupFn);
  }
}

/**
 * Schedules hydration triggering of a defer block for `on idle` and `on timer` conditions.
 */
export function scheduleDelayedHydrating(
  scheduleFn: (callback: VoidFunction, injector: Injector) => VoidFunction,
  lView: LView,
  tNode: TNode,
) {
  if (typeof ngServerMode !== 'undefined' && ngServerMode) return;

  // Only trigger the scheduled trigger on the browser
  // since we don't want to delay the server response.
  const injector = lView[INJECTOR];
  const lDetails = getLDeferBlockDetails(lView, tNode);
  const ssrUniqueId = lDetails[SSR_UNIQUE_ID]!;
  ngDevMode && assertSsrIdDefined(ssrUniqueId);

  const cleanupFn = scheduleFn(
    () => triggerHydrationFromBlockName(injector, ssrUniqueId),
    injector,
  );
  storeTriggerCleanupFn(TriggerType.Hydrate, lDetails, cleanupFn);
}

/**
 * Trigger prefetching of dependencies for a defer block.
 *
 * @param tDetails Static information about this defer block.
 * @param lView LView of a host view.
 * @param tNode TNode that represents a defer block.
 */
export function triggerPrefetching(tDetails: TDeferBlockDetails, lView: LView, tNode: TNode) {
  triggerResourceLoading(tDetails, lView, tNode);
}

/**
 * Trigger loading of defer block dependencies if the process hasn't started yet.
 *
 * @param tDetails Static information about this defer block.
 * @param lView LView of a host view.
 */
export function triggerResourceLoading(
  tDetails: TDeferBlockDetails,
  lView: LView,
  tNode: TNode,
): Promise<unknown> {
  const injector = lView[INJECTOR];
  const tView = lView[TVIEW];

  if (tDetails.loadingState !== DeferDependenciesLoadingState.NOT_STARTED) {
    // If the loading status is different from initial one, it means that
    // the loading of dependencies is in progress and there is nothing to do
    // in this function. All details can be obtained from the `tDetails` object.
    return tDetails.loadingPromise ?? Promise.resolve();
  }

  const lDetails = getLDeferBlockDetails(lView, tNode);
  const primaryBlockTNode = getPrimaryBlockTNode(tView, tDetails);

  // Switch from NOT_STARTED -> IN_PROGRESS state.
  tDetails.loadingState = DeferDependenciesLoadingState.IN_PROGRESS;

  // Prefetching is triggered, cleanup all registered prefetch triggers.
  invokeTriggerCleanupFns(TriggerType.Prefetch, lDetails);

  let dependenciesFn = tDetails.dependencyResolverFn;

  if (ngDevMode) {
    // Check if dependency function interceptor is configured.
    const deferDependencyInterceptor = injector.get(DEFER_BLOCK_DEPENDENCY_INTERCEPTOR, null, {
      optional: true,
    });

    if (deferDependencyInterceptor) {
      dependenciesFn = deferDependencyInterceptor.intercept(dependenciesFn);
    }
  }

  // Indicate that an application is not stable and has a pending task.
  const pendingTasks = injector.get(PendingTasksInternal);
  const taskId = pendingTasks.add();

  // The `dependenciesFn` might be `null` when all dependencies within
  // a given defer block were eagerly referenced elsewhere in a file,
  // thus no dynamic `import()`s were produced.
  if (!dependenciesFn) {
    tDetails.loadingPromise = Promise.resolve().then(() => {
      tDetails.loadingPromise = null;
      tDetails.loadingState = DeferDependenciesLoadingState.COMPLETE;
      pendingTasks.remove(taskId);
    });
    return tDetails.loadingPromise;
  }

  // Start downloading of defer block dependencies.
  tDetails.loadingPromise = Promise.allSettled(dependenciesFn()).then((results) => {
    let failed = false;
    const directiveDefs: DirectiveDefList = [];
    const pipeDefs: PipeDefList = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const dependency = result.value;
        const directiveDef = getComponentDef(dependency) || getDirectiveDef(dependency);
        if (directiveDef) {
          directiveDefs.push(directiveDef);
        } else {
          const pipeDef = getPipeDef(dependency);
          if (pipeDef) {
            pipeDefs.push(pipeDef);
          }
        }
      } else {
        failed = true;
        break;
      }
    }

    // Loading is completed, we no longer need the loading Promise
    // and a pending task should also be removed.
    tDetails.loadingPromise = null;
    pendingTasks.remove(taskId);

    if (failed) {
      tDetails.loadingState = DeferDependenciesLoadingState.FAILED;

      if (tDetails.errorTmplIndex === null) {
        const templateLocation = ngDevMode ? getTemplateLocationDetails(lView) : '';
        const error = new RuntimeError(
          RuntimeErrorCode.DEFER_LOADING_FAILED,
          ngDevMode &&
            'Loading dependencies for `@defer` block failed, ' +
              `but no \`@error\` block was configured${templateLocation}. ` +
              'Consider using the `@error` block to render an error state.',
        );
        handleError(lView, error);
      }
    } else {
      tDetails.loadingState = DeferDependenciesLoadingState.COMPLETE;

      // Update directive and pipe registries to add newly downloaded dependencies.
      const primaryBlockTView = primaryBlockTNode.tView!;
      if (directiveDefs.length > 0) {
        primaryBlockTView.directiveRegistry = addDepsToRegistry<DirectiveDefList>(
          primaryBlockTView.directiveRegistry,
          directiveDefs,
        );

        // Extract providers from all NgModules imported by standalone components
        // used within this defer block.
        const directiveTypes = directiveDefs.map((def) => def.type);
        const providers = internalImportProvidersFrom(false, ...directiveTypes);
        tDetails.providers = providers;
      }
      if (pipeDefs.length > 0) {
        primaryBlockTView.pipeRegistry = addDepsToRegistry<PipeDefList>(
          primaryBlockTView.pipeRegistry,
          pipeDefs,
        );
      }
    }
  });
  return tDetails.loadingPromise;
}

/**
 * Defines whether we should proceed with triggering a given defer block.
 */
function shouldTriggerDeferBlock(triggerType: TriggerType, lView: LView): boolean {
  // prevents triggering regular triggers when on the server.
  if (triggerType === TriggerType.Regular && typeof ngServerMode !== 'undefined' && ngServerMode) {
    return false;
  }

  // prevents triggering in the case of a test run with manual defer block configuration.
  const injector = lView[INJECTOR];
  const config = injector.get(DEFER_BLOCK_CONFIG, null, {optional: true});
  if (config?.behavior === DeferBlockBehavior.Manual) {
    return false;
  }
  return true;
}

/**
 * Attempts to trigger loading of defer block dependencies.
 * If the block is already in a loading, completed or an error state -
 * no additional actions are taken.
 */
export function triggerDeferBlock(triggerType: TriggerType, lView: LView, tNode: TNode) {
  const tView = lView[TVIEW];
  const lContainer = lView[tNode.index];
  ngDevMode && assertLContainer(lContainer);

  if (!shouldTriggerDeferBlock(triggerType, lView)) return;

  const lDetails = getLDeferBlockDetails(lView, tNode);
  const tDetails = getTDeferBlockDetails(tView, tNode);

  // Defer block is triggered, cleanup all registered trigger functions.
  invokeAllTriggerCleanupFns(lDetails);

  switch (tDetails.loadingState) {
    case DeferDependenciesLoadingState.NOT_STARTED:
      renderDeferBlockState(DeferBlockState.Loading, tNode, lContainer);
      triggerResourceLoading(tDetails, lView, tNode);

      // The `loadingState` might have changed to "loading".
      if (
        (tDetails.loadingState as DeferDependenciesLoadingState) ===
        DeferDependenciesLoadingState.IN_PROGRESS
      ) {
        renderDeferStateAfterResourceLoading(tDetails, tNode, lContainer);
      }
      break;
    case DeferDependenciesLoadingState.IN_PROGRESS:
      renderDeferBlockState(DeferBlockState.Loading, tNode, lContainer);
      renderDeferStateAfterResourceLoading(tDetails, tNode, lContainer);
      break;
    case DeferDependenciesLoadingState.COMPLETE:
      ngDevMode && assertDeferredDependenciesLoaded(tDetails);
      renderDeferBlockState(DeferBlockState.Complete, tNode, lContainer);
      break;
    case DeferDependenciesLoadingState.FAILED:
      renderDeferBlockState(DeferBlockState.Error, tNode, lContainer);
      break;
    default:
      if (ngDevMode) {
        throwError('Unknown defer block state');
      }
  }
}

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
export async function triggerHydrationFromBlockName(
  injector: Injector,
  blockName: string,
  replayQueuedEventsFn?: Function,
) {
  const dehydratedBlockRegistry = injector.get(DEHYDRATED_BLOCK_REGISTRY);
  const blocksBeingHydrated = dehydratedBlockRegistry.hydrating;

  // Make sure we don't hydrate/trigger the same thing multiple times
  if (blocksBeingHydrated.has(blockName)) {
    return;
  }

  // The parent promise is the possible case of a list of defer blocks already being queued
  // If it is queued, it'll exist; otherwise it'll be null. The hydration queue will contain all
  // elements that need to be hydrated, sans any that have promises already
  const {parentBlockPromise, hydrationQueue} = getParentBlockHydrationQueue(blockName, injector);

  // The hydrating map in the registry prevents re-triggering hydration for a block that's already in
  // the hydration queue. Here we generate promises for each of the blocks about to be hydrated
  populateHydratingStateForQueue(dehydratedBlockRegistry, hydrationQueue);

  // Trigger resource loading and hydration for the blocks in the queue in the order of highest block
  // to lowest block. Once a block has finished resource loading, after next render fires after hydration
  // finishes. The new block will have its defer instruction called and will be in the registry.
  // Due to timing related to potential nested control flow, this has to be scheduled after the next render.

  // Indicate that we have some pending async work.
  const pendingTasks = injector.get(PendingTasksInternal);
  const taskId = pendingTasks.add();

  // If the parent block was being hydrated, but the process has
  // not yet complete, wait until parent block promise settles before
  // going over dehydrated blocks from the queue.
  if (parentBlockPromise !== null) {
    await parentBlockPromise;
  }

  // Actually do the triggering and hydration of the queue of blocks
  for (const dehydratedBlockId of hydrationQueue) {
    await triggerResourceLoadingForHydration(dehydratedBlockId, dehydratedBlockRegistry);
    await nextRender(injector);
    // TODO(incremental-hydration): assert (in dev mode) that a defer block is present in the dehydrated registry
    // at this point. If not - it means that the block has not been hydrated, for example due to different
    // `@if` conditions on the client and the server. If we detect this case, we should also do the cleanup
    // of all child block (promises, registry state, etc).
    // TODO(incremental-hydration): call `rejectFn` when lDetails[DEFER_BLOCK_STATE] is `DeferBlockState.Error`.
    blocksBeingHydrated.get(dehydratedBlockId)!.resolve();

    // TODO(incremental-hydration): consider adding a wait for stability here
  }

  // Await hydration completion for the requested block.
  await blocksBeingHydrated.get(blockName)?.promise;

  // All async work is done, remove the taskId from the registry.
  pendingTasks.remove(taskId);

  // Replay any queued events, if any exist and the replay operation was requested.
  if (replayQueuedEventsFn) {
    replayQueuedEventsFn(hydrationQueue);
  }

  // Cleanup after hydration of all affected defer blocks.
  cleanupHydratedDeferBlocks(
    dehydratedBlockRegistry.get(blockName),
    hydrationQueue,
    dehydratedBlockRegistry,
    injector.get(ApplicationRef),
  );
}

/**
 * Generates a new promise for every defer block in the hydrating queue
 */
function populateHydratingStateForQueue(registry: DehydratedBlockRegistry, queue: string[]) {
  for (let blockId of queue) {
    registry.hydrating.set(blockId, Promise.withResolvers());
  }
}

// Waits for the next render cycle to complete
function nextRender(injector: Injector): Promise<void> {
  return new Promise<void>((resolveFn) => afterNextRender(resolveFn, {injector}));
}

async function triggerResourceLoadingForHydration(
  dehydratedBlockId: string,
  dehydratedBlockRegistry: DehydratedBlockRegistry,
): Promise<void> {
  const deferBlock = dehydratedBlockRegistry.get(dehydratedBlockId);
  // Since we trigger hydration for nested defer blocks in a sequence (parent -> child),
  // there is a chance that a defer block may not be present at hydration time. For example,
  // when a nested block was in an `@if` condition, which has changed.
  if (deferBlock === null) {
    // TODO(incremental-hydration): handle the cleanup for cases when
    // defer block is no longer present during hydration (e.g. `@if` condition
    // has changed during hydration/rendering).

    return;
  }

  const {tNode, lView} = deferBlock;
  const lDetails = getLDeferBlockDetails(lView, tNode);

  return new Promise<void>((resolve) => {
    onDeferBlockCompletion(lDetails, resolve);
    triggerDeferBlock(TriggerType.Hydrate, lView, tNode);
  });
}

/**
 * Registers cleanup functions for a defer block when the block has finished
 * fetching and rendering
 */
function onDeferBlockCompletion(lDetails: LDeferBlockDetails, callback: VoidFunction) {
  if (!Array.isArray(lDetails[ON_COMPLETE_FNS])) {
    lDetails[ON_COMPLETE_FNS] = [];
  }
  lDetails[ON_COMPLETE_FNS].push(callback);
}

/**
 * Determines whether specific trigger types should be attached during an instruction firing
 * to ensure the proper triggers for a given type are used.
 */
export function shouldAttachTrigger(triggerType: TriggerType, lView: LView, tNode: TNode): boolean {
  if (triggerType === TriggerType.Regular) {
    return shouldAttachRegularTrigger(lView, tNode);
  } else if (triggerType === TriggerType.Hydrate) {
    return !shouldAttachRegularTrigger(lView, tNode);
  }
  // TriggerType.Prefetch is active only on the client
  return !(typeof ngServerMode !== 'undefined' && ngServerMode);
}

/**
 * Defines whether a regular trigger logic (e.g. "on viewport") should be attached
 * to a defer block. This function defines a condition, which mutually excludes
 * `deferOn*` and `deferHydrateOn*` triggers, to make sure only one of the trigger
 * types is active for a block with the current state.
 */
function shouldAttachRegularTrigger(lView: LView, tNode: TNode): boolean {
  const injector = lView[INJECTOR];

  const tDetails = getTDeferBlockDetails(lView[TVIEW], tNode);
  const incrementalHydrationEnabled = isIncrementalHydrationEnabled(injector);
  const hasHydrateTriggers =
    tDetails.flags !== null &&
    (tDetails.flags & TDeferDetailsFlags.HasHydrateTriggers) ===
      TDeferDetailsFlags.HasHydrateTriggers;

  // On the server:
  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    // Regular triggers are activated on the server when:
    //  - Either Incremental Hydration is *not* enabled
    //  - Or Incremental Hydration is enabled, but a given block doesn't have "hydrate" triggers
    return !incrementalHydrationEnabled || !hasHydrateTriggers;
  }

  // On the client:
  const lDetails = getLDeferBlockDetails(lView, tNode);
  const wasServerSideRendered = lDetails[SSR_UNIQUE_ID] !== null;

  if (hasHydrateTriggers && wasServerSideRendered && incrementalHydrationEnabled) {
    return false;
  }
  return true;
}

/**
 * Retrives a Defer Block's list of hydration triggers
 */
export function getHydrateTriggers(
  tView: TView,
  tNode: TNode,
): Map<DeferBlockTrigger, HydrateTriggerDetails | null> {
  const tDetails = getTDeferBlockDetails(tView, tNode);
  return (tDetails.hydrateTriggers ??= new Map());
}

/**
 * Loops through all defer block summaries and ensures all the blocks triggers are
 * properly initialized
 */
export function processAndInitTriggers(
  injector: Injector,
  blockData: Map<string, BlockSummary>,
  nodes: Map<string, Comment>,
) {
  const idleElements: ElementTrigger[] = [];
  const timerElements: ElementTrigger[] = [];
  const viewportElements: ElementTrigger[] = [];
  const immediateElements: ElementTrigger[] = [];
  for (let [blockId, blockSummary] of blockData) {
    const commentNode = nodes.get(blockId);
    if (commentNode !== undefined) {
      const numRootNodes = blockSummary.data[NUM_ROOT_NODES];
      let currentNode: Comment | HTMLElement = commentNode;
      for (let i = 0; i < numRootNodes; i++) {
        currentNode = currentNode.previousSibling as HTMLElement;
        if (currentNode.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }
        const elementTrigger: ElementTrigger = {el: currentNode, blockName: blockId};
        // hydrate
        if (blockSummary.hydrate.idle) {
          idleElements.push(elementTrigger);
        }
        if (blockSummary.hydrate.immediate) {
          immediateElements.push(elementTrigger);
        }
        if (blockSummary.hydrate.timer !== null) {
          elementTrigger.delay = blockSummary.hydrate.timer;
          timerElements.push(elementTrigger);
        }
        if (blockSummary.hydrate.viewport) {
          viewportElements.push(elementTrigger);
        }
      }
    }
  }

  setIdleTriggers(injector, idleElements);
  setImmediateTriggers(injector, immediateElements);
  setViewportTriggers(injector, viewportElements);
  setTimerTriggers(injector, timerElements);
}

function setIdleTriggers(injector: Injector, elementTriggers: ElementTrigger[]) {
  for (const elementTrigger of elementTriggers) {
    const registry = injector.get(DEHYDRATED_BLOCK_REGISTRY);
    const onInvoke = () => triggerHydrationFromBlockName(injector, elementTrigger.blockName);
    const cleanupFn = onIdle(onInvoke, injector);
    registry.addCleanupFn(elementTrigger.blockName, cleanupFn);
  }
}

function setViewportTriggers(injector: Injector, elementTriggers: ElementTrigger[]) {
  if (elementTriggers.length > 0) {
    const registry = injector.get(DEHYDRATED_BLOCK_REGISTRY);
    for (let elementTrigger of elementTriggers) {
      const cleanupFn = onViewport(
        elementTrigger.el,
        () => triggerHydrationFromBlockName(injector, elementTrigger.blockName),
        injector,
      );
      registry.addCleanupFn(elementTrigger.blockName, cleanupFn);
    }
  }
}

function setTimerTriggers(injector: Injector, elementTriggers: ElementTrigger[]) {
  for (const elementTrigger of elementTriggers) {
    const registry = injector.get(DEHYDRATED_BLOCK_REGISTRY);
    const onInvoke = () => triggerHydrationFromBlockName(injector, elementTrigger.blockName);
    const timerFn = onTimer(elementTrigger.delay!);
    const cleanupFn = timerFn(onInvoke, injector);
    registry.addCleanupFn(elementTrigger.blockName, cleanupFn);
  }
}

function setImmediateTriggers(injector: Injector, elementTriggers: ElementTrigger[]) {
  for (const elementTrigger of elementTriggers) {
    // Note: we intentionally avoid awaiting each call and instead kick off
    // th hydration process simultaneously for all defer blocks with this trigger;
    triggerHydrationFromBlockName(injector, elementTrigger.blockName);
  }
}
