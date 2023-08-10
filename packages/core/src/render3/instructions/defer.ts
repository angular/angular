/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, Injector} from '../../di';
import {assertDefined, assertEqual, assertNotDefined, throwError} from '../../util/assert';
import {NgZone} from '../../zone';
import {assertLContainer} from '../assert';
import {bindingUpdated} from '../bindings';
import {getComponentDef, getDirectiveDef, getPipeDef} from '../definition';
import {DEFER_BLOCK_DETAILS, DeferBlockInstanceState, LContainer} from '../interfaces/container';
import {DependencyResolverFn, DirectiveDefList, PipeDefList} from '../interfaces/definition';
import {DeferDependenciesLoadingState, DeferredLoadingBlockConfig, DeferredPlaceholderBlockConfig, TContainerNode, TDeferBlockDetails, TNode} from '../interfaces/node';
import {isDestroyed} from '../interfaces/type_checks';
import {HEADER_OFFSET, INJECTOR, LView, PARENT, TVIEW} from '../interfaces/view';
import {getCurrentTNode, getLView, getSelectedTNode, getTView, nextBindingIndex} from '../state';
import {NO_CHANGE} from '../tokens';
import {getConstant, getTNode, storeLViewOnDestroy} from '../util/view_utils';
import {addLViewToLContainer, createAndRenderEmbeddedLView, removeLViewFromLContainer} from '../view_manipulation';

import {templateInternal} from './template';

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

  // Defer block details are needed only once during the first creation pass,
  // so we wrap an object with defer block details into a function that is only
  // invoked once to avoid re-constructing the same object for each subsequent
  // creation run.
  const deferBlockConfig: () => TDeferBlockDetails = () => ({
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
  });

  templateInternal(index, null, 0, 0, deferBlockConfig);

  // Init instance-specific defer details for this LContainer.
  const adjustedIndex = index + HEADER_OFFSET;
  const lContainer = lView[adjustedIndex];
  lContainer[DEFER_BLOCK_DETAILS] = {state: DeferBlockInstanceState.INITIAL};
}

/**
 * Loads the deferred content when a value becomes truthy.
 * @codeGenApi
 */
export function ɵɵdeferWhen(value: unknown) {
  const lView = getLView();
  const bindingIndex = nextBindingIndex();
  const newValue = !!value;  // handle truthy or falsy values
  const oldValue = lView[bindingIndex];
  // If an old value was `true` - don't enter the path that triggers
  // defer loading.
  if (oldValue !== true && bindingUpdated(lView, bindingIndex, value)) {
    const tNode = getSelectedTNode();
    if (oldValue === NO_CHANGE && newValue === false) {
      // We set the value for the first time, render a placeholder (if defined).
      renderPlaceholder(lView, tNode);
    } else if (newValue === true) {
      // The `when` condition has changed to `true`, trigger defer block loading.
      triggerDeferBlock(lView, tNode);
    }
  }
}

/**
 * Prefetches the deferred content when a value becomes truthy.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchWhen(value: unknown) {}  // TODO: implement runtime logic.

/**
 * Sets up handlers that represent `on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnIdle() {
  const lView = getLView();
  const tNode = getCurrentTNode()!;

  renderPlaceholder(lView, tNode);

  const id = _requestIdleCallback(() => {
               triggerDeferBlock(lView, tNode);
               cancelIdleCallback(id);
             }) as number;
  storeLViewOnDestroy(lView, () => _cancelIdleCallback(id));
}

/**
 * Creates runtime data structures for the `prefetech on idle` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferPrefetchOnIdle() {}  // TODO: implement runtime logic.

/**
 * Creates runtime data structures for the `on immediate` deferred trigger.
 * @codeGenApi
 */
export function ɵɵdeferOnImmediate() {}  // TODO: implement runtime logic.


/**
 * Creates runtime data structures for the `prefetech on immediate` deferred trigger.
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
 * Creates runtime data structures for the `prefetech on hover` deferred trigger.
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
 * Transitions a defer block to the new state. Updates the  necessary
 * data structures and renders corresponding block.
 *
 * @param newState New state that should be applied to the defer block.
 * @param lContainer Represents an instance of a defer block.
 * @param stateTmplIndex Index of a template that should be rendered.
 */
function renderDeferBlockState(
    newState: DeferBlockInstanceState, lContainer: LContainer, stateTmplIndex: number|null): void {
  const hostLView = lContainer[PARENT];

  // Check if this view is not destroyed. Since the loading process was async,
  // the view might end up being destroyed by the time rendering happens.
  if (isDestroyed(hostLView)) return;

  ngDevMode &&
      assertDefined(
          lContainer[DEFER_BLOCK_DETAILS],
          'Expected an LContainer that represents ' +
              'a defer block, but got a regular LContainer');

  const lDetails = lContainer[DEFER_BLOCK_DETAILS]!;

  // Note: we transition to the next state if the previous state was represented
  // with a number that is less than the next state. For example, if the current
  // state is "loading" (represented as `2`), we should not show a placeholder
  // (represented as `1`).
  if (lDetails.state < newState && stateTmplIndex !== null) {
    lDetails.state = newState;
    const hostTView = hostLView[TVIEW];
    const adjustedIndex = stateTmplIndex + HEADER_OFFSET;
    const tNode = getTNode(hostTView, adjustedIndex) as TContainerNode;

    // There is only 1 view that can be present in an LContainer that
    // represents a `{#defer}` block, so always refer to the first one.
    const viewIndex = 0;
    removeLViewFromLContainer(lContainer, viewIndex);
    const embeddedLView = createAndRenderEmbeddedLView(hostLView, tNode, {});
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
  const lContainer = lView[tNode.index];
  ngDevMode && assertLContainer(lContainer);

  const tDetails = tNode.value as TDeferBlockDetails;
  renderDeferBlockState(
      DeferBlockInstanceState.PLACEHOLDER, lContainer, tDetails.placeholderTmplIndex);
}

/**
 * Subscribes to the "loading" Promise and renders corresponding defer sub-block,
 * based on the loading results.
 *
 * @param lContainer Represents an instance of a defer block.
 * @param tNode Represents defer block info shared across all instances.
 */
function renderDeferStateAfterResourceLoading(lContainer: LContainer, tNode: TNode) {
  const tDetails = tNode.value as TDeferBlockDetails;

  ngDevMode &&
      assertDefined(
          tDetails.loadingPromise, 'Expected loading Promise to exist on this defer block');

  tDetails.loadingPromise!.then(() => {
    if (tDetails.loadingState === DeferDependenciesLoadingState.COMPLETE) {
      ngDevMode && assertDeferredDependenciesLoaded(tDetails);

      // Everything is loaded, show the primary block content
      renderDeferBlockState(
          DeferBlockInstanceState.COMPLETE, lContainer, tDetails.primaryTmplIndex);

    } else if (tDetails.loadingState === DeferDependenciesLoadingState.FAILED) {
      renderDeferBlockState(DeferBlockInstanceState.ERROR, lContainer, tDetails.errorTmplIndex);
    }
  });
}

/**
 * Attempts to trigger loading of defer block dependencies.
 * If the block is already in a loading, completed or an error state -
 * no additional actions are taken.
 */
function triggerDeferBlock(lView: LView, tNode: TNode) {
  const lContainer = lView[tNode.index];
  ngDevMode && assertLContainer(lContainer);

  const tDetails = tNode.value as TDeferBlockDetails;

  // Condition is triggered, try to render loading state and start downloading.
  // Note: if a block is in a loading, completed or an error state, this call would be a noop.
  renderDeferBlockState(DeferBlockInstanceState.LOADING, lContainer, tDetails.loadingTmplIndex);

  switch (tDetails.loadingState) {
    case DeferDependenciesLoadingState.NOT_STARTED:
      const adjustedIndex = tDetails.primaryTmplIndex + HEADER_OFFSET;
      const primaryBlockTNode = getTNode(lView[TVIEW], adjustedIndex) as TContainerNode;
      triggerResourceLoading(tDetails, primaryBlockTNode, lView[INJECTOR]!);

      // The `loadingState` might have changed to "loading".
      if ((tDetails.loadingState as DeferDependenciesLoadingState) ===
          DeferDependenciesLoadingState.IN_PROGRESS) {
        renderDeferStateAfterResourceLoading(lContainer, tNode);
      }
      break;
    case DeferDependenciesLoadingState.IN_PROGRESS:
      renderDeferStateAfterResourceLoading(lContainer, tNode);
      break;
    case DeferDependenciesLoadingState.COMPLETE:
      ngDevMode && assertDeferredDependenciesLoaded(tDetails);
      renderDeferBlockState(
          DeferBlockInstanceState.COMPLETE, lContainer, tDetails.primaryTmplIndex);
      break;
    case DeferDependenciesLoadingState.FAILED:
      renderDeferBlockState(DeferBlockInstanceState.ERROR, lContainer, tDetails.errorTmplIndex);
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
