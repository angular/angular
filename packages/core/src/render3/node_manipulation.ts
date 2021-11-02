/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation} from '../metadata/view';
import {Renderer2} from '../render/api';
import {RendererStyleFlags2} from '../render/api_flags';
import {addToArray, removeFromArray} from '../util/array_utils';
import {assertDefined, assertDomNode, assertEqual, assertFunction, assertString} from '../util/assert';
import {escapeCommentText} from '../util/dom';

import {assertLContainer, assertLView, assertParentView, assertProjectionSlots, assertTNodeForLView} from './assert';
import {attachPatchData} from './context_discovery';
import {icuContainerIterate} from './i18n/i18n_tree_shaking';
import {CONTAINER_HEADER_OFFSET, HAS_TRANSPLANTED_VIEWS, LContainer, MOVED_VIEWS, NATIVE, unusedValueExportToPlacateAjd as unused1} from './interfaces/container';
import {ComponentDef} from './interfaces/definition';
import {NodeInjectorFactory} from './interfaces/injector';
import {TElementNode, TIcuContainerNode, TNode, TNodeFlags, TNodeType, TProjectionNode, unusedValueExportToPlacateAjd as unused2} from './interfaces/node';
import {unusedValueExportToPlacateAjd as unused3} from './interfaces/projection';
import {isProceduralRenderer, ProceduralRenderer3, Renderer3, unusedValueExportToPlacateAjd as unused4} from './interfaces/renderer';
import {RComment, RElement, RNode, RText} from './interfaces/renderer_dom';
import {isLContainer, isLView} from './interfaces/type_checks';
import {CHILD_HEAD, CLEANUP, DECLARATION_COMPONENT_VIEW, DECLARATION_LCONTAINER, DestroyHookData, FLAGS, HookData, HookFn, HOST, LView, LViewFlags, NEXT, PARENT, QUERIES, RENDERER, T_HOST, TVIEW, TView, TViewType, unusedValueExportToPlacateAjd as unused5} from './interfaces/view';
import {assertTNodeType} from './node_assert';
import {profiler, ProfilerEvent} from './profiler';
import {getLViewParent} from './util/view_traversal_utils';
import {getNativeByTNode, unwrapRNode, updateTransplantedViewCount} from './util/view_utils';



const unusedValueToPlacateAjd = unused1 + unused2 + unused3 + unused4 + unused5;

const enum WalkTNodeTreeAction {
  /** node create in the native environment. Run on initial creation. */
  Create = 0,

  /**
   * node insert in the native environment.
   * Run when existing node has been detached and needs to be re-attached.
   */
  Insert = 1,

  /** node detach from the native environment */
  Detach = 2,

  /** node destruction using the renderer's API */
  Destroy = 3,
}



/**
 * NOTE: for performance reasons, the possible actions are inlined within the function instead of
 * being passed as an argument.
 */
function applyToElementOrContainer(
    action: WalkTNodeTreeAction, renderer: Renderer3, parent: RElement|null,
    lNodeToHandle: RNode|LContainer|LView, beforeNode?: RNode|null) {
  // If this slot was allocated for a text node dynamically created by i18n, the text node itself
  // won't be created until i18nApply() in the update block, so this node should be skipped.
  // For more info, see "ICU expressions should work inside an ngTemplateOutlet inside an ngFor"
  // in `i18n_spec.ts`.
  if (lNodeToHandle != null) {
    let lContainer: LContainer|undefined;
    let isComponent = false;
    // We are expecting an RNode, but in the case of a component or LContainer the `RNode` is
    // wrapped in an array which needs to be unwrapped. We need to know if it is a component and if
    // it has LContainer so that we can process all of those cases appropriately.
    if (isLContainer(lNodeToHandle)) {
      lContainer = lNodeToHandle;
    } else if (isLView(lNodeToHandle)) {
      isComponent = true;
      ngDevMode && assertDefined(lNodeToHandle[HOST], 'HOST must be defined for a component LView');
      lNodeToHandle = lNodeToHandle[HOST]!;
    }
    const rNode: RNode = unwrapRNode(lNodeToHandle);
    ngDevMode && !isProceduralRenderer(renderer) && assertDomNode(rNode);

    if (action === WalkTNodeTreeAction.Create && parent !== null) {
      if (beforeNode == null) {
        nativeAppendChild(renderer, parent, rNode);
      } else {
        nativeInsertBefore(renderer, parent, rNode, beforeNode || null, true);
      }
    } else if (action === WalkTNodeTreeAction.Insert && parent !== null) {
      nativeInsertBefore(renderer, parent, rNode, beforeNode || null, true);
    } else if (action === WalkTNodeTreeAction.Detach) {
      nativeRemoveNode(renderer, rNode, isComponent);
    } else if (action === WalkTNodeTreeAction.Destroy) {
      ngDevMode && ngDevMode.rendererDestroyNode++;
      (renderer as ProceduralRenderer3).destroyNode!(rNode);
    }
    if (lContainer != null) {
      applyContainer(renderer, action, lContainer, parent, beforeNode);
    }
  }
}

export function createTextNode(renderer: Renderer3, value: string): RText {
  ngDevMode && ngDevMode.rendererCreateTextNode++;
  ngDevMode && ngDevMode.rendererSetText++;
  return isProceduralRenderer(renderer) ? renderer.createText(value) :
                                          renderer.createTextNode(value);
}

export function updateTextNode(renderer: Renderer3, rNode: RText, value: string): void {
  ngDevMode && ngDevMode.rendererSetText++;
  isProceduralRenderer(renderer) ? renderer.setValue(rNode, value) : rNode.textContent = value;
}

export function createCommentNode(renderer: Renderer3, value: string): RComment {
  ngDevMode && ngDevMode.rendererCreateComment++;
  // isProceduralRenderer check is not needed because both `Renderer2` and `Renderer3` have the same
  // method name.
  return renderer.createComment(escapeCommentText(value));
}

/**
 * Creates a native element from a tag name, using a renderer.
 * @param renderer A renderer to use
 * @param name the tag name
 * @param namespace Optional namespace for element.
 * @returns the element created
 */
export function createElementNode(
    renderer: Renderer3, name: string, namespace: string|null): RElement {
  ngDevMode && ngDevMode.rendererCreateElement++;
  if (isProceduralRenderer(renderer)) {
    return renderer.createElement(name, namespace);
  } else {
    return namespace === null ? renderer.createElement(name) :
                                renderer.createElementNS(namespace, name);
  }
}


/**
 * Removes all DOM elements associated with a view.
 *
 * Because some root nodes of the view may be containers, we sometimes need
 * to propagate deeply into the nested containers to remove all elements in the
 * views beneath it.
 *
 * @param tView The `TView' of the `LView` from which elements should be added or removed
 * @param lView The view from which elements should be added or removed
 */
export function removeViewFromContainer(tView: TView, lView: LView): void {
  const renderer = lView[RENDERER];
  applyView(tView, lView, renderer, WalkTNodeTreeAction.Detach, null, null);
  lView[HOST] = null;
  lView[T_HOST] = null;
}

/**
 * Adds all DOM elements associated with a view.
 *
 * Because some root nodes of the view may be containers, we sometimes need
 * to propagate deeply into the nested containers to add all elements in the
 * views beneath it.
 *
 * @param tView The `TView' of the `LView` from which elements should be added or removed
 * @param parentTNode The `TNode` where the `LView` should be attached to.
 * @param renderer Current renderer to use for DOM manipulations.
 * @param lView The view from which elements should be added or removed
 * @param parentNativeNode The parent `RElement` where it should be inserted into.
 * @param beforeNode The node before which elements should be added, if insert mode
 */
export function addViewToContainer(
    tView: TView, parentTNode: TNode, renderer: Renderer3, lView: LView, parentNativeNode: RElement,
    beforeNode: RNode|null): void {
  lView[HOST] = parentNativeNode;
  lView[T_HOST] = parentTNode;
  applyView(tView, lView, renderer, WalkTNodeTreeAction.Insert, parentNativeNode, beforeNode);
}


/**
 * Detach a `LView` from the DOM by detaching its nodes.
 *
 * @param tView The `TView' of the `LView` to be detached
 * @param lView the `LView` to be detached.
 */
export function renderDetachView(tView: TView, lView: LView) {
  applyView(tView, lView, lView[RENDERER], WalkTNodeTreeAction.Detach, null, null);
}

/**
 * Traverses down and up the tree of views and containers to remove listeners and
 * call onDestroy callbacks.
 *
 * Notes:
 *  - Because it's used for onDestroy calls, it needs to be bottom-up.
 *  - Must process containers instead of their views to avoid splicing
 *  when views are destroyed and re-added.
 *  - Using a while loop because it's faster than recursion
 *  - Destroy only called on movement to sibling or movement to parent (laterally or up)
 *
 *  @param rootView The view to destroy
 */
export function destroyViewTree(rootView: LView): void {
  // If the view has no children, we can clean it up and return early.
  let lViewOrLContainer = rootView[CHILD_HEAD];
  if (!lViewOrLContainer) {
    return cleanUpView(rootView[TVIEW], rootView);
  }

  while (lViewOrLContainer) {
    let next: LView|LContainer|null = null;

    if (isLView(lViewOrLContainer)) {
      // If LView, traverse down to child.
      next = lViewOrLContainer[CHILD_HEAD];
    } else {
      ngDevMode && assertLContainer(lViewOrLContainer);
      // If container, traverse down to its first LView.
      const firstView: LView|undefined = lViewOrLContainer[CONTAINER_HEADER_OFFSET];
      if (firstView) next = firstView;
    }

    if (!next) {
      // Only clean up view when moving to the side or up, as destroy hooks
      // should be called in order from the bottom up.
      while (lViewOrLContainer && !lViewOrLContainer![NEXT] && lViewOrLContainer !== rootView) {
        if (isLView(lViewOrLContainer)) {
          cleanUpView(lViewOrLContainer[TVIEW], lViewOrLContainer);
        }
        lViewOrLContainer = lViewOrLContainer[PARENT];
      }
      if (lViewOrLContainer === null) lViewOrLContainer = rootView;
      if (isLView(lViewOrLContainer)) {
        cleanUpView(lViewOrLContainer[TVIEW], lViewOrLContainer);
      }
      next = lViewOrLContainer && lViewOrLContainer![NEXT];
    }
    lViewOrLContainer = next;
  }
}

/**
 * Inserts a view into a container.
 *
 * This adds the view to the container's array of active views in the correct
 * position. It also adds the view's elements to the DOM if the container isn't a
 * root node of another view (in that case, the view's elements will be added when
 * the container's parent view is added later).
 *
 * @param tView The `TView' of the `LView` to insert
 * @param lView The view to insert
 * @param lContainer The container into which the view should be inserted
 * @param index Which index in the container to insert the child view into
 */
export function insertView(tView: TView, lView: LView, lContainer: LContainer, index: number) {
  ngDevMode && assertLView(lView);
  ngDevMode && assertLContainer(lContainer);
  const indexInContainer = CONTAINER_HEADER_OFFSET + index;
  const containerLength = lContainer.length;

  if (index > 0) {
    // This is a new view, we need to add it to the children.
    lContainer[indexInContainer - 1][NEXT] = lView;
  }
  if (index < containerLength - CONTAINER_HEADER_OFFSET) {
    lView[NEXT] = lContainer[indexInContainer];
    addToArray(lContainer, CONTAINER_HEADER_OFFSET + index, lView);
  } else {
    lContainer.push(lView);
    lView[NEXT] = null;
  }

  lView[PARENT] = lContainer;

  // track views where declaration and insertion points are different
  const declarationLContainer = lView[DECLARATION_LCONTAINER];
  if (declarationLContainer !== null && lContainer !== declarationLContainer) {
    trackMovedView(declarationLContainer, lView);
  }

  // notify query that a new view has been added
  const lQueries = lView[QUERIES];
  if (lQueries !== null) {
    lQueries.insertView(tView);
  }

  // Sets the attached flag
  lView[FLAGS] |= LViewFlags.Attached;
}

/**
 * Track views created from the declaration container (TemplateRef) and inserted into a
 * different LContainer.
 */
function trackMovedView(declarationContainer: LContainer, lView: LView) {
  ngDevMode && assertDefined(lView, 'LView required');
  ngDevMode && assertLContainer(declarationContainer);
  const movedViews = declarationContainer[MOVED_VIEWS];
  const insertedLContainer = lView[PARENT] as LContainer;
  ngDevMode && assertLContainer(insertedLContainer);
  const insertedComponentLView = insertedLContainer[PARENT]![DECLARATION_COMPONENT_VIEW];
  ngDevMode && assertDefined(insertedComponentLView, 'Missing insertedComponentLView');
  const declaredComponentLView = lView[DECLARATION_COMPONENT_VIEW];
  ngDevMode && assertDefined(declaredComponentLView, 'Missing declaredComponentLView');
  if (declaredComponentLView !== insertedComponentLView) {
    // At this point the declaration-component is not same as insertion-component; this means that
    // this is a transplanted view. Mark the declared lView as having transplanted views so that
    // those views can participate in CD.
    declarationContainer[HAS_TRANSPLANTED_VIEWS] = true;
  }
  if (movedViews === null) {
    declarationContainer[MOVED_VIEWS] = [lView];
  } else {
    movedViews.push(lView);
  }
}

function detachMovedView(declarationContainer: LContainer, lView: LView) {
  ngDevMode && assertLContainer(declarationContainer);
  ngDevMode &&
      assertDefined(
          declarationContainer[MOVED_VIEWS],
          'A projected view should belong to a non-empty projected views collection');
  const movedViews = declarationContainer[MOVED_VIEWS]!;
  const declarationViewIndex = movedViews.indexOf(lView);
  const insertionLContainer = lView[PARENT] as LContainer;
  ngDevMode && assertLContainer(insertionLContainer);

  // If the view was marked for refresh but then detached before it was checked (where the flag
  // would be cleared and the counter decremented), we need to decrement the view counter here
  // instead.
  if (lView[FLAGS] & LViewFlags.RefreshTransplantedView) {
    lView[FLAGS] &= ~LViewFlags.RefreshTransplantedView;
    updateTransplantedViewCount(insertionLContainer, -1);
  }

  movedViews.splice(declarationViewIndex, 1);
}

/**
 * Detaches a view from a container.
 *
 * This method removes the view from the container's array of active views. It also
 * removes the view's elements from the DOM.
 *
 * @param lContainer The container from which to detach a view
 * @param removeIndex The index of the view to detach
 * @returns Detached LView instance.
 */
export function detachView(lContainer: LContainer, removeIndex: number): LView|undefined {
  if (lContainer.length <= CONTAINER_HEADER_OFFSET) return;

  const indexInContainer = CONTAINER_HEADER_OFFSET + removeIndex;
  const viewToDetach = lContainer[indexInContainer];

  if (viewToDetach) {
    const declarationLContainer = viewToDetach[DECLARATION_LCONTAINER];
    if (declarationLContainer !== null && declarationLContainer !== lContainer) {
      detachMovedView(declarationLContainer, viewToDetach);
    }


    if (removeIndex > 0) {
      lContainer[indexInContainer - 1][NEXT] = viewToDetach[NEXT] as LView;
    }
    const removedLView = removeFromArray(lContainer, CONTAINER_HEADER_OFFSET + removeIndex);
    removeViewFromContainer(viewToDetach[TVIEW], viewToDetach);

    // notify query that a view has been removed
    const lQueries = removedLView[QUERIES];
    if (lQueries !== null) {
      lQueries.detachView(removedLView[TVIEW]);
    }

    viewToDetach[PARENT] = null;
    viewToDetach[NEXT] = null;
    // Unsets the attached flag
    viewToDetach[FLAGS] &= ~LViewFlags.Attached;
  }
  return viewToDetach;
}

/**
 * A standalone function which destroys an LView,
 * conducting clean up (e.g. removing listeners, calling onDestroys).
 *
 * @param tView The `TView' of the `LView` to be destroyed
 * @param lView The view to be destroyed.
 */
export function destroyLView(tView: TView, lView: LView) {
  if (!(lView[FLAGS] & LViewFlags.Destroyed)) {
    const renderer = lView[RENDERER];
    if (isProceduralRenderer(renderer) && renderer.destroyNode) {
      applyView(tView, lView, renderer, WalkTNodeTreeAction.Destroy, null, null);
    }

    destroyViewTree(lView);
  }
}

/**
 * Calls onDestroys hooks for all directives and pipes in a given view and then removes all
 * listeners. Listeners are removed as the last step so events delivered in the onDestroys hooks
 * can be propagated to @Output listeners.
 *
 * @param tView `TView` for the `LView` to clean up.
 * @param lView The LView to clean up
 */
function cleanUpView(tView: TView, lView: LView): void {
  if (!(lView[FLAGS] & LViewFlags.Destroyed)) {
    // Usually the Attached flag is removed when the view is detached from its parent, however
    // if it's a root view, the flag won't be unset hence why we're also removing on destroy.
    lView[FLAGS] &= ~LViewFlags.Attached;

    // Mark the LView as destroyed *before* executing the onDestroy hooks. An onDestroy hook
    // runs arbitrary user code, which could include its own `viewRef.destroy()` (or similar). If
    // We don't flag the view as destroyed before the hooks, this could lead to an infinite loop.
    // This also aligns with the ViewEngine behavior. It also means that the onDestroy hook is
    // really more of an "afterDestroy" hook if you think about it.
    lView[FLAGS] |= LViewFlags.Destroyed;

    executeOnDestroys(tView, lView);
    processCleanups(tView, lView);
    // For component views only, the local renderer is destroyed at clean up time.
    if (lView[TVIEW].type === TViewType.Component && isProceduralRenderer(lView[RENDERER])) {
      ngDevMode && ngDevMode.rendererDestroy++;
      (lView[RENDERER] as ProceduralRenderer3).destroy();
    }

    const declarationContainer = lView[DECLARATION_LCONTAINER];
    // we are dealing with an embedded view that is still inserted into a container
    if (declarationContainer !== null && isLContainer(lView[PARENT])) {
      // and this is a projected view
      if (declarationContainer !== lView[PARENT]) {
        detachMovedView(declarationContainer, lView);
      }

      // For embedded views still attached to a container: remove query result from this view.
      const lQueries = lView[QUERIES];
      if (lQueries !== null) {
        lQueries.detachView(tView);
      }
    }
  }
}

/** Removes listeners and unsubscribes from output subscriptions */
function processCleanups(tView: TView, lView: LView): void {
  const tCleanup = tView.cleanup;
  const lCleanup = lView[CLEANUP]!;
  // `LCleanup` contains both share information with `TCleanup` as well as instance specific
  // information appended at the end. We need to know where the end of the `TCleanup` information
  // is, and we track this with `lastLCleanupIndex`.
  let lastLCleanupIndex = -1;
  if (tCleanup !== null) {
    for (let i = 0; i < tCleanup.length - 1; i += 2) {
      if (typeof tCleanup[i] === 'string') {
        // This is a native DOM listener
        const idxOrTargetGetter = tCleanup[i + 1];
        const target = typeof idxOrTargetGetter === 'function' ?
            idxOrTargetGetter(lView) :
            unwrapRNode(lView[idxOrTargetGetter]);
        const listener = lCleanup[lastLCleanupIndex = tCleanup[i + 2]];
        const useCaptureOrSubIdx = tCleanup[i + 3];
        if (typeof useCaptureOrSubIdx === 'boolean') {
          // native DOM listener registered with Renderer3
          target.removeEventListener(tCleanup[i], listener, useCaptureOrSubIdx);
        } else {
          if (useCaptureOrSubIdx >= 0) {
            // unregister
            lCleanup[lastLCleanupIndex = useCaptureOrSubIdx]();
          } else {
            // Subscription
            lCleanup[lastLCleanupIndex = -useCaptureOrSubIdx].unsubscribe();
          }
        }
        i += 2;
      } else {
        // This is a cleanup function that is grouped with the index of its context
        const context = lCleanup[lastLCleanupIndex = tCleanup[i + 1]];
        tCleanup[i].call(context);
      }
    }
  }
  if (lCleanup !== null) {
    for (let i = lastLCleanupIndex + 1; i < lCleanup.length; i++) {
      const instanceCleanupFn = lCleanup[i];
      ngDevMode && assertFunction(instanceCleanupFn, 'Expecting instance cleanup function.');
      instanceCleanupFn();
    }
    lView[CLEANUP] = null;
  }
}

/** Calls onDestroy hooks for this view */
function executeOnDestroys(tView: TView, lView: LView): void {
  let destroyHooks: DestroyHookData|null;

  if (tView != null && (destroyHooks = tView.destroyHooks) != null) {
    for (let i = 0; i < destroyHooks.length; i += 2) {
      const context = lView[destroyHooks[i] as number];

      // Only call the destroy hook if the context has been requested.
      if (!(context instanceof NodeInjectorFactory)) {
        const toCall = destroyHooks[i + 1] as HookFn | HookData;

        if (Array.isArray(toCall)) {
          for (let j = 0; j < toCall.length; j += 2) {
            const callContext = context[toCall[j] as number];
            const hook = toCall[j + 1] as HookFn;
            profiler(ProfilerEvent.LifecycleHookStart, callContext, hook);
            try {
              hook.call(callContext);
            } finally {
              profiler(ProfilerEvent.LifecycleHookEnd, callContext, hook);
            }
          }
        } else {
          profiler(ProfilerEvent.LifecycleHookStart, context, toCall);
          try {
            toCall.call(context);
          } finally {
            profiler(ProfilerEvent.LifecycleHookEnd, context, toCall);
          }
        }
      }
    }
  }
}

/**
 * Returns a native element if a node can be inserted into the given parent.
 *
 * There are two reasons why we may not be able to insert a element immediately.
 * - Projection: When creating a child content element of a component, we have to skip the
 *   insertion because the content of a component will be projected.
 *   `<component><content>delayed due to projection</content></component>`
 * - Parent container is disconnected: This can happen when we are inserting a view into
 *   parent container, which itself is disconnected. For example the parent container is part
 *   of a View which has not be inserted or is made for projection but has not been inserted
 *   into destination.
 *
 * @param tView: Current `TView`.
 * @param tNode: `TNode` for which we wish to retrieve render parent.
 * @param lView: Current `LView`.
 */
export function getParentRElement(tView: TView, tNode: TNode, lView: LView): RElement|null {
  return getClosestRElement(tView, tNode.parent, lView);
}

/**
 * Get closest `RElement` or `null` if it can't be found.
 *
 * If `TNode` is `TNodeType.Element` => return `RElement` at `LView[tNode.index]` location.
 * If `TNode` is `TNodeType.ElementContainer|IcuContain` => return the parent (recursively).
 * If `TNode` is `null` then return host `RElement`:
 *   - return `null` if projection
 *   - return `null` if parent container is disconnected (we have no parent.)
 *
 * @param tView: Current `TView`.
 * @param tNode: `TNode` for which we wish to retrieve `RElement` (or `null` if host element is
 *     needed).
 * @param lView: Current `LView`.
 * @returns `null` if the `RElement` can't be determined at this time (no parent / projection)
 */
export function getClosestRElement(tView: TView, tNode: TNode|null, lView: LView): RElement|null {
  let parentTNode: TNode|null = tNode;
  // Skip over element and ICU containers as those are represented by a comment node and
  // can't be used as a render parent.
  while (parentTNode !== null &&
         (parentTNode.type & (TNodeType.ElementContainer | TNodeType.Icu))) {
    tNode = parentTNode;
    parentTNode = tNode.parent;
  }

  // If the parent tNode is null, then we are inserting across views: either into an embedded view
  // or a component view.
  if (parentTNode === null) {
    // We are inserting a root element of the component view into the component host element and
    // it should always be eager.
    return lView[HOST];
  } else {
    ngDevMode && assertTNodeType(parentTNode, TNodeType.AnyRNode | TNodeType.Container);
    if (parentTNode.flags & TNodeFlags.isComponentHost) {
      ngDevMode && assertTNodeForLView(parentTNode, lView);
      const encapsulation =
          (tView.data[parentTNode.directiveStart] as ComponentDef<unknown>).encapsulation;
      // We've got a parent which is an element in the current view. We just need to verify if the
      // parent element is not a component. Component's content nodes are not inserted immediately
      // because they will be projected, and so doing insert at this point would be wasteful.
      // Since the projection would then move it to its final destination. Note that we can't
      // make this assumption when using the Shadow DOM, because the native projection placeholders
      // (<content> or <slot>) have to be in place as elements are being inserted.
      if (encapsulation === ViewEncapsulation.None ||
          encapsulation === ViewEncapsulation.Emulated) {
        return null;
      }
    }

    return getNativeByTNode(parentTNode, lView) as RElement;
  }
}

/**
 * Inserts a native node before another native node for a given parent using {@link Renderer3}.
 * This is a utility function that can be used when native nodes were determined - it abstracts an
 * actual renderer being used.
 */
export function nativeInsertBefore(
    renderer: Renderer3, parent: RElement, child: RNode, beforeNode: RNode|null,
    isMove: boolean): void {
  ngDevMode && ngDevMode.rendererInsertBefore++;
  if (isProceduralRenderer(renderer)) {
    renderer.insertBefore(parent, child, beforeNode, isMove);
  } else {
    parent.insertBefore(child, beforeNode, isMove);
  }
}

function nativeAppendChild(renderer: Renderer3, parent: RElement, child: RNode): void {
  ngDevMode && ngDevMode.rendererAppendChild++;
  ngDevMode && assertDefined(parent, 'parent node must be defined');
  if (isProceduralRenderer(renderer)) {
    renderer.appendChild(parent, child);
  } else {
    parent.appendChild(child);
  }
}

function nativeAppendOrInsertBefore(
    renderer: Renderer3, parent: RElement, child: RNode, beforeNode: RNode|null, isMove: boolean) {
  if (beforeNode !== null) {
    nativeInsertBefore(renderer, parent, child, beforeNode, isMove);
  } else {
    nativeAppendChild(renderer, parent, child);
  }
}

/** Removes a node from the DOM given its native parent. */
function nativeRemoveChild(
    renderer: Renderer3, parent: RElement, child: RNode, isHostElement?: boolean): void {
  if (isProceduralRenderer(renderer)) {
    renderer.removeChild(parent, child, isHostElement);
  } else {
    parent.removeChild(child);
  }
}

/**
 * Returns a native parent of a given native node.
 */
export function nativeParentNode(renderer: Renderer3, node: RNode): RElement|null {
  return (isProceduralRenderer(renderer) ? renderer.parentNode(node) : node.parentNode) as RElement;
}

/**
 * Returns a native sibling of a given native node.
 */
export function nativeNextSibling(renderer: Renderer3, node: RNode): RNode|null {
  return isProceduralRenderer(renderer) ? renderer.nextSibling(node) : node.nextSibling;
}

/**
 * Find a node in front of which `currentTNode` should be inserted.
 *
 * This method determines the `RNode` in front of which we should insert the `currentRNode`. This
 * takes `TNode.insertBeforeIndex` into account if i18n code has been invoked.
 *
 * @param parentTNode parent `TNode`
 * @param currentTNode current `TNode` (The node which we would like to insert into the DOM)
 * @param lView current `LView`
 */
function getInsertInFrontOfRNode(parentTNode: TNode, currentTNode: TNode, lView: LView): RNode|
    null {
  return _getInsertInFrontOfRNodeWithI18n(parentTNode, currentTNode, lView);
}


/**
 * Find a node in front of which `currentTNode` should be inserted. (Does not take i18n into
 * account)
 *
 * This method determines the `RNode` in front of which we should insert the `currentRNode`. This
 * does not take `TNode.insertBeforeIndex` into account.
 *
 * @param parentTNode parent `TNode`
 * @param currentTNode current `TNode` (The node which we would like to insert into the DOM)
 * @param lView current `LView`
 */
export function getInsertInFrontOfRNodeWithNoI18n(
    parentTNode: TNode, currentTNode: TNode, lView: LView): RNode|null {
  if (parentTNode.type & (TNodeType.ElementContainer | TNodeType.Icu)) {
    return getNativeByTNode(parentTNode, lView);
  }
  return null;
}

/**
 * Tree shakable boundary for `getInsertInFrontOfRNodeWithI18n` function.
 *
 * This function will only be set if i18n code runs.
 */
let _getInsertInFrontOfRNodeWithI18n: (parentTNode: TNode, currentTNode: TNode, lView: LView) =>
    RNode | null = getInsertInFrontOfRNodeWithNoI18n;

/**
 * Tree shakable boundary for `processI18nInsertBefore` function.
 *
 * This function will only be set if i18n code runs.
 */
let _processI18nInsertBefore: (
    renderer: Renderer3, childTNode: TNode, lView: LView, childRNode: RNode|RNode[],
    parentRElement: RElement|null) => void;

export function setI18nHandling(
    getInsertInFrontOfRNodeWithI18n: (parentTNode: TNode, currentTNode: TNode, lView: LView) =>
        RNode | null,
    processI18nInsertBefore: (
        renderer: Renderer3, childTNode: TNode, lView: LView, childRNode: RNode|RNode[],
        parentRElement: RElement|null) => void) {
  _getInsertInFrontOfRNodeWithI18n = getInsertInFrontOfRNodeWithI18n;
  _processI18nInsertBefore = processI18nInsertBefore;
}

/**
 * Appends the `child` native node (or a collection of nodes) to the `parent`.
 *
 * @param tView The `TView' to be appended
 * @param lView The current LView
 * @param childRNode The native child (or children) that should be appended
 * @param childTNode The TNode of the child element
 */
export function appendChild(
    tView: TView, lView: LView, childRNode: RNode|RNode[], childTNode: TNode): void {
  const parentRNode = getParentRElement(tView, childTNode, lView);
  const renderer = lView[RENDERER];
  const parentTNode: TNode = childTNode.parent || lView[T_HOST]!;
  const anchorNode = getInsertInFrontOfRNode(parentTNode, childTNode, lView);
  if (parentRNode != null) {
    if (Array.isArray(childRNode)) {
      for (let i = 0; i < childRNode.length; i++) {
        nativeAppendOrInsertBefore(renderer, parentRNode, childRNode[i], anchorNode, false);
      }
    } else {
      nativeAppendOrInsertBefore(renderer, parentRNode, childRNode, anchorNode, false);
    }
  }

  _processI18nInsertBefore !== undefined &&
      _processI18nInsertBefore(renderer, childTNode, lView, childRNode, parentRNode);
}

/**
 * Returns the first native node for a given LView, starting from the provided TNode.
 *
 * Native nodes are returned in the order in which those appear in the native tree (DOM).
 */
function getFirstNativeNode(lView: LView, tNode: TNode|null): RNode|null {
  if (tNode !== null) {
    ngDevMode &&
        assertTNodeType(
            tNode,
            TNodeType.AnyRNode | TNodeType.AnyContainer | TNodeType.Icu | TNodeType.Projection);

    const tNodeType = tNode.type;
    if (tNodeType & TNodeType.AnyRNode) {
      return getNativeByTNode(tNode, lView);
    } else if (tNodeType & TNodeType.Container) {
      return getBeforeNodeForView(-1, lView[tNode.index]);
    } else if (tNodeType & TNodeType.ElementContainer) {
      const elIcuContainerChild = tNode.child;
      if (elIcuContainerChild !== null) {
        return getFirstNativeNode(lView, elIcuContainerChild);
      } else {
        const rNodeOrLContainer = lView[tNode.index];
        if (isLContainer(rNodeOrLContainer)) {
          return getBeforeNodeForView(-1, rNodeOrLContainer);
        } else {
          return unwrapRNode(rNodeOrLContainer);
        }
      }
    } else if (tNodeType & TNodeType.Icu) {
      let nextRNode = icuContainerIterate(tNode as TIcuContainerNode, lView);
      let rNode: RNode|null = nextRNode();
      // If the ICU container has no nodes, than we use the ICU anchor as the node.
      return rNode || unwrapRNode(lView[tNode.index]);
    } else {
      const projectionNodes = getProjectionNodes(lView, tNode);
      if (projectionNodes !== null) {
        if (Array.isArray(projectionNodes)) {
          return projectionNodes[0];
        }
        const parentView = getLViewParent(lView[DECLARATION_COMPONENT_VIEW]);
        ngDevMode && assertParentView(parentView);
        return getFirstNativeNode(parentView!, projectionNodes);
      } else {
        return getFirstNativeNode(lView, tNode.next);
      }
    }
  }

  return null;
}

export function getProjectionNodes(lView: LView, tNode: TNode|null): TNode|RNode[]|null {
  if (tNode !== null) {
    const componentView = lView[DECLARATION_COMPONENT_VIEW];
    const componentHost = componentView[T_HOST] as TElementNode;
    const slotIdx = tNode.projection as number;
    ngDevMode && assertProjectionSlots(lView);
    return componentHost.projection![slotIdx];
  }
  return null;
}

export function getBeforeNodeForView(viewIndexInContainer: number, lContainer: LContainer): RNode|
    null {
  const nextViewIndex = CONTAINER_HEADER_OFFSET + viewIndexInContainer + 1;
  if (nextViewIndex < lContainer.length) {
    const lView = lContainer[nextViewIndex] as LView;
    const firstTNodeOfView = lView[TVIEW].firstChild;
    if (firstTNodeOfView !== null) {
      return getFirstNativeNode(lView, firstTNodeOfView);
    }
  }

  return lContainer[NATIVE];
}

/**
 * Removes a native node itself using a given renderer. To remove the node we are looking up its
 * parent from the native tree as not all platforms / browsers support the equivalent of
 * node.remove().
 *
 * @param renderer A renderer to be used
 * @param rNode The native node that should be removed
 * @param isHostElement A flag indicating if a node to be removed is a host of a component.
 */
export function nativeRemoveNode(renderer: Renderer3, rNode: RNode, isHostElement?: boolean): void {
  ngDevMode && ngDevMode.rendererRemoveNode++;
  const nativeParent = nativeParentNode(renderer, rNode);
  if (nativeParent) {
    nativeRemoveChild(renderer, nativeParent, rNode, isHostElement);
  }
}


/**
 * Performs the operation of `action` on the node. Typically this involves inserting or removing
 * nodes on the LView or projection boundary.
 */
function applyNodes(
    renderer: Renderer3, action: WalkTNodeTreeAction, tNode: TNode|null, lView: LView,
    parentRElement: RElement|null, beforeNode: RNode|null, isProjection: boolean) {
  while (tNode != null) {
    ngDevMode && assertTNodeForLView(tNode, lView);
    ngDevMode &&
        assertTNodeType(
            tNode,
            TNodeType.AnyRNode | TNodeType.AnyContainer | TNodeType.Projection | TNodeType.Icu);
    const rawSlotValue = lView[tNode.index];
    const tNodeType = tNode.type;
    if (isProjection) {
      if (action === WalkTNodeTreeAction.Create) {
        rawSlotValue && attachPatchData(unwrapRNode(rawSlotValue), lView);
        tNode.flags |= TNodeFlags.isProjected;
      }
    }
    if ((tNode.flags & TNodeFlags.isDetached) !== TNodeFlags.isDetached) {
      if (tNodeType & TNodeType.ElementContainer) {
        applyNodes(renderer, action, tNode.child, lView, parentRElement, beforeNode, false);
        applyToElementOrContainer(action, renderer, parentRElement, rawSlotValue, beforeNode);
      } else if (tNodeType & TNodeType.Icu) {
        const nextRNode = icuContainerIterate(tNode as TIcuContainerNode, lView);
        let rNode: RNode|null;
        while (rNode = nextRNode()) {
          applyToElementOrContainer(action, renderer, parentRElement, rNode, beforeNode);
        }
        applyToElementOrContainer(action, renderer, parentRElement, rawSlotValue, beforeNode);
      } else if (tNodeType & TNodeType.Projection) {
        applyProjectionRecursive(
            renderer, action, lView, tNode as TProjectionNode, parentRElement, beforeNode);
      } else {
        ngDevMode && assertTNodeType(tNode, TNodeType.AnyRNode | TNodeType.Container);
        applyToElementOrContainer(action, renderer, parentRElement, rawSlotValue, beforeNode);
      }
    }
    tNode = isProjection ? tNode.projectionNext : tNode.next;
  }
}


/**
 * `applyView` performs operation on the view as specified in `action` (insert, detach, destroy)
 *
 * Inserting a view without projection or containers at top level is simple. Just iterate over the
 * root nodes of the View, and for each node perform the `action`.
 *
 * Things get more complicated with containers and projections. That is because coming across:
 * - Container: implies that we have to insert/remove/destroy the views of that container as well
 *              which in turn can have their own Containers at the View roots.
 * - Projection: implies that we have to insert/remove/destroy the nodes of the projection. The
 *               complication is that the nodes we are projecting can themselves have Containers
 *               or other Projections.
 *
 * As you can see this is a very recursive problem. Yes recursion is not most efficient but the
 * code is complicated enough that trying to implemented with recursion becomes unmaintainable.
 *
 * @param tView The `TView' which needs to be inserted, detached, destroyed
 * @param lView The LView which needs to be inserted, detached, destroyed.
 * @param renderer Renderer to use
 * @param action action to perform (insert, detach, destroy)
 * @param parentRElement parent DOM element for insertion (Removal does not need it).
 * @param beforeNode Before which node the insertions should happen.
 */
function applyView(
    tView: TView, lView: LView, renderer: Renderer3, action: WalkTNodeTreeAction.Destroy,
    parentRElement: null, beforeNode: null): void;
function applyView(
    tView: TView, lView: LView, renderer: Renderer3, action: WalkTNodeTreeAction,
    parentRElement: RElement|null, beforeNode: RNode|null): void;
function applyView(
    tView: TView, lView: LView, renderer: Renderer3, action: WalkTNodeTreeAction,
    parentRElement: RElement|null, beforeNode: RNode|null): void {
  applyNodes(renderer, action, tView.firstChild, lView, parentRElement, beforeNode, false);
}

/**
 * `applyProjection` performs operation on the projection.
 *
 * Inserting a projection requires us to locate the projected nodes from the parent component. The
 * complication is that those nodes themselves could be re-projected from their parent component.
 *
 * @param tView The `TView` of `LView` which needs to be inserted, detached, destroyed
 * @param lView The `LView` which needs to be inserted, detached, destroyed.
 * @param tProjectionNode node to project
 */
export function applyProjection(tView: TView, lView: LView, tProjectionNode: TProjectionNode) {
  const renderer = lView[RENDERER];
  const parentRNode = getParentRElement(tView, tProjectionNode, lView);
  const parentTNode = tProjectionNode.parent || lView[T_HOST]!;
  let beforeNode = getInsertInFrontOfRNode(parentTNode, tProjectionNode, lView);
  applyProjectionRecursive(
      renderer, WalkTNodeTreeAction.Create, lView, tProjectionNode, parentRNode, beforeNode);
}

/**
 * `applyProjectionRecursive` performs operation on the projection specified by `action` (insert,
 * detach, destroy)
 *
 * Inserting a projection requires us to locate the projected nodes from the parent component. The
 * complication is that those nodes themselves could be re-projected from their parent component.
 *
 * @param renderer Render to use
 * @param action action to perform (insert, detach, destroy)
 * @param lView The LView which needs to be inserted, detached, destroyed.
 * @param tProjectionNode node to project
 * @param parentRElement parent DOM element for insertion/removal.
 * @param beforeNode Before which node the insertions should happen.
 */
function applyProjectionRecursive(
    renderer: Renderer3, action: WalkTNodeTreeAction, lView: LView,
    tProjectionNode: TProjectionNode, parentRElement: RElement|null, beforeNode: RNode|null) {
  const componentLView = lView[DECLARATION_COMPONENT_VIEW];
  const componentNode = componentLView[T_HOST] as TElementNode;
  ngDevMode &&
      assertEqual(typeof tProjectionNode.projection, 'number', 'expecting projection index');
  const nodeToProjectOrRNodes = componentNode.projection![tProjectionNode.projection]!;
  if (Array.isArray(nodeToProjectOrRNodes)) {
    // This should not exist, it is a bit of a hack. When we bootstrap a top level node and we
    // need to support passing projectable nodes, so we cheat and put them in the TNode
    // of the Host TView. (Yes we put instance info at the T Level). We can get away with it
    // because we know that that TView is not shared and therefore it will not be a problem.
    // This should be refactored and cleaned up.
    for (let i = 0; i < nodeToProjectOrRNodes.length; i++) {
      const rNode = nodeToProjectOrRNodes[i];
      applyToElementOrContainer(action, renderer, parentRElement, rNode, beforeNode);
    }
  } else {
    let nodeToProject: TNode|null = nodeToProjectOrRNodes;
    const projectedComponentLView = componentLView[PARENT] as LView;
    applyNodes(
        renderer, action, nodeToProject, projectedComponentLView, parentRElement, beforeNode, true);
  }
}


/**
 * `applyContainer` performs an operation on the container and its views as specified by
 * `action` (insert, detach, destroy)
 *
 * Inserting a Container is complicated by the fact that the container may have Views which
 * themselves have containers or projections.
 *
 * @param renderer Renderer to use
 * @param action action to perform (insert, detach, destroy)
 * @param lContainer The LContainer which needs to be inserted, detached, destroyed.
 * @param parentRElement parent DOM element for insertion/removal.
 * @param beforeNode Before which node the insertions should happen.
 */
function applyContainer(
    renderer: Renderer3, action: WalkTNodeTreeAction, lContainer: LContainer,
    parentRElement: RElement|null, beforeNode: RNode|null|undefined) {
  ngDevMode && assertLContainer(lContainer);
  const anchor = lContainer[NATIVE];  // LContainer has its own before node.
  const native = unwrapRNode(lContainer);
  // An LContainer can be created dynamically on any node by injecting ViewContainerRef.
  // Asking for a ViewContainerRef on an element will result in a creation of a separate anchor
  // node (comment in the DOM) that will be different from the LContainer's host node. In this
  // particular case we need to execute action on 2 nodes:
  // - container's host node (this is done in the executeActionOnElementOrContainer)
  // - container's host node (this is done here)
  if (anchor !== native) {
    // This is very strange to me (Misko). I would expect that the native is same as anchor. I
    // don't see a reason why they should be different, but they are.
    //
    // If they are we need to process the second anchor as well.
    applyToElementOrContainer(action, renderer, parentRElement, anchor, beforeNode);
  }
  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    const lView = lContainer[i] as LView;
    applyView(lView[TVIEW], lView, renderer, action, parentRElement, anchor);
  }
}

/**
 * Writes class/style to element.
 *
 * @param renderer Renderer to use.
 * @param isClassBased `true` if it should be written to `class` (`false` to write to `style`)
 * @param rNode The Node to write to.
 * @param prop Property to write to. This would be the class/style name.
 * @param value Value to write. If `null`/`undefined`/`false` this is considered a remove (set/add
 *        otherwise).
 */
export function applyStyling(
    renderer: Renderer3, isClassBased: boolean, rNode: RElement, prop: string, value: any) {
  const isProcedural = isProceduralRenderer(renderer);
  if (isClassBased) {
    // We actually want JS true/false here because any truthy value should add the class
    if (!value) {
      ngDevMode && ngDevMode.rendererRemoveClass++;
      if (isProcedural) {
        (renderer as Renderer2).removeClass(rNode, prop);
      } else {
        (rNode as HTMLElement).classList.remove(prop);
      }
    } else {
      ngDevMode && ngDevMode.rendererAddClass++;
      if (isProcedural) {
        (renderer as Renderer2).addClass(rNode, prop);
      } else {
        ngDevMode && assertDefined((rNode as HTMLElement).classList, 'HTMLElement expected');
        (rNode as HTMLElement).classList.add(prop);
      }
    }
  } else {
    let flags = prop.indexOf('-') === -1 ? undefined : RendererStyleFlags2.DashCase as number;
    if (value == null /** || value === undefined */) {
      ngDevMode && ngDevMode.rendererRemoveStyle++;
      if (isProcedural) {
        (renderer as Renderer2).removeStyle(rNode, prop, flags);
      } else {
        (rNode as HTMLElement).style.removeProperty(prop);
      }
    } else {
      // A value is important if it ends with `!important`. The style
      // parser strips any semicolons at the end of the value.
      const isImportant = typeof value === 'string' ? value.endsWith('!important') : false;

      if (isImportant) {
        // !important has to be stripped from the value for it to be valid.
        value = value.slice(0, -10);
        flags! |= RendererStyleFlags2.Important;
      }

      ngDevMode && ngDevMode.rendererSetStyle++;
      if (isProcedural) {
        (renderer as Renderer2).setStyle(rNode, prop, value, flags);
      } else {
        ngDevMode && assertDefined((rNode as HTMLElement).style, 'HTMLElement expected');
        (rNode as HTMLElement).style.setProperty(prop, value, isImportant ? 'important' : '');
      }
    }
  }
}


/**
 * Write `cssText` to `RElement`.
 *
 * This function does direct write without any reconciliation. Used for writing initial values, so
 * that static styling values do not pull in the style parser.
 *
 * @param renderer Renderer to use
 * @param element The element which needs to be updated.
 * @param newValue The new class list to write.
 */
export function writeDirectStyle(renderer: Renderer3, element: RElement, newValue: string) {
  ngDevMode && assertString(newValue, '\'newValue\' should be a string');
  if (isProceduralRenderer(renderer)) {
    renderer.setAttribute(element, 'style', newValue);
  } else {
    (element as HTMLElement).style.cssText = newValue;
  }
  ngDevMode && ngDevMode.rendererSetStyle++;
}

/**
 * Write `className` to `RElement`.
 *
 * This function does direct write without any reconciliation. Used for writing initial values, so
 * that static styling values do not pull in the style parser.
 *
 * @param renderer Renderer to use
 * @param element The element which needs to be updated.
 * @param newValue The new class list to write.
 */
export function writeDirectClass(renderer: Renderer3, element: RElement, newValue: string) {
  ngDevMode && assertString(newValue, '\'newValue\' should be a string');
  if (isProceduralRenderer(renderer)) {
    if (newValue === '') {
      // There are tests in `google3` which expect `element.getAttribute('class')` to be `null`.
      renderer.removeAttribute(element, 'class');
    } else {
      renderer.setAttribute(element, 'class', newValue);
    }
  } else {
    element.className = newValue;
  }
  ngDevMode && ngDevMode.rendererSetClassName++;
}
