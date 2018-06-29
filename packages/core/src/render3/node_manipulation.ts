/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {callHooks} from './hooks';
import {LContainer, RENDER_PARENT, VIEWS, unusedValueExportToPlacateAjd as unused1} from './interfaces/container';
import {LContainerNode, LElementNode, LNode, LProjectionNode, LTextNode, LViewNode, TNodeType, unusedValueExportToPlacateAjd as unused2} from './interfaces/node';
import {unusedValueExportToPlacateAjd as unused3} from './interfaces/projection';
import {ProceduralRenderer3, RComment, RElement, RNode, RText, Renderer3, isProceduralRenderer, unusedValueExportToPlacateAjd as unused4} from './interfaces/renderer';
import {CLEANUP, CONTAINER_INDEX, DIRECTIVES, FLAGS, HEADER_OFFSET, HOST_NODE, HookData, LViewData, LViewFlags, NEXT, PARENT, QUERIES, RENDERER, TVIEW, unusedValueExportToPlacateAjd as unused5} from './interfaces/view';
import {assertNodeOfPossibleTypes, assertNodeType} from './node_assert';
import {stringify} from './util';

const unusedValueToPlacateAjd = unused1 + unused2 + unused3 + unused4 + unused5;

/** Retrieves the sibling node for the given node. */
export function getNextLNode(node: LNode): LNode|null {
  // View nodes don't have TNodes, so their next must be retrieved through their LView.
  if (node.tNode.type === TNodeType.View) {
    const viewData = node.data as LViewData;
    return viewData[NEXT] ? (viewData[NEXT] as LViewData)[HOST_NODE] : null;
  }
  return node.tNode.next ? node.view[node.tNode.next !.index] : null;
}

/** Retrieves the first child of a given node */
export function getChildLNode(node: LNode): LNode|null {
  if (node.tNode.child) {
    const viewData = node.tNode.type === TNodeType.View ? node.data as LViewData : node.view;
    return viewData[node.tNode.child.index];
  }
  return null;
}

/** Retrieves the parent LNode of a given node. */
export function getParentLNode(node: LContainerNode | LElementNode | LTextNode | LProjectionNode):
    LElementNode|LViewNode;
export function getParentLNode(node: LViewNode): LContainerNode|null;
export function getParentLNode(node: LNode): LElementNode|LContainerNode|LViewNode|null;
export function getParentLNode(node: LNode): LElementNode|LContainerNode|LViewNode|null {
  if (node.tNode.index === -1 && node.tNode.type === TNodeType.View) {
    // This is a dynamically created view inside a dynamic container.
    // If the host index is -1, the view has not yet been inserted, so it has no parent.
    const containerHostIndex = (node.data as LViewData)[CONTAINER_INDEX];
    return containerHostIndex === -1 ? null : node.view[containerHostIndex].dynamicLContainerNode;
  }
  const parent = node.tNode.parent;
  return parent ? node.view[parent.index] : node.view[HOST_NODE];
}

/**
 * Get the next node in the LNode tree, taking into account the place where a node is
 * projected (in the shadow DOM) rather than where it comes from (in the light DOM).
 *
 * @param node The node whose next node in the LNode tree must be found.
 * @return LNode|null The next sibling in the LNode tree.
 */
function getNextLNodeWithProjection(node: LNode): LNode|null {
  const pNextOrParent = node.pNextOrParent;

  if (pNextOrParent) {
    // The node is projected
    const isLastProjectedNode = pNextOrParent.tNode.type === TNodeType.Projection;
    // returns pNextOrParent if we are not at the end of the list, null otherwise
    return isLastProjectedNode ? null : pNextOrParent;
  }

  // returns node.next because the the node is not projected
  return getNextLNode(node);
}

const enum WalkLNodeTreeAction {
  /** node insert in the native environment */
  Insert = 0,

  /** node detach from the native environment */
  Detach = 1,

  /** node destruction using the renderer's API */
  Destroy = 2,
}

/**
 * Walks a tree of LNodes, applying a transformation on the LElement nodes, either only on the first
 * one found, or on all of them.
 *
 * @param startingNode the node from which the walk is started.
 * @param rootNode the root node considered.
 * @param action identifies the action to be performed on the LElement nodes.
 * @param renderer the current renderer.
 * @param renderParentNode Optional the render parent node to be set in all LContainerNodes found,
 * required for action modes Insert and Destroy.
 * @param beforeNode Optional the node before which elements should be added, required for action
 * Insert.
 */
function walkLNodeTree(
    startingNode: LNode | null, rootNode: LNode, action: WalkLNodeTreeAction, renderer: Renderer3,
    renderParentNode?: LElementNode | null, beforeNode?: RNode | null) {
  let node: LNode|null = startingNode;
  while (node) {
    let nextNode: LNode|null = null;
    const parent = renderParentNode ? renderParentNode.native : null;
    if (node.tNode.type === TNodeType.Element) {
      // Execute the action
      executeNodeAction(action, renderer, parent, node.native !, beforeNode);
      if (node.dynamicLContainerNode) {
        executeNodeAction(
            action, renderer, parent, node.dynamicLContainerNode.native !, beforeNode);
      }
      nextNode = getNextLNode(node);
    } else if (node.tNode.type === TNodeType.Container) {
      executeNodeAction(action, renderer, parent, node.native !, beforeNode);
      const lContainerNode: LContainerNode = (node as LContainerNode);
      const childContainerData: LContainer = lContainerNode.dynamicLContainerNode ?
          lContainerNode.dynamicLContainerNode.data :
          lContainerNode.data;
      if (renderParentNode) {
        childContainerData[RENDER_PARENT] = renderParentNode;
      }
      nextNode =
          childContainerData[VIEWS].length ? getChildLNode(childContainerData[VIEWS][0]) : null;
      if (nextNode) {
        // When the walker enters a container, then the beforeNode has to become the local native
        // comment node.
        beforeNode = lContainerNode.dynamicLContainerNode ?
            lContainerNode.dynamicLContainerNode.native :
            lContainerNode.native;
      }
    } else if (node.tNode.type === TNodeType.Projection) {
      // For Projection look at the first projected node
      nextNode = (node as LProjectionNode).data.head;
    } else {
      // Otherwise look at the first child
      nextNode = getChildLNode(node as LViewNode);
    }

    if (nextNode == null) {
      /**
       * Find the next node in the LNode tree, taking into account the place where a node is
       * projected (in the shadow DOM) rather than where it comes from (in the light DOM).
       *
       * If there is no sibling node, then it goes to the next sibling of the parent node...
       * until it reaches rootNode (at which point null is returned).
       */
      let currentNode: LNode|null = node;
      node = getNextLNodeWithProjection(currentNode);
      while (currentNode && !node) {
        // if node.pNextOrParent is not null here, it is not the next node
        // (because, at this point, nextNode is null, so it is the parent)
        currentNode = currentNode.pNextOrParent || getParentLNode(currentNode);
        if (currentNode === rootNode) {
          return null;
        }
        // When the walker exits a container, the beforeNode has to be restored to the previous
        // value.
        if (currentNode && !currentNode.pNextOrParent &&
            currentNode.tNode.type === TNodeType.Container) {
          beforeNode = currentNode.native;
        }
        node = currentNode && getNextLNodeWithProjection(currentNode);
      }
    } else {
      node = nextNode;
    }
  }
}

/**
 * NOTE: for performance reasons, the possible actions are inlined within the function instead of
 * being passed as an argument.
 */
function executeNodeAction(
    action: WalkLNodeTreeAction, renderer: Renderer3, parent: RElement | null,
    node: RComment | RElement | RText, beforeNode?: RNode | null) {
  if (action === WalkLNodeTreeAction.Insert) {
    isProceduralRenderer(renderer !) ?
        (renderer as ProceduralRenderer3).insertBefore(parent !, node, beforeNode as RNode | null) :
        parent !.insertBefore(node, beforeNode as RNode | null, true);
  } else if (action === WalkLNodeTreeAction.Detach) {
    isProceduralRenderer(renderer !) ?
        (renderer as ProceduralRenderer3).removeChild(parent !, node) :
        parent !.removeChild(node);
  } else if (action === WalkLNodeTreeAction.Destroy) {
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
 * @param container The container to which the root view belongs
 * @param rootNode The view from which elements should be added or removed
 * @param insertMode Whether or not elements should be added (if false, removing)
 * @param beforeNode The node before which elements should be added, if insert mode
 */
export function addRemoveViewFromContainer(
    container: LContainerNode, rootNode: LViewNode, insertMode: true,
    beforeNode: RNode | null): void;
export function addRemoveViewFromContainer(
    container: LContainerNode, rootNode: LViewNode, insertMode: false): void;
export function addRemoveViewFromContainer(
    container: LContainerNode, rootNode: LViewNode, insertMode: boolean,
    beforeNode?: RNode | null): void {
  ngDevMode && assertNodeType(container, TNodeType.Container);
  ngDevMode && assertNodeType(rootNode, TNodeType.View);
  const parentNode = container.data[RENDER_PARENT];
  const parent = parentNode ? parentNode.native : null;
  if (parent) {
    let node: LNode|null = getChildLNode(rootNode);
    const renderer = container.view[RENDERER];
    walkLNodeTree(
        node, rootNode, insertMode ? WalkLNodeTreeAction.Insert : WalkLNodeTreeAction.Detach,
        renderer, parentNode, beforeNode);
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
      if (container[VIEWS].length) next = container[VIEWS][0].data;
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
 * @param container The container into which the view should be inserted
 * @param viewNode The view to insert
 * @param index The index at which to insert the view
 * @returns The inserted view
 */
export function insertView(
    container: LContainerNode, viewNode: LViewNode, index: number): LViewNode {
  const state = container.data;
  const views = state[VIEWS];
  const lView = viewNode.data as LViewData;

  if (index > 0) {
    // This is a new view, we need to add it to the children.
    views[index - 1].data[NEXT] = lView;
  }

  if (index < views.length) {
    lView[NEXT] = views[index].data;
    views.splice(index, 0, viewNode);
  } else {
    views.push(viewNode);
    lView[NEXT] = null;
  }

  // Dynamically inserted views need a reference to their parent container'S host so it's
  // possible to jump from a view to its container's next when walking the node tree.
  if (viewNode.tNode.index === -1) {
    lView[CONTAINER_INDEX] = container.tNode.parent !.index;
    (viewNode as{view: LViewData}).view = container.view;
  }

  // Notify query that a new view has been added
  if (lView[QUERIES]) {
    lView[QUERIES] !.insertView(index);
  }

  // Sets the attached flag
  lView[FLAGS] |= LViewFlags.Attached;

  return viewNode;
}

/**
 * Detaches a view from a container.
 *
 * This method splices the view from the container's array of active views. It also
 * removes the view's elements from the DOM.
 *
 * @param container The container from which to detach a view
 * @param removeIndex The index of the view to detach
 * @returns The detached view
 */
export function detachView(container: LContainerNode, removeIndex: number): LViewNode {
  const views = container.data[VIEWS];
  const viewNode = views[removeIndex];
  if (removeIndex > 0) {
    views[removeIndex - 1].data[NEXT] = viewNode.data[NEXT] as LViewData;
  }
  views.splice(removeIndex, 1);
  if (!container.tNode.detached) {
    addRemoveViewFromContainer(container, viewNode, false);
  }
  // Notify query that view has been removed
  const removedLView = viewNode.data;
  if (removedLView[QUERIES]) {
    removedLView[QUERIES] !.removeView();
  }
  removedLView[CONTAINER_INDEX] = -1;
  (viewNode as{view: LViewData | null}).view = null;
  // Unsets the attached flag
  viewNode.data[FLAGS] &= ~LViewFlags.Attached;
  return viewNode;
}

/**
 * Removes a view from a container, i.e. detaches it and then destroys the underlying LView.
 *
 * @param container The container from which to remove a view
 * @param removeIndex The index of the view to remove
 * @returns The removed view
 */
export function removeView(container: LContainerNode, removeIndex: number): LViewNode {
  const viewNode = container.data[VIEWS][removeIndex];
  detachView(container, removeIndex);
  destroyLView(viewNode.data);
  return viewNode;
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
    walkLNodeTree(view[HOST_NODE], view[HOST_NODE], WalkLNodeTreeAction.Destroy, renderer);
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
  let node;
  if ((node = (state as LViewData) ![HOST_NODE]) && node.tNode.type === TNodeType.View) {
    // if it's an embedded view, the state needs to go up to the container, in case the
    // container has a next
    return getParentLNode(node) !.data as any;
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
        const native = viewData[cleanup[i + 1]].native;
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
export function canInsertNativeNode(parent: LNode, currentView: LViewData): boolean {
  // We can only insert into a Component or View. Any other type should be an Error.
  ngDevMode && assertNodeOfPossibleTypes(parent, TNodeType.Element, TNodeType.View);

  if (parent.tNode.type === TNodeType.Element) {
    // Parent is an element.
    if (parent.view !== currentView) {
      // If the Parent view is not the same as current view than we are inserting across
      // Views. This happens when we insert a root element of the component view into
      // the component host element and it should always be eager.
      return true;
    }
    // Parent elements can be a component which may have projection.
    if (parent.data === null) {
      // Parent is a regular non-component element. We should eagerly insert into it
      // since we know that this relationship will never be broken.
      return true;
    } else {
      // Parent is a Component. Component's content nodes are not inserted immediately
      // because they will be projected, and so doing insert at this point would be wasteful.
      // Since the projection would than move it to its final destination.
      return false;
    }
  } else {
    // Parent is a View.
    ngDevMode && assertNodeType(parent, TNodeType.View);

    // Because we are inserting into a `View` the `View` may be disconnected.
    const grandParentContainer = getParentLNode(parent) as LContainerNode;
    if (grandParentContainer == null) {
      // The `View` is not inserted into a `Container` we have to delay insertion.
      return false;
    }
    ngDevMode && assertNodeType(grandParentContainer, TNodeType.Container);
    if (grandParentContainer.data[RENDER_PARENT] == null) {
      // The parent `Container` itself is disconnected. So we have to delay.
      return false;
    } else {
      // The parent `Container` is in inserted state, so we can eagerly insert into
      // this location.
      return true;
    }
  }
}

/**
 * Appends the `child` element to the `parent`.
 *
 * The element insertion might be delayed {@link canInsertNativeNode}.
 *
 * @param parent The parent to which to append the child
 * @param child The child that should be appended
 * @param currentView The current LView
 * @returns Whether or not the child was appended
 */
export function appendChild(parent: LNode, child: RNode | null, currentView: LViewData): boolean {
  if (child !== null && canInsertNativeNode(parent, currentView)) {
    const renderer = currentView[RENDERER];
    if (parent.tNode.type === TNodeType.View) {
      const container = getParentLNode(parent) as LContainerNode;
      const renderParent = container.data[RENDER_PARENT];
      const views = container.data[VIEWS];
      const index = views.indexOf(parent as LViewNode);
      const beforeNode =
          index + 1 < views.length ? (getChildLNode(views[index + 1]) !).native : container.native;
      isProceduralRenderer(renderer) ?
          renderer.insertBefore(renderParent !.native, child, beforeNode) :
          renderParent !.native.insertBefore(child, beforeNode, true);
    } else {
      isProceduralRenderer(renderer) ? renderer.appendChild(parent.native !as RElement, child) :
                                       parent.native !.appendChild(child);
    }
    return true;
  }
  return false;
}

/**
 * Removes the `child` element of the `parent` from the DOM.
 *
 * @param parent The parent from which to remove the child
 * @param child The child that should be removed
 * @param currentView The current LView
 * @returns Whether or not the child was removed
 */
export function removeChild(parent: LNode, child: RNode | null, currentView: LViewData): boolean {
  if (child !== null && canInsertNativeNode(parent, currentView)) {
    // We only remove the element if not in View or not projected.
    const renderer = currentView[RENDERER];
    isProceduralRenderer(renderer) ? renderer.removeChild(parent.native as RElement, child) :
                                     parent.native !.removeChild(child);
    return true;
  }
  return false;
}

/**
 * Appends a projected node to the DOM, or in the case of a projected container,
 * appends the nodes from all of the container's active views to the DOM.
 *
 * @param node The node to process
 * @param currentParent The last parent element to be processed
 * @param currentView Current LView
 */
export function appendProjectedNode(
    node: LElementNode | LTextNode | LContainerNode, currentParent: LElementNode | LViewNode,
    currentView: LViewData, renderParent: LElementNode): void {
  appendChild(currentParent, node.native, currentView);
  if (node.tNode.type === TNodeType.Container) {
    // The node we are adding is a container and we are adding it to an element which
    // is not a component (no more re-projection).
    // Alternatively a container is projected at the root of a component's template
    // and can't be re-projected (as not content of any component).
    // Assign the final projection location in those cases.
    const lContainer = (node as LContainerNode).data;
    lContainer[RENDER_PARENT] = renderParent;
    const views = lContainer[VIEWS];
    for (let i = 0; i < views.length; i++) {
      addRemoveViewFromContainer(node as LContainerNode, views[i], true, node.native);
    }
  }
  if (node.dynamicLContainerNode) {
    node.dynamicLContainerNode.data[RENDER_PARENT] = renderParent;
    appendChild(currentParent, node.dynamicLContainerNode.native, currentView);
  }
}
