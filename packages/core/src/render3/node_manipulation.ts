/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertDefined} from './assert';
import {attachPatchData, readElementValue} from './context_discovery';
import {callHooks} from './hooks';
import {LContainer, RENDER_PARENT, VIEWS, unusedValueExportToPlacateAjd as unused1} from './interfaces/container';
import {LContainerNode, LElementContainerNode, LElementNode, LTextNode, TContainerNode, TElementNode, TNode, TNodeFlags, TNodeType, TViewNode, unusedValueExportToPlacateAjd as unused2} from './interfaces/node';
import {unusedValueExportToPlacateAjd as unused3} from './interfaces/projection';
import {ProceduralRenderer3, RComment, RElement, RNode, RText, Renderer3, isProceduralRenderer, unusedValueExportToPlacateAjd as unused4} from './interfaces/renderer';
import {CLEANUP, CONTAINER_INDEX, DIRECTIVES, FLAGS, HEADER_OFFSET, HOST_NODE, HookData, LViewData, LViewFlags, NEXT, PARENT, QUERIES, RENDERER, TVIEW, unusedValueExportToPlacateAjd as unused5} from './interfaces/view';
import {assertNodeType} from './node_assert';
import {getLNode, stringify} from './util';

const unusedValueToPlacateAjd = unused1 + unused2 + unused3 + unused4 + unused5;

/** Retrieves the parent LNode of a given node. */
export function getParentLNode(tNode: TNode, currentView: LViewData): LElementNode|
    LElementContainerNode|LContainerNode|null {
  return tNode.parent == null ? getHostElementNode(currentView) :
                                getLNode(tNode.parent, currentView);
}

/**
 * Gets the host LElementNode given a view. Will return null if the host element is an
 * LViewNode, since they are being phased out.
 */
export function getHostElementNode(currentView: LViewData): LElementNode|null {
  const hostTNode = currentView[HOST_NODE] as TElementNode;
  return hostTNode && hostTNode.type !== TNodeType.View ?
      (getLNode(hostTNode, currentView[PARENT] !) as LElementNode) :
      null;
}

export function getContainerNode(tNode: TNode, embeddedView: LViewData): LContainerNode|null {
  if (tNode.index === -1) {
    // This is a dynamically created view inside a dynamic container.
    // If the host index is -1, the view has not yet been inserted, so it has no parent.
    const containerHostIndex = embeddedView[CONTAINER_INDEX];
    return containerHostIndex > -1 ?
        embeddedView[PARENT] ![containerHostIndex].dynamicLContainerNode :
        null;
  } else {
    // This is a inline view node (e.g. embeddedViewStart)
    return getParentLNode(tNode, embeddedView[PARENT] !) as LContainerNode;
  }
}


/**
 * Retrieves render parent LElementNode for a given view.
 * Might be null if a view is not yet attached to any container.
 */
export function getContainerRenderParent(tViewNode: TViewNode, view: LViewData): LElementNode|null {
  const container = getContainerNode(tViewNode, view);
  return container ? container.data[RENDER_PARENT] : null;
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
const projectionNodeStack: (LViewData | TNode)[] = [];

/**
 * Walks a tree of TNodes, applying a transformation on the element nodes, either only on the first
 * one found, or on all of them.
 *
 * @param viewToWalk the view to walk
 * @param action identifies the action to be performed on the LElement nodes.
 * @param renderer the current renderer.
 * @param renderParentNode Optional the render parent node to be set in all LContainerNodes found,
 * required for action modes Insert and Destroy.
 * @param beforeNode Optional the node before which elements should be added, required for action
 * Insert.
 */
function walkTNodeTree(
    viewToWalk: LViewData, action: WalkTNodeTreeAction, renderer: Renderer3,
    renderParentNode?: LElementNode | null, beforeNode?: RNode | null) {
  const rootTNode = viewToWalk[TVIEW].node as TViewNode;
  let projectionNodeIndex = -1;
  let currentView = viewToWalk;
  let tNode: TNode|null = rootTNode.child as TNode;
  while (tNode) {
    let nextTNode: TNode|null = null;
    const parent = renderParentNode ? renderParentNode.native : null;
    if (tNode.type === TNodeType.Element) {
      const elementNode = getLNode(tNode, currentView);
      executeNodeAction(action, renderer, parent, elementNode.native !, beforeNode);
      if (elementNode.dynamicLContainerNode) {
        executeNodeAction(
            action, renderer, parent, elementNode.dynamicLContainerNode.native !, beforeNode);
      }
    } else if (tNode.type === TNodeType.Container) {
      const lContainerNode: LContainerNode = currentView ![tNode.index] as LContainerNode;
      executeNodeAction(action, renderer, parent, lContainerNode.native !, beforeNode);
      const childContainerData: LContainer = lContainerNode.dynamicLContainerNode ?
          lContainerNode.dynamicLContainerNode.data :
          lContainerNode.data;
      if (renderParentNode) {
        childContainerData[RENDER_PARENT] = renderParentNode;
      }

      if (childContainerData[VIEWS].length) {
        currentView = childContainerData[VIEWS][0];
        nextTNode = currentView[TVIEW].node;

        // When the walker enters a container, then the beforeNode has to become the local native
        // comment node.
        beforeNode = lContainerNode.dynamicLContainerNode ?
            lContainerNode.dynamicLContainerNode.native :
            lContainerNode.native;
      }
    } else if (tNode.type === TNodeType.Projection) {
      const componentView = findComponentView(currentView !);
      const componentHost = componentView[HOST_NODE] as TElementNode;
      const head: TNode|null =
          (componentHost.projection as(TNode | null)[])[tNode.projection as number];

      // Must store both the TNode and the view because this projection node could be nested
      // deeply inside embedded views, and we need to get back down to this particular nested view.
      projectionNodeStack[++projectionNodeIndex] = tNode;
      projectionNodeStack[++projectionNodeIndex] = currentView !;
      if (head) {
        currentView = componentView[PARENT] !;
        nextTNode = currentView[TVIEW].data[head.index] as TNode;
      }
    } else {
      // Otherwise, this is a View or an ElementContainer
      nextTNode = tNode.child;
    }

    if (nextTNode === null) {
      // this last node was projected, we need to get back down to its projection node
      if (tNode.next === null && (tNode.flags & TNodeFlags.isProjected)) {
        currentView = projectionNodeStack[projectionNodeIndex--] as LViewData;
        tNode = projectionNodeStack[projectionNodeIndex--] as TNode;
      }
      nextTNode = tNode.next;

      /**
       * Find the next node in the LNode tree, taking into account the place where a node is
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
          beforeNode = currentView[tNode.index].native;
        }

        if (tNode.type === TNodeType.View && currentView[NEXT]) {
          currentView = currentView[NEXT] as LViewData;
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
 * Given a current view, finds the nearest component's host (LElement).
 *
 * @param lViewData LViewData for which we want a host element node
 * @returns The host node
 */
export function findComponentView(lViewData: LViewData): LViewData {
  let rootTNode = lViewData[HOST_NODE];

  while (rootTNode && rootTNode.type === TNodeType.View) {
    ngDevMode && assertDefined(lViewData[PARENT], 'viewData.parent');
    lViewData = lViewData[PARENT] !;
    rootTNode = lViewData[HOST_NODE];
  }

  return lViewData;
}

/**
 * NOTE: for performance reasons, the possible actions are inlined within the function instead of
 * being passed as an argument.
 */
function executeNodeAction(
    action: WalkTNodeTreeAction, renderer: Renderer3, parent: RElement | null,
    node: RComment | RElement | RText, beforeNode?: RNode | null) {
  if (action === WalkTNodeTreeAction.Insert) {
    isProceduralRenderer(renderer !) ?
        (renderer as ProceduralRenderer3).insertBefore(parent !, node, beforeNode as RNode | null) :
        parent !.insertBefore(node, beforeNode as RNode | null, true);
  } else if (action === WalkTNodeTreeAction.Detach) {
    isProceduralRenderer(renderer !) ?
        (renderer as ProceduralRenderer3).removeChild(parent !, node) :
        parent !.removeChild(node);
  } else if (action === WalkTNodeTreeAction.Destroy) {
    ngDevMode && ngDevMode.rendererDestroyNode++;
    (renderer as ProceduralRenderer3).destroyNode !(node);
  }
}

export function createTextNode(value: any, renderer: Renderer3): RText {
  return isProceduralRenderer(renderer) ? renderer.createText(stringify(value)) :
                                          renderer.createTextNode(stringify(value));
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
    viewToWalk: LViewData, insertMode: true, beforeNode: RNode | null): void;
export function addRemoveViewFromContainer(viewToWalk: LViewData, insertMode: false): void;
export function addRemoveViewFromContainer(
    viewToWalk: LViewData, insertMode: boolean, beforeNode?: RNode | null): void {
  const parentNode = getContainerRenderParent(viewToWalk[TVIEW].node as TViewNode, viewToWalk);
  const parent = parentNode ? parentNode.native : null;
  ngDevMode && assertNodeType(viewToWalk[TVIEW].node as TNode, TNodeType.View);
  if (parent) {
    const renderer = viewToWalk[RENDERER];
    walkTNodeTree(
        viewToWalk, insertMode ? WalkTNodeTreeAction.Insert : WalkTNodeTreeAction.Detach, renderer,
        parentNode, beforeNode);
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
export function destroyViewTree(rootView: LViewData): void {
  // If the view has no children, we can clean it up and return early.
  if (rootView[TVIEW].childIndex === -1) {
    return cleanUpView(rootView);
  }
  let viewOrContainer: LViewData|LContainer|null = getLViewChild(rootView);

  while (viewOrContainer) {
    let next: LViewData|LContainer|null = null;

    if (viewOrContainer.length >= HEADER_OFFSET) {
      // If LViewData, traverse down to child.
      const view = viewOrContainer as LViewData;
      if (view[TVIEW].childIndex > -1) next = getLViewChild(view);
    } else {
      // If container, traverse down to its first LViewData.
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
    lView: LViewData, lContainer: LContainer, parentView: LViewData, index: number,
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
 */
export function detachView(lContainer: LContainer, removeIndex: number, detached: boolean) {
  const views = lContainer[VIEWS];
  const viewToDetach = views[removeIndex];
  if (removeIndex > 0) {
    views[removeIndex - 1][NEXT] = viewToDetach[NEXT] as LViewData;
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
}

/**
 * Removes a view from a container, i.e. detaches it and then destroys the underlying LView.
 *
 * @param lContainer The container from which to remove a view
 * @param tContainer The TContainer node associated with the LContainer
 * @param removeIndex The index of the view to remove
 */
export function removeView(
    lContainer: LContainer, tContainer: TContainerNode, removeIndex: number) {
  const view = lContainer[VIEWS][removeIndex];
  destroyLView(view);
  detachView(lContainer, removeIndex, !!tContainer.detached);
}

/** Gets the child of the given LViewData */
export function getLViewChild(viewData: LViewData): LViewData|LContainer|null {
  if (viewData[TVIEW].childIndex === -1) return null;

  const hostNode: LElementNode|LContainerNode = viewData[viewData[TVIEW].childIndex];

  return hostNode.data ? hostNode.data : (hostNode.dynamicLContainerNode as LContainerNode).data;
}

/**
 * A standalone function which destroys an LView,
 * conducting cleanup (e.g. removing listeners, calling onDestroys).
 *
 * @param view The view to be destroyed.
 */
export function destroyLView(view: LViewData) {
  const renderer = view[RENDERER];
  if (isProceduralRenderer(renderer) && renderer.destroyNode) {
    walkTNodeTree(view, WalkTNodeTreeAction.Destroy, renderer);
  }
  destroyViewTree(view);
  // Sets the destroyed flag
  view[FLAGS] |= LViewFlags.Destroyed;
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
export function getParentState(state: LViewData | LContainer, rootView: LViewData): LViewData|
    LContainer|null {
  let tNode;
  if (state.length >= HEADER_OFFSET && (tNode = (state as LViewData) ![HOST_NODE]) &&
      tNode.type === TNodeType.View) {
    // if it's an embedded view, the state needs to go up to the container, in case the
    // container has a next
    return getContainerNode(tNode, state as LViewData) !.data as any;
  } else {
    // otherwise, use parent view for containers or component views
    return state[PARENT] === rootView ? null : state[PARENT];
  }
}

/**
 * Removes all listeners and call all onDestroys in a given view.
 *
 * @param view The LViewData to clean up
 */
function cleanUpView(viewOrContainer: LViewData | LContainer): void {
  if ((viewOrContainer as LViewData)[TVIEW]) {
    const view = viewOrContainer as LViewData;
    removeListeners(view);
    executeOnDestroys(view);
    executePipeOnDestroys(view);
    // For component views only, the local renderer is destroyed as clean up time.
    if (view[TVIEW].id === -1 && isProceduralRenderer(view[RENDERER])) {
      ngDevMode && ngDevMode.rendererDestroy++;
      (view[RENDERER] as ProceduralRenderer3).destroy();
    }
  }
}

/** Removes listeners and unsubscribes from output subscriptions */
function removeListeners(viewData: LViewData): void {
  const cleanup = viewData[TVIEW].cleanup !;
  if (cleanup != null) {
    for (let i = 0; i < cleanup.length - 1; i += 2) {
      if (typeof cleanup[i] === 'string') {
        // This is a listener with the native renderer
        const native = readElementValue(viewData[cleanup[i + 1]]).native;
        const listener = viewData[CLEANUP] ![cleanup[i + 2]];
        native.removeEventListener(cleanup[i], listener, cleanup[i + 3]);
        i += 2;
      } else if (typeof cleanup[i] === 'number') {
        // This is a listener with renderer2 (cleanup fn can be found by index)
        const cleanupFn = viewData[CLEANUP] ![cleanup[i]];
        cleanupFn();
      } else {
        // This is a cleanup function that is grouped with the index of its context
        const context = viewData[CLEANUP] ![cleanup[i + 1]];
        cleanup[i].call(context);
      }
    }
    viewData[CLEANUP] = null;
  }
}

/** Calls onDestroy hooks for this view */
function executeOnDestroys(view: LViewData): void {
  const tView = view[TVIEW];
  let destroyHooks: HookData|null;
  if (tView != null && (destroyHooks = tView.destroyHooks) != null) {
    callHooks(view[DIRECTIVES] !, destroyHooks);
  }
}

/** Calls pipe destroy hooks for this view */
function executePipeOnDestroys(viewData: LViewData): void {
  const pipeDestroyHooks = viewData[TVIEW] && viewData[TVIEW].pipeDestroyHooks;
  if (pipeDestroyHooks) {
    callHooks(viewData !, pipeDestroyHooks);
  }
}

export function getRenderParent(tNode: TNode, currentView: LViewData): LElementNode|null {
  if (canInsertNativeNode(tNode, currentView)) {
    const hostTNode = currentView[HOST_NODE];
    return tNode.parent == null && hostTNode !.type === TNodeType.View ?
        getContainerRenderParent(hostTNode as TViewNode, currentView) :
        getParentLNode(tNode, currentView) as LElementNode;
  }
  return null;
}

function canInsertNativeChildOfElement(tNode: TNode): boolean {
  // If the parent is null, then we are inserting across views. This happens when we
  // insert a root element of the component view into the component host element and it
  // should always be eager.
  if (tNode.parent == null ||
      // We should also eagerly insert if the parent is a regular, non-component element
      // since we know that this relationship will never be broken.
      tNode.parent.type === TNodeType.Element && !(tNode.parent.flags & TNodeFlags.isComponent)) {
    return true;
  }

  // Parent is a Component. Component's content nodes are not inserted immediately
  // because they will be projected, and so doing insert at this point would be wasteful.
  // Since the projection would than move it to its final destination.
  return false;
}

/**
 * We might delay insertion of children for a given view if it is disconnected.
 * This might happen for 2 main reasons:
 * - view is not inserted into any container (view was created but not inserted yet)
 * - view is inserted into a container but the container itself is not inserted into the DOM
 * (container might be part of projection or child of a view that is not inserted yet).
 *
 * In other words we can insert children of a given view if this view was inserted into a container
 * and
 * the container itself has its render parent determined.
 */
function canInsertNativeChildOfView(viewTNode: TViewNode, view: LViewData): boolean {
  // Because we are inserting into a `View` the `View` may be disconnected.
  const container = getContainerNode(viewTNode, view) !;
  if (container == null || container.data[RENDER_PARENT] == null) {
    // The `View` is not inserted into a `Container` or the parent `Container`
    // itself is disconnected. So we have to delay.
    return false;
  }

  // The parent `Container` is in inserted state, so we can eagerly insert into
  // this location.
  return true;
}

/**
 * Returns whether a native element can be inserted into the given parent.
 *
 * There are two reasons why we may not be able to insert a element immediately.
 * - Projection: When creating a child content element of a component, we have to skip the
 *   insertion because the content of a component will be projected.
 *   `<component><content>delayed due to projection</content></component>`
 * - Parent container is disconnected: This can happen when we are inserting a view into
 *   parent container, which itself is disconnected. For example the parent container is part
 *   of a View which has not be inserted or is mare for projection but has not been inserted
 *   into destination.
 *

 *
 * @param parent The parent where the child will be inserted into.
 * @param currentView Current LView being processed.
 * @return boolean Whether the child should be inserted now (or delayed until later).
 */
export function canInsertNativeNode(tNode: TNode, currentView: LViewData): boolean {
  let currentNode = tNode;
  let parent: TNode|null = tNode.parent;

  if (tNode.parent && tNode.parent.type === TNodeType.ElementContainer) {
    currentNode = getHighestElementContainer(tNode);
    parent = currentNode.parent;
  }
  if (parent === null) parent = currentView[HOST_NODE];

  if (parent && parent.type === TNodeType.View) {
    return canInsertNativeChildOfView(parent as TViewNode, currentView);
  } else {
    // Parent is a regular element or a component
    return canInsertNativeChildOfElement(currentNode);
  }
}

/**
 * Inserts a native node before another native node for a given parent using {@link Renderer3}.
 * This is a utility function that can be used when native nodes were determined - it abstracts an
 * actual renderer being used.
 */
function nativeInsertBefore(
    renderer: Renderer3, parent: RElement, child: RNode, beforeNode: RNode | null): void {
  if (isProceduralRenderer(renderer)) {
    renderer.insertBefore(parent, child, beforeNode);
  } else {
    parent.insertBefore(child, beforeNode, true);
  }
}

/**
 * Appends the `child` element to the `parent`.
 *
 * The element insertion might be delayed {@link canInsertNativeNode}.
 *
 * @param childEl The child that should be appended
 * @param childTNode The TNode of the child element
 * @param currentView The current LView
 * @returns Whether or not the child was appended
 */
export function appendChild(
    childEl: RNode | null, childTNode: TNode, currentView: LViewData): boolean {
  const parentLNode = getParentLNode(childTNode, currentView);
  const parentEl = parentLNode ? parentLNode.native : null;

  if (childEl !== null && canInsertNativeNode(childTNode, currentView)) {
    const renderer = currentView[RENDERER];
    const parentTNode: TNode = childTNode.parent || currentView[HOST_NODE] !;

    if (parentTNode.type === TNodeType.View) {
      const container = getContainerNode(parentTNode, currentView) as LContainerNode;
      const renderParent = container.data[RENDER_PARENT];
      const views = container.data[VIEWS];
      const index = views.indexOf(currentView);
      nativeInsertBefore(
          renderer, renderParent !.native, childEl, getBeforeNodeForView(index, views, container));
    } else if (parentTNode.type === TNodeType.ElementContainer) {
      let elementContainer = getHighestElementContainer(childTNode);
      let node: LElementNode = getRenderParent(elementContainer, currentView) !;
      nativeInsertBefore(renderer, node.native, childEl, parentEl);
    } else {
      isProceduralRenderer(renderer) ? renderer.appendChild(parentEl !as RElement, childEl) :
                                       parentEl !.appendChild(childEl);
    }
    return true;
  }
  return false;
}

/**
 * Gets the top-level ng-container if ng-containers are nested.
 *
 * @param ngContainer The TNode of the starting ng-container
 * @returns tNode The TNode of the highest level ng-container
 */
function getHighestElementContainer(ngContainer: TNode): TNode {
  while (ngContainer.parent != null && ngContainer.parent.type === TNodeType.ElementContainer) {
    ngContainer = ngContainer.parent;
  }
  return ngContainer;
}

export function getBeforeNodeForView(index: number, views: LViewData[], container: LContainerNode) {
  if (index + 1 < views.length) {
    const view = views[index + 1] as LViewData;
    const viewTNode = view[HOST_NODE] as TViewNode;
    return viewTNode.child ? getLNode(viewTNode.child, view).native : container.native;
  } else {
    return container.native;
  }
}

/**
 * Removes the `child` element of the `parent` from the DOM.
 *
 * @param parentEl The parent element from which to remove the child
 * @param child The child that should be removed
 * @param currentView The current LView
 * @returns Whether or not the child was removed
 */
export function removeChild(tNode: TNode, child: RNode | null, currentView: LViewData): boolean {
  const parentNative = getParentLNode(tNode, currentView) !.native as RElement;
  if (child !== null && canInsertNativeNode(tNode, currentView)) {
    // We only remove the element if not in View or not projected.
    const renderer = currentView[RENDERER];
    isProceduralRenderer(renderer) ? renderer.removeChild(parentNative as RElement, child) :
                                     parentNative !.removeChild(child);
    return true;
  }
  return false;
}

/**
 * Appends a projected node to the DOM, or in the case of a projected container,
 * appends the nodes from all of the container's active views to the DOM.
 *
 * @param projectedLNode The node to process
 * @param parentNode The last parent element to be processed
 * @param tProjectionNode
 * @param currentView Current LView
 * @param projectionView Projection view
 */
export function appendProjectedNode(
    projectedLNode: LElementNode | LElementContainerNode | LTextNode | LContainerNode,
    projectedTNode: TNode, tProjectionNode: TNode, currentView: LViewData,
    projectionView: LViewData): void {
  appendChild(projectedLNode.native, tProjectionNode, currentView);

  // the projected contents are processed while in the shadow view (which is the currentView)
  // therefore we need to extract the view where the host element lives since it's the
  // logical container of the content projected views
  attachPatchData(projectedLNode.native, projectionView);

  const renderParent = getRenderParent(tProjectionNode, currentView);

  if (projectedTNode.type === TNodeType.Container) {
    // The node we are adding is a container and we are adding it to an element which
    // is not a component (no more re-projection).
    // Alternatively a container is projected at the root of a component's template
    // and can't be re-projected (as not content of any component).
    // Assign the final projection location in those cases.
    const lContainer = (projectedLNode as LContainerNode).data;
    lContainer[RENDER_PARENT] = renderParent;
    const views = lContainer[VIEWS];
    for (let i = 0; i < views.length; i++) {
      addRemoveViewFromContainer(views[i], true, projectedLNode.native);
    }
  } else if (projectedTNode.type === TNodeType.ElementContainer) {
    let ngContainerChildTNode: TNode|null = projectedTNode.child as TNode;
    while (ngContainerChildTNode) {
      let ngContainerChild = getLNode(ngContainerChildTNode, projectionView);
      appendProjectedNode(
          ngContainerChild as LElementNode | LElementContainerNode | LTextNode | LContainerNode,
          ngContainerChildTNode, tProjectionNode, currentView, projectionView);
      ngContainerChildTNode = ngContainerChildTNode.next;
    }
  }
  if (projectedLNode.dynamicLContainerNode) {
    projectedLNode.dynamicLContainerNode.data[RENDER_PARENT] = renderParent;
    appendChild(projectedLNode.dynamicLContainerNode.native, tProjectionNode, currentView);
  }
}
