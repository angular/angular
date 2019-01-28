/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation} from '../metadata/view';
import {attachPatchData} from './context_discovery';
import {callHooks} from './hooks';
import {LContainer, NATIVE, VIEWS, unusedValueExportToPlacateAjd as unused1} from './interfaces/container';
import {ComponentDef} from './interfaces/definition';
import {TContainerNode, TElementContainerNode, TElementNode, TNode, TNodeFlags, TNodeType, TProjectionNode, TViewNode, unusedValueExportToPlacateAjd as unused2} from './interfaces/node';
import {unusedValueExportToPlacateAjd as unused3} from './interfaces/projection';
import {ProceduralRenderer3, RComment, RElement, RNode, RText, Renderer3, isProceduralRenderer, unusedValueExportToPlacateAjd as unused4} from './interfaces/renderer';
import {CLEANUP, CONTAINER_INDEX, FLAGS, HEADER_OFFSET, HOST_NODE, HookData, LView, LViewFlags, NEXT, PARENT, QUERIES, RENDERER, TVIEW, unusedValueExportToPlacateAjd as unused5} from './interfaces/view';
import {assertNodeType} from './node_assert';
import {findComponentView, getNativeByTNode, isComponent, isLContainer, isRootView, readElementValue, renderStringify} from './util';

const unusedValueToPlacateAjd = unused1 + unused2 + unused3 + unused4 + unused5;

export function getLContainer(tNode: TViewNode, embeddedView: LView): LContainer|null {
  if (tNode.index === -1) {
    // This is a dynamically created view inside a dynamic container.
    // If the host index is -1, the view has not yet been inserted, so it has no parent.
    const containerHostIndex = embeddedView[CONTAINER_INDEX];
    return containerHostIndex > -1 ? embeddedView[PARENT] ![containerHostIndex] : null;
  } else {
    // This is a inline view node (e.g. embeddedViewStart)
    return embeddedView[PARENT] ![tNode.parent !.index] as LContainer;
  }
}


/**
 * Retrieves render parent for a given view.
 * Might be null if a view is not yet attached to any container.
 */
function getContainerRenderParent(tViewNode: TViewNode, view: LView): RElement|null {
  const container = getLContainer(tViewNode, view);
  return container ? nativeParentNode(view[RENDERER], container[NATIVE]) : null;
}

const enum WalkTNodeTreeAction {
  /** node insert in the native environment */
  Insert = 0,

  /** node detach from the native environment */
  Detach = 1,

  /** node destruction using the renderer's API */
  Destroy = 2,
}


/**
 * Stack used to keep track of projection nodes in walkTNodeTree.
 *
 * This is deliberately created outside of walkTNodeTree to avoid allocating
 * a new array each time the function is called. Instead the array will be
 * re-used by each invocation. This works because the function is not reentrant.
 */
const projectionNodeStack: (LView | TNode)[] = [];

/**
 * Walks a tree of TNodes, applying a transformation on the element nodes, either only on the first
 * one found, or on all of them.
 *
 * @param viewToWalk the view to walk
 * @param action identifies the action to be performed on the elements
 * @param renderer the current renderer.
 * @param renderParent Optional the render parent node to be set in all LContainers found,
 * required for action modes Insert and Destroy.
 * @param beforeNode Optional the node before which elements should be added, required for action
 * Insert.
 */
function walkTNodeTree(
    viewToWalk: LView, action: WalkTNodeTreeAction, renderer: Renderer3,
    renderParent: RElement | null, beforeNode?: RNode | null) {
  const rootTNode = viewToWalk[TVIEW].node as TViewNode;
  let projectionNodeIndex = -1;
  let currentView = viewToWalk;
  let tNode: TNode|null = rootTNode.child as TNode;
  while (tNode) {
    let nextTNode: TNode|null = null;
    if (tNode.type === TNodeType.Element) {
      executeNodeAction(
          action, renderer, renderParent, getNativeByTNode(tNode, currentView), tNode, beforeNode);
      const nodeOrContainer = currentView[tNode.index];
      if (isLContainer(nodeOrContainer)) {
        // This element has an LContainer, and its comment needs to be handled
        executeNodeAction(
            action, renderer, renderParent, nodeOrContainer[NATIVE], tNode, beforeNode);
      }
    } else if (tNode.type === TNodeType.Container) {
      const lContainer = currentView ![tNode.index] as LContainer;
      executeNodeAction(action, renderer, renderParent, lContainer[NATIVE], tNode, beforeNode);

      if (lContainer[VIEWS].length) {
        currentView = lContainer[VIEWS][0];
        nextTNode = currentView[TVIEW].node;

        // When the walker enters a container, then the beforeNode has to become the local native
        // comment node.
        beforeNode = lContainer[NATIVE];
      }
    } else if (tNode.type === TNodeType.Projection) {
      const componentView = findComponentView(currentView !);
      const componentHost = componentView[HOST_NODE] as TElementNode;
      const head: TNode|null =
          (componentHost.projection as(TNode | null)[])[tNode.projection as number];

      if (Array.isArray(head)) {
        for (let nativeNode of head) {
          executeNodeAction(action, renderer, renderParent, nativeNode, tNode, beforeNode);
        }
      } else {
        // Must store both the TNode and the view because this projection node could be nested
        // deeply inside embedded views, and we need to get back down to this particular nested
        // view.
        projectionNodeStack[++projectionNodeIndex] = tNode;
        projectionNodeStack[++projectionNodeIndex] = currentView !;
        if (head) {
          currentView = componentView[PARENT] !;
          nextTNode = currentView[TVIEW].data[head.index] as TNode;
        }
      }

    } else {
      // Otherwise, this is a View or an ElementContainer
      nextTNode = tNode.child;
    }

    if (nextTNode === null) {
      // this last node was projected, we need to get back down to its projection node
      if (tNode.next === null && (tNode.flags & TNodeFlags.isProjected)) {
        currentView = projectionNodeStack[projectionNodeIndex--] as LView;
        tNode = projectionNodeStack[projectionNodeIndex--] as TNode;
      }
      nextTNode = tNode.next;

      /**
       * Find the next node in the TNode tree, taking into account the place where a node is
       * projected (in the shadow DOM) rather than where it comes from (in the light DOM).
       *
       * If there is no sibling node, then it goes to the next sibling of the parent node...
       * until it reaches rootNode (at which point null is returned).
       */
      while (!nextTNode) {
        // If parent is null, we're crossing the view boundary, so we should get the host TNode.
        tNode = tNode.parent || currentView[TVIEW].node;

        if (tNode === null || tNode === rootTNode) return null;

        // When exiting a container, the beforeNode must be restored to the previous value
        if (tNode.type === TNodeType.Container) {
          currentView = currentView[PARENT] !;
          beforeNode = currentView[tNode.index][NATIVE];
        }

        if (tNode.type === TNodeType.View && currentView[NEXT]) {
          currentView = currentView[NEXT] as LView;
          nextTNode = currentView[TVIEW].node;
        } else {
          nextTNode = tNode.next;
        }
      }
    }
    tNode = nextTNode;
  }
}

/**
 * NOTE: for performance reasons, the possible actions are inlined within the function instead of
 * being passed as an argument.
 */
function executeNodeAction(
    action: WalkTNodeTreeAction, renderer: Renderer3, parent: RElement | null,
    node: RComment | RElement | RText, tNode: TNode, beforeNode?: RNode | null) {
  if (action === WalkTNodeTreeAction.Insert) {
    nativeInsertBefore(renderer, parent !, node, beforeNode || null);
  } else if (action === WalkTNodeTreeAction.Detach) {
    nativeRemoveChild(renderer, parent !, node, isComponent(tNode));
  } else if (action === WalkTNodeTreeAction.Destroy) {
    ngDevMode && ngDevMode.rendererDestroyNode++;
    (renderer as ProceduralRenderer3).destroyNode !(node);
  }
}

export function createTextNode(value: any, renderer: Renderer3): RText {
  return isProceduralRenderer(renderer) ? renderer.createText(renderStringify(value)) :
                                          renderer.createTextNode(renderStringify(value));
}

/**
 * Adds or removes all DOM elements associated with a view.
 *
 * Because some root nodes of the view may be containers, we sometimes need
 * to propagate deeply into the nested containers to remove all elements in the
 * views beneath it.
 *
 * @param viewToWalk The view from which elements should be added or removed
 * @param insertMode Whether or not elements should be added (if false, removing)
 * @param beforeNode The node before which elements should be added, if insert mode
 */
export function addRemoveViewFromContainer(
    viewToWalk: LView, insertMode: true, beforeNode: RNode | null): void;
export function addRemoveViewFromContainer(viewToWalk: LView, insertMode: false): void;
export function addRemoveViewFromContainer(
    viewToWalk: LView, insertMode: boolean, beforeNode?: RNode | null): void {
  const renderParent = getContainerRenderParent(viewToWalk[TVIEW].node as TViewNode, viewToWalk);
  ngDevMode && assertNodeType(viewToWalk[TVIEW].node as TNode, TNodeType.View);
  if (renderParent) {
    const renderer = viewToWalk[RENDERER];
    walkTNodeTree(
        viewToWalk, insertMode ? WalkTNodeTreeAction.Insert : WalkTNodeTreeAction.Detach, renderer,
        renderParent, beforeNode);
  }
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
  if (rootView[TVIEW].childIndex === -1) {
    return cleanUpView(rootView);
  }
  let viewOrContainer: LView|LContainer|null = getLViewChild(rootView);

  while (viewOrContainer) {
    let next: LView|LContainer|null = null;

    if (viewOrContainer.length >= HEADER_OFFSET) {
      // If LView, traverse down to child.
      const view = viewOrContainer as LView;
      if (view[TVIEW].childIndex > -1) next = getLViewChild(view);
    } else {
      // If container, traverse down to its first LView.
      const container = viewOrContainer as LContainer;
      if (container[VIEWS].length) next = container[VIEWS][0];
    }

    if (next == null) {
      // Only clean up view when moving to the side or up, as destroy hooks
      // should be called in order from the bottom up.
      while (viewOrContainer && !viewOrContainer ![NEXT] && viewOrContainer !== rootView) {
        cleanUpView(viewOrContainer);
        viewOrContainer = getParentState(viewOrContainer, rootView);
      }
      cleanUpView(viewOrContainer || rootView);
      next = viewOrContainer && viewOrContainer ![NEXT];
    }
    viewOrContainer = next;
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
 * @param lView The view to insert
 * @param lContainer The container into which the view should be inserted
 * @param parentView The new parent of the inserted view
 * @param index The index at which to insert the view
 * @param containerIndex The index of the container node, if dynamic
 */
export function insertView(
    lView: LView, lContainer: LContainer, parentView: LView, index: number,
    containerIndex: number) {
  const views = lContainer[VIEWS];

  if (index > 0) {
    // This is a new view, we need to add it to the children.
    views[index - 1][NEXT] = lView;
  }

  if (index < views.length) {
    lView[NEXT] = views[index];
    views.splice(index, 0, lView);
  } else {
    views.push(lView);
    lView[NEXT] = null;
  }

  // Dynamically inserted views need a reference to their parent container's host so it's
  // possible to jump from a view to its container's next when walking the node tree.
  if (containerIndex > -1) {
    lView[CONTAINER_INDEX] = containerIndex;
    lView[PARENT] = parentView;
  }

  // Notify query that a new view has been added
  if (lView[QUERIES]) {
    lView[QUERIES] !.insertView(index);
  }

  // Sets the attached flag
  lView[FLAGS] |= LViewFlags.Attached;
}

/**
 * Detaches a view from a container.
 *
 * This method splices the view from the container's array of active views. It also
 * removes the view's elements from the DOM.
 *
 * @param lContainer The container from which to detach a view
 * @param removeIndex The index of the view to detach
 * @param detached Whether or not this view is already detached.
 * @returns Detached LView instance.
 */
export function detachView(lContainer: LContainer, removeIndex: number, detached: boolean): LView {
  const views = lContainer[VIEWS];
  const viewToDetach = views[removeIndex];
  if (removeIndex > 0) {
    views[removeIndex - 1][NEXT] = viewToDetach[NEXT] as LView;
  }
  views.splice(removeIndex, 1);
  if (!detached) {
    addRemoveViewFromContainer(viewToDetach, false);
  }

  if (viewToDetach[QUERIES]) {
    viewToDetach[QUERIES] !.removeView();
  }
  viewToDetach[CONTAINER_INDEX] = -1;
  viewToDetach[PARENT] = null;
  // Unsets the attached flag
  viewToDetach[FLAGS] &= ~LViewFlags.Attached;
  return viewToDetach;
}

/**
 * Removes a view from a container, i.e. detaches it and then destroys the underlying LView.
 *
 * @param lContainer The container from which to remove a view
 * @param tContainer The TContainer node associated with the LContainer
 * @param removeIndex The index of the view to remove
 */
export function removeView(
    lContainer: LContainer, containerHost: TElementNode | TContainerNode | TElementContainerNode,
    removeIndex: number) {
  const view = lContainer[VIEWS][removeIndex];
  detachView(lContainer, removeIndex, !!containerHost.detached);
  destroyLView(view);
}

/** Gets the child of the given LView */
export function getLViewChild(lView: LView): LView|LContainer|null {
  const childIndex = lView[TVIEW].childIndex;
  return childIndex === -1 ? null : lView[childIndex];
}

/**
 * A standalone function which destroys an LView,
 * conducting cleanup (e.g. removing listeners, calling onDestroys).
 *
 * @param view The view to be destroyed.
 */
export function destroyLView(view: LView) {
  if (!(view[FLAGS] & LViewFlags.Destroyed)) {
    const renderer = view[RENDERER];
    if (isProceduralRenderer(renderer) && renderer.destroyNode) {
      walkTNodeTree(view, WalkTNodeTreeAction.Destroy, renderer, null);
    }

    destroyViewTree(view);
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
 * @param state The LViewOrLContainer for which we need a parent state
 * @param rootView The rootView, so we don't propagate too far up the view tree
 * @returns The correct parent LViewOrLContainer
 */
export function getParentState(state: LView | LContainer, rootView: LView): LView|LContainer|null {
  let tNode;
  if (state.length >= HEADER_OFFSET && (tNode = (state as LView) ![HOST_NODE]) &&
      tNode.type === TNodeType.View) {
    // if it's an embedded view, the state needs to go up to the container, in case the
    // container has a next
    return getLContainer(tNode as TViewNode, state as LView) as LContainer;
  } else {
    // otherwise, use parent view for containers or component views
    return state[PARENT] === rootView ? null : state[PARENT];
  }
}

/**
 * Calls onDestroys hooks for all directives and pipes in a given view and then removes all
 * listeners. Listeners are removed as the last step so events delivered in the onDestroys hooks
 * can be propagated to @Output listeners.
 *
 * @param view The LView to clean up
 */
function cleanUpView(viewOrContainer: LView | LContainer): void {
  if ((viewOrContainer as LView).length >= HEADER_OFFSET) {
    const view = viewOrContainer as LView;

    // Mark the LView as destroyed *before* executing the onDestroy hooks. An onDestroy hook
    // runs arbitrary user code, which could include its own `viewRef.destroy()` (or similar). If
    // We don't flag the view as destroyed before the hooks, this could lead to an infinite loop.
    // This also aligns with the ViewEngine behavior. It also means that the onDestroy hook is
    // really more of an "afterDestroy" hook if you think about it.
    view[FLAGS] |= LViewFlags.Destroyed;

    executeOnDestroys(view);
    removeListeners(view);
    const hostTNode = view[HOST_NODE];
    // For component views only, the local renderer is destroyed as clean up time.
    if (hostTNode && hostTNode.type === TNodeType.Element && isProceduralRenderer(view[RENDERER])) {
      ngDevMode && ngDevMode.rendererDestroy++;
      (view[RENDERER] as ProceduralRenderer3).destroy();
    }
  }
}

/** Removes listeners and unsubscribes from output subscriptions */
function removeListeners(lView: LView): void {
  const tCleanup = lView[TVIEW].cleanup !;
  if (tCleanup != null) {
    const lCleanup = lView[CLEANUP] !;
    for (let i = 0; i < tCleanup.length - 1; i += 2) {
      if (typeof tCleanup[i] === 'string') {
        // This is a listener with the native renderer
        const idxOrTargetGetter = tCleanup[i + 1];
        const target = typeof idxOrTargetGetter === 'function' ?
            idxOrTargetGetter(lView) :
            readElementValue(lView[idxOrTargetGetter]);
        const listener = lCleanup[tCleanup[i + 2]];
        const useCaptureOrSubIdx = tCleanup[i + 3];
        if (typeof useCaptureOrSubIdx === 'boolean') {
          // DOM listener
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
      } else if (typeof tCleanup[i] === 'number') {
        // This is a listener with renderer2 (cleanup fn can be found by index)
        const cleanupFn = lCleanup[tCleanup[i]];
        cleanupFn();
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
function executeOnDestroys(view: LView): void {
  const tView = view[TVIEW];
  let destroyHooks: HookData|null;
  if (tView != null && (destroyHooks = tView.destroyHooks) != null) {
    callHooks(view, destroyHooks);
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
function getRenderParent(tNode: TNode, currentView: LView): RElement|null {
  // Nodes of the top-most view can be inserted eagerly.
  if (isRootView(currentView)) {
    return nativeParentNode(currentView[RENDERER], getNativeByTNode(tNode, currentView));
  }

  // Skip over element and ICU containers as those are represented by a comment node and
  // can't be used as a render parent.
  const parent = getHighestElementOrICUContainer(tNode).parent;

  // If the parent is null, then we are inserting across views: either into an embedded view or a
  // component view.
  if (parent == null) {
    const hostTNode = currentView[HOST_NODE] !;
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
      return getHostNative(currentView);
    }
  } else {
    ngDevMode && assertNodeType(parent, TNodeType.Element);
    if (parent.flags & TNodeFlags.isComponent) {
      const tData = currentView[TVIEW].data;
      const tNode = tData[parent.index] as TNode;
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

    return getNativeByTNode(parent, currentView) as RElement;
  }
}

/**
 * Gets the native host element for a given view. Will return null if the current view does not have
 * a host element.
 */
function getHostNative(currentView: LView): RElement|null {
  const hostTNode = currentView[HOST_NODE];
  return hostTNode && hostTNode.type === TNodeType.Element ?
      (getNativeByTNode(hostTNode, currentView[PARENT] !) as RElement) :
      null;
}

/**
 * Inserts a native node before another native node for a given parent using {@link Renderer3}.
 * This is a utility function that can be used when native nodes were determined - it abstracts an
 * actual renderer being used.
 */
export function nativeInsertBefore(
    renderer: Renderer3, parent: RElement, child: RNode, beforeNode: RNode | null): void {
  if (isProceduralRenderer(renderer)) {
    renderer.insertBefore(parent, child, beforeNode);
  } else {
    parent.insertBefore(child, beforeNode, true);
  }
}

function nativeAppendChild(renderer: Renderer3, parent: RElement, child: RNode): void {
  if (isProceduralRenderer(renderer)) {
    renderer.appendChild(parent, child);
  } else {
    parent.appendChild(child);
  }
}

function nativeAppendOrInsertBefore(
    renderer: Renderer3, parent: RElement, child: RNode, beforeNode: RNode | null) {
  if (beforeNode) {
    nativeInsertBefore(renderer, parent, child, beforeNode);
  } else {
    nativeAppendChild(renderer, parent, child);
  }
}

/**
 * Removes a native child node from a given native parent node.
 */
export function nativeRemoveChild(
    renderer: Renderer3, parent: RElement, child: RNode, isHostElement?: boolean): void {
  isProceduralRenderer(renderer) ? renderer.removeChild(parent as RElement, child, isHostElement) :
                                   parent.removeChild(child);
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
    const lContainer = getLContainer(parentTNode as TViewNode, lView) !;
    const views = lContainer[VIEWS];
    const index = views.indexOf(lView);
    return getBeforeNodeForView(index, views, lContainer[NATIVE]);
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
 * @param childEl The native child (or children) that should be appended
 * @param childTNode The TNode of the child element
 * @param currentView The current LView
 * @returns Whether or not the child was appended
 */
export function appendChild(childEl: RNode | RNode[], childTNode: TNode, currentView: LView): void {
  const renderParent = getRenderParent(childTNode, currentView);
  if (renderParent != null) {
    const renderer = currentView[RENDERER];
    const parentTNode: TNode = childTNode.parent || currentView[HOST_NODE] !;
    const anchorNode = getNativeAnchorNode(parentTNode, currentView);
    if (Array.isArray(childEl)) {
      for (let nativeNode of childEl) {
        nativeAppendOrInsertBefore(renderer, renderParent, nativeNode, anchorNode);
      }
    } else {
      nativeAppendOrInsertBefore(renderer, renderParent, childEl, anchorNode);
    }
  }
}

/**
 * Gets the top-level element or an ICU container if those containers are nested.
 *
 * @param tNode The starting TNode for which we should skip element and ICU containers
 * @returns The TNode of the highest level ICU container or element container
 */
function getHighestElementOrICUContainer(tNode: TNode): TNode {
  while (tNode.parent != null && (tNode.parent.type === TNodeType.ElementContainer ||
                                  tNode.parent.type === TNodeType.IcuContainer)) {
    tNode = tNode.parent;
  }
  return tNode;
}

export function getBeforeNodeForView(index: number, views: LView[], containerNative: RComment) {
  if (index + 1 < views.length) {
    const view = views[index + 1] as LView;
    const viewTNode = view[HOST_NODE] as TViewNode;
    return viewTNode.child ? getNativeByTNode(viewTNode.child, view) : containerNative;
  } else {
    return containerNative;
  }
}

/**
 * Removes the `child` element from the DOM if not in view and not projected.
 *
 * @param childTNode The TNode of the child to remove
 * @param childEl The child that should be removed
 * @param currentView The current LView
 * @returns Whether or not the child was removed
 */
export function removeChild(childTNode: TNode, childEl: RNode, currentView: LView): void {
  const parentNative = getRenderParent(childTNode, currentView);
  // We only remove the element if it already has a render parent.
  if (parentNative) {
    nativeRemoveChild(currentView[RENDERER], parentNative, childEl);
  }
}

/**
 * Appends a projected node to the DOM, or in the case of a projected container,
 * appends the nodes from all of the container's active views to the DOM.
 *
 * @param projectedTNode The TNode to be projected
 * @param tProjectionNode The projection (ng-content) TNode
 * @param currentView Current LView
 * @param projectionView Projection view (view above current)
 */
export function appendProjectedNode(
    projectedTNode: TNode, tProjectionNode: TNode, currentView: LView,
    projectionView: LView): void {
  const native = getNativeByTNode(projectedTNode, projectionView);
  appendChild(native, tProjectionNode, currentView);

  // the projected contents are processed while in the shadow view (which is the currentView)
  // therefore we need to extract the view where the host element lives since it's the
  // logical container of the content projected views
  attachPatchData(native, projectionView);

  const nodeOrContainer = projectionView[projectedTNode.index];
  if (projectedTNode.type === TNodeType.Container) {
    // The node we are adding is a container and we are adding it to an element which
    // is not a component (no more re-projection).
    // Alternatively a container is projected at the root of a component's template
    // and can't be re-projected (as not content of any component).
    // Assign the final projection location in those cases.
    const views = nodeOrContainer[VIEWS];
    for (let i = 0; i < views.length; i++) {
      addRemoveViewFromContainer(views[i], true, nodeOrContainer[NATIVE]);
    }
  } else {
    if (projectedTNode.type === TNodeType.ElementContainer) {
      let ngContainerChildTNode: TNode|null = projectedTNode.child as TNode;
      while (ngContainerChildTNode) {
        appendProjectedNode(ngContainerChildTNode, tProjectionNode, currentView, projectionView);
        ngContainerChildTNode = ngContainerChildTNode.next;
      }
    }

    if (isLContainer(nodeOrContainer)) {
      appendChild(nodeOrContainer[NATIVE], tProjectionNode, currentView);
    }
  }
}
