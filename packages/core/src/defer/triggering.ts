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
import {cleanupDeferBlock} from '../hydration/cleanup';
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
import {
  DeferBlockBehavior,
  DeferBlockState,
  DeferBlockTrigger,
  DeferDependenciesLoadingState,
  DehydratedDeferBlock,
  LDeferBlockDetails,
  ON_COMPLETE_FNS,
  SSR_BLOCK_STATE,
  SSR_UNIQUE_ID,
  TDeferBlockDetails,
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
import {
  addDepsToRegistry,
  assertDeferredDependenciesLoaded,
  getLDeferBlockDetails,
  getPrimaryBlockTNode,
  getTDeferBlockDetails,
} from './utils';

/**
 * Schedules triggering of a defer block for `on idle` and `on timer` conditions.
 */
export function scheduleDelayedTrigger(
  scheduleFn: (callback: VoidFunction, injector: Injector) => VoidFunction,
) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const injector = lView[INJECTOR]!;
  const lDetails = getLDeferBlockDetails(lView, tNode);
  const tDetails = getTDeferBlockDetails(lView[TVIEW], tNode);

  renderPlaceholder(lView, tNode);

  if (shouldTriggerWhenOnClient(lView[INJECTOR]!, lDetails, tDetails)) {
    // Only trigger the scheduled trigger on the browser
    // since we don't want to delay the server response.
    const cleanupFn = scheduleFn(() => triggerDeferBlock(lView, tNode), injector);
    storeTriggerCleanupFn(TriggerType.Regular, lDetails, cleanupFn);
  }
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
  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    return;
  }

  const lView = getLView();
  const injector = lView[INJECTOR]!;

  // Only trigger the scheduled trigger on the browser
  // since we don't want to delay the server response.
  const tNode = getCurrentTNode()!;
  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);
  const prefetchTriggers = getPrefetchTriggers(tDetails);
  prefetchTriggers.add(trigger);

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
  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    return;
  }

  // Only trigger the scheduled trigger on the browser
  // since we don't want to delay the server response.
  const injector = lView[INJECTOR]!;
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
 */
export function triggerPrefetching(tDetails: TDeferBlockDetails, lView: LView, tNode: TNode) {
  const tDeferBlockDetails = getTDeferBlockDetails(lView[TVIEW], tNode);
  if (lView[INJECTOR] && shouldTriggerDeferBlock(lView[INJECTOR]!, tDeferBlockDetails)) {
    triggerResourceLoading(tDetails, lView, tNode);
  }
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
  const injector = lView[INJECTOR]!;
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
 * Attempts to trigger loading of defer block dependencies.
 * If the block is already in a loading, completed or an error state -
 * no additional actions are taken.
 */
export function triggerDeferBlock(lView: LView, tNode: TNode) {
  const tView = lView[TVIEW];
  const lContainer = lView[tNode.index];
  const injector = lView[INJECTOR]!;
  ngDevMode && assertLContainer(lContainer);

  const lDetails = getLDeferBlockDetails(lView, tNode);
  const tDetails = getTDeferBlockDetails(tView, tNode);
  if (!shouldTriggerDeferBlock(injector, tDetails)) return;

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
 * Triggers hydration from a given defer block's unique SSR ID.
 * This includes firing any queued events that need to be replayed
 * and handling any post hydration cleanup.
 */
export async function triggerHydrationFromBlockName(
  injector: Injector,
  blockName: string,
  replayFn: Function = () => {},
): Promise<void> {
  const {deferBlock, hydratedBlocks} = await triggerBlockTreeHydrationByName(injector, blockName);
  replayFn(hydratedBlocks);
  await cleanupDeferBlock(deferBlock, hydratedBlocks, injector);
}

/**
 * Triggers the resource loading for a defer block and passes back a promise
 * to handle cleanup on completion
 */
export function triggerAndWaitForCompletion(
  dehydratedBlockId: string,
  dehydratedBlockRegistry: DehydratedBlockRegistry,
  injector: Injector,
): Promise<void> {
  // TODO(incremental-hydration): This is a temporary fix to resolve control flow
  // cases where nested defer blocks are inside control flow. We wait for each nested
  // defer block to load and render before triggering the next one in a sequence. This is
  // needed to ensure that corresponding LViews & LContainers are available for a block
  // before we trigger it. We need to investigate how to get rid of the `afterNextRender`
  // calls (in the nearest future) and do loading of all dependencies of nested defer blocks
  // in parallel (later).

  let resolve: VoidFunction;
  const promise = new Promise<void>((resolveFn) => {
    resolve = resolveFn;
  });

  afterNextRender(
    () => {
      const deferBlock = dehydratedBlockRegistry.get(dehydratedBlockId);
      // Since we trigger hydration for nested defer blocks in a sequence (parent -> child),
      // there is a chance that a defer block may not be present at hydration time. For example,
      // when a nested block was in an `@if` condition, which has changed.
      // TODO(incremental-hydration): add tests to verify the behavior mentioned above.
      if (deferBlock !== null) {
        const {tNode, lView} = deferBlock;
        const lDetails = getLDeferBlockDetails(lView, tNode);
        onDeferBlockCompletion(lDetails, resolve);
        triggerDeferBlock(lView, tNode);
        // TODO(incremental-hydration): handle the cleanup for cases when
        // defer block is no longer present during hydration (e.g. `@if` condition
        // has changed during hydration/rendering).
      }
    },
    {injector},
  );
  return promise;
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
 * The core mechanism for incremental hydration. This triggers
 * hydration for all the blocks in the tree that need to be hydrated and keeps
 * track of all those blocks that were hydrated along the way.
 */
async function triggerBlockTreeHydrationByName(
  injector: Injector,
  blockName: string,
): Promise<{
  deferBlock: DehydratedDeferBlock | null;
  hydratedBlocks: Set<string>;
}> {
  const dehydratedBlockRegistry = injector.get(DEHYDRATED_BLOCK_REGISTRY);

  // Make sure we don't hydrate/trigger the same thing multiple times
  if (dehydratedBlockRegistry.hydrating.has(blockName))
    return {deferBlock: null, hydratedBlocks: new Set<string>()};

  // Step 1: Get the queue of items that needs to be hydrated
  const hydrationQueue = getParentBlockHydrationQueue(blockName, injector);

  // Step 2: Add all the items in the queue to the registry at once so we don't trigger hydration on them while
  // the sequence of triggers fires.
  hydrationQueue.forEach((id) => dehydratedBlockRegistry.hydrating.add(id));

  // Step 3: hydrate each block in the queue. It will be in descending order from the top down.
  for (const dehydratedBlockId of hydrationQueue) {
    // Step 4: Run the actual trigger function to fetch dependencies.
    // Triggering a block adds any of its child defer blocks to the registry.
    await triggerAndWaitForCompletion(dehydratedBlockId, dehydratedBlockRegistry, injector);
  }

  const hydratedBlocks = new Set<string>(hydrationQueue);

  // The last item in the queue was the original target block;
  const hydratedBlockId = hydrationQueue.slice(-1)[0];
  const hydratedBlock = dehydratedBlockRegistry.get(hydratedBlockId)!;

  return {deferBlock: hydratedBlock, hydratedBlocks};
}

/**
 * Determines whether "hydrate" triggers should be activated. Triggers are activated in the following cases:
 *  - on the server, when incremental hydration is enabled, to trigger the block and render the main content
 *  - on the client for blocks that were server-side rendered, to start hydration process
 */
export function shouldActivateHydrateTrigger(lView: LView, tNode: TNode): boolean {
  const lDetails = getLDeferBlockDetails(lView, tNode);
  const injector = lView[INJECTOR]!;
  // TODO(incremental-hydration): ideally, this check should only happen once and then stored on
  // LDeferBlockDetails as a flag. This would make subsequent lookups very cheap.
  return (
    isIncrementalHydrationEnabled(injector) &&
    ((typeof ngServerMode !== 'undefined' && ngServerMode) || lDetails[SSR_UNIQUE_ID] !== null)
  );
}

// TODO(incremental-hydration): Optimize this further by moving the calculation to earlier
// in the process. Consider a flag we can check similar to LView[FLAGS].

/**
 * Determines whether regular defer block triggers should be invoked based on client state
 * and whether incremental hydration is enabled. Hydrate triggers are invoked elsewhere.
 */
export function shouldTriggerWhenOnClient(
  injector: Injector,
  lDetails: LDeferBlockDetails,
  tDetails: TDeferBlockDetails,
): boolean {
  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    return false;
  }

  const isServerRendered =
    lDetails[SSR_BLOCK_STATE] && lDetails[SSR_BLOCK_STATE] === DeferBlockState.Complete;
  const hasHydrateTriggers = tDetails.hydrateTriggers && tDetails.hydrateTriggers.size > 0;
  if (hasHydrateTriggers && isServerRendered && isIncrementalHydrationEnabled(injector)) {
    return false;
  }
  return true;
}

/**
 * Returns whether defer blocks should be triggered.
 *
 * Currently, defer blocks are not triggered on the server,
 * only placeholder content is rendered (if provided).
 */
export function shouldTriggerDeferBlock(
  injector: Injector,
  tDeferBlockDetails: TDeferBlockDetails,
): boolean {
  const config = injector.get(DEFER_BLOCK_CONFIG, null, {optional: true});
  if (config?.behavior === DeferBlockBehavior.Manual) {
    return false;
  }

  return (
    typeof ngServerMode === 'undefined' ||
    !ngServerMode ||
    tDeferBlockDetails.hydrateTriggers !== null
  );
}

/**
 * Retrives a Defer Block's list of hydration triggers
 */
export function getHydrateTriggers(
  tView: TView,
  tNode: TNode,
): Map<DeferBlockTrigger, number | null> {
  const tDetails = getTDeferBlockDetails(tView, tNode);
  return (tDetails.hydrateTriggers ??= new Map());
}

/**
 * Retrives a Defer Block's list of prefetch triggers
 */
export function getPrefetchTriggers(tDetails: TDeferBlockDetails): Set<DeferBlockTrigger> {
  return (tDetails.prefetchTriggers ??= new Set());
}
