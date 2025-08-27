/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  consumerAfterComputation,
  consumerBeforeComputation,
  consumerDestroy,
  consumerPollProducersForChange,
  getActiveConsumer,
  ReactiveNode,
  setActiveConsumer,
} from '../../../primitives/signals';

import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {assertDefined, assertEqual} from '../../util/assert';
import {addAfterRenderSequencesForView} from '../after_render/view';
import {executeCheckHooks, executeInitAndCheckHooks, incrementInitPhaseFlags} from '../hooks';
import {CONTAINER_HEADER_OFFSET, LContainerFlags, MOVED_VIEWS} from '../interfaces/container';
import {ComponentTemplate, HostBindingsFunction, RenderFlags} from '../interfaces/definition';
import {
  CONTEXT,
  EFFECTS_TO_SCHEDULE,
  ENTER_ANIMATIONS,
  ENVIRONMENT,
  FLAGS,
  InitPhaseState,
  LView,
  LViewFlags,
  REACTIVE_TEMPLATE_CONSUMER,
  TVIEW,
  TView,
} from '../interfaces/view';
import {
  getOrBorrowReactiveLViewConsumer,
  getOrCreateTemporaryConsumer,
  maybeReturnReactiveLViewConsumer,
  ReactiveLViewConsumer,
  viewShouldHaveReactiveConsumer,
} from '../reactive_lview_consumer';
import {
  CheckNoChangesMode,
  enterView,
  isExhaustiveCheckNoChanges,
  isInCheckNoChangesMode,
  isRefreshingViews,
  leaveView,
  setBindingIndex,
  setBindingRootForHostBindings,
  setIsInCheckNoChangesMode,
  setIsRefreshingViews,
  setSelectedIndex,
} from '../state';
import {getFirstLContainer, getNextLContainer} from '../util/view_traversal_utils';
import {
  getComponentLViewByIndex,
  isCreationMode,
  markAncestorsForTraversal,
  markViewForRefresh,
  requiresRefreshOrTraversal,
  resetPreOrderHookFlags,
  viewAttachedToChangeDetector,
} from '../util/view_utils';

import {isDestroyed} from '../interfaces/type_checks';
import {profiler} from '../profiler';
import {ProfilerEvent} from '../profiler_types';
import {executeViewQueryFn, refreshContentQueries} from '../queries/query_execution';
import {runEffectsInView} from '../reactivity/view_effect_runner';
import {executeTemplate} from './shared';

/**
 * The maximum number of times the change detection traversal will rerun before throwing an error.
 */
export const MAXIMUM_REFRESH_RERUNS = 100;

export function detectChangesInternal(lView: LView, mode = ChangeDetectionMode.Global) {
  const environment = lView[ENVIRONMENT];
  const rendererFactory = environment.rendererFactory;

  // Check no changes mode is a dev only mode used to verify that bindings have not changed
  // since they were assigned. We do not want to invoke renderer factory functions in that mode
  // to avoid any possible side-effects.
  const checkNoChangesMode = !!ngDevMode && isInCheckNoChangesMode();

  if (!checkNoChangesMode) {
    rendererFactory.begin?.();
  }

  try {
    detectChangesInViewWhileDirty(lView, mode);
  } finally {
    if (!checkNoChangesMode) {
      rendererFactory.end?.();
    }
  }
}

function detectChangesInViewWhileDirty(lView: LView, mode: ChangeDetectionMode) {
  const lastIsRefreshingViewsValue = isRefreshingViews();
  try {
    setIsRefreshingViews(true);
    detectChangesInView(lView, mode);

    // We don't need or want to do any looping when in exhaustive checkNoChanges because we
    // already traverse all the views and nothing should change so we shouldn't have to do
    // another pass to pick up new changes.
    if (ngDevMode && isExhaustiveCheckNoChanges()) {
      return;
    }

    let retries = 0;
    // If after running change detection, this view still needs to be refreshed or there are
    // descendants views that need to be refreshed due to re-dirtying during the change detection
    // run, detect changes on the view again. We run change detection in `Targeted` mode to only
    // refresh views with the `RefreshView` flag.
    while (requiresRefreshOrTraversal(lView)) {
      if (retries === MAXIMUM_REFRESH_RERUNS) {
        throw new RuntimeError(
          RuntimeErrorCode.INFINITE_CHANGE_DETECTION,
          ngDevMode &&
            'Infinite change detection while trying to refresh views. ' +
              'There may be components which each cause the other to require a refresh, ' +
              'causing an infinite loop.',
        );
      }
      retries++;
      // Even if this view is detached, we still detect changes in targeted mode because this was
      // the root of the change detection run.
      detectChangesInView(lView, ChangeDetectionMode.Targeted);
    }
  } finally {
    // restore state to what it was before entering this change detection loop
    setIsRefreshingViews(lastIsRefreshingViewsValue);
  }
}

export function checkNoChangesInternal(lView: LView, exhaustive: boolean) {
  setIsInCheckNoChangesMode(
    exhaustive ? CheckNoChangesMode.Exhaustive : CheckNoChangesMode.OnlyDirtyViews,
  );
  try {
    detectChangesInternal(lView);
  } finally {
    setIsInCheckNoChangesMode(CheckNoChangesMode.Off);
  }
}

/**
 * Different modes of traversing the logical view tree during change detection.
 *
 *
 * The change detection traversal algorithm switches between these modes based on various
 * conditions.
 */
export const enum ChangeDetectionMode {
  /**
   * In `Global` mode, `Dirty` and `CheckAlways` views are refreshed as well as views with the
   * `RefreshView` flag.
   */
  Global,
  /**
   * In `Targeted` mode, only views with the `RefreshView` flag or updated signals are refreshed.
   */
  Targeted,
}

/**
 * Processes a view in update mode. This includes a number of steps in a specific order:
 * - executing a template function in update mode;
 * - executing hooks;
 * - refreshing queries;
 * - setting host bindings;
 * - refreshing child (embedded and component) views.
 */

export function refreshView<T>(
  tView: TView,
  lView: LView,
  templateFn: ComponentTemplate<{}> | null,
  context: T,
) {
  ngDevMode && assertEqual(isCreationMode(lView), false, 'Should be run in update mode');

  if (isDestroyed(lView)) return;

  const flags = lView[FLAGS];

  // Check no changes mode is a dev only mode used to verify that bindings have not changed
  // since they were assigned. We do not want to execute lifecycle hooks in that mode.
  const isInCheckNoChangesPass = ngDevMode && isInCheckNoChangesMode();
  const isInExhaustiveCheckNoChangesPass = ngDevMode && isExhaustiveCheckNoChanges();

  // Start component reactive context
  // - We might already be in a reactive context if this is an embedded view of the host.
  // - We might be descending into a view that needs a consumer.
  enterView(lView);
  let returnConsumerToPool = true;
  let prevConsumer: ReactiveNode | null = null;
  let currentConsumer: ReactiveLViewConsumer | null = null;
  if (!isInCheckNoChangesPass) {
    if (viewShouldHaveReactiveConsumer(tView)) {
      currentConsumer = getOrBorrowReactiveLViewConsumer(lView);
      prevConsumer = consumerBeforeComputation(currentConsumer);
    } else if (getActiveConsumer() === null) {
      // If the current view should not have a reactive consumer but we don't have an active consumer,
      // we still need to create a temporary consumer to track any signal reads in this template.
      // This is a rare case that can happen with
      // - `viewContainerRef.createEmbeddedView(...).detectChanges()`.
      // - `viewContainerRef.createEmbeddedView(...)` without any other dirty marking on the parent,
      //   flagging the parent component for traversal but not triggering a full `refreshView`.
      // This temporary consumer marks the first parent that _should_ have a consumer for refresh.
      // Once that refresh happens, the signals will be tracked in the parent consumer and we can destroy
      // the temporary one.
      returnConsumerToPool = false;
      currentConsumer = getOrCreateTemporaryConsumer(lView);
      prevConsumer = consumerBeforeComputation(currentConsumer);
    } else if (lView[REACTIVE_TEMPLATE_CONSUMER]) {
      consumerDestroy(lView[REACTIVE_TEMPLATE_CONSUMER]);
      lView[REACTIVE_TEMPLATE_CONSUMER] = null;
    }
  }

  try {
    resetPreOrderHookFlags(lView);

    setBindingIndex(tView.bindingStartIndex);
    if (templateFn !== null) {
      executeTemplate(tView, lView, templateFn, RenderFlags.Update, context);
    }

    const hooksInitPhaseCompleted =
      (flags & LViewFlags.InitPhaseStateMask) === InitPhaseState.InitPhaseCompleted;

    // execute pre-order hooks (OnInit, OnChanges, DoCheck)
    // PERF WARNING: do NOT extract this to a separate function without running benchmarks
    if (!isInCheckNoChangesPass) {
      if (hooksInitPhaseCompleted) {
        const preOrderCheckHooks = tView.preOrderCheckHooks;
        if (preOrderCheckHooks !== null) {
          executeCheckHooks(lView, preOrderCheckHooks, null);
        }
      } else {
        const preOrderHooks = tView.preOrderHooks;
        if (preOrderHooks !== null) {
          executeInitAndCheckHooks(lView, preOrderHooks, InitPhaseState.OnInitHooksToBeRun, null);
        }
        incrementInitPhaseFlags(lView, InitPhaseState.OnInitHooksToBeRun);
      }
    }

    // We do not need to mark transplanted views for refresh when doing exhaustive checks
    // because all views will be reached anyways during the traversal.
    if (!isInExhaustiveCheckNoChangesPass) {
      // First mark transplanted views that are declared in this lView as needing a refresh at their
      // insertion points. This is needed to avoid the situation where the template is defined in this
      // `LView` but its declaration appears after the insertion component.
      markTransplantedViewsForRefresh(lView);
    }
    runEnterAnimations(lView);
    runEffectsInView(lView);
    detectChangesInEmbeddedViews(lView, ChangeDetectionMode.Global);

    // Content query results must be refreshed before content hooks are called.
    if (tView.contentQueries !== null) {
      refreshContentQueries(tView, lView);
    }

    // execute content hooks (AfterContentInit, AfterContentChecked)
    // PERF WARNING: do NOT extract this to a separate function without running benchmarks
    if (!isInCheckNoChangesPass) {
      if (hooksInitPhaseCompleted) {
        const contentCheckHooks = tView.contentCheckHooks;
        if (contentCheckHooks !== null) {
          executeCheckHooks(lView, contentCheckHooks);
        }
      } else {
        const contentHooks = tView.contentHooks;
        if (contentHooks !== null) {
          executeInitAndCheckHooks(
            lView,
            contentHooks,
            InitPhaseState.AfterContentInitHooksToBeRun,
          );
        }
        incrementInitPhaseFlags(lView, InitPhaseState.AfterContentInitHooksToBeRun);
      }
    }

    processHostBindingOpCodes(tView, lView);

    // Refresh child component views.
    const components = tView.components;
    if (components !== null) {
      detectChangesInChildComponents(lView, components, ChangeDetectionMode.Global);
    }

    // View queries must execute after refreshing child components because a template in this view
    // could be inserted in a child component. If the view query executes before child component
    // refresh, the template might not yet be inserted.
    const viewQuery = tView.viewQuery;
    if (viewQuery !== null) {
      executeViewQueryFn<T>(RenderFlags.Update, viewQuery, context);
    }

    // execute view hooks (AfterViewInit, AfterViewChecked)
    // PERF WARNING: do NOT extract this to a separate function without running benchmarks
    if (!isInCheckNoChangesPass) {
      if (hooksInitPhaseCompleted) {
        const viewCheckHooks = tView.viewCheckHooks;
        if (viewCheckHooks !== null) {
          executeCheckHooks(lView, viewCheckHooks);
        }
      } else {
        const viewHooks = tView.viewHooks;
        if (viewHooks !== null) {
          executeInitAndCheckHooks(lView, viewHooks, InitPhaseState.AfterViewInitHooksToBeRun);
        }
        incrementInitPhaseFlags(lView, InitPhaseState.AfterViewInitHooksToBeRun);
      }
    }
    if (tView.firstUpdatePass === true) {
      // We need to make sure that we only flip the flag on successful `refreshView` only
      // Don't do this in `finally` block.
      // If we did this in `finally` block then an exception could block the execution of styling
      // instructions which in turn would be unable to insert themselves into the styling linked
      // list. The result of this would be that if the exception would not be throw on subsequent CD
      // the styling would be unable to process it data and reflect to the DOM.
      tView.firstUpdatePass = false;
    }

    // Schedule any effects that are waiting on the update pass of this view.
    if (lView[EFFECTS_TO_SCHEDULE]) {
      for (const notifyEffect of lView[EFFECTS_TO_SCHEDULE]) {
        notifyEffect();
      }

      // Once they've been run, we can drop the array.
      lView[EFFECTS_TO_SCHEDULE] = null;
    }

    // Do not reset the dirty state when running in check no changes mode. We don't want components
    // to behave differently depending on whether check no changes is enabled or not. For example:
    // Marking an OnPush component as dirty from within the `ngAfterViewInit` hook in order to
    // refresh a `NgClass` binding should work. If we would reset the dirty state in the check
    // no changes cycle, the component would be not be dirty for the next update pass. This would
    // be different in production mode where the component dirty state is not reset.
    if (!isInCheckNoChangesPass) {
      addAfterRenderSequencesForView(lView);

      lView[FLAGS] &= ~(LViewFlags.Dirty | LViewFlags.FirstLViewPass);
    }
  } catch (e) {
    if (!isInCheckNoChangesPass) {
      // If refreshing a view causes an error, we need to remark the ancestors as needing traversal
      // because the error might have caused a situation where views below the current location are
      // dirty but will be unreachable because the "has dirty children" flag in the ancestors has been
      // cleared during change detection and we failed to run to completion.
      markAncestorsForTraversal(lView);
    }
    throw e;
  } finally {
    if (currentConsumer !== null) {
      consumerAfterComputation(currentConsumer, prevConsumer);
      if (returnConsumerToPool) {
        maybeReturnReactiveLViewConsumer(currentConsumer);
      }
    }
    leaveView();
  }
}

function runEnterAnimations(lView: LView) {
  if (lView[ENTER_ANIMATIONS]) {
    for (let animateFn of lView[ENTER_ANIMATIONS]) {
      animateFn();
    }
    lView[ENTER_ANIMATIONS] = null;
  }
}

/**
 * Goes over embedded views (ones created through ViewContainerRef APIs) and refreshes
 * them by executing an associated template function.
 */
function detectChangesInEmbeddedViews(lView: LView, mode: ChangeDetectionMode) {
  for (
    let lContainer = getFirstLContainer(lView);
    lContainer !== null;
    lContainer = getNextLContainer(lContainer)
  ) {
    for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
      const embeddedLView = lContainer[i];
      detectChangesInViewIfAttached(embeddedLView, mode);
    }
  }
}

/**
 * Mark transplanted views as needing to be refreshed at their attachment points.
 *
 * @param lView The `LView` that may have transplanted views.
 */
function markTransplantedViewsForRefresh(lView: LView) {
  for (
    let lContainer = getFirstLContainer(lView);
    lContainer !== null;
    lContainer = getNextLContainer(lContainer)
  ) {
    if (!(lContainer[FLAGS] & LContainerFlags.HasTransplantedViews)) continue;

    const movedViews = lContainer[MOVED_VIEWS]!;
    ngDevMode && assertDefined(movedViews, 'Transplanted View flags set but missing MOVED_VIEWS');
    for (let i = 0; i < movedViews.length; i++) {
      const movedLView = movedViews[i]!;
      markViewForRefresh(movedLView);
    }
  }
}

/**
 * Detects changes in a component by entering the component view and processing its bindings,
 * queries, etc. if it is CheckAlways, OnPush and Dirty, etc.
 *
 * @param componentHostIdx  Element index in LView[] (adjusted for HEADER_OFFSET)
 */
function detectChangesInComponent(
  hostLView: LView,
  componentHostIdx: number,
  mode: ChangeDetectionMode,
): void {
  ngDevMode && assertEqual(isCreationMode(hostLView), false, 'Should be run in update mode');
  profiler(ProfilerEvent.ComponentStart);

  const componentView = getComponentLViewByIndex(componentHostIdx, hostLView);
  detectChangesInViewIfAttached(componentView, mode);

  profiler(ProfilerEvent.ComponentEnd, componentView[CONTEXT] as any as {});
}

/**
 * Visits a view as part of change detection traversal.
 *
 * If the view is detached, no additional traversal happens.
 */
function detectChangesInViewIfAttached(lView: LView, mode: ChangeDetectionMode) {
  if (!viewAttachedToChangeDetector(lView)) {
    return;
  }
  detectChangesInView(lView, mode);
}

/**
 * Visits a view as part of change detection traversal.
 *
 * The view is refreshed if:
 * - If the view is CheckAlways or Dirty and ChangeDetectionMode is `Global`
 * - If the view has the `RefreshView` flag
 *
 * The view is not refreshed, but descendants are traversed in `ChangeDetectionMode.Targeted` if the
 * view HasChildViewsToRefresh flag is set.
 */
function detectChangesInView(lView: LView, mode: ChangeDetectionMode) {
  const isInCheckNoChangesPass = ngDevMode && isInCheckNoChangesMode();
  const tView = lView[TVIEW];
  const flags = lView[FLAGS];
  const consumer = lView[REACTIVE_TEMPLATE_CONSUMER];

  // Refresh CheckAlways views in Global mode.
  let shouldRefreshView: boolean = !!(
    mode === ChangeDetectionMode.Global && flags & LViewFlags.CheckAlways
  );

  // Refresh Dirty views in Global mode, as long as we're not in checkNoChanges.
  // CheckNoChanges never worked with `OnPush` components because the `Dirty` flag was
  // cleared before checkNoChanges ran. Because there is now a loop for to check for
  // backwards views, it gives an opportunity for `OnPush` components to be marked `Dirty`
  // before the CheckNoChanges pass. We don't want existing errors that are hidden by the
  // current CheckNoChanges bug to surface when making unrelated changes.
  shouldRefreshView ||= !!(
    flags & LViewFlags.Dirty &&
    mode === ChangeDetectionMode.Global &&
    !isInCheckNoChangesPass
  );

  // Always refresh views marked for refresh, regardless of mode.
  shouldRefreshView ||= !!(flags & LViewFlags.RefreshView);

  // Refresh views when they have a dirty reactive consumer, regardless of mode.
  shouldRefreshView ||= !!(consumer?.dirty && consumerPollProducersForChange(consumer));

  shouldRefreshView ||= !!(ngDevMode && isExhaustiveCheckNoChanges());

  // Mark the Flags and `ReactiveNode` as not dirty before refreshing the component, so that they
  // can be re-dirtied during the refresh process.
  if (consumer) {
    consumer.dirty = false;
  }
  lView[FLAGS] &= ~(LViewFlags.HasChildViewsToRefresh | LViewFlags.RefreshView);

  if (shouldRefreshView) {
    refreshView(tView, lView, tView.template, lView[CONTEXT]);
  } else if (flags & LViewFlags.HasChildViewsToRefresh) {
    // Set active consumer to null to avoid inheriting an improper reactive context
    const prevConsumer = setActiveConsumer(null);
    try {
      if (!isInCheckNoChangesPass) {
        runEffectsInView(lView);
      }
      detectChangesInEmbeddedViews(lView, ChangeDetectionMode.Targeted);
      const components = tView.components;
      if (components !== null) {
        detectChangesInChildComponents(lView, components, ChangeDetectionMode.Targeted);
      }
      if (!isInCheckNoChangesPass) {
        addAfterRenderSequencesForView(lView);
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}

/** Refreshes child components in the current view (update mode). */
function detectChangesInChildComponents(
  hostLView: LView,
  components: number[],
  mode: ChangeDetectionMode,
): void {
  for (let i = 0; i < components.length; i++) {
    detectChangesInComponent(hostLView, components[i], mode);
  }
}

/**
 * Invoke `HostBindingsFunction`s for view.
 *
 * This methods executes `TView.hostBindingOpCodes`. It is used to execute the
 * `HostBindingsFunction`s associated with the current `LView`.
 *
 * @param tView Current `TView`.
 * @param lView Current `LView`.
 */
function processHostBindingOpCodes(tView: TView, lView: LView): void {
  const hostBindingOpCodes = tView.hostBindingOpCodes;
  if (hostBindingOpCodes === null) return;
  try {
    for (let i = 0; i < hostBindingOpCodes.length; i++) {
      const opCode = hostBindingOpCodes[i] as number;
      if (opCode < 0) {
        // Negative numbers are element indexes.
        setSelectedIndex(~opCode);
      } else {
        // Positive numbers are NumberTuple which store bindingRootIndex and directiveIndex.
        const directiveIdx = opCode;
        const bindingRootIndx = hostBindingOpCodes[++i] as number;
        const hostBindingFn = hostBindingOpCodes[++i] as HostBindingsFunction<any>;
        setBindingRootForHostBindings(bindingRootIndx, directiveIdx);
        const context = lView[directiveIdx];
        profiler(ProfilerEvent.HostBindingsUpdateStart, context);
        hostBindingFn(RenderFlags.Update, context);
        profiler(ProfilerEvent.HostBindingsUpdateEnd, context);
      }
    }
  } finally {
    setSelectedIndex(-1);
  }
}
