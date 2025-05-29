/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setActiveConsumer} from '../../primitives/signals';

import {
  DEFER_BLOCK_ID,
  DEFER_BLOCK_STATE as SERIALIZED_DEFER_BLOCK_STATE,
} from '../hydration/interfaces';
import {populateDehydratedViewsInLContainer} from '../linker/view_container_ref';
import {bindingUpdated} from '../render3/bindings';
import {declareNoDirectiveHostTemplate} from '../render3/instructions/template';
import {DEHYDRATED_VIEWS} from '../render3/interfaces/container';
import {HEADER_OFFSET, INJECTOR, TVIEW} from '../render3/interfaces/view';
import {
  getCurrentTNode,
  getLView,
  getSelectedTNode,
  getTView,
  nextBindingIndex,
} from '../render3/state';
import {removeLViewOnDestroy, storeLViewOnDestroy} from '../render3/util/view_utils';
import {performanceMarkFeature} from '../util/performance';
import {invokeAllTriggerCleanupFns, storeTriggerCleanupFn} from './cleanup';
import {onViewportWrapper, registerDomTrigger} from './dom_triggers';
import {onHover, onInteraction} from '../../primitives/defer/src/triggers';
import {onIdle} from './idle_scheduler';
import {
  DEFER_BLOCK_STATE,
  DeferBlockInternalState,
  DeferBlockState,
  DeferDependenciesLoadingState,
  DependencyResolverFn,
  DeferBlockTrigger,
  LDeferBlockDetails,
  TDeferBlockDetails,
  TriggerType,
  SSR_UNIQUE_ID,
  TDeferDetailsFlags,
} from './interfaces';
import {onTimer} from './timer_scheduler';
import {
  getLDeferBlockDetails,
  getTDeferBlockDetails,
  setLDeferBlockDetails,
  setTDeferBlockDetails,
  trackTriggerForDebugging,
} from './utils';
import {DEHYDRATED_BLOCK_REGISTRY, DehydratedBlockRegistry} from './registry';
import {assertIncrementalHydrationIsConfigured, assertSsrIdDefined} from '../hydration/utils';
import {ɵɵdeferEnableTimerScheduling, renderPlaceholder} from './rendering';

import {
  getHydrateTriggers,
  triggerHydrationFromBlockName,
  scheduleDelayedHydrating,
  scheduleDelayedPrefetching,
  scheduleDelayedTrigger,
  triggerDeferBlock,
  triggerPrefetching,
  triggerResourceLoading,
  shouldAttachTrigger,
  hasHydrateTriggers,
} from './triggering';
import {formatRuntimeError, RuntimeErrorCode} from '../errors';
import {Console} from '../console';
import {Injector} from '../di';

/**
 * Indicates whether we've already produced a warning,
 * prevents the logic from producing it multiple times.
 */
let _hmrWarningProduced = false;

/**
 * Logs a message into the console to indicate that `@defer` block
 * dependencies are loaded eagerly when the HMR mode is enabled.
 */
function logHmrWarning(injector: Injector) {
  if (!_hmrWarningProduced) {
    _hmrWarningProduced = true;
    const console = injector.get(Console);
    // tslint:disable-next-line:no-console
    console.log(
      formatRuntimeError(
        RuntimeErrorCode.DEFER_IN_HMR_MODE,
        'Angular has detected that this application contains `@defer` blocks ' +
          'and the hot module replacement (HMR) mode is enabled. All `@defer` ' +
          'block dependencies will be loaded eagerly.',
      ),
    );
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
 * @param flags A set of flags to define a particular behavior (e.g. to indicate that
 *              hydrate triggers are present and regular triggers should be deactivated
 *              in certain scenarios).
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
  flags?: TDeferDetailsFlags | null,
) {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;
  const tNode = declareNoDirectiveHostTemplate(lView, tView, index, null, 0, 0);
  const injector = lView[INJECTOR];

  if (tView.firstCreatePass) {
    performanceMarkFeature('NgDefer');

    if (ngDevMode) {
      if (typeof ngHmrMode !== 'undefined' && ngHmrMode) {
        logHmrWarning(injector);
      }
      if (hasHydrateTriggers(flags)) {
        assertIncrementalHydrationIsConfigured(injector);
      }
    }

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
      hydrateTriggers: null,
      debug: null,
      flags: flags ?? TDeferDetailsFlags.Default,
    };
    enableTimerScheduling?.(tView, tDetails, placeholderConfigIndex, loadingConfigIndex);
    setTDeferBlockDetails(tView, adjustedIndex, tDetails);
  }

  const lContainer = lView[adjustedIndex];

  // If hydration is enabled, looks up dehydrated views in the DOM
  // using hydration annotation info and stores those views on LContainer.
  // In client-only mode, this function is a noop.
  populateDehydratedViewsInLContainer(lContainer, tNode, lView);

  let ssrBlockState = null;
  let ssrUniqueId: string | null = null;
  if (lContainer[DEHYDRATED_VIEWS]?.length > 0) {
    const info = lContainer[DEHYDRATED_VIEWS][0].data;
    ssrUniqueId = info[DEFER_BLOCK_ID] ?? null;
    ssrBlockState = info[SERIALIZED_DEFER_BLOCK_STATE];
  }

  // Init instance-specific defer details and store it.
  const lDetails: LDeferBlockDetails = [
    null, // NEXT_DEFER_BLOCK_STATE
    DeferBlockInternalState.Initial, // DEFER_BLOCK_STATE
    null, // STATE_IS_FROZEN_UNTIL
    null, // LOADING_AFTER_CLEANUP_FN
    null, // TRIGGER_CLEANUP_FNS
    null, // PREFETCH_TRIGGER_CLEANUP_FNS
    ssrUniqueId, // SSR_UNIQUE_ID
    ssrBlockState, // SSR_BLOCK_STATE
    null, // ON_COMPLETE_FNS
    null, // HYDRATE_TRIGGER_CLEANUP_FNS
  ];
  setLDeferBlockDetails(lView, adjustedIndex, lDetails);

  let registry: DehydratedBlockRegistry | null = null;
  if (ssrUniqueId !== null) {
    // Store this defer block in the registry, to have an access to
    // internal data structures from hydration runtime code.
    registry = injector.get(DEHYDRATED_BLOCK_REGISTRY);
    registry.add(ssrUniqueId, {lView, tNode, lContainer});
  }

  const onLViewDestroy = () => {
    invokeAllTriggerCleanupFns(lDetails);
    if (ssrUniqueId !== null) {
      registry?.cleanup([ssrUniqueId]);
    }
  };

  // When defer block is triggered - unsubscribe from LView destroy cleanup.
  storeTriggerCleanupFn(TriggerType.Regular, lDetails, () =>
    removeLViewOnDestroy(lView, onLViewDestroy),
  );
  storeLViewOnDestroy(lView, onLViewDestroy);
}

/**
 * Loads defer block dependencies when a trigger value becomes truthy.
 * @codeGenApi
 */
export function ɵɵdeferWhen(rawValue: unknown) {
  const lView = getLView();
  const tNode = getSelectedTNode();

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, 'when <expression>');
  }

  if (!shouldAttachTrigger(TriggerType.Regular, lView, tNode)) return;

  const bindingIndex = nextBindingIndex();
  if (bindingUpdated(lView, bindingIndex, rawValue)) {
    const prevConsumer = setActiveConsumer(null);
    try {
      const value = Boolean(rawValue); // handle truthy or falsy values
      const lDetails = getLDeferBlockDetails(lView, tNode);
      const renderedState = lDetails[DEFER_BLOCK_STATE];
      if (value === false && renderedState === DeferBlockInternalState.Initial) {
        // If nothing is rendered yet, render a placeholder (if defined).
        renderPlaceholder(lView, tNode);
      } else if (
        value === true &&
        (renderedState === DeferBlockInternalState.Initial ||
          renderedState === DeferBlockState.Placeholder)
      ) {
        triggerDeferBlock(TriggerType.Regular, lView, tNode);
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

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, 'prefetch when <expression>');
  }

  if (!shouldAttachTrigger(TriggerType.Prefetch, lView, tNode)) return;

  const bindingIndex = nextBindingIndex();

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

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, 'hydrate when <expression>');
  }

  if (!shouldAttachTrigger(TriggerType.Hydrate, lView, tNode)) return;

  // TODO(incremental-hydration): audit all defer instructions to reduce unnecessary work by
  // moving function calls inside their relevant control flow blocks
  const bindingIndex = nextBindingIndex();
  const tView = getTView();
  const hydrateTriggers = getHydrateTriggers(tView, tNode);
  hydrateTriggers.set(DeferBlockTrigger.When, null);

  if (bindingUpdated(lView, bindingIndex, rawValue)) {
    if (typeof ngServerMode !== 'undefined' && ngServerMode) {
      // We are on the server and SSR for defer blocks is enabled.
      triggerDeferBlock(TriggerType.Hydrate, lView, tNode);
    } else {
      const injector = lView[INJECTOR];
      const prevConsumer = setActiveConsumer(null);
      try {
        const value = Boolean(rawValue); // handle truthy or falsy values
        if (value === true) {
          // The `when` condition has changed to `true`, trigger defer block loading
          // if the block is either in initial (nothing is rendered) or a placeholder
          // state.
          const lDetails = getLDeferBlockDetails(lView, tNode);
          const ssrUniqueId = lDetails[SSR_UNIQUE_ID]!;
          ngDevMode && assertSsrIdDefined(ssrUniqueId);
          triggerHydrationFromBlockName(injector, ssrUniqueId);
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

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, 'hydrate never');
  }

  if (!shouldAttachTrigger(TriggerType.Hydrate, lView, tNode)) return;

  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(DeferBlockTrigger.Never, null);

  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    // We are on the server and SSR for defer blocks is enabled.
    triggerDeferBlock(TriggerType.Hydrate, lView, tNode);
  }
}

/**
 * Sets up logic to handle the `on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnIdle() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, 'on idle');
  }

  if (!shouldAttachTrigger(TriggerType.Regular, lView, tNode)) return;

  scheduleDelayedTrigger(onIdle);
}

/**
 * Sets up logic to handle the `prefetch on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnIdle() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, 'prefetch on idle');
  }

  if (!shouldAttachTrigger(TriggerType.Prefetch, lView, tNode)) return;

  scheduleDelayedPrefetching(onIdle, DeferBlockTrigger.Idle);
}

/**
 * Sets up logic to handle the `on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferHydrateOnIdle() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, 'hydrate on idle');
  }

  if (!shouldAttachTrigger(TriggerType.Hydrate, lView, tNode)) return;

  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(DeferBlockTrigger.Idle, null);

  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    // We are on the server and SSR for defer blocks is enabled.
    triggerDeferBlock(TriggerType.Hydrate, lView, tNode);
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

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, 'on immediate');
  }

  if (!shouldAttachTrigger(TriggerType.Regular, lView, tNode)) return;

  // Render placeholder block only if loading template is not present and we're on
  // the client to avoid content flickering, since it would be immediately replaced
  // by the loading block.
  const tDetails = getTDeferBlockDetails(lView[TVIEW], tNode);
  if (tDetails.loadingTmplIndex === null) {
    renderPlaceholder(lView, tNode);
  }
  triggerDeferBlock(TriggerType.Regular, lView, tNode);
}

/**
 * Sets up logic to handle the `prefetch on immediate` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnImmediate() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, 'prefetch on immediate');
  }

  if (!shouldAttachTrigger(TriggerType.Prefetch, lView, tNode)) return;

  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);

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

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, 'hydrate on immediate');
  }

  if (!shouldAttachTrigger(TriggerType.Hydrate, lView, tNode)) return;

  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(DeferBlockTrigger.Immediate, null);

  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    triggerDeferBlock(TriggerType.Hydrate, lView, tNode);
  } else {
    const injector = lView[INJECTOR];
    const lDetails = getLDeferBlockDetails(lView, tNode);
    const ssrUniqueId = lDetails[SSR_UNIQUE_ID]!;
    ngDevMode && assertSsrIdDefined(ssrUniqueId);
    triggerHydrationFromBlockName(injector, ssrUniqueId);
  }
}
/**
 * Creates runtime data structures for the `on timer` deferred trigger.
 * @param delay Amount of time to wait before loading the content.
 * @codeGenApi
 */
export function ɵɵdeferOnTimer(delay: number) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, `on timer(${delay}ms)`);
  }

  if (!shouldAttachTrigger(TriggerType.Regular, lView, tNode)) return;

  scheduleDelayedTrigger(onTimer(delay));
}

/**
 * Creates runtime data structures for the `prefetch on timer` deferred trigger.
 * @param delay Amount of time to wait before prefetching the content.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnTimer(delay: number) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, `prefetch on timer(${delay}ms)`);
  }

  if (!shouldAttachTrigger(TriggerType.Prefetch, lView, tNode)) return;

  scheduleDelayedPrefetching(onTimer(delay), DeferBlockTrigger.Timer);
}

/**
 * Creates runtime data structures for the `on timer` hydrate trigger.
 * @param delay Amount of time to wait before loading the content.
 * @codeGenApi
 */
export function ɵɵdeferHydrateOnTimer(delay: number) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, `hydrate on timer(${delay}ms)`);
  }

  if (!shouldAttachTrigger(TriggerType.Hydrate, lView, tNode)) return;

  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(DeferBlockTrigger.Timer, {delay});

  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    // We are on the server and SSR for defer blocks is enabled.
    triggerDeferBlock(TriggerType.Hydrate, lView, tNode);
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

  if (ngDevMode) {
    trackTriggerForDebugging(
      lView[TVIEW],
      tNode,
      `on hover${walkUpTimes === -1 ? '' : '(<target>)'}`,
    );
  }

  if (!shouldAttachTrigger(TriggerType.Regular, lView, tNode)) return;

  renderPlaceholder(lView, tNode);

  // Avoid adding event listeners when this instruction is invoked on the server.
  if (!(typeof ngServerMode !== 'undefined' && ngServerMode)) {
    registerDomTrigger(
      lView,
      tNode,
      triggerIndex,
      walkUpTimes,
      onHover,
      () => triggerDeferBlock(TriggerType.Regular, lView, tNode),
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

  if (ngDevMode) {
    trackTriggerForDebugging(
      lView[TVIEW],
      tNode,
      `prefetch on hover${walkUpTimes === -1 ? '' : '(<target>)'}`,
    );
  }

  if (!shouldAttachTrigger(TriggerType.Prefetch, lView, tNode)) return;

  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);

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

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, 'hydrate on hover');
  }

  if (!shouldAttachTrigger(TriggerType.Hydrate, lView, tNode)) return;

  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(DeferBlockTrigger.Hover, null);

  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    // We are on the server and SSR for defer blocks is enabled.
    triggerDeferBlock(TriggerType.Hydrate, lView, tNode);
  }
  // The actual triggering of hydration on hover is handled by JSAction in
  // event_replay.ts.
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

  if (ngDevMode) {
    trackTriggerForDebugging(
      lView[TVIEW],
      tNode,
      `on interaction${walkUpTimes === -1 ? '' : '(<target>)'}`,
    );
  }

  if (!shouldAttachTrigger(TriggerType.Regular, lView, tNode)) return;

  renderPlaceholder(lView, tNode);

  // Avoid adding event listeners when this instruction is invoked on the server.
  if (!(typeof ngServerMode !== 'undefined' && ngServerMode)) {
    registerDomTrigger(
      lView,
      tNode,
      triggerIndex,
      walkUpTimes,
      onInteraction,
      () => triggerDeferBlock(TriggerType.Regular, lView, tNode),
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

  if (ngDevMode) {
    trackTriggerForDebugging(
      lView[TVIEW],
      tNode,
      `prefetch on interaction${walkUpTimes === -1 ? '' : '(<target>)'}`,
    );
  }

  if (!shouldAttachTrigger(TriggerType.Prefetch, lView, tNode)) return;

  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);

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

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, 'hydrate on interaction');
  }

  if (!shouldAttachTrigger(TriggerType.Hydrate, lView, tNode)) return;

  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(DeferBlockTrigger.Interaction, null);

  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    // We are on the server and SSR for defer blocks is enabled.
    triggerDeferBlock(TriggerType.Hydrate, lView, tNode);
  }
  // The actual triggering of hydration on interaction is handled by JSAction in
  // event_replay.ts.
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

  if (ngDevMode) {
    trackTriggerForDebugging(
      lView[TVIEW],
      tNode,
      `on viewport${walkUpTimes === -1 ? '' : '(<target>)'}`,
    );
  }

  if (!shouldAttachTrigger(TriggerType.Regular, lView, tNode)) return;

  renderPlaceholder(lView, tNode);

  // Avoid adding event listeners when this instruction is invoked on the server.
  if (!(typeof ngServerMode !== 'undefined' && ngServerMode)) {
    registerDomTrigger(
      lView,
      tNode,
      triggerIndex,
      walkUpTimes,
      onViewportWrapper,
      () => triggerDeferBlock(TriggerType.Regular, lView, tNode),
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

  if (ngDevMode) {
    trackTriggerForDebugging(
      lView[TVIEW],
      tNode,
      `prefetch on viewport${walkUpTimes === -1 ? '' : '(<target>)'}`,
    );
  }

  if (!shouldAttachTrigger(TriggerType.Prefetch, lView, tNode)) return;

  const tView = lView[TVIEW];
  const tDetails = getTDeferBlockDetails(tView, tNode);

  if (tDetails.loadingState === DeferDependenciesLoadingState.NOT_STARTED) {
    registerDomTrigger(
      lView,
      tNode,
      triggerIndex,
      walkUpTimes,
      onViewportWrapper,
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

  if (ngDevMode) {
    trackTriggerForDebugging(lView[TVIEW], tNode, 'hydrate on viewport');
  }

  if (!shouldAttachTrigger(TriggerType.Hydrate, lView, tNode)) return;

  const hydrateTriggers = getHydrateTriggers(getTView(), tNode);
  hydrateTriggers.set(DeferBlockTrigger.Viewport, null);

  if (typeof ngServerMode !== 'undefined' && ngServerMode) {
    // We are on the server and SSR for defer blocks is enabled.
    triggerDeferBlock(TriggerType.Hydrate, lView, tNode);
  }
  // The actual triggering of hydration on viewport happens in triggering.ts,
  // since these instructions won't exist for dehydrated content.
}
