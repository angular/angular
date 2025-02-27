/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CachedInjectorService} from '../cached_injector_service';
import {NotificationSource} from '../change_detection/scheduling/zoneless_scheduling';
import {EnvironmentInjector, InjectionToken, Injector, Provider} from '../di';
import {
  DehydratedContainerView,
  DEFER_BLOCK_STATE as SERIALIZED_DEFER_BLOCK_STATE,
} from '../hydration/interfaces';
import {assertLContainer, assertTNodeForLView} from '../render3/assert';
import {ChainedInjector} from '../render3/chained_injector';
import {markViewDirty} from '../render3/instructions/mark_view_dirty';
import {handleUncaughtError} from '../render3/instructions/shared';
import {DEHYDRATED_VIEWS, LContainer} from '../render3/interfaces/container';
import {TContainerNode, TNode} from '../render3/interfaces/node';
import {isDestroyed} from '../render3/interfaces/type_checks';
import {HEADER_OFFSET, INJECTOR, LView, PARENT, TVIEW, TView} from '../render3/interfaces/view';
import {getConstant, getTNode} from '../render3/util/view_utils';
import {createAndRenderEmbeddedLView, shouldAddViewToDom} from '../render3/view_manipulation';
import {assertDefined} from '../util/assert';

import {
  DEFER_BLOCK_STATE,
  DeferBlockConfig,
  DeferBlockDependencyInterceptor,
  DeferBlockInternalState,
  DeferBlockState,
  DeferDependenciesLoadingState,
  DeferredLoadingBlockConfig,
  DeferredPlaceholderBlockConfig,
  LDeferBlockDetails,
  LOADING_AFTER_CLEANUP_FN,
  NEXT_DEFER_BLOCK_STATE,
  ON_COMPLETE_FNS,
  SSR_BLOCK_STATE,
  STATE_IS_FROZEN_UNTIL,
  TDeferBlockDetails,
} from './interfaces';
import {scheduleTimerTrigger} from './timer_scheduler';
import {
  assertDeferredDependenciesLoaded,
  getLDeferBlockDetails,
  getLoadingBlockAfter,
  getMinimumDurationForState,
  getTDeferBlockDetails,
  getTemplateIndexForState,
} from './utils';
import {profiler} from '../render3/profiler';
import {ProfilerEvent} from '../render3/profiler_types';
import {addLViewToLContainer, removeLViewFromLContainer} from '../render3/view/container';

/**
 * **INTERNAL**, avoid referencing it in application code.
 * *
 * Injector token that allows to provide `DeferBlockDependencyInterceptor` class
 * implementation.
 *
 * This token is only injected in devMode
 */
export const DEFER_BLOCK_DEPENDENCY_INTERCEPTOR =
  /* @__PURE__ */ new InjectionToken<DeferBlockDependencyInterceptor>(
    'DEFER_BLOCK_DEPENDENCY_INTERCEPTOR',
  );

/**
 * **INTERNAL**, token used for configuring defer block behavior.
 */
export const DEFER_BLOCK_CONFIG = new InjectionToken<DeferBlockConfig>(
  ngDevMode ? 'DEFER_BLOCK_CONFIG' : '',
);

/**
 * Checks whether there is a cached injector associated with a given defer block
 * declaration and returns if it exists. If there is no cached injector present -
 * creates a new injector and stores in the cache.
 */
function getOrCreateEnvironmentInjector(
  parentInjector: Injector,
  tDetails: TDeferBlockDetails,
  providers: Provider[],
) {
  return parentInjector
    .get(CachedInjectorService)
    .getOrCreateInjector(
      tDetails,
      parentInjector as EnvironmentInjector,
      providers,
      ngDevMode ? 'DeferBlock Injector' : '',
    );
}

/** Injector Helpers */

/**
 * Creates a new injector, which contains providers collected from dependencies (NgModules) of
 * defer-loaded components. This function detects different types of parent injectors and creates
 * a new injector based on that.
 */
function createDeferBlockInjector(
  parentInjector: Injector,
  tDetails: TDeferBlockDetails,
  providers: Provider[],
) {
  // Check if the parent injector is an instance of a `ChainedInjector`.
  //
  // In this case, we retain the shape of the injector and use a newly created
  // `EnvironmentInjector` as a parent in the `ChainedInjector`. That is needed to
  // make sure that the primary injector gets consulted first (since it's typically
  // a NodeInjector) and `EnvironmentInjector` tree is consulted after that.
  if (parentInjector instanceof ChainedInjector) {
    const origInjector = parentInjector.injector;
    // Guaranteed to be an environment injector
    const parentEnvInjector = parentInjector.parentInjector;

    const envInjector = getOrCreateEnvironmentInjector(parentEnvInjector, tDetails, providers);
    return new ChainedInjector(origInjector, envInjector);
  }

  const parentEnvInjector = parentInjector.get(EnvironmentInjector);

  // If the `parentInjector` is *not* an `EnvironmentInjector` - we need to create
  // a new `ChainedInjector` with the following setup:
  //
  //  - the provided `parentInjector` becomes a primary injector
  //  - an existing (real) `EnvironmentInjector` becomes a parent injector for
  //    a newly-created one, which contains extra providers
  //
  // So the final order in which injectors would be consulted in this case would look like this:
  //
  //  1. Provided `parentInjector`
  //  2. Newly-created `EnvironmentInjector` with extra providers
  //  3. `EnvironmentInjector` from the `parentInjector`
  if (parentEnvInjector !== parentInjector) {
    const envInjector = getOrCreateEnvironmentInjector(parentEnvInjector, tDetails, providers);
    return new ChainedInjector(parentInjector, envInjector);
  }

  // The `parentInjector` is an instance of an `EnvironmentInjector`.
  // No need for special handling, we can use `parentInjector` as a
  // parent injector directly.
  return getOrCreateEnvironmentInjector(parentInjector, tDetails, providers);
}

/** Rendering Helpers */

/**
 * Transitions a defer block to the new state. Updates the  necessary
 * data structures and renders corresponding block.
 *
 * @param newState New state that should be applied to the defer block.
 * @param tNode TNode that represents a defer block.
 * @param lContainer Represents an instance of a defer block.
 * @param skipTimerScheduling Indicates that `@loading` and `@placeholder` block
 *   should be rendered immediately, even if they have `after` or `minimum` config
 *   options setup. This flag to needed for testing APIs to transition defer block
 *   between states via `DeferFixture.render` method.
 */
export function renderDeferBlockState(
  newState: DeferBlockState,
  tNode: TNode,
  lContainer: LContainer,
  skipTimerScheduling = false,
): void {
  const hostLView = lContainer[PARENT];
  const hostTView = hostLView[TVIEW];

  // Check if this view is not destroyed. Since the loading process was async,
  // the view might end up being destroyed by the time rendering happens.
  if (isDestroyed(hostLView)) return;

  // Make sure this TNode belongs to TView that represents host LView.
  ngDevMode && assertTNodeForLView(tNode, hostLView);

  const lDetails = getLDeferBlockDetails(hostLView, tNode);

  ngDevMode && assertDefined(lDetails, 'Expected a defer block state defined');

  const currentState = lDetails[DEFER_BLOCK_STATE];

  const ssrState = lDetails[SSR_BLOCK_STATE];
  if (ssrState !== null && newState < ssrState) {
    return; // trying to render a previous state, exit
  }

  if (
    isValidStateChange(currentState, newState) &&
    isValidStateChange(lDetails[NEXT_DEFER_BLOCK_STATE] ?? -1, newState)
  ) {
    const tDetails = getTDeferBlockDetails(hostTView, tNode);
    // Skips scheduling on the server since it can delay the server response.
    const needsScheduling =
      !skipTimerScheduling &&
      (typeof ngServerMode === 'undefined' || !ngServerMode) &&
      (getLoadingBlockAfter(tDetails) !== null ||
        getMinimumDurationForState(tDetails, DeferBlockState.Loading) !== null ||
        getMinimumDurationForState(tDetails, DeferBlockState.Placeholder));

    if (ngDevMode && needsScheduling) {
      assertDefined(
        applyDeferBlockStateWithSchedulingImpl,
        'Expected scheduling function to be defined',
      );
    }

    const applyStateFn = needsScheduling
      ? applyDeferBlockStateWithSchedulingImpl!
      : applyDeferBlockState;
    try {
      applyStateFn(newState, lDetails, lContainer, tNode, hostLView);
    } catch (error: unknown) {
      handleUncaughtError(hostLView, error);
    }
  }
}

function findMatchingDehydratedViewForDeferBlock(
  lContainer: LContainer,
  lDetails: LDeferBlockDetails,
): {dehydratedView: DehydratedContainerView | null; dehydratedViewIx: number} {
  const dehydratedViewIx =
    lContainer[DEHYDRATED_VIEWS]?.findIndex(
      (view: any) => view.data[SERIALIZED_DEFER_BLOCK_STATE] === lDetails[DEFER_BLOCK_STATE],
    ) ?? -1;
  const dehydratedView =
    dehydratedViewIx > -1 ? lContainer[DEHYDRATED_VIEWS]![dehydratedViewIx] : null;
  return {dehydratedView, dehydratedViewIx};
}

/**
 * Applies changes to the DOM to reflect a given state.
 */
function applyDeferBlockState(
  newState: DeferBlockState,
  lDetails: LDeferBlockDetails,
  lContainer: LContainer,
  tNode: TNode,
  hostLView: LView<unknown>,
) {
  profiler(ProfilerEvent.DeferBlockStateStart);

  const stateTmplIndex = getTemplateIndexForState(newState, hostLView, tNode);

  if (stateTmplIndex !== null) {
    lDetails[DEFER_BLOCK_STATE] = newState;
    const hostTView = hostLView[TVIEW];
    const adjustedIndex = stateTmplIndex + HEADER_OFFSET;

    // The TNode that represents a template that will activated in the defer block
    const activeBlockTNode = getTNode(hostTView, adjustedIndex) as TContainerNode;

    // There is only 1 view that can be present in an LContainer that
    // represents a defer block, so always refer to the first one.
    const viewIndex = 0;

    removeLViewFromLContainer(lContainer, viewIndex);

    let injector: Injector | undefined;
    if (newState === DeferBlockState.Complete) {
      // When we render a defer block in completed state, there might be
      // newly loaded standalone components used within the block, which may
      // import NgModules with providers. In order to make those providers
      // available for components declared in that NgModule, we create an instance
      // of an environment injector to host those providers and pass this injector
      // to the logic that creates a view.
      const tDetails = getTDeferBlockDetails(hostTView, tNode);
      const providers = tDetails.providers;
      if (providers && providers.length > 0) {
        injector = createDeferBlockInjector(hostLView[INJECTOR], tDetails, providers);
      }
    }
    const {dehydratedView, dehydratedViewIx} = findMatchingDehydratedViewForDeferBlock(
      lContainer,
      lDetails,
    );

    const embeddedLView = createAndRenderEmbeddedLView(hostLView, activeBlockTNode, null, {
      injector,
      dehydratedView,
    });
    addLViewToLContainer(
      lContainer,
      embeddedLView,
      viewIndex,
      shouldAddViewToDom(activeBlockTNode, dehydratedView),
    );
    markViewDirty(embeddedLView, NotificationSource.DeferBlockStateUpdate);

    if (dehydratedViewIx > -1) {
      // Erase dehydrated view info in a given LContainer, so that the view is not
      // removed later by post-hydration cleanup process (which iterates over all
      // dehydrated views in component tree). This clears only the dehydrated view
      // that was found for this render, which in most cases will be the only view.
      // In the case that there was control flow that changed, there may be either
      // more than one or the views would not match up due to the server rendered
      // content being a different branch of the control flow.
      lContainer[DEHYDRATED_VIEWS]?.splice(dehydratedViewIx, 1);
    }

    if (
      (newState === DeferBlockState.Complete || newState === DeferBlockState.Error) &&
      Array.isArray(lDetails[ON_COMPLETE_FNS])
    ) {
      for (const callback of lDetails[ON_COMPLETE_FNS]) {
        callback();
      }
      lDetails[ON_COMPLETE_FNS] = null;
    }
  }

  profiler(ProfilerEvent.DeferBlockStateEnd);
}

/**
 * Extends the `applyDeferBlockState` with timer-based scheduling.
 * This function becomes available on a page if there are defer blocks
 * that use `after` or `minimum` parameters in the `@loading` or
 * `@placeholder` blocks.
 */
function applyDeferBlockStateWithScheduling(
  newState: DeferBlockState,
  lDetails: LDeferBlockDetails,
  lContainer: LContainer,
  tNode: TNode,
  hostLView: LView<unknown>,
) {
  const now = Date.now();
  const hostTView = hostLView[TVIEW];
  const tDetails = getTDeferBlockDetails(hostTView, tNode);

  if (lDetails[STATE_IS_FROZEN_UNTIL] === null || lDetails[STATE_IS_FROZEN_UNTIL] <= now) {
    lDetails[STATE_IS_FROZEN_UNTIL] = null;

    const loadingAfter = getLoadingBlockAfter(tDetails);
    const inLoadingAfterPhase = lDetails[LOADING_AFTER_CLEANUP_FN] !== null;
    if (newState === DeferBlockState.Loading && loadingAfter !== null && !inLoadingAfterPhase) {
      // Trying to render loading, but it has an `after` config,
      // so schedule an update action after a timeout.
      lDetails[NEXT_DEFER_BLOCK_STATE] = newState;
      const cleanupFn = scheduleDeferBlockUpdate(
        loadingAfter,
        lDetails,
        tNode,
        lContainer,
        hostLView,
      );
      lDetails[LOADING_AFTER_CLEANUP_FN] = cleanupFn;
    } else {
      // If we transition to a complete or an error state and there is a pending
      // operation to render loading after a timeout - invoke a cleanup operation,
      // which stops the timer.
      if (newState > DeferBlockState.Loading && inLoadingAfterPhase) {
        lDetails[LOADING_AFTER_CLEANUP_FN]!();
        lDetails[LOADING_AFTER_CLEANUP_FN] = null;
        lDetails[NEXT_DEFER_BLOCK_STATE] = null;
      }

      applyDeferBlockState(newState, lDetails, lContainer, tNode, hostLView);

      const duration = getMinimumDurationForState(tDetails, newState);
      if (duration !== null) {
        lDetails[STATE_IS_FROZEN_UNTIL] = now + duration;
        scheduleDeferBlockUpdate(duration, lDetails, tNode, lContainer, hostLView);
      }
    }
  } else {
    // We are still rendering the previous state.
    // Update the `NEXT_DEFER_BLOCK_STATE`, which would be
    // picked up once it's time to transition to the next state.
    lDetails[NEXT_DEFER_BLOCK_STATE] = newState;
  }
}

/**
 * Schedules an update operation after a specified timeout.
 */
function scheduleDeferBlockUpdate(
  timeout: number,
  lDetails: LDeferBlockDetails,
  tNode: TNode,
  lContainer: LContainer,
  hostLView: LView<unknown>,
): VoidFunction {
  const callback = () => {
    const nextState = lDetails[NEXT_DEFER_BLOCK_STATE];
    lDetails[STATE_IS_FROZEN_UNTIL] = null;
    lDetails[NEXT_DEFER_BLOCK_STATE] = null;
    if (nextState !== null) {
      renderDeferBlockState(nextState, tNode, lContainer);
    }
  };
  return scheduleTimerTrigger(timeout, callback, hostLView[INJECTOR]);
}

/**
 * Checks whether we can transition to the next state.
 *
 * We transition to the next state if the previous state was represented
 * with a number that is less than the next state. For example, if the current
 * state is "loading" (represented as `1`), we should not show a placeholder
 * (represented as `0`), but we can show a completed state (represented as `2`)
 * or an error state (represented as `3`).
 */
function isValidStateChange(
  currentState: DeferBlockState | DeferBlockInternalState,
  newState: DeferBlockState,
): boolean {
  return currentState < newState;
}

/** Utility function to render placeholder content (if present) */
export function renderPlaceholder(lView: LView, tNode: TNode) {
  const lContainer = lView[tNode.index];
  ngDevMode && assertLContainer(lContainer);

  renderDeferBlockState(DeferBlockState.Placeholder, tNode, lContainer);
}

/**
 * Subscribes to the "loading" Promise and renders corresponding defer sub-block,
 * based on the loading results.
 *
 * @param lContainer Represents an instance of a defer block.
 * @param tNode Represents defer block info shared across all instances.
 */
export function renderDeferStateAfterResourceLoading(
  tDetails: TDeferBlockDetails,
  tNode: TNode,
  lContainer: LContainer,
) {
  ngDevMode &&
    assertDefined(tDetails.loadingPromise, 'Expected loading Promise to exist on this defer block');

  tDetails.loadingPromise!.then(() => {
    if (tDetails.loadingState === DeferDependenciesLoadingState.COMPLETE) {
      ngDevMode && assertDeferredDependenciesLoaded(tDetails);

      // Everything is loaded, show the primary block content
      renderDeferBlockState(DeferBlockState.Complete, tNode, lContainer);
    } else if (tDetails.loadingState === DeferDependenciesLoadingState.FAILED) {
      renderDeferBlockState(DeferBlockState.Error, tNode, lContainer);
    }
  });
}

/**
 * Reference to the timer-based scheduler implementation of defer block state
 * rendering method. It's used to make timer-based scheduling tree-shakable.
 * If `minimum` or `after` parameters are used, compiler generates an extra
 * argument for the `ɵɵdefer` instruction, which references a timer-based
 * implementation.
 */
let applyDeferBlockStateWithSchedulingImpl: typeof applyDeferBlockState | null = null;

/**
 * Enables timer-related scheduling if `after` or `minimum` parameters are setup
 * on the `@loading` or `@placeholder` blocks.
 */
export function ɵɵdeferEnableTimerScheduling(
  tView: TView,
  tDetails: TDeferBlockDetails,
  placeholderConfigIndex?: number | null,
  loadingConfigIndex?: number | null,
) {
  const tViewConsts = tView.consts;
  if (placeholderConfigIndex != null) {
    tDetails.placeholderBlockConfig = getConstant<DeferredPlaceholderBlockConfig>(
      tViewConsts,
      placeholderConfigIndex,
    );
  }
  if (loadingConfigIndex != null) {
    tDetails.loadingBlockConfig = getConstant<DeferredLoadingBlockConfig>(
      tViewConsts,
      loadingConfigIndex,
    );
  }

  // Enable implementation that supports timer-based scheduling.
  if (applyDeferBlockStateWithSchedulingImpl === null) {
    applyDeferBlockStateWithSchedulingImpl = applyDeferBlockStateWithScheduling;
  }
}
