/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, InjectionToken, Injector, ɵɵdefineInjectable} from '../../di';
import {findMatchingDehydratedView} from '../../hydration/views';
import {populateDehydratedViewsInLContainer} from '../../linker/view_container_ref';
import {arrayInsert2, arraySplice} from '../../util/array_utils';
import {assertDefined, assertElement, assertEqual, throwError} from '../../util/assert';
import {NgZone} from '../../zone';
import {afterRender} from '../after_render_hooks';
import {assertIndexInDeclRange, assertLContainer, assertLView, assertTNodeForLView} from '../assert';
import {bindingUpdated} from '../bindings';
import {getComponentDef, getDirectiveDef, getPipeDef} from '../definition';
import {CONTAINER_HEADER_OFFSET, LContainer} from '../interfaces/container';
import {DEFER_BLOCK_STATE, DeferBlockBehavior, DeferBlockConfig, DeferBlockInternalState, DeferBlockState, DeferBlockTriggers, DeferDependenciesLoadingState, DeferredLoadingBlockConfig, DeferredPlaceholderBlockConfig, DependencyResolverFn, LDeferBlockDetails, LOADING_AFTER_CLEANUP_FN, LOADING_AFTER_SLOT, MINIMUM_SLOT, NEXT_DEFER_BLOCK_STATE, STATE_IS_FROZEN_UNTIL, TDeferBlockDetails} from '../interfaces/defer';
import {DependencyDef, DirectiveDefList, PipeDefList} from '../interfaces/definition';
import {TContainerNode, TNode} from '../interfaces/node';
import {isDestroyed, isLContainer, isLView} from '../interfaces/type_checks';
import {FLAGS, HEADER_OFFSET, INJECTOR, LView, LViewFlags, PARENT, TVIEW, TView} from '../interfaces/view';
import {getCurrentTNode, getLView, getSelectedTNode, getTView, nextBindingIndex} from '../state';
import {isPlatformBrowser} from '../util/misc_utils';
import {getConstant, getNativeByIndex, getTNode, removeLViewOnDestroy, storeLViewOnDestroy, walkUpViews} from '../util/view_utils';
import {addLViewToLContainer, createAndRenderEmbeddedLView, removeLViewFromLContainer, shouldAddViewToDom} from '../view_manipulation';

import {onHover, onInteraction, onViewport} from './defer_events';
import {markViewDirty} from './mark_view_dirty';
import {ɵɵtemplate} from './template';

/**
 * Returns whether defer blocks should be triggered.
 *
 * Currently, defer blocks are not triggered on the server,
 * only placeholder content is rendered (if provided).
 */
function shouldTriggerDeferBlock(injector: Injector): boolean {
  const config = injector.get(DEFER_BLOCK_CONFIG, null, {optional: true});
  if (config?.behavior === DeferBlockBehavior.Manual) {
    return false;
  }
  return isPlatformBrowser(injector);
}

/**
 * Reference to the timer-based scheduler implementation of defer block state
 * rendering method. It's used to make timer-based scheduling tree-shakable.
 * If `minimum` or `after` parameters are used, compiler generates an extra
 * argument for the `ɵɵdefer` instruction, which references a timer-based
 * implementation.
 */
let applyDeferBlockStateWithSchedulingImpl: (typeof applyDeferBlockState)|null = null;

/**
 * Enables timer-related scheduling if `after` or `minimum` parameters are setup
 * on the `@loading` or `@placeholder` blocks.
 */
export function ɵɵdeferEnableTimerScheduling(
    tView: TView, tDetails: TDeferBlockDetails, placeholderConfigIndex?: number|null,
    loadingConfigIndex?: number|null) {
  const tViewConsts = tView.consts;
  if (placeholderConfigIndex != null) {
    tDetails.placeholderBlockConfig =
        getConstant<DeferredPlaceholderBlockConfig>(tViewConsts, placeholderConfigIndex);
  }
  if (loadingConfigIndex != null) {
    tDetails.loadingBlockConfig =
        getConstant<DeferredLoadingBlockConfig>(tViewConsts, loadingConfigIndex);
  }

  // Enable implementation that supports timer-based scheduling.
  if (applyDeferBlockStateWithSchedulingImpl === null) {
    applyDeferBlockStateWithSchedulingImpl = applyDeferBlockStateWithScheduling;
  }
}

/**
 * Creates runtime data structures for defer blocks.
 *
 * @param index Index of the `defer` instruction.
 * @param primaryTmplIndex Index of the template with the primary block content.
 * @param dependencyResolverFn Function that contains dependencies for this defer block.
 * @param loadingTmplIndex Index of the template with the loading block content.
 * @param placeholderTmplIndex Index of the template with the placeholder block content.
 * @param errorTmplIndex Index of the template with the error block content.
 * @param loadingConfigIndex Index in the constants array of the configuration of the loading.
 *     block.
 * @param placeholderConfigIndex Index in the constants array of the configuration of the
 *     placeholder block.
 * @param enableTimerScheduling Function that enables timer-related scheduling if `after`
 *     or `minimum` parameters are setup on the `@loading` or `@placeholder` blocks.
 *
 * @codeGenApi
 */
export function ɵɵdefer(
    index: number, primaryTmplIndex: number, dependencyResolverFn?: DependencyResolverFn|null,
    loadingTmplIndex?: number|null, placeholderTmplIndex?: number|null,
    errorTmplIndex?: number|null, loadingConfigIndex?: number|null,
    placeholderConfigIndex?: number|null,
    enableTimerScheduling?: typeof ɵɵdeferEnableTimerScheduling) {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;

  ɵɵtemplate(index, null, 0, 0);

  if (tView.firstCreatePass) {
    const tDetails: TDeferBlockDetails = {
      primaryTmplIndex,
      loadingTmplIndex: loadingTmplIndex ?? null,
      placeholderTmplIndex: placeholderTmplIndex ?? null,
      errorTmplIndex: errorTmplIndex ?? null,
      placeholderBlockConfig: null,
      loadingBlockConfig: null,
      dependencyResolverFn: dependencyResolverFn ?? null,
      loadingState: DeferDependenciesLoadingState.NOT_STARTED,
      loadingPromise: null,
    };
    enableTimerScheduling?.(tView, tDetails, placeholderConfigIndex, loadingConfigIndex);
    setTDeferBlockDetails(tView, adjustedIndex, tDetails);
  }

  const tNode = getCurrentTNode()!;
  const lContainer = lView[adjustedIndex];

  // If hydration is enabled, looks up dehydrated views in the DOM
  // using hydration annotation info and stores those views on LContainer.
  // In client-only mode, this function is a noop.
  populateDehydratedViewsInLContainer(lContainer, tNode, lView);

  // Init instance-specific defer details and store it.
  const lDetails: LDeferBlockDetails = [
    null,                             // NEXT_DEFER_BLOCK_STATE
    DeferBlockInternalState.Initial,  // DEFER_BLOCK_STATE
    null,                             // STATE_IS_FROZEN_UNTIL
    null                              // LOADING_AFTER_CLEANUP_FN
  ];
  setLDeferBlockDetails(lView, adjustedIndex, lDetails);
}

/**
 * Loads defer block dependencies when a trigger value becomes truthy.
 * @codeGenApi
 */
export function ɵɵdeferWhen(rawValue: unknown) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, rawValue)) {
    const value = Boolean(rawValue);  // handle truthy or falsy values
    const tNode = getSelectedTNode();
    const lDetails = getLDeferBlockDetails(lView, tNode);
    const renderedState = lDetails[DEFER_BLOCK_STATE];
    if (value === false && renderedState === DeferBlockInternalState.Initial) {
      // If nothing is rendered yet, render a placeholder (if defined).
      renderPlaceholder(lView, tNode);
    } else if (
        value === true &&
        (renderedState === DeferBlockInternalState.Initial ||
         renderedState === DeferBlockState.Placeholder)) {
      // The `when` condition has changed to `true`, trigger defer block loading
      // if the block is either in initial (nothing is rendered) or a placeholder
      // state.
      triggerDeferBlock(lView, tNode);
    }
  }
}

/**
 * Prefetches the deferred content when a value becomes truthy.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchWhen(rawValue: unknown) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();

  if (bindingUpdated(lView, bindingIndex, rawValue)) {
    const value = Boolean(rawValue);  // handle truthy or falsy values
    const tView = lView[TVIEW];
    const tNode = getSelectedTNode();
    const tDetails = getTDeferBlockDetails(tView, tNode);
    if (value === true && tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
      // If loading has not been started yet, trigger it now.
      triggerPrefetching(tDetails, lView);
    }
  }
}

/**
 * Sets up logic to handle the `on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnIdle() {
  scheduleDelayedTrigger(onIdle);
}

/**
 * Sets up logic to handle the `prefetch on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnIdle() {
  scheduleDelayedPrefetching(onIdle, DeferBlockTriggers.OnIdle);
}

/**
 * Sets up logic to handle the `on immediate` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnImmediate() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);

  // Render placeholder block only if loading template is not present
  // to avoid content flickering, since it would be immediately replaced
  // by the loading block.
  if (tDetails.loadingTmplIndex === null) {
    renderPlaceholder(lView, tNode);
  }
  triggerDeferBlock(lView, tNode);
}


/**
 * Sets up logic to handle the `prefetch on immediate` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnImmediate() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);

  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    triggerResourceLoading(tDetails, lView);
  }
}

/**
 * Creates runtime data structures for the `on timer` deferred trigger.
 * @param delay Amount of time to wait before loading the content.
 * @codeGenApi
 */
export function ɵɵdeferOnTimer(delay: number) {
  scheduleDelayedTrigger(onTimer(delay));
}

/**
 * Creates runtime data structures for the `prefetch on timer` deferred trigger.
 * @param delay Amount of time to wait before prefetching the content.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnTimer(delay: number) {
  scheduleDelayedPrefetching(onTimer(delay), DeferBlockTriggers.OnTimer);
}

/**
 * Creates runtime data structures for the `on hover` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnHover(triggerIndex: number, walkUpTimes?: number) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  renderPlaceholder(lView, tNode);
  registerDomTrigger(
      lView, tNode, triggerIndex, walkUpTimes, onHover, () => triggerDeferBlock(lView, tNode));
}

/**
 * Creates runtime data structures for the `prefetch on hover` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnHover(triggerIndex: number, walkUpTimes?: number) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);

  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    registerDomTrigger(
        lView, tNode, triggerIndex, walkUpTimes, onHover,
        () => triggerPrefetching(tDetails, lView));
  }
}

/**
 * Creates runtime data structures for the `on interaction` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnInteraction(triggerIndex: number, walkUpTimes?: number) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  renderPlaceholder(lView, tNode);
  registerDomTrigger(
      lView, tNode, triggerIndex, walkUpTimes, onInteraction,
      () => triggerDeferBlock(lView, tNode));
}

/**
 * Creates runtime data structures for the `prefetch on interaction` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnInteraction(triggerIndex: number, walkUpTimes?: number) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);

  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    registerDomTrigger(
        lView, tNode, triggerIndex, walkUpTimes, onInteraction,
        () => triggerPrefetching(tDetails, lView));
  }
}

/**
 * Creates runtime data structures for the `on viewport` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnViewport(triggerIndex: number, walkUpTimes?: number) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  renderPlaceholder(lView, tNode);
  registerDomTrigger(
      lView, tNode, triggerIndex, walkUpTimes, onViewport, () => triggerDeferBlock(lView, tNode));
}

/**
 * Creates runtime data structures for the `prefetch on viewport` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnViewport(triggerIndex: number, walkUpTimes?: number) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);

  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    registerDomTrigger(
        lView, tNode, triggerIndex, walkUpTimes, onViewport,
        () => triggerPrefetching(tDetails, lView));
  }
}

/********** Helper functions **********/

/**
 * Schedules triggering of a defer block for `on idle` and `on timer` conditions.
 */
function scheduleDelayedTrigger(
    scheduleFn: (callback: VoidFunction, lView: LView, withLViewCleanup: boolean) => VoidFunction) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  renderPlaceholder(lView, tNode);
  scheduleFn(() => triggerDeferBlock(lView, tNode), lView, true /* withLViewCleanup */);
}

/**
 * Schedules prefetching for `on idle` and `on timer` triggers.
 *
 * @param scheduleFn A function that does the scheduling.
 * @param trigger A trigger that initiated scheduling.
 */
function scheduleDelayedPrefetching(
    scheduleFn: (callback: VoidFunction, lView: LView, withLViewCleanup: boolean) => VoidFunction,
    trigger: DeferBlockTriggers) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);

  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    // Prevent scheduling more than one prefetch init call
    // for each defer block. For this reason we use only a trigger
    // identifier in a key, so all instances would use the same key.
    const key = String(trigger);
    const injector = lView[INJECTOR]!;
    const manager = injector.get(DeferBlockCleanupManager);
    if (!manager.has(tDetails, key)) {
      // In case of prefetching, we intentionally avoid cancelling resource loading if
      // an underlying LView get destroyed (thus passing `null` as a second argument),
      // because there might be other LViews (that represent embedded views) that
      // depend on resource loading.
      const prefetch = () => triggerPrefetching(tDetails, lView);
      const cleanupFn = scheduleFn(prefetch, lView, false /* withLViewCleanup */);
      registerTDetailsCleanup(injector, tDetails, key, cleanupFn);
    }
  }
}

/**
 * Helper function to get the LView in which a deferred block's trigger is rendered.
 * @param deferredHostLView LView in which the deferred block is defined.
 * @param deferredTNode TNode defining the deferred block.
 * @param walkUpTimes Number of times to go up in the view hierarchy to find the trigger's view.
 *   A negative value means that the trigger is inside the block's placeholder, while an undefined
 *   value means that the trigger is in the same LView as the deferred block.
 */
function getTriggerLView(
    deferredHostLView: LView, deferredTNode: TNode, walkUpTimes: number|undefined): LView|null {
  // The trigger is in the same view, we don't need to traverse.
  if (walkUpTimes == null) {
    return deferredHostLView;
  }

  // A positive value or zero means that the trigger is in a parent view.
  if (walkUpTimes >= 0) {
    return walkUpViews(walkUpTimes, deferredHostLView);
  }

  // If the value is negative, it means that the trigger is inside the placeholder.
  const deferredContainer = deferredHostLView[deferredTNode.index];
  ngDevMode && assertLContainer(deferredContainer);
  const triggerLView = deferredContainer[CONTAINER_HEADER_OFFSET] ?? null;

  // We need to null check, because the placeholder might not have been rendered yet.
  if (ngDevMode && triggerLView !== null) {
    const lDetails = getLDeferBlockDetails(deferredHostLView, deferredTNode);
    const renderedState = lDetails[DEFER_BLOCK_STATE];
    assertEqual(
        renderedState, DeferBlockState.Placeholder,
        'Expected a placeholder to be rendered in this defer block.');
    assertLView(triggerLView);
  }

  return triggerLView;
}

/**
 * Gets the element that a deferred block's trigger is pointing to.
 * @param triggerLView LView in which the trigger is defined.
 * @param triggerIndex Index at which the trigger element should've been rendered.
 */
function getTriggerElement(triggerLView: LView, triggerIndex: number): Element {
  const element = getNativeByIndex(HEADER_OFFSET + triggerIndex, triggerLView);
  ngDevMode && assertElement(element);
  return element as Element;
}

/**
 * Registers a DOM-node based trigger.
 * @param initialLView LView in which the defer block is rendered.
 * @param tNode TNode representing the defer block.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to go up/down in the view hierarchy to find the trigger.
 * @param registerFn Function that will register the DOM events.
 * @param callback Callback to be invoked when the trigger receives the event that should render
 *     the deferred block.
 */
function registerDomTrigger(
    initialLView: LView, tNode: TNode, triggerIndex: number, walkUpTimes: number|undefined,
    registerFn: (element: Element, callback: VoidFunction, injector: Injector) => VoidFunction,
    callback: VoidFunction) {
  const injector = initialLView[INJECTOR]!;

  // Assumption: the `afterRender` reference should be destroyed
  // automatically so we don't need to keep track of it.
  const afterRenderRef = afterRender(() => {
    const lDetails = getLDeferBlockDetails(initialLView, tNode);
    const renderedState = lDetails[DEFER_BLOCK_STATE];

    // If the block was loaded before the trigger was resolved, we don't need to do anything.
    if (renderedState !== DeferBlockInternalState.Initial &&
        renderedState !== DeferBlockState.Placeholder) {
      afterRenderRef.destroy();
      return;
    }

    const triggerLView = getTriggerLView(initialLView, tNode, walkUpTimes);

    // Keep polling until we resolve the trigger's LView.
    // `afterRender` should stop automatically if the view is destroyed.
    if (!triggerLView) {
      return;
    }

    // It's possible that the trigger's view was destroyed before we resolved the trigger element.
    if (triggerLView[FLAGS] & LViewFlags.Destroyed) {
      afterRenderRef.destroy();
      return;
    }

    // TODO: add integration with `DeferBlockCleanupManager`.
    const element = getTriggerElement(triggerLView, triggerIndex);
    const cleanup = registerFn(element, () => {
      callback();
      removeLViewOnDestroy(triggerLView, cleanup);
      if (initialLView !== triggerLView) {
        removeLViewOnDestroy(initialLView, cleanup);
      }
      cleanup();
    }, injector);

    afterRenderRef.destroy();
    storeLViewOnDestroy(triggerLView, cleanup);

    // Since the trigger and deferred block might be in different
    // views, we have to register the callback in both locations.
    if (initialLView !== triggerLView) {
      storeLViewOnDestroy(initialLView, cleanup);
    }
  }, {injector});
}

/**
 * Helper function to schedule a callback to be invoked when a browser becomes idle.
 *
 * @param callback A function to be invoked when a browser becomes idle.
 * @param lView LView that hosts an instance of a defer block.
 * @param withLViewCleanup A flag that indicates whether a scheduled callback
 *           should be cancelled in case an LView is destroyed before a callback
 *           was invoked.
 */
function onIdle(callback: VoidFunction, lView: LView, withLViewCleanup: boolean) {
  const injector = lView[INJECTOR]!;
  const scheduler = injector.get(OnIdleScheduler);
  const cleanupFn = () => scheduler.remove(callback);
  const wrappedCallback =
      withLViewCleanup ? wrapWithLViewCleanup(callback, lView, cleanupFn) : callback;
  scheduler.add(wrappedCallback);
  return cleanupFn;
}

/**
 * Returns a function that captures a provided delay.
 * Invoking the returned function schedules a trigger.
 */
function onTimer(delay: number) {
  return (callback: VoidFunction, lView: LView, withLViewCleanup: boolean) =>
             scheduleTimerTrigger(delay, callback, lView, withLViewCleanup);
}

/**
 * Schedules a callback to be invoked after a given timeout.
 *
 * @param delay A number of ms to wait until firing a callback.
 * @param callback A function to be invoked after a timeout.
 * @param lView LView that hosts an instance of a defer block.
 * @param withLViewCleanup A flag that indicates whether a scheduled callback
 *           should be cancelled in case an LView is destroyed before a callback
 *           was invoked.
 */
function scheduleTimerTrigger(
    delay: number, callback: VoidFunction, lView: LView, withLViewCleanup: boolean) {
  const injector = lView[INJECTOR]!;
  const scheduler = injector.get(TimerScheduler);
  const cleanupFn = () => scheduler.remove(callback);
  const wrappedCallback =
      withLViewCleanup ? wrapWithLViewCleanup(callback, lView, cleanupFn) : callback;
  scheduler.add(delay, wrappedCallback);
  return cleanupFn;
}

/**
 * Wraps a given callback into a logic that registers a cleanup function
 * in the LView cleanup slot, to be invoked when an LView is destroyed.
 */
function wrapWithLViewCleanup(
    callback: VoidFunction, lView: LView, cleanup: VoidFunction): VoidFunction {
  const wrappedCallback = () => {
    callback();
    removeLViewOnDestroy(lView, cleanup);
  };
  storeLViewOnDestroy(lView, cleanup);
  return wrappedCallback;
}

/**
 * Calculates a data slot index for defer block info (either static or
 * instance-specific), given an index of a defer instruction.
 */
function getDeferBlockDataIndex(deferBlockIndex: number) {
  // Instance state is located at the *next* position
  // after the defer block slot in an LView or TView.data.
  return deferBlockIndex + 1;
}

/** Retrieves a defer block state from an LView, given a TNode that represents a block. */
function getLDeferBlockDetails(lView: LView, tNode: TNode): LDeferBlockDetails {
  const tView = lView[TVIEW];
  const slotIndex = getDeferBlockDataIndex(tNode.index);
  ngDevMode && assertIndexInDeclRange(tView, slotIndex);
  return lView[slotIndex];
}

/** Stores a defer block instance state in LView. */
function setLDeferBlockDetails(
    lView: LView, deferBlockIndex: number, lDetails: LDeferBlockDetails) {
  const tView = lView[TVIEW];
  const slotIndex = getDeferBlockDataIndex(deferBlockIndex);
  ngDevMode && assertIndexInDeclRange(tView, slotIndex);
  lView[slotIndex] = lDetails;
}

/** Retrieves static info about a defer block, given a TView and a TNode that represents a block. */
function getTDeferBlockDetails(tView: TView, tNode: TNode): TDeferBlockDetails {
  const slotIndex = getDeferBlockDataIndex(tNode.index);
  ngDevMode && assertIndexInDeclRange(tView, slotIndex);
  return tView.data[slotIndex] as TDeferBlockDetails;
}

/** Stores a defer block static info in `TView.data`. */
function setTDeferBlockDetails(
    tView: TView, deferBlockIndex: number, deferBlockConfig: TDeferBlockDetails) {
  const slotIndex = getDeferBlockDataIndex(deferBlockIndex);
  ngDevMode && assertIndexInDeclRange(tView, slotIndex);
  tView.data[slotIndex] = deferBlockConfig;
}

function getTemplateIndexForState(
    newState: DeferBlockState, hostLView: LView, tNode: TNode): number|null {
  const tView = hostLView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);

  switch (newState) {
    case DeferBlockState.Complete:
      return tDetails.primaryTmplIndex;
    case DeferBlockState.Loading:
      return tDetails.loadingTmplIndex;
    case DeferBlockState.Error:
      return tDetails.errorTmplIndex;
    case DeferBlockState.Placeholder:
      return tDetails.placeholderTmplIndex;
    default:
      ngDevMode && throwError(`Unexpected defer block state: ${newState}`);
      return null;
  }
}

/**
 * Returns a minimum amount of time that a given state should be rendered for,
 * taking into account `minimum` parameter value. If the `minimum` value is
 * not specified - returns `null`.
 */
function getMinimumDurationForState(
    tDetails: TDeferBlockDetails, currentState: DeferBlockState): number|null {
  if (currentState === DeferBlockState.Placeholder) {
    return tDetails.placeholderBlockConfig?.[MINIMUM_SLOT] ?? null;
  } else if (currentState === DeferBlockState.Loading) {
    return tDetails.loadingBlockConfig?.[MINIMUM_SLOT] ?? null;
  }
  return null;
}

/** Retrieves the value of the `after` parameter on the @loading block. */
function getLoadingBlockAfter(tDetails: TDeferBlockDetails): number|null {
  return tDetails.loadingBlockConfig?.[LOADING_AFTER_SLOT] ?? null;
}

/**
 * Transitions a defer block to the new state. Updates the  necessary
 * data structures and renders corresponding block.
 *
 * @param newState New state that should be applied to the defer block.
 * @param tNode TNode that represents a defer block.
 * @param lContainer Represents an instance of a defer block.
 */
export function renderDeferBlockState(
    newState: DeferBlockState, tNode: TNode, lContainer: LContainer): void {
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

  if (isValidStateChange(currentState, newState) &&
      isValidStateChange(lDetails[NEXT_DEFER_BLOCK_STATE] ?? -1, newState)) {
    const tDetails = getTDeferBlockDetails(hostTView, tNode);
    const needsScheduling = getLoadingBlockAfter(tDetails) !== null ||
        getMinimumDurationForState(tDetails, DeferBlockState.Loading) !== null ||
        getMinimumDurationForState(tDetails, DeferBlockState.Placeholder);

    if (ngDevMode && needsScheduling) {
      assertDefined(
          applyDeferBlockStateWithSchedulingImpl, 'Expected scheduling function to be defined');
    }

    const applyStateFn =
        needsScheduling ? applyDeferBlockStateWithSchedulingImpl! : applyDeferBlockState;
    applyStateFn(newState, lDetails, lContainer, tNode, hostLView);
  }
}

/**
 * Applies changes to the DOM to reflect a given state.
 */
function applyDeferBlockState(
    newState: DeferBlockState, lDetails: LDeferBlockDetails, lContainer: LContainer, tNode: TNode,
    hostLView: LView<unknown>) {
  const stateTmplIndex = getTemplateIndexForState(newState, hostLView, tNode);

  if (stateTmplIndex !== null) {
    lDetails[DEFER_BLOCK_STATE] = newState;
    const hostTView = hostLView[TVIEW];
    const adjustedIndex = stateTmplIndex + HEADER_OFFSET;
    const tNode = getTNode(hostTView, adjustedIndex) as TContainerNode;

    // There is only 1 view that can be present in an LContainer that
    // represents a defer block, so always refer to the first one.
    const viewIndex = 0;

    removeLViewFromLContainer(lContainer, viewIndex);
    const dehydratedView = findMatchingDehydratedView(lContainer, tNode.tView!.ssrId);
    const embeddedLView = createAndRenderEmbeddedLView(hostLView, tNode, null, {dehydratedView});
    addLViewToLContainer(
        lContainer, embeddedLView, viewIndex, shouldAddViewToDom(tNode, dehydratedView));
    markViewDirty(embeddedLView);
  }
}

/**
 * Extends the `applyDeferBlockState` with timer-based scheduling.
 * This function becomes available on a page if there are defer blocks
 * that use `after` or `minimum` parameters in the `@loading` or
 * `@placeholder` blocks.
 */
function applyDeferBlockStateWithScheduling(
    newState: DeferBlockState, lDetails: LDeferBlockDetails, lContainer: LContainer, tNode: TNode,
    hostLView: LView<unknown>) {
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
      const cleanupFn =
          scheduleDeferBlockUpdate(loadingAfter, lDetails, tNode, lContainer, hostLView);
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
    timeout: number, lDetails: LDeferBlockDetails, tNode: TNode, lContainer: LContainer,
    hostLView: LView<unknown>): VoidFunction {
  const callback = () => {
    const nextState = lDetails[NEXT_DEFER_BLOCK_STATE];
    lDetails[STATE_IS_FROZEN_UNTIL] = null;
    lDetails[NEXT_DEFER_BLOCK_STATE] = null;
    if (nextState !== null) {
      renderDeferBlockState(nextState, tNode, lContainer);
    }
  };
  return scheduleTimerTrigger(timeout, callback, hostLView, true);
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
    currentState: DeferBlockState|DeferBlockInternalState, newState: DeferBlockState): boolean {
  return currentState < newState;
}

/**
 * Trigger prefetching of dependencies for a defer block.
 *
 * @param tDetails Static information about this defer block.
 * @param lView LView of a host view.
 */
export function triggerPrefetching(tDetails: TDeferBlockDetails, lView: LView) {
  if (lView[INJECTOR] && shouldTriggerDeferBlock(lView[INJECTOR]!)) {
    triggerResourceLoading(tDetails, lView);
  }
}

/**
 * Trigger loading of defer block dependencies if the process hasn't started yet.
 *
 * @param tDetails Static information about this defer block.
 * @param lView LView of a host view.
 */
export function triggerResourceLoading(tDetails: TDeferBlockDetails, lView: LView) {
  const injector = lView[INJECTOR]!;
  const tView = lView[TVIEW];

  if (tDetails.loadingState !== DeferDependenciesLoadingState.NOT_STARTED) {
    // If the loading status is different from initial one, it means that
    // the loading of dependencies is in progress and there is nothing to do
    // in this function. All details can be obtained from the `tDetails` object.
    return;
  }

  const primaryBlockTNode = getPrimaryBlockTNode(tView, tDetails);

  // Switch from NOT_STARTED -> IN_PROGRESS state.
  tDetails.loadingState = DeferDependenciesLoadingState.IN_PROGRESS;

  // Check if dependency function interceptor is configured.
  const deferDependencyInterceptor =
      injector.get(DEFER_BLOCK_DEPENDENCY_INTERCEPTOR, null, {optional: true});

  const dependenciesFn = deferDependencyInterceptor ?
      deferDependencyInterceptor.intercept(tDetails.dependencyResolverFn) :
      tDetails.dependencyResolverFn;

  // The `dependenciesFn` might be `null` when all dependencies within
  // a given defer block were eagerly references elsewhere in a file,
  // thus no dynamic `import()`s were produced.
  if (!dependenciesFn) {
    tDetails.loadingPromise = Promise.resolve().then(() => {
      tDetails.loadingState = DeferDependenciesLoadingState.COMPLETE;
    });
    return;
  }

  // Defer block may have multiple prefetch triggers. Once the loading
  // starts, invoke all clean functions, since they are no longer needed.
  invokeTDetailsCleanup(injector, tDetails);

  // Start downloading of defer block dependencies.
  tDetails.loadingPromise = Promise.allSettled(dependenciesFn()).then(results => {
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

    // Loading is completed, we no longer need this Promise.
    tDetails.loadingPromise = null;

    if (failed) {
      tDetails.loadingState = DeferDependenciesLoadingState.FAILED;
    } else {
      tDetails.loadingState = DeferDependenciesLoadingState.COMPLETE;

      // Update directive and pipe registries to add newly downloaded dependencies.
      const primaryBlockTView = primaryBlockTNode.tView!;
      if (directiveDefs.length > 0) {
        primaryBlockTView.directiveRegistry =
            addDepsToRegistry<DirectiveDefList>(primaryBlockTView.directiveRegistry, directiveDefs);
      }
      if (pipeDefs.length > 0) {
        primaryBlockTView.pipeRegistry =
            addDepsToRegistry<PipeDefList>(primaryBlockTView.pipeRegistry, pipeDefs);
      }
    }
  });
}

/**
 * Adds downloaded dependencies into a directive or a pipe registry,
 * making sure that a dependency doesn't yet exist in the registry.
 */
function addDepsToRegistry<T extends DependencyDef[]>(currentDeps: T|null, newDeps: T): T {
  if (!currentDeps || currentDeps.length === 0) {
    return newDeps;
  }

  const currentDepSet = new Set(currentDeps);
  for (const dep of newDeps) {
    currentDepSet.add(dep);
  }

  // If `currentDeps` is the same length, there were no new deps and can
  // return the original array.
  return (currentDeps.length === currentDepSet.size) ? currentDeps : Array.from(currentDepSet) as T;
}

/** Utility function to render placeholder content (if present) */
function renderPlaceholder(lView: LView, tNode: TNode) {
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
function renderDeferStateAfterResourceLoading(
    tDetails: TDeferBlockDetails, tNode: TNode, lContainer: LContainer) {
  ngDevMode &&
      assertDefined(
          tDetails.loadingPromise, 'Expected loading Promise to exist on this defer block');

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

/** Retrieves a TNode that represents main content of a defer block. */
function getPrimaryBlockTNode(tView: TView, tDetails: TDeferBlockDetails): TContainerNode {
  const adjustedIndex = tDetails.primaryTmplIndex + HEADER_OFFSET;
  return getTNode(tView, adjustedIndex) as TContainerNode;
}

/**
 * Attempts to trigger loading of defer block dependencies.
 * If the block is already in a loading, completed or an error state -
 * no additional actions are taken.
 */
function triggerDeferBlock(lView: LView, tNode: TNode) {
  const tView = lView[TVIEW];
  const lContainer = lView[tNode.index];
  const injector = lView[INJECTOR]!;
  ngDevMode && assertLContainer(lContainer);

  if (!shouldTriggerDeferBlock(injector)) return;

  const tDetails = getTDeferBlockDetails(tView, tNode);
  switch (tDetails.loadingState) {
    case DeferDependenciesLoadingState.NOT_STARTED:
      renderDeferBlockState(DeferBlockState.Loading, tNode, lContainer);
      triggerResourceLoading(tDetails, lView);

      // The `loadingState` might have changed to "loading".
      if ((tDetails.loadingState as DeferDependenciesLoadingState) ===
          DeferDependenciesLoadingState.IN_PROGRESS) {
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
 * Asserts whether all dependencies for a defer block are loaded.
 * Always run this function (in dev mode) before rendering a defer
 * block in completed state.
 */
function assertDeferredDependenciesLoaded(tDetails: TDeferBlockDetails) {
  assertEqual(
      tDetails.loadingState, DeferDependenciesLoadingState.COMPLETE,
      'Expecting all deferred dependencies to be loaded.');
}

/**
 * **INTERNAL**, avoid referencing it in application code.
 *
 * Describes a helper class that allows to intercept a call to retrieve current
 * dependency loading function and replace it with a different implementation.
 * This interceptor class is needed to allow testing blocks in different states
 * by simulating loading response.
 */
export interface DeferBlockDependencyInterceptor {
  /**
   * Invoked for each defer block when dependency loading function is accessed.
   */
  intercept(dependencyFn: DependencyResolverFn|null): DependencyResolverFn|null;

  /**
   * Allows to configure an interceptor function.
   */
  setInterceptor(interceptorFn: (current: DependencyResolverFn) => DependencyResolverFn): void;
}

/**
 * **INTERNAL**, avoid referencing it in application code.
 *
 * Injector token that allows to provide `DeferBlockDependencyInterceptor` class
 * implementation.
 */
export const DEFER_BLOCK_DEPENDENCY_INTERCEPTOR =
    new InjectionToken<DeferBlockDependencyInterceptor>(
        ngDevMode ? 'DEFER_BLOCK_DEPENDENCY_INTERCEPTOR' : '');

/**
 * Determines if a given value matches the expected structure of a defer block
 *
 * We can safely rely on the primaryTmplIndex because every defer block requires
 * that a primary template exists. All the other template options are optional.
 */
function isTDeferBlockDetails(value: unknown): value is TDeferBlockDetails {
  return (typeof value === 'object') &&
      (typeof (value as TDeferBlockDetails).primaryTmplIndex === 'number');
}

/**
 * Internal token used for configuring defer block behavior.
 */
export const DEFER_BLOCK_CONFIG =
    new InjectionToken<DeferBlockConfig>(ngDevMode ? 'DEFER_BLOCK_CONFIG' : '');

/**
 * Defer block instance for testing.
 */
export interface DeferBlockDetails {
  lContainer: LContainer;
  lView: LView;
  tNode: TNode;
  tDetails: TDeferBlockDetails;
}

/**
 * Retrieves all defer blocks in a given LView.
 *
 * @param lView lView with defer blocks
 * @param deferBlocks defer block aggregator array
 */
export function getDeferBlocks(lView: LView, deferBlocks: DeferBlockDetails[]) {
  const tView = lView[TVIEW];
  for (let i = HEADER_OFFSET; i < tView.bindingStartIndex; i++) {
    if (isLContainer(lView[i])) {
      const lContainer = lView[i];
      // An LContainer may represent an instance of a defer block, in which case
      // we store it as a result. Otherwise, keep iterating over LContainer views and
      // look for defer blocks.
      const isLast = i === tView.bindingStartIndex - 1;
      if (!isLast) {
        const tNode = tView.data[i] as TNode;
        const tDetails = getTDeferBlockDetails(tView, tNode);
        if (isTDeferBlockDetails(tDetails)) {
          deferBlocks.push({lContainer, lView, tNode, tDetails});
          // This LContainer represents a defer block, so we exit
          // this iteration and don't inspect views in this LContainer.
          continue;
        }
      }
      for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
        getDeferBlocks(lContainer[i] as LView, deferBlocks);
      }
    } else if (isLView(lView[i])) {
      // This is a component, enter the `getDeferBlocks` recursively.
      getDeferBlocks(lView[i], deferBlocks);
    }
  }
}

/**
 * Registers a cleanup function associated with a prefetching trigger
 * of a given defer block.
 */
function registerTDetailsCleanup(
    injector: Injector, tDetails: TDeferBlockDetails, key: string, cleanupFn: VoidFunction) {
  injector.get(DeferBlockCleanupManager).add(tDetails, key, cleanupFn);
}

/**
 * Invokes all registered prefetch cleanup triggers
 * and removes all cleanup functions afterwards.
 */
function invokeTDetailsCleanup(injector: Injector, tDetails: TDeferBlockDetails) {
  injector.get(DeferBlockCleanupManager).cleanup(tDetails);
}

/**
 * Internal service to keep track of cleanup functions associated
 * with defer blocks. This class is used to manage cleanup functions
 * created for prefetching triggers.
 */
class DeferBlockCleanupManager {
  private blocks = new Map<TDeferBlockDetails, Map<string, VoidFunction[]>>();

  add(tDetails: TDeferBlockDetails, key: string, callback: VoidFunction) {
    if (!this.blocks.has(tDetails)) {
      this.blocks.set(tDetails, new Map());
    }
    const block = this.blocks.get(tDetails)!;
    if (!block.has(key)) {
      block.set(key, []);
    }
    const callbacks = block.get(key)!;
    callbacks.push(callback);
  }

  has(tDetails: TDeferBlockDetails, key: string): boolean {
    return !!this.blocks.get(tDetails)?.has(key);
  }

  cleanup(tDetails: TDeferBlockDetails) {
    const block = this.blocks.get(tDetails);
    if (block) {
      for (const callbacks of Object.values(block)) {
        for (const callback of callbacks) {
          callback();
        }
      }
      this.blocks.delete(tDetails);
    }
  }

  ngOnDestroy() {
    for (const [block] of this.blocks) {
      this.cleanup(block);
    }
    this.blocks.clear();
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: DeferBlockCleanupManager,
    providedIn: 'root',
    factory: () => new DeferBlockCleanupManager(),
  });
}

/**
 * Use shims for the `requestIdleCallback` and `cancelIdleCallback` functions for
 * environments where those functions are not available (e.g. Node.js and Safari).
 *
 * Note: we wrap the `requestIdleCallback` call into a function, so that it can be
 * overridden/mocked in test environment and picked up by the runtime code.
 */
const _requestIdleCallback = () =>
    typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : setTimeout;
const _cancelIdleCallback = () =>
    typeof requestIdleCallback !== 'undefined' ? cancelIdleCallback : clearTimeout;

/**
 * Helper service to schedule `requestIdleCallback`s for batches of defer blocks,
 * to avoid calling `requestIdleCallback` for each defer block (e.g. if
 * defer blocks are defined inside a for loop).
 */
class OnIdleScheduler {
  // Indicates whether current callbacks are being invoked.
  executingCallbacks = false;

  // Currently scheduled idle callback id.
  idleId: number|null = null;

  // Set of callbacks to be invoked next.
  current = new Set<VoidFunction>();

  // Set of callbacks collected while invoking current set of callbacks.
  // Those callbacks are scheduled for the next idle period.
  deferred = new Set<VoidFunction>();

  ngZone = inject(NgZone);

  requestIdleCallback = _requestIdleCallback().bind(globalThis);
  cancelIdleCallback = _cancelIdleCallback().bind(globalThis);

  add(callback: VoidFunction) {
    const target = this.executingCallbacks ? this.deferred : this.current;
    target.add(callback);
    if (this.idleId === null) {
      this.scheduleIdleCallback();
    }
  }

  remove(callback: VoidFunction) {
    this.current.delete(callback);
    this.deferred.delete(callback);
  }

  private scheduleIdleCallback() {
    const callback = () => {
      this.cancelIdleCallback(this.idleId!);
      this.idleId = null;

      this.executingCallbacks = true;

      for (const callback of this.current) {
        callback();
      }
      this.current.clear();

      this.executingCallbacks = false;

      // If there are any callbacks added during an invocation
      // of the current ones - make them "current" and schedule
      // a new idle callback.
      if (this.deferred.size > 0) {
        for (const callback of this.deferred) {
          this.current.add(callback);
        }
        this.deferred.clear();
        this.scheduleIdleCallback();
      }
    };
    // Ensure that the callback runs in the NgZone since
    // the `requestIdleCallback` is not currently patched by Zone.js.
    this.idleId = this.requestIdleCallback(() => this.ngZone.run(callback)) as number;
  }

  ngOnDestroy() {
    if (this.idleId !== null) {
      this.cancelIdleCallback(this.idleId);
      this.idleId = null;
    }
    this.current.clear();
    this.deferred.clear();
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: OnIdleScheduler,
    providedIn: 'root',
    factory: () => new OnIdleScheduler(),
  });
}

/**
 * Helper service to schedule `setTimeout`s for batches of defer blocks,
 * to avoid calling `setTimeout` for each defer block (e.g. if defer blocks
 * are created inside a for loop).
 */
class TimerScheduler {
  // Indicates whether current callbacks are being invoked.
  executingCallbacks = false;

  // Currently scheduled `setTimeout` id.
  timeoutId: number|null = null;

  // When currently scheduled timer would fire.
  invokeTimerAt: number|null = null;

  // List of callbacks to be invoked.
  // For each callback we also store a timestamp on when the callback
  // should be invoked. We store timestamps and callback functions
  // in a flat array to avoid creating new objects for each entry.
  // [timestamp1, callback1, timestamp2, callback2, ...]
  current: Array<number|VoidFunction> = [];

  // List of callbacks collected while invoking current set of callbacks.
  // Those callbacks are added to the "current" queue at the end of
  // the current callback invocation. The shape of this list is the same
  // as the shape of the `current` list.
  deferred: Array<number|VoidFunction> = [];

  add(delay: number, callback: VoidFunction) {
    const target = this.executingCallbacks ? this.deferred : this.current;
    this.addToQueue(target, Date.now() + delay, callback);
    this.scheduleTimer();
  }

  remove(callback: VoidFunction) {
    const callbackIndex = this.removeFromQueue(this.current, callback);
    if (callbackIndex === -1) {
      // Try cleaning up deferred queue only in case
      // we didn't find a callback in the "current" queue.
      this.removeFromQueue(this.deferred, callback);
    }
  }

  private addToQueue(target: Array<number|VoidFunction>, invokeAt: number, callback: VoidFunction) {
    let insertAtIndex = target.length;
    for (let i = 0; i < target.length; i += 2) {
      const invokeQueuedCallbackAt = target[i] as number;
      if (invokeQueuedCallbackAt > invokeAt) {
        // We've reached a first timer that is scheduled
        // for a later time than what we are trying to insert.
        // This is the location at which we need to insert,
        // no need to iterate further.
        insertAtIndex = i;
        break;
      }
    }
    arrayInsert2(target, insertAtIndex, invokeAt, callback);
  }

  private removeFromQueue(target: Array<number|VoidFunction>, callback: VoidFunction) {
    let index = -1;
    for (let i = 0; i < target.length; i += 2) {
      const queuedCallback = target[i + 1];
      if (queuedCallback === callback) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      // Remove 2 elements: a timestamp slot and
      // the following slot with a callback function.
      arraySplice(target, index, 2);
    }
    return index;
  }

  private scheduleTimer() {
    const callback = () => {
      clearTimeout(this.timeoutId!);
      this.timeoutId = null;

      this.executingCallbacks = true;

      // Invoke callbacks that were scheduled to run
      // before the current time.
      let now = Date.now();
      let lastCallbackIndex: number|null = null;
      for (let i = 0; i < this.current.length; i += 2) {
        const invokeAt = this.current[i] as number;
        const callback = this.current[i + 1] as VoidFunction;
        if (invokeAt <= now) {
          callback();
          // Point at the invoked callback function, which is located
          // after the timestamp.
          lastCallbackIndex = i + 1;
        } else {
          // We've reached a timer that should not be invoked yet.
          break;
        }
      }
      if (lastCallbackIndex !== null) {
        // If last callback index is `null` - no callbacks were invoked,
        // so no cleanup is needed. Otherwise, remove invoked callbacks
        // from the queue.
        arraySplice(this.current, 0, lastCallbackIndex + 1);
      }

      this.executingCallbacks = false;

      // If there are any callbacks added during an invocation
      // of the current ones - move them over to the "current"
      // queue.
      if (this.deferred.length > 0) {
        for (let i = 0; i < this.deferred.length; i += 2) {
          const invokeAt = this.deferred[i] as number;
          const callback = this.deferred[i + 1] as VoidFunction;
          this.addToQueue(this.current, invokeAt, callback);
        }
        this.deferred.length = 0;
      }
      this.scheduleTimer();
    };

    // Avoid running timer callbacks more than once per
    // average frame duration. This is needed for better
    // batching and to avoid kicking off excessive change
    // detection cycles.
    const FRAME_DURATION_MS = 16;  // 1000ms / 60fps

    if (this.current.length > 0) {
      const now = Date.now();
      // First element in the queue points at the timestamp
      // of the first (earliest) event.
      const invokeAt = this.current[0] as number;
      if (!this.timeoutId ||
          // Reschedule a timer in case a queue contains an item with
          // an earlier timestamp and the delta is more than an average
          // frame duration.
          (this.invokeTimerAt && (this.invokeTimerAt - invokeAt > FRAME_DURATION_MS))) {
        if (this.timeoutId !== null) {
          // There was a timeout already, but an earlier event was added
          // into the queue. In this case we drop an old timer and setup
          // a new one with an updated (smaller) timeout.
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
        const timeout = Math.max(invokeAt - now, FRAME_DURATION_MS);
        this.invokeTimerAt = invokeAt;
        this.timeoutId = setTimeout(callback, timeout) as unknown as number;
      }
    }
  }

  ngOnDestroy() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.current.length = 0;
    this.deferred.length = 0;
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: TimerScheduler,
    providedIn: 'root',
    factory: () => new TimerScheduler(),
  });
}
