/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, Injector} from '../../di';
import {assertDefined, assertEqual, throwError} from '../../util/assert';
import {assertIndexInDeclRange, assertLContainer, assertTNodeForLView} from '../assert';
import {bindingUpdated} from '../bindings';
import {getComponentDef, getDirectiveDef, getPipeDef} from '../definition';
import {LContainer} from '../interfaces/container';
import {DEFER_BLOCK_STATE, DeferBlockInstanceState, DeferDependenciesLoadingState, DeferredLoadingBlockConfig, DeferredPlaceholderBlockConfig, DependencyResolverFn, LDeferBlockDetails, TDeferBlockDetails} from '../interfaces/defer';
import {DirectiveDefList, PipeDefList} from '../interfaces/definition';
import {TContainerNode, TNode} from '../interfaces/node';
import {isDestroyed} from '../interfaces/type_checks';
import {HEADER_OFFSET, INJECTOR, LView, PARENT, TVIEW, TView} from '../interfaces/view';
import {getCurrentTNode, getLView, getSelectedTNode, getTView, nextBindingIndex} from '../state';
import {getConstant, getTNode, removeLViewOnDestroy, storeLViewOnDestroy} from '../util/view_utils';
import {addLViewToLContainer, createAndRenderEmbeddedLView, removeLViewFromLContainer} from '../view_manipulation';

import {ɵɵtemplate} from './template';

/**
 * Shims for the `requestIdleCallback` and `cancelIdleCallback` functions for environments
 * where those functions are not available (e.g. Node.js).
 */
const _requestIdleCallback =
    typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : setTimeout;
const _cancelIdleCallback =
    typeof requestIdleCallback !== 'undefined' ? cancelIdleCallback : clearTimeout;

/**
 * Creates runtime data structures for `{#defer}` blocks.
 *
 * @param index Index of the `defer` instruction.
 * @param primaryTmplIndex Index of the template with the primary block content.
 * @param dependencyResolverFn Function that contains dependencies for this defer block.
 * @param loadingTmplIndex Index of the template with the `{:loading}` block content.
 * @param placeholderTmplIndex Index of the template with the `{:placeholder}` block content.
 * @param errorTmplIndex Index of the template with the `{:error}` block content.
 * @param loadingConfigIndex Index in the constants array of the configuration of the `{:loading}`.
 *     block.
 * @param placeholderConfigIndexIndex in the constants array of the configuration of the
 *     `{:placeholder}` block.
 *
 * @codeGenApi
 */
export function ɵɵdefer(
    index: number, primaryTmplIndex: number, dependencyResolverFn?: DependencyResolverFn|null,
    loadingTmplIndex?: number|null, placeholderTmplIndex?: number|null,
    errorTmplIndex?: number|null, loadingConfigIndex?: number|null,
    placeholderConfigIndex?: number|null) {
  const lView = getLView();
  const tView = getTView();
  const tViewConsts = tView.consts;
  const adjustedIndex = index + HEADER_OFFSET;

  ɵɵtemplate(index, null, 0, 0);

  if (tView.firstCreatePass) {
    const deferBlockConfig: TDeferBlockDetails = {
      primaryTmplIndex,
      loadingTmplIndex: loadingTmplIndex ?? null,
      placeholderTmplIndex: placeholderTmplIndex ?? null,
      errorTmplIndex: errorTmplIndex ?? null,
      placeholderBlockConfig: placeholderConfigIndex != null ?
          getConstant<DeferredPlaceholderBlockConfig>(tViewConsts, placeholderConfigIndex) :
          null,
      loadingBlockConfig: loadingConfigIndex != null ?
          getConstant<DeferredLoadingBlockConfig>(tViewConsts, loadingConfigIndex) :
          null,
      dependencyResolverFn: dependencyResolverFn ?? null,
      loadingState: DeferDependenciesLoadingState.NOT_STARTED,
      loadingPromise: null,
    };

    setTDeferBlockDetails(tView, adjustedIndex, deferBlockConfig);
  }

  // Init instance-specific defer details and store it.
  const lDetails = [];
  lDetails[DEFER_BLOCK_STATE] = DeferBlockInstanceState.INITIAL;
  setLDeferBlockDetails(lView, adjustedIndex, lDetails as LDeferBlockDetails);
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
    if (value === false && renderedState === DeferBlockInstanceState.INITIAL) {
      // If nothing is rendered yet, render a placeholder (if defined).
      renderPlaceholder(lView, tNode);
    } else if (
        value === true &&
        (renderedState === DeferBlockInstanceState.INITIAL ||
         renderedState === DeferBlockInstanceState.PLACEHOLDER)) {
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
      triggerResourceLoading(tDetails, getPrimaryBlockTNode(tView, tDetails), lView[INJECTOR]!);
    }
  }
}

/**
 * Sets up handlers that represent `on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnIdle() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  renderPlaceholder(lView, tNode);

  let id: number;
  const removeIdleCallback = () => _cancelIdleCallback(id);
  id = _requestIdleCallback(() => {
         removeIdleCallback();
         // The idle callback is invoked, we no longer need
         // to retain a cleanup callback in an LView.
         removeLViewOnDestroy(lView, removeIdleCallback);
         triggerDeferBlock(lView, tNode);
       }) as number;

  // Store a cleanup function on LView, so that we cancel idle
  // callback in case this LView was destroyed before a callback
  // was invoked.
  storeLViewOnDestroy(lView, removeIdleCallback);
}

/**
 * Creates runtime data structures for the `prefetch on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnIdle() {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `on immediate` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnImmediate() {}  // TODO: implement runtime logic.


/**
 * Creates runtime data structures for the `prefetch on immediate` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnImmediate() {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `on timer` deferred trigger.
 * @param delay Amount of time to wait before loading the content.
 * @codeGenApi
 */
export function ɵɵdeferOnTimer(delay: number) {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `prefetch on timer` deferred trigger.
 * @param delay Amount of time to wait before prefetching the content.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnTimer(delay: number) {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `on hover` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnHover() {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `prefetch on hover` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnHover() {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `on interaction` deferred trigger.
 * @param target Optional element on which to listen for hover events.
 * @codeGenApi
 */
export function ɵɵdeferOnInteraction(target?: unknown) {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `prefetch on interaction` deferred trigger.
 * @param target Optional element on which to listen for hover events.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnInteraction(target?: unknown) {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `on viewport` deferred trigger.
 * @param target Optional element on which to listen for hover events.
 * @codeGenApi
 */
export function ɵɵdeferOnViewport(target?: unknown) {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `prefetch on viewport` deferred trigger.
 * @param target Optional element on which to listen for hover events.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnViewport(target?: unknown) {}  // TODO: implement runtime logic.

/********** Helper functions **********/

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

/**
 * Transitions a defer block to the new state. Updates the  necessary
 * data structures and renders corresponding block.
 *
 * @param newState New state that should be applied to the defer block.
 * @param tNode TNode that represents a defer block.
 * @param lContainer Represents an instance of a defer block.
 * @param stateTmplIndex Index of a template that should be rendered.
 */
function renderDeferBlockState(
    newState: DeferBlockInstanceState, tNode: TNode, lContainer: LContainer,
    stateTmplIndex: number|null): void {
  const hostLView = lContainer[PARENT];

  // Check if this view is not destroyed. Since the loading process was async,
  // the view might end up being destroyed by the time rendering happens.
  if (isDestroyed(hostLView)) return;

  // Make sure this TNode belongs to TView that represents host LView.
  ngDevMode && assertTNodeForLView(tNode, hostLView);

  const lDetails = getLDeferBlockDetails(hostLView, tNode);

  ngDevMode && assertDefined(lDetails, 'Expected a defer block state defined');

  // Note: we transition to the next state if the previous state was represented
  // with a number that is less than the next state. For example, if the current
  // state is "loading" (represented as `2`), we should not show a placeholder
  // (represented as `1`).
  if (lDetails[DEFER_BLOCK_STATE] < newState && stateTmplIndex !== null) {
    lDetails[DEFER_BLOCK_STATE] = newState;
    const hostTView = hostLView[TVIEW];
    const adjustedIndex = stateTmplIndex + HEADER_OFFSET;
    const tNode = getTNode(hostTView, adjustedIndex) as TContainerNode;

    // There is only 1 view that can be present in an LContainer that
    // represents a `{#defer}` block, so always refer to the first one.
    const viewIndex = 0;
    removeLViewFromLContainer(lContainer, viewIndex);
    const embeddedLView = createAndRenderEmbeddedLView(hostLView, tNode, null);
    addLViewToLContainer(lContainer, embeddedLView, viewIndex);
  }
}

/**
 * Trigger loading of defer block dependencies if the process hasn't started yet.
 *
 * @param tDetails Static information about this defer block.
 * @param primaryBlockTNode TNode of a primary block template.
 * @param injector Environment injector of the application.
 */
function triggerResourceLoading(
    tDetails: TDeferBlockDetails, primaryBlockTNode: TNode, injector: Injector) {
  const tView = primaryBlockTNode.tView!;

  if (tDetails.loadingState !== DeferDependenciesLoadingState.NOT_STARTED) {
    // If the loading status is different from initial one, it means that
    // the loading of dependencies is in progress and there is nothing to do
    // in this function. All details can be obtained from the `tDetails` object.
    return;
  }

  // Switch from NOT_STARTED -> IN_PROGRESS state.
  tDetails.loadingState = DeferDependenciesLoadingState.IN_PROGRESS;

  // Check if dependency function interceptor is configured.
  const deferDependencyInterceptor =
      injector.get(DEFER_BLOCK_DEPENDENCY_INTERCEPTOR, null, {optional: true});

  const dependenciesFn = deferDependencyInterceptor ?
      deferDependencyInterceptor.intercept(tDetails.dependencyResolverFn) :
      tDetails.dependencyResolverFn;

  // The `dependenciesFn` might be `null` when all dependencies within
  // a given `{#defer}` block were eagerly references elsewhere in a file,
  // thus no dynamic `import()`s were produced.
  if (!dependenciesFn) {
    tDetails.loadingPromise = Promise.resolve().then(() => {
      tDetails.loadingState = DeferDependenciesLoadingState.COMPLETE;
    });
    return;
  }

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
      if (directiveDefs.length > 0) {
        tView.directiveRegistry = tView.directiveRegistry ?
            [...tView.directiveRegistry, ...directiveDefs] :
            directiveDefs;
      }
      if (pipeDefs.length > 0) {
        tView.pipeRegistry = tView.pipeRegistry ? [...tView.pipeRegistry, ...pipeDefs] : pipeDefs;
      }
    }
  });
}

/** Utility function to render `{:placeholder}` content (if present) */
function renderPlaceholder(lView: LView, tNode: TNode) {
  const tView = lView[TVIEW];
  const lContainer = lView[tNode.index];
  ngDevMode && assertLContainer(lContainer);

  const tDetails = getTDeferBlockDetails(tView, tNode);
  renderDeferBlockState(
      DeferBlockInstanceState.PLACEHOLDER, tNode, lContainer, tDetails.placeholderTmplIndex);
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
      renderDeferBlockState(
          DeferBlockInstanceState.COMPLETE, tNode, lContainer, tDetails.primaryTmplIndex);

    } else if (tDetails.loadingState === DeferDependenciesLoadingState.FAILED) {
      renderDeferBlockState(
          DeferBlockInstanceState.ERROR, tNode, lContainer, tDetails.errorTmplIndex);
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
  ngDevMode && assertLContainer(lContainer);

  const tDetails = getTDeferBlockDetails(tView, tNode);

  // Condition is triggered, try to render loading state and start downloading.
  // Note: if a block is in a loading, completed or an error state, this call would be a noop.
  renderDeferBlockState(
      DeferBlockInstanceState.LOADING, tNode, lContainer, tDetails.loadingTmplIndex);

  switch (tDetails.loadingState) {
    case DeferDependenciesLoadingState.NOT_STARTED:
      triggerResourceLoading(
          tDetails, getPrimaryBlockTNode(lView[TVIEW], tDetails), lView[INJECTOR]!);

      // The `loadingState` might have changed to "loading".
      if ((tDetails.loadingState as DeferDependenciesLoadingState) ===
          DeferDependenciesLoadingState.IN_PROGRESS) {
        renderDeferStateAfterResourceLoading(tDetails, tNode, lContainer);
      }
      break;
    case DeferDependenciesLoadingState.IN_PROGRESS:
      renderDeferStateAfterResourceLoading(tDetails, tNode, lContainer);
      break;
    case DeferDependenciesLoadingState.COMPLETE:
      ngDevMode && assertDeferredDependenciesLoaded(tDetails);
      renderDeferBlockState(
          DeferBlockInstanceState.COMPLETE, tNode, lContainer, tDetails.primaryTmplIndex);
      break;
    case DeferDependenciesLoadingState.FAILED:
      renderDeferBlockState(
          DeferBlockInstanceState.ERROR, tNode, lContainer, tDetails.errorTmplIndex);
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
