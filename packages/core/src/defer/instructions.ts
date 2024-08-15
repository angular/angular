/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {setActiveConsumer} from '@angular/core/primitives/signals';

import {CachedInjectorService} from '../cached_injector_service';
import {NotificationSource} from '../change_detection/scheduling/zoneless_scheduling';
import {EnvironmentInjector, InjectionToken, Injector, Provider} from '../di';
import {internalImportProvidersFrom} from '../di/provider_collection';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {
  DEFER_BLOCK_ID,
  DEFER_BLOCK_STATE as SERIALIZED_DEFER_BLOCK_STATE,
  DehydratedContainerView,
} from '../hydration/interfaces';
import {populateDehydratedViewsInLContainer} from '../linker/view_container_ref';
import {PendingTasks} from '../pending_tasks';
import {assertLContainer, assertTNodeForLView} from '../render3/assert';
import {bindingUpdated} from '../render3/bindings';
import {ChainedInjector} from '../render3/chained_injector';
import {getComponentDef, getDirectiveDef, getPipeDef} from '../render3/definition';
import {getTemplateLocationDetails} from '../render3/instructions/element_validation';
import {markViewDirty} from '../render3/instructions/mark_view_dirty';
import {handleError} from '../render3/instructions/shared';
import {declareTemplate} from '../render3/instructions/template';
import {DEHYDRATED_VIEWS, LContainer} from '../render3/interfaces/container';
import {DirectiveDefList, PipeDefList} from '../render3/interfaces/definition';
import {TContainerNode, TNode} from '../render3/interfaces/node';
import {isDestroyed} from '../render3/interfaces/type_checks';
import {HEADER_OFFSET, INJECTOR, LView, PARENT, TVIEW, TView} from '../render3/interfaces/view';
import {
  getCurrentTNode,
  getLView,
  getSelectedTNode,
  getTView,
  nextBindingIndex,
} from '../render3/state';
import {isPlatformBrowser} from '../render3/util/misc_utils';
import {
  getConstant,
  getTNode,
  removeLViewOnDestroy,
  storeLViewOnDestroy,
} from '../render3/util/view_utils';
import {
  addLViewToLContainer,
  createAndRenderEmbeddedLView,
  removeLViewFromLContainer,
  shouldAddViewToDom,
} from '../render3/view_manipulation';
import {assertDefined, throwError} from '../util/assert';
import {performanceMarkFeature} from '../util/performance';

import {
  invokeAllTriggerCleanupFns,
  invokeTriggerCleanupFns,
  storeTriggerCleanupFn,
} from './cleanup';
import {onHover, onInteraction, onViewport, registerDomTrigger} from './dom_triggers';
import {onIdle} from './idle_scheduler';
import {
  DEFER_BLOCK_STATE,
  DeferBlockBehavior,
  DeferBlockConfig,
  DeferBlockDependencyInterceptor,
  DeferBlockInternalState,
  DeferBlockState,
  DeferDependenciesLoadingState,
  DeferredLoadingBlockConfig,
  DeferredPlaceholderBlockConfig,
  DependencyResolverFn,
  Trigger,
  LDeferBlockDetails,
  LOADING_AFTER_CLEANUP_FN,
  NEXT_DEFER_BLOCK_STATE,
  ON_COMPLETE_FNS,
  SSR_STATE,
  STATE_IS_FROZEN_UNTIL,
  TDeferBlockDetails,
  TriggerType,
  HydrateTrigger,
} from './interfaces';
import {onTimer, scheduleTimerTrigger} from './timer_scheduler';
import {
  addDepsToRegistry,
  assertDeferredDependenciesLoaded,
  getLDeferBlockDetails,
  getLoadingBlockAfter,
  getMinimumDurationForState,
  getPrimaryBlockTNode,
  getTDeferBlockDetails,
  getTemplateIndexForState,
  setLDeferBlockDetails,
  setTDeferBlockDetails,
} from './utils';
import {IS_PARTIAL_HYDRATION_ENABLED} from '../hydration/tokens';
import {DeferBlockRegistry} from './registry';
import {partialHydrateFromBlockName} from '../hydration/blocks';

/**
 * **INTERNAL**, avoid referencing it in application code.
 * *
 * Injector token that allows to provide `DeferBlockDependencyInterceptor` class
 * implementation.
 *
 * This token is only injected in devMode
 */
export const DEFER_BLOCK_DEPENDENCY_INTERCEPTOR =
  new InjectionToken<DeferBlockDependencyInterceptor>('DEFER_BLOCK_DEPENDENCY_INTERCEPTOR');

/**
 * **INTERNAL**, token used for configuring defer block behavior.
 */
export const DEFER_BLOCK_CONFIG = new InjectionToken<DeferBlockConfig>(
  ngDevMode ? 'DEFER_BLOCK_CONFIG' : '',
);

function shouldTriggerWhenOnServer(injector: Injector) {
  const isServer = !isPlatformBrowser(injector);
  const isPartialHydrationEnabled = injector.get(IS_PARTIAL_HYDRATION_ENABLED, false, {
    optional: true,
  });
  return isServer && isPartialHydrationEnabled;
}

function shouldTriggerWhenOnClient(
  injector: Injector,
  state: DeferBlockState | DeferBlockInternalState | null,
  hydrateTriggers: (Trigger | HydrateTrigger)[] | null,
): boolean {
  const isClient = isPlatformBrowser(injector);
  if (!isClient) {
    return false;
  }
  const isPartialHydrationEnabled = injector.get(IS_PARTIAL_HYDRATION_ENABLED, false, {
    optional: true,
  });
  const isRendered = state && state === DeferBlockState.Complete;
  const hasHydrateTriggers = hydrateTriggers && hydrateTriggers.length > 0;
  if (isPartialHydrationEnabled && hasHydrateTriggers && isRendered) {
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
function shouldTriggerDeferBlock(injector: Injector, willHydrateOnClient: boolean): boolean {
  const config = injector.get(DEFER_BLOCK_CONFIG, null, {optional: true});
  if (config?.behavior === DeferBlockBehavior.Manual) {
    return false;
  }
  return isPlatformBrowser(injector) || willHydrateOnClient;
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
  index: number,
  primaryTmplIndex: number,
  dependencyResolverFn?: DependencyResolverFn | null,
  loadingTmplIndex?: number | null,
  placeholderTmplIndex?: number | null,
  errorTmplIndex?: number | null,
  loadingConfigIndex?: number | null,
  placeholderConfigIndex?: number | null,
  enableTimerScheduling?: typeof ɵɵdeferEnableTimerScheduling,
) {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = declareTemplate(lView, tView, index, null, 0, 0);
  const registry = lView[INJECTOR]!.get(DeferBlockRegistry);
  let uniqueId = `d${registry.size}`;

  if (tView.firstCreatePass) {
    performanceMarkFeature('NgDefer');

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
      providers: null,
      taskId: null,
      uniqueId: uniqueId,
      hydrateTriggers: null,
      prefetchTriggers: null,
    };
    enableTimerScheduling?.(tView, tDetails, placeholderConfigIndex, loadingConfigIndex);
    setTDeferBlockDetails(tView, adjustedIndex, tDetails);
  }

  const lContainer = lView[adjustedIndex];

  // If hydration is enabled, looks up dehydrated views in the DOM
  // using hydration annotation info and stores those views on LContainer.
  // In client-only mode, this function is a noop.
  populateDehydratedViewsInLContainer(lContainer, tNode, lView);

  let ssrState = null;
  if (lContainer[DEHYDRATED_VIEWS]?.length > 0) {
    // NOTE: this is a hack, we should serialize defer
    // block info at a higher level (not at a view level).
    const info = lContainer[DEHYDRATED_VIEWS][0].data;
    uniqueId = info[DEFER_BLOCK_ID];
    ssrState = info[SERIALIZED_DEFER_BLOCK_STATE];
  }

  // Init instance-specific defer details and store it.
  const lDetails: LDeferBlockDetails = [
    null, // NEXT_DEFER_BLOCK_STATE
    DeferBlockInternalState.Initial, // DEFER_BLOCK_STATE
    null, // STATE_IS_FROZEN_UNTIL
    null, // LOADING_AFTER_CLEANUP_FN
    null, // TRIGGER_CLEANUP_FNS
    null, // PREFETCH_TRIGGER_CLEANUP_FNS
    uniqueId, // UNIQUE_ID
    ssrState, // SSR_STATE
    null,
    null, // HYDRATE_TRIGGER_CLEANUP_FNS
  ];
  setLDeferBlockDetails(lView, adjustedIndex, lDetails);

  if (uniqueId !== null) {
    // Also store this defer block in the registry.
    registry.add(uniqueId, {lView, tNode, lContainer});
  }

  const cleanupTriggersFn = () => invokeAllTriggerCleanupFns(lDetails, registry);

  // When defer block is triggered - unsubscribe from LView destroy cleanup.
  storeTriggerCleanupFn(TriggerType.Regular, lDetails, () =>
    removeLViewOnDestroy(lView, cleanupTriggersFn),
  );
  storeLViewOnDestroy(lView, cleanupTriggersFn);
}

/**
 * Loads defer block dependencies when a trigger value becomes truthy.
 * @codeGenApi
 */
export function ɵɵdeferWhen(rawValue: unknown) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, rawValue)) {
    const prevConsumer = setActiveConsumer(null);
    try {
      const value = Boolean(rawValue); // handle truthy or falsy values
      const tNode = getSelectedTNode();
      const lDetails = getLDeferBlockDetails(lView, tNode);
      const tDetails = getTDeferBlockDetails(lView[TVIEW], tNode);
      const renderedState = lDetails[DEFER_BLOCK_STATE];
      if (value === false && renderedState === DeferBlockInternalState.Initial) {
        // If nothing is rendered yet, render a placeholder (if defined).
        renderPlaceholder(lView, tNode);
      } else if (
        value === true &&
        (renderedState === DeferBlockInternalState.Initial ||
          renderedState === DeferBlockState.Placeholder) &&
        shouldTriggerWhenOnClient(lView[INJECTOR]!, lDetails[SSR_STATE], tDetails.hydrateTriggers)
      ) {
        // The `when` condition has changed to `true`, trigger defer block loading
        // if the block is either in initial (nothing is rendered) or a placeholder
        // state.
        triggerDeferBlock(lView, tNode);
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}

/**
 * Prefetches the deferred content when a value becomes truthy.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchWhen(rawValue: unknown) {
  const lView = getLView();
  const tNode = getSelectedTNode();
  const bindingIndex = nextBindingIndex();
  const prefetchTriggers = (getTDeferBlockDetails(getTView(), tNode).prefetchTriggers ??= []);
  prefetchTriggers.push(Trigger.When);

  if (bindingUpdated(lView, bindingIndex, rawValue)) {
    const prevConsumer = setActiveConsumer(null);
    try {
      const value = Boolean(rawValue); // handle truthy or falsy values
      const tView = lView[TVIEW];
      const tNode = getSelectedTNode();
      const tDetails = getTDeferBlockDetails(tView, tNode);
      if (value === true && tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
        // If loading has not been started yet, trigger it now.
        triggerPrefetching(tDetails, lView, tNode);
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  }
}

/**
 * Hydrates the deferred content when a value becomes truthy.
 * @codeGenApi
 */
export function ɵɵdeferHydrateWhen(rawValue: unknown) {
  const lView = getLView();
  const tNode = getSelectedTNode();
  const bindingIndex = nextBindingIndex();
  const tView = getTView();
  const tDeferBlockDetails = getTDeferBlockDetails(tView, tNode);
  const hydrateTriggers = (tDeferBlockDetails.hydrateTriggers ??= []);
  hydrateTriggers.push(Trigger.When);
  if (bindingUpdated(lView, bindingIndex, rawValue)) {
    const prevConsumer = setActiveConsumer(null);

    if (shouldTriggerWhenOnServer(lView[INJECTOR]!)) {
      // We are on the server and SSR for defer blocks is enabled.
      triggerDeferBlock(lView, tNode);
    } else {
      try {
        const value = Boolean(rawValue); // handle truthy or falsy values
        if (value === true) {
          // The `when` condition has changed to `true`, trigger defer block loading
          // if the block is either in initial (nothing is rendered) or a placeholder
          // state.
          const injector = lView[INJECTOR]!;
          partialHydrateFromBlockName(injector, tDeferBlockDetails.uniqueId, (deferBlock: any) =>
            triggerAndWaitForCompletion(deferBlock),
          );
        }
      } finally {
        setActiveConsumer(prevConsumer);
      }
    }
  }
}

/**
 * Specifies that hydration never occurs.
 * @codeGenApi
 */
export function ɵɵdeferHydrateNever() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const tDeferBlockDetails = getTDeferBlockDetails(getTView(), tNode);
  const hydrateTriggers = (tDeferBlockDetails.hydrateTriggers ??= []);
  hydrateTriggers.push(Trigger.Never);

  if (shouldTriggerWhenOnServer(lView[INJECTOR]!)) {
    // We are on the server and SSR for defer blocks is enabled.
    triggerDeferBlock(lView, tNode);
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
  scheduleDelayedPrefetching(onIdle, Trigger.Idle);
}

/**
 * Sets up logic to handle the `on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferHydrateOnIdle() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const hydrateTriggers = (getTDeferBlockDetails(getTView(), tNode).hydrateTriggers ??= []);
  hydrateTriggers.push(Trigger.Idle);

  if (shouldTriggerWhenOnServer(lView[INJECTOR]!)) {
    // We are on the server and SSR for defer blocks is enabled.
    triggerDeferBlock(lView, tNode);
  } else {
    scheduleDelayedHydrating(onIdle, lView, tNode);
  }
}

/**
 * Sets up logic to handle the `on immediate` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnImmediate() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const tView = lView[TVIEW];
  const injector = lView[INJECTOR]!;
  const tDetails = getTDeferBlockDetails(tView, tNode);
  const lDetails = getLDeferBlockDetails(lView, tNode);

  // Render placeholder block only if loading template is not present and we're on
  // the client to avoid content flickering, since it would be immediately replaced
  // by the loading block.
  if (
    !shouldTriggerDeferBlock(injector, tDetails.hydrateTriggers !== null) ||
    tDetails.loadingTmplIndex === null
  ) {
    renderPlaceholder(lView, tNode);
  }
  if (shouldTriggerWhenOnClient(injector, lDetails[SSR_STATE], tDetails.hydrateTriggers)) {
    triggerDeferBlock(lView, tNode);
  }
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
  const prefetchTriggers = (tDetails.prefetchTriggers ??= []);
  prefetchTriggers.push(Trigger.Immediate);

  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    triggerResourceLoading(tDetails, lView, tNode);
  }
}

/**
 * Sets up logic to handle the `on immediate` hydrate trigger.
 * @codeGenApi
 */
export function ɵɵdeferHydrateOnImmediate() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const injector = lView[INJECTOR]!;
  const tDeferBlockDetails = getTDeferBlockDetails(getTView(), tNode);
  const hydrateTriggers = (tDeferBlockDetails.hydrateTriggers ??= []);
  hydrateTriggers.push(Trigger.Immediate);

  if (shouldTriggerWhenOnServer(injector)) {
    triggerDeferBlock(lView, tNode);
  } else {
    partialHydrateFromBlockName(injector, tDeferBlockDetails.uniqueId, (deferBlock: any) =>
      triggerAndWaitForCompletion(deferBlock),
    );
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
  scheduleDelayedPrefetching(onTimer(delay), Trigger.Timer);
}

/**
 * Creates runtime data structures for the `on timer` hydrate trigger.
 * @param delay Amount of time to wait before loading the content.
 * @codeGenApi
 */
export function ɵɵdeferHydrateOnTimer(delay: number) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const hydrateTriggers = (getTDeferBlockDetails(getTView(), tNode).hydrateTriggers ??= []);
  hydrateTriggers.push({trigger: Trigger.Timer, delay});

  if (shouldTriggerWhenOnServer(lView[INJECTOR]!)) {
    // We are on the server and SSR for defer blocks is enabled.
    triggerDeferBlock(lView, tNode);
  } else {
    scheduleDelayedHydrating(onTimer(delay), lView, tNode);
  }
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
  const lDetails = getLDeferBlockDetails(lView, tNode);
  const tDetails = getTDeferBlockDetails(lView[TVIEW], tNode);
  renderPlaceholder(lView, tNode);
  if (shouldTriggerWhenOnClient(lView[INJECTOR]!, lDetails[SSR_STATE], tDetails.hydrateTriggers)) {
    registerDomTrigger(
      lView,
      tNode,
      triggerIndex,
      walkUpTimes,
      onHover,
      () => triggerDeferBlock(lView, tNode),
      TriggerType.Regular,
    );
  }
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
  const prefetchTriggers = (tDetails.prefetchTriggers ??= []);
  prefetchTriggers.push(Trigger.Hover);

  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    registerDomTrigger(
      lView,
      tNode,
      triggerIndex,
      walkUpTimes,
      onHover,
      () => triggerPrefetching(tDetails, lView, tNode),
      TriggerType.Prefetch,
    );
  }
}

/**
 * Creates runtime data structures for the `on hover` hydrate trigger.
 * @codeGenApi
 */
export function ɵɵdeferHydrateOnHover() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const hydrateTriggers = (getTDeferBlockDetails(getTView(), tNode).hydrateTriggers ??= []);
  hydrateTriggers.push(Trigger.Hover);

  if (shouldTriggerWhenOnServer(lView[INJECTOR]!)) {
    // We are on the server and SSR for defer blocks is enabled.
    triggerDeferBlock(lView, tNode);
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
  const lDetails = getLDeferBlockDetails(lView, tNode);
  const tDetails = getTDeferBlockDetails(lView[TVIEW], tNode);
  renderPlaceholder(lView, tNode);
  if (shouldTriggerWhenOnClient(lView[INJECTOR]!, lDetails[SSR_STATE], tDetails.hydrateTriggers)) {
    registerDomTrigger(
      lView,
      tNode,
      triggerIndex,
      walkUpTimes,
      onInteraction,
      () => triggerDeferBlock(lView, tNode),
      TriggerType.Regular,
    );
  }
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
  const prefetchTriggers = (tDetails.prefetchTriggers ??= []);
  prefetchTriggers.push(Trigger.Interaction);

  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    registerDomTrigger(
      lView,
      tNode,
      triggerIndex,
      walkUpTimes,
      onInteraction,
      () => triggerPrefetching(tDetails, lView, tNode),
      TriggerType.Prefetch,
    );
  }
}

/**
 * Creates runtime data structures for the `on interaction` hydrate trigger.
 * @codeGenApi
 */
export function ɵɵdeferHydrateOnInteraction() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const hydrateTriggers = (getTDeferBlockDetails(getTView(), tNode).hydrateTriggers ??= []);
  hydrateTriggers.push(Trigger.Interaction);

  // TODO: this should be repeated for all "on" conditions.
  if (shouldTriggerWhenOnServer(lView[INJECTOR]!)) {
    // We are on the server and SSR for defer blocks is enabled.
    triggerDeferBlock(lView, tNode);
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
  const lDetails = getLDeferBlockDetails(lView, tNode);
  const tDetails = getTDeferBlockDetails(lView[TVIEW], tNode);
  renderPlaceholder(lView, tNode);
  if (shouldTriggerWhenOnClient(lView[INJECTOR]!, lDetails[SSR_STATE], tDetails.hydrateTriggers)) {
    registerDomTrigger(
      lView,
      tNode,
      triggerIndex,
      walkUpTimes,
      onViewport,
      () => triggerDeferBlock(lView, tNode),
      TriggerType.Regular,
    );
  }
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
  const prefetchTriggers = (tDetails.prefetchTriggers ??= []);
  prefetchTriggers.push(Trigger.Viewport);

  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    registerDomTrigger(
      lView,
      tNode,
      triggerIndex,
      walkUpTimes,
      onViewport,
      () => triggerPrefetching(tDetails, lView, tNode),
      TriggerType.Prefetch,
    );
  }
}

/**
 * Creates runtime data structures for the `on viewport` hydrate trigger.
 * @codeGenApi
 */
export function ɵɵdeferHydrateOnViewport() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const tDeferBlockDetails = getTDeferBlockDetails(getTView(), tNode);
  const hydrateTriggers = (tDeferBlockDetails.hydrateTriggers ??= []);
  hydrateTriggers.push(Trigger.Viewport);
  const injector = lView[INJECTOR]!;

  // TODO: this should be repeated for all "on" conditions.
  if (shouldTriggerWhenOnServer(injector)) {
    // We are on the server and SSR for defer blocks is enabled.
    triggerDeferBlock(lView, tNode);
  }
}

/********** Helper functions **********/

/**
 * Schedules triggering of a defer block for `on idle` and `on timer` conditions.
 */
function scheduleDelayedTrigger(
  scheduleFn: (callback: VoidFunction, injector: Injector) => VoidFunction,
) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const lDetails = getLDeferBlockDetails(lView, tNode);
  const tDetails = getTDeferBlockDetails(lView[TVIEW], tNode);

  renderPlaceholder(lView, tNode);

  if (shouldTriggerWhenOnClient(lView[INJECTOR]!, lDetails[SSR_STATE], tDetails.hydrateTriggers)) {
    // Only trigger the scheduled trigger on the browser
    // since we don't want to delay the server response.
    if (isPlatformBrowser(lView[INJECTOR]!)) {
      const cleanupFn = scheduleFn(() => triggerDeferBlock(lView, tNode), lView[INJECTOR]!);
      storeTriggerCleanupFn(TriggerType.Regular, lDetails, cleanupFn);
    }
  }
}

/**
 * Schedules prefetching for `on idle` and `on timer` triggers.
 *
 * @param scheduleFn A function that does the scheduling.
 */
function scheduleDelayedPrefetching(
  scheduleFn: (callback: VoidFunction, injector: Injector) => VoidFunction,
  trigger: Trigger,
) {
  const lView = getLView();

  // Only trigger the scheduled trigger on the browser
  // since we don't want to delay the server response.
  if (isPlatformBrowser(lView[INJECTOR]!)) {
    const tNode = getCurrentTNode()!;
    const tView = lView[TVIEW];
    const tDetails = getTDeferBlockDetails(tView, tNode);
    const prefetchTriggers = (getTDeferBlockDetails(getTView(), tNode).prefetchTriggers ??= []);
    prefetchTriggers.push(trigger);

    if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
      const lDetails = getLDeferBlockDetails(lView, tNode);
      const prefetch = () => triggerPrefetching(tDetails, lView, tNode);
      const cleanupFn = scheduleFn(prefetch, lView[INJECTOR]!);
      storeTriggerCleanupFn(TriggerType.Prefetch, lDetails, cleanupFn);
    }
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
  // Only trigger the scheduled trigger on the browser
  // since we don't want to delay the server response.
  const injector = lView[INJECTOR]!;
  if (isPlatformBrowser(injector)) {
    const tDeferBlockDetails = getTDeferBlockDetails(lView[TVIEW], tNode);
    const cleanupFn = scheduleFn(
      () =>
        partialHydrateFromBlockName(injector, tDeferBlockDetails.uniqueId, (deferBlock: any) =>
          triggerAndWaitForCompletion(deferBlock),
        ),
      injector,
    );
    const lDetails = getLDeferBlockDetails(lView, tNode);
    storeTriggerCleanupFn(TriggerType.Hydrate, lDetails, cleanupFn);
  }
}

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

  const ssrState = lDetails[SSR_STATE];
  if (ssrState !== null && newState < ssrState) {
    return; // trying to render a previous state, exit
  }

  if (
    isValidStateChange(currentState, newState) &&
    isValidStateChange(lDetails[NEXT_DEFER_BLOCK_STATE] ?? -1, newState)
  ) {
    const injector = hostLView[INJECTOR]!;
    const tDetails = getTDeferBlockDetails(hostTView, tNode);
    // Skips scheduling on the server since it can delay the server response.
    const needsScheduling =
      !skipTimerScheduling &&
      isPlatformBrowser(injector) &&
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
      handleError(hostLView, error);
    }
  }
}

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

function findMatchingDehydratedViewForDeferBlock(
  lContainer: LContainer,
  lDetails: LDeferBlockDetails,
): DehydratedContainerView | null {
  // TODO(thePunderWoman): extract into a separate util function and use in relevant places.
  const views = lContainer[DEHYDRATED_VIEWS];
  if (views === null || views.length === 0) {
    return null;
  }

  // Find matching view based on serialized defer block state.
  // TODO: reconcile this logic with the regular logic that looks up
  // dehydrated views to see if there is anything missing in this function.
  return (
    views.find(
      (view: any) => view.data[SERIALIZED_DEFER_BLOCK_STATE] === lDetails[DEFER_BLOCK_STATE],
    ) ?? null
  );
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
        injector = createDeferBlockInjector(hostLView[INJECTOR]!, tDetails, providers);
      }
    }

    const dehydratedView = findMatchingDehydratedViewForDeferBlock(lContainer, lDetails);
    // Render either when we don't have dehydrated views at all (e.g. client rendering)
    // or when dehydrated view is found (in which case we hydrate).
    // Otherwise, do nothing, since we'd end up erasing SSR'ed content.
    // TODO(thePunderWoman): Use the util function for checking dehydrated views mentioned above
    const isClientOnly =
      lContainer[DEHYDRATED_VIEWS] === null || lContainer[DEHYDRATED_VIEWS].length === 0;
    if (isClientOnly || dehydratedView) {
      // Erase dehydrated view info, so that it's not removed later
      // by post-hydration cleanup process.
      // TODO: we need a better mechanism here.
      lContainer[DEHYDRATED_VIEWS] = null;

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
    }

    // TODO:
    // - what if we had some views in `lContainer[DEHYDRATED_VIEWS]`, but
    //   we didn't find a view that matches the expected state?
    // - for example, handle a situation when a block was in the "completed" state
    //   on the server, but the loading failing on the client. How do we reconcile and cleanup?

    // TODO: should we also invoke if newState === DeferBlockState.Error?
    if (newState === DeferBlockState.Complete && Array.isArray(lDetails[ON_COMPLETE_FNS])) {
      for (const callback of lDetails[ON_COMPLETE_FNS]) {
        callback();
      }
      lDetails[ON_COMPLETE_FNS] = null;
    }
  }
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
  return scheduleTimerTrigger(timeout, callback, hostLView[INJECTOR]!);
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

/**
 * Trigger prefetching of dependencies for a defer block.
 *
 * @param tDetails Static information about this defer block.
 * @param lView LView of a host view.
 */
export function triggerPrefetching(tDetails: TDeferBlockDetails, lView: LView, tNode: TNode) {
  const tDeferBlockDetails = getTDeferBlockDetails(lView[TVIEW], tNode);
  if (
    lView[INJECTOR] &&
    shouldTriggerDeferBlock(lView[INJECTOR]!, tDeferBlockDetails.hydrateTriggers !== null)
  ) {
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
  const pendingTasks = injector.get(PendingTasks);
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
  if (!shouldTriggerDeferBlock(injector, tDetails.hydrateTriggers !== null)) return;

  const registry = injector.get(DeferBlockRegistry);
  // Defer block is triggered, cleanup all registered trigger functions.
  invokeAllTriggerCleanupFns(lDetails, registry);

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

export function triggerAndWaitForCompletion(deferBlock: any): Promise<void> {
  const lDetails = getLDeferBlockDetails(deferBlock.lView, deferBlock.tNode);
  const promise = new Promise<void>((resolve) => {
    onDeferBlockCompletion(lDetails, resolve);
  });
  triggerDeferBlock(deferBlock.lView, deferBlock.tNode);
  return promise;
}

function onDeferBlockCompletion(lDetails: LDeferBlockDetails, callback: VoidFunction) {
  if (!Array.isArray(lDetails[ON_COMPLETE_FNS])) {
    lDetails[ON_COMPLETE_FNS] = [];
  }
  lDetails[ON_COMPLETE_FNS].push(callback);
}
