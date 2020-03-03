/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Renderer2} from '../core';
import {ViewEncapsulation} from '../metadata/view';
import {addToArray, removeFromArray} from '../util/array_utils';
import {assertDefined, assertDomNode, assertEqual, assertString} from '../util/assert';

import {assertLContainer, assertLView, assertTNodeForLView} from './assert';
import {attachPatchData} from './context_discovery';
import {ACTIVE_INDEX, ActiveIndexFlag, CONTAINER_HEADER_OFFSET, LContainer, MOVED_VIEWS, NATIVE, unusedValueExportToPlacateAjd as unused1} from './interfaces/container';
import {ComponentDef} from './interfaces/definition';
import {NodeInjectorFactory} from './interfaces/injector';
import {TElementNode, TNode, TNodeFlags, TNodeType, TProjectionNode, TViewNode, unusedValueExportToPlacateAjd as unused2} from './interfaces/node';
import {unusedValueExportToPlacateAjd as unused3} from './interfaces/projection';
import {isProceduralRenderer, ProceduralRenderer3, RElement, Renderer3, RNode, RText, unusedValueExportToPlacateAjd as unused4} from './interfaces/renderer';
import {isLContainer, isLView} from './interfaces/type_checks';
import {CHILD_HEAD, CLEANUP, DECLARATION_COMPONENT_VIEW, DECLARATION_LCONTAINER, DestroyHookData, FLAGS, HookData, HookFn, HOST, LView, LViewFlags, NEXT, PARENT, QUERIES, RENDERER, T_HOST, TVIEW, TView, unusedValueExportToPlacateAjd as unused5} from './interfaces/view';
import {assertNodeOfPossibleTypes, assertNodeType} from './node_assert';
import {getLViewParent} from './util/view_traversal_utils';
import {getNativeByTNode, unwrapRNode} from './util/view_utils';

const unusedValueToPlacateAjd = unused1 + unused2 + unused3 + unused4 + unused5;

export function getLContainer(tNode: TViewNode, embeddedView: LView): LContainer|null {
  ngDevMode && assertLView(embeddedView);
  const container = embeddedView[PARENT] as LContainer;
  if (tNode.index === -1) {
    // This is a dynamically created view inside a dynamic container.
    // The parent isn't an LContainer if the embedded view hasn't been attached yet.
    return isLContainer(container) ? container : null;
  } else {
    ngDevMode && assertLContainer(container);
    // This is a inline view node (e.g. embeddedViewStart)
    return container;
  }
}


/**
 * Retrieves render parent for a given view.
 * Might be null if a view is not yet attached to any container.
 */
export function getContainerRenderParent(tViewNode: TViewNode, view: LView): RElement|null {
  const container = getLContainer(tViewNode, view);
  return container ? nativeParentNode(view[RENDERER], container[NATIVE]) : null;
}

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
        nativeInsertBefore(renderer, parent, rNode, beforeNode || null);
      }
    } else if (action === WalkTNodeTreeAction.Insert && parent !== null) {
      nativeInsertBefore(renderer, parent, rNode, beforeNode || null);
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

export function createTextNode(value: string, renderer: Renderer3): RText {
  ngDevMode && ngDevMode.rendererCreateTextNode++;
  ngDevMode && ngDevMode.rendererSetText++;
  return isProceduralRenderer(renderer) ? renderer.createText(value) :
                                          renderer.createTextNode(value);
}

/**
 * Adds or removes all DOM elements associated with a view.
 *
 * Because some root nodes of the view may be containers, we sometimes need
 * to propagate deeply into the nested containers to remove all elements in the
 * views beneath it.
 *
 * @param tView The `TView' of the `LView` from which elements should be added or removed
 * @param lView The view from which elements should be added or removed
 * @param insertMode Whether or not elements should be added (if false, removing)
 * @param beforeNode The node before which elements should be added, if insert mode
 */
export function addRemoveViewFromContainer(
    tView: TView, lView: LView, insertMode: true, beforeNode: RNode|null): void;
export function addRemoveViewFromContainer(
    tView: TView, lView: LView, insertMode: false, beforeNode: null): void;
export function addRemoveViewFromContainer(
    tView: TView, lView: LView, insertMode: boolean, beforeNode: RNode|null): void {
  const renderParent = getContainerRenderParent(tView.node as TViewNode, lView);
  ngDevMode && assertNodeType(tView.node as TNode, TNodeType.View);
  if (renderParent) {
    const renderer = lView[RENDERER];
    const action = insertMode ? WalkTNodeTreeAction.Insert : WalkTNodeTreeAction.Detach;
    applyView(tView, lView, renderer, action, renderParent, beforeNode);
  }
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
        isLView(lViewOrLContainer) && cleanUpView(lViewOrLContainer[TVIEW], lViewOrLContainer);
        lViewOrLContainer = getParentState(lViewOrLContainer, rootView);
      }
      if (lViewOrLContainer === null) lViewOrLContainer = rootView;
      isLView(lViewOrLContainer) && cleanUpView(lViewOrLContainer[TVIEW], lViewOrLContainer);
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
  const insertedComponentIsOnPush =
      (insertedComponentLView[FLAGS] & LViewFlags.CheckAlways) !== LViewFlags.CheckAlways;
  if (insertedComponentIsOnPush) {
    const declaredComponentLView = lView[DECLARATION_COMPONENT_VIEW];
    ngDevMode && assertDefined(declaredComponentLView, 'Missing declaredComponentLView');
    if (declaredComponentLView !== insertedComponentLView) {
      // At this point the declaration-component is not same as insertion-component and we are in
      // on-push mode, this means that this is a transplanted view. Mark the declared lView as
      // having
      // transplanted views so that those views can participate in CD.
      declarationContainer[ACTIVE_INDEX] |= ActiveIndexFlag.HAS_TRANSPLANTED_VIEWS;
    }
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
  const declaredViewIndex = movedViews.indexOf(lView);
  movedViews.splice(declaredViewIndex, 1);
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
    addRemoveViewFromContainer(viewToDetach[TVIEW], viewToDetach, false, null);

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
 * Removes a view from a container, i.e. detaches it and then destroys the underlying LView.
 *
 * @param lContainer The container from which to remove a view
 * @param removeIndex The index of the view to remove
 */
export function removeView(lContainer: LContainer, removeIndex: number) {
  const detachedView = detachView(lContainer, removeIndex);
  detachedView && destroyLView(detachedView[TVIEW], detachedView);
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
 * Determines which LViewOrLContainer to jump to when traversing back up the
 * tree in destroyViewTree.
 *
 * Normally, the view's parent LView should be checked, but in the case of
 * embedded views, the container (which is the view node's parent, but not the
 * LView's parent) needs to be checked for a possible next property.
 *
 * @param lViewOrLContainer The LViewOrLContainer for which we need a parent state
 * @param rootView The rootView, so we don't propagate too far up the view tree
 * @returns The correct parent LViewOrLContainer
 */
export function getParentState(lViewOrLContainer: LView|LContainer, rootView: LView): LView|
    LContainer|null {
  let tNode;
  if (isLView(lViewOrLContainer) && (tNode = lViewOrLContainer[T_HOST]) &&
      tNode.type === TNodeType.View) {
    // if it's an embedded view, the state needs to go up to the container, in case the
    // container has a next
    return getLContainer(tNode as TViewNode, lViewOrLContainer);
  } else {
    // otherwise, use parent view for containers or component views
    return lViewOrLContainer[PARENT] === rootView ? null : lViewOrLContainer[PARENT];
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
    removeListeners(tView, lView);
    const hostTNode = lView[T_HOST];
    // For component views only, the local renderer is destroyed as clean up time.
    if (hostTNode && hostTNode.type === TNodeType.Element &&
        isProceduralRenderer(lView[RENDERER])) {
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
function removeListeners(tView: TView, lView: LView): void {
  const tCleanup = tView.cleanup;
  if (tCleanup !== null) {
    const lCleanup = lView[CLEANUP]!;
    for (let i = 0; i < tCleanup.length - 1; i += 2) {
      if (typeof tCleanup[i] === 'string') {
        // This is a native DOM listener
        const idxOrTargetGetter = tCleanup[i + 1];
        const target = typeof idxOrTargetGetter === 'function' ?
            idxOrTargetGetter(lView) :
            unwrapRNode(lView[idxOrTargetGetter]);
        const listener = lCleanup[tCleanup[i + 2]];
        const useCaptureOrSubIdx = tCleanup[i + 3];
        if (typeof useCaptureOrSubIdx === 'boolean') {
          // native DOM listener registered with Renderer3
          target.removeEventListener(tCleanup[i], listener, useCaptureOrSubIdx);
        } else {
          if (useCaptureOrSubIdx >= 0) {
            // unregister
            lCleanup[useCaptureOrSubIdx]();
          } else {
            // Subscription
            lCleanup[-useCaptureOrSubIdx].unsubscribe();
          }
        }
        i += 2;
      } else {
        // This is a cleanup function that is grouped with the index of its context
        const context = lCleanup[tCleanup[i + 1]];
        tCleanup[i].call(context);
      }
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
            (toCall[j + 1] as HookFn).call(context[toCall[j] as number]);
          }
        } else {
          toCall.call(context);
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
 */
function getRenderParent(tView: TView, tNode: TNode, currentView: LView): RElement|null {
  // Skip over element and ICU containers as those are represented by a comment node and
  // can't be used as a render parent.
  let parentTNode = tNode.parent;
  while (parentTNode != null &&
         (parentTNode.type === TNodeType.ElementContainer ||
          parentTNode.type === TNodeType.IcuContainer)) {
    tNode = parentTNode;
    parentTNode = tNode.parent;
  }

  // If the parent tNode is null, then we are inserting across views: either into an embedded view
  // or a component view.
  if (parentTNode == null) {
    const hostTNode = currentView[T_HOST]!;
    if (hostTNode.type === TNodeType.View) {
      // We are inserting a root element of an embedded view We might delay insertion of children
      // for a given view if it is disconnected. This might happen for 2 main reasons:
      // - view is not inserted into any container(view was created but not inserted yet)
      // - view is inserted into a container but the container itself is not inserted into the DOM
      // (container might be part of projection or child of a view that is not inserted yet).
      // In other words we can insert children of a given view if this view was inserted into a
      // container and the container itself has its render parent determined.
      return getContainerRenderParent(hostTNode as TViewNode, currentView);
    } else {
      // We are inserting a root element of the component view into the component host element and
      // it should always be eager.
      ngDevMode && assertNodeOfPossibleTypes(hostTNode, TNodeType.Element);
      return currentView[HOST];
    }
  } else {
    const isIcuCase = tNode && tNode.type === TNodeType.IcuContainer;
    // If the parent of this node is an ICU container, then it is represented by comment node and we
    // need to use it as an anchor. If it is projected then it's direct parent node is the renderer.
    if (isIcuCase && tNode.flags & TNodeFlags.isProjected) {
      return getNativeByTNode(tNode, currentView).parentNode as RElement;
    }

    ngDevMode && assertNodeType(parentTNode, TNodeType.Element);
    if (parentTNode.flags & TNodeFlags.isComponentHost) {
      const tData = tView.data;
      const tNode = tData[parentTNode.index] as TNode;
      const encapsulation = (tData[tNode.directiveStart] as ComponentDef<any>).encapsulation;

      // We've got a parent which is an element in the current view. We just need to verify if the
      // parent element is not a component. Component's content nodes are not inserted immediately
      // because they will be projected, and so doing insert at this point would be wasteful.
      // Since the projection would then move it to its final destination. Note that we can't
      // make this assumption when using the Shadow DOM, because the native projection placeholders
      // (<content> or <slot>) have to be in place as elements are being inserted.
      if (encapsulation !== ViewEncapsulation.ShadowDom &&
          encapsulation !== ViewEncapsulation.Native) {
        return null;
      }
    }

    return getNativeByTNode(parentTNode, currentView) as RElement;
  }
}

/**
 * Inserts a native node before another native node for a given parent using {@link Renderer3}.
 * This is a utility function that can be used when native nodes were determined - it abstracts an
 * actual renderer being used.
 */
export function nativeInsertBefore(
    renderer: Renderer3, parent: RElement, child: RNode, beforeNode: RNode|null): void {
  ngDevMode && ngDevMode.rendererInsertBefore++;
  if (isProceduralRenderer(renderer)) {
    renderer.insertBefore(parent, child, beforeNode);
  } else {
    parent.insertBefore(child, beforeNode, true);
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
    renderer: Renderer3, parent: RElement, child: RNode, beforeNode: RNode|null) {
  if (beforeNode !== null) {
    nativeInsertBefore(renderer, parent, child, beforeNode);
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
 * Finds a native "anchor" node for cases where we can't append a native child directly
 * (`appendChild`) and need to use a reference (anchor) node for the `insertBefore` operation.
 * @param parentTNode
 * @param lView
 */
function getNativeAnchorNode(parentTNode: TNode, lView: LView): RNode|null {
  if (parentTNode.type === TNodeType.View) {
    const lContainer = getLContainer(parentTNode as TViewNode, lView);
    if (lContainer === null) return null;
    const index = lContainer.indexOf(lView, CONTAINER_HEADER_OFFSET) - CONTAINER_HEADER_OFFSET;
    return getBeforeNodeForView(index, lContainer);
  } else if (
      parentTNode.type === TNodeType.ElementContainer ||
      parentTNode.type === TNodeType.IcuContainer) {
    return getNativeByTNode(parentTNode, lView);
  }
  return null;
}

/**
 * Appends the `child` native node (or a collection of nodes) to the `parent`.
 *
 * The element insertion might be delayed {@link canInsertNativeNode}.
 *
 * @param tView The `TView' to be appended
 * @param lView The current LView
 * @param childEl The native child (or children) that should be appended
 * @param childTNode The TNode of the child element
 * @returns Whether or not the child was appended
 */
export function appendChild(
    tView: TView, lView: LView, childEl: RNode|RNode[], childTNode: TNode): void {
  const renderParent = getRenderParent(tView, childTNode, lView);
  if (renderParent != null) {
    const renderer = lView[RENDERER];
    const parentTNode: TNode = childTNode.parent || lView[T_HOST]!;
    const anchorNode = getNativeAnchorNode(parentTNode, lView);
    if (Array.isArray(childEl)) {
      for (let i = 0; i < childEl.length; i++) {
        nativeAppendOrInsertBefore(renderer, renderParent, childEl[i], anchorNode);
      }
    } else {
      nativeAppendOrInsertBefore(renderer, renderParent, childEl, anchorNode);
    }
  }
}

/**
 * Returns the first native node for a given LView, starting from the provided TNode.
 *
 * Native nodes are returned in the order in which those appear in the native tree (DOM).
 */
function getFirstNativeNode(lView: LView, tNode: TNode|null): RNode|null {
  if (tNode !== null) {
    ngDevMode &&
        assertNodeOfPossibleTypes(
            tNode, TNodeType.Element, TNodeType.Container, TNodeType.ElementContainer,
            TNodeType.IcuContainer, TNodeType.Projection);

    const tNodeType = tNode.type;
    if (tNodeType === TNodeType.Element) {
      return getNativeByTNode(tNode, lView);
    } else if (tNodeType === TNodeType.Container) {
      return getBeforeNodeForView(-1, lView[tNode.index]);
    } else if (tNodeType === TNodeType.ElementContainer || tNodeType === TNodeType.IcuContainer) {
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
    } else {
      const componentView = lView[DECLARATION_COMPONENT_VIEW];
      const componentHost = componentView[T_HOST] as TElementNode;
      const parentView = getLViewParent(componentView);
      const firstProjectedTNode: TNode|null =
          (componentHost.projection as (TNode | null)[])[tNode.projection as number];

      if (firstProjectedTNode != null) {
        return getFirstNativeNode(parentView!, firstProjectedTNode);
      } else {
        return getFirstNativeNode(lView, tNode.next);
      }
    }
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
    renderParent: RElement|null, beforeNode: RNode|null, isProjection: boolean) {
  while (tNode != null) {
    ngDevMode && assertTNodeForLView(tNode, lView);
    ngDevMode &&
        assertNodeOfPossibleTypes(
            tNode, TNodeType.Container, TNodeType.Element, TNodeType.ElementContainer,
            TNodeType.Projection, TNodeType.Projection, TNodeType.IcuContainer);
    const rawSlotValue = lView[tNode.index];
    const tNodeType = tNode.type;
    if (isProjection) {
      if (action === WalkTNodeTreeAction.Create) {
        rawSlotValue && attachPatchData(unwrapRNode(rawSlotValue), lView);
        tNode.flags |= TNodeFlags.isProjected;
      }
    }
    if ((tNode.flags & TNodeFlags.isDetached) !== TNodeFlags.isDetached) {
      if (tNodeType === TNodeType.ElementContainer || tNodeType === TNodeType.IcuContainer) {
        applyNodes(renderer, action, tNode.child, lView, renderParent, beforeNode, false);
        applyToElementOrContainer(action, renderer, renderParent, rawSlotValue, beforeNode);
      } else if (tNodeType === TNodeType.Projection) {
        applyProjectionRecursive(
            renderer, action, lView, tNode as TProjectionNode, renderParent, beforeNode);
      } else {
        ngDevMode && assertNodeOfPossibleTypes(tNode, TNodeType.Element, TNodeType.Container);
        applyToElementOrContainer(action, renderer, renderParent, rawSlotValue, beforeNode);
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
 * @param renderParent parent DOM element for insertion/removal.
 * @param beforeNode Before which node the insertions should happen.
 */
function applyView(
    tView: TView, lView: LView, renderer: Renderer3, action: WalkTNodeTreeAction,
    renderParent: RElement|null, beforeNode: RNode|null) {
  ngDevMode && assertNodeType(tView.node!, TNodeType.View);
  const viewRootTNode: TNode|null = tView.node!.child;
  applyNodes(renderer, action, viewRootTNode, lView, renderParent, beforeNode, false);
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
  const renderParent = getRenderParent(tView, tProjectionNode, lView);
  const parentTNode = tProjectionNode.parent || lView[T_HOST]!;
  let beforeNode = getNativeAnchorNode(parentTNode, lView);
  applyProjectionRecursive(
      renderer, WalkTNodeTreeAction.Create, lView, tProjectionNode, renderParent, beforeNode);
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
 * @param renderParent parent DOM element for insertion/removal.
 * @param beforeNode Before which node the insertions should happen.
 */
function applyProjectionRecursive(
    renderer: Renderer3, action: WalkTNodeTreeAction, lView: LView,
    tProjectionNode: TProjectionNode, renderParent: RElement|null, beforeNode: RNode|null) {
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
      applyToElementOrContainer(action, renderer, renderParent, rNode, beforeNode);
    }
  } else {
    let nodeToProject: TNode|null = nodeToProjectOrRNodes;
    const projectedComponentLView = componentLView[PARENT] as LView;
    applyNodes(
        renderer, action, nodeToProject, projectedComponentLView, renderParent, beforeNode, true);
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
 * @param renderParent parent DOM element for insertion/removal.
 * @param beforeNode Before which node the insertions should happen.
 */
function applyContainer(
    renderer: Renderer3, action: WalkTNodeTreeAction, lContainer: LContainer,
    renderParent: RElement|null, beforeNode: RNode|null|undefined) {
  ngDevMode && assertLContainer(lContainer);
  const anchor = lContainer[NATIVE];  // LContainer has its own before node.
  const native = unwrapRNode(lContainer);
  // An LContainer can be created dynamically on any node by injecting ViewContainerRef.
  // Asking for a ViewContainerRef on an element will result in a creation of a separate anchor node
  // (comment in the DOM) that will be different from the LContainer's host node. In this particular
  // case we need to execute action on 2 nodes:
  // - container's host node (this is done in the executeActionOnElementOrContainer)
  // - container's host node (this is done here)
  if (anchor !== native) {
    // This is very strange to me (Misko). I would expect that the native is same as anchor. I don't
    // see a reason why they should be different, but they are.
    //
    // If they are we need to process the second anchor as well.
    applyToElementOrContainer(action, renderer, renderParent, anchor, beforeNode);
  }
  for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
    const lView = lContainer[i] as LView;
    applyView(lView[TVIEW], lView, renderer, action, renderParent, anchor);
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
    // TODO(misko): Can't import RendererStyleFlags2.DashCase as it causes imports to be resolved in
    // different order which causes failures. Using direct constant as workaround for now.
    const flags = prop.indexOf('-') == -1 ? undefined : 2 /* RendererStyleFlags2.DashCase */;
    if (value == null /** || value === undefined */) {
      ngDevMode && ngDevMode.rendererRemoveStyle++;
      if (isProcedural) {
        (renderer as Renderer2).removeStyle(rNode, prop, flags);
      } else {
        (rNode as HTMLElement).style.removeProperty(prop);
      }
    } else {
      ngDevMode && ngDevMode.rendererSetStyle++;
      if (isProcedural) {
        (renderer as Renderer2).setStyle(rNode, prop, value, flags);
      } else {
        ngDevMode && assertDefined((rNode as HTMLElement).style, 'HTMLElement expected');
        (rNode as HTMLElement).style.setProperty(prop, value);
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
