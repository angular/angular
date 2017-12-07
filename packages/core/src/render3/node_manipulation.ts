/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertNotNull} from './assert';
import {ContainerState, LContainer, LElement, LNode, LNodeFlags, LProjection, LText, LView, ProjectionState, ViewOrContainerState, ViewState} from './interfaces';
import {assertNodeType} from './node_assert';
import {RComment, RElement, RNode, RText, Renderer3Fn} from './renderer';

export function findNativeParent(containerNode: LContainer): RNode|null {
  let container: LContainer|null = containerNode;
  while (container) {
    ngDevMode && assertNodeType(container, LNodeFlags.Container);
    const renderParent = container.data.renderParent;
    if (renderParent !== null) {
      return renderParent.native;
    }
    const viewOrElement: LView|LElement = container.parent !;
    ngDevMode && assertNotNull(viewOrElement, 'container.parent');
    if ((viewOrElement.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Element) {
      // we are an LElement, which means we are past the last LContainer.
      // This means than we have not been projected so just ignore.
      return null;
    }
    ngDevMode && assertNodeType(viewOrElement, LNodeFlags.View);
    container = (viewOrElement as LView).parent;
  }
  return null;
}

export function findBeforeNode(index: number, state: ContainerState, native: RComment): RElement|
    RText|RComment {
  const children = state.children;
  // Find the node to insert in front of
  return index + 1 < children.length ?
      (children[index + 1].data.nodesAndBindings[0] as LText | LElement | LContainer).native :
      native;
}

export function addRemoveViewFromContainer(
    container: LContainer, rootNode: LView, insertMode: true, beforeNode: RNode | null): void;
export function addRemoveViewFromContainer(
    container: LContainer, rootNode: LView, insertMode: false): void;
export function addRemoveViewFromContainer(
    container: LContainer, rootNode: LView, insertMode: boolean, beforeNode?: RNode | null): void {
  ngDevMode && assertNodeType(container, LNodeFlags.Container);
  ngDevMode && assertNodeType(rootNode, LNodeFlags.View);
  const parent = findNativeParent(container);
  let node: LNode|null = rootNode.data.nodesAndBindings[0];
  if (parent) {
    while (node) {
      const type = node.flags & LNodeFlags.TYPE_MASK;
      let nextNode: LNode|null = null;
      const renderer = container.view.renderer;
      const isFnRenderer = (renderer as Renderer3Fn).listen;
      if (type === LNodeFlags.Element) {
        insertMode ?
            (isFnRenderer ?
                 (renderer as Renderer3Fn)
                     .insertBefore !(parent, node.native !, beforeNode as RNode | null) :
                 parent.insertBefore(node.native !, beforeNode as RNode | null, true)) :
            (isFnRenderer ?
                 (renderer as Renderer3Fn).removeChild !(parent as RElement, node.native !) :
                 parent.removeChild(node.native !));
        nextNode = node.next;
      } else if (type === LNodeFlags.Container) {
        // if we get to a container, it must be a root node of a view because we are only
        // propagating down into child views / containers and not child elements
        const childContainerData: ContainerState = (node as LContainer).data;
        insertMode ?
            (isFnRenderer ?
                 (renderer as Renderer3Fn).appendChild !(parent as RElement, node.native !) :
                 parent.appendChild(node.native !)) :
            (isFnRenderer ?
                 (renderer as Renderer3Fn).removeChild !(parent as RElement, node.native !) :
                 parent.removeChild(node.native !));
        nextNode = childContainerData.children.length ?
            childContainerData.children[0].data.nodesAndBindings[0] :
            null;
      } else if (type === LNodeFlags.Projection) {
        nextNode = (node as LProjection).data[0];
      } else {
        nextNode = (node as LView).data.nodesAndBindings[0];
      }
      if (nextNode === null) {
        while (node && !node.next) {
          node = node.parent;
          if (node === rootNode) node = null;
        }
        node = node && node.next;
      } else {
        node = nextNode;
      }
    }
  }
}

/**
 * Traverses the tree of component views and containers to remove listeners.
 *
 * Notes:
 *  - Will be used for onDestroy calls later, so needs to be bottom-up.
 *  - Must process containers instead of their views to avoid splicing
 *  when views are destroyed and re-added.
 *  - Using a while loop because it's faster than recursing
 *  - Destroy only called on movement to sibling or movement to parent (laterally or up)
 */
export function destroyViewTree(rootView: ViewState): void {
  let viewOrContainerState: ViewOrContainerState|null = rootView;

  while (viewOrContainerState) {
    let next: ViewOrContainerState|null = null;

    if (viewOrContainerState.children && viewOrContainerState.children.length) {
      next = viewOrContainerState.children[0].data;
    } else if (viewOrContainerState.child) {
      next = viewOrContainerState.child;
    } else if (viewOrContainerState.next) {
      cleanUpView(viewOrContainerState as ViewState);
      next = viewOrContainerState.next;
    }

    if (next == null) {
      while (viewOrContainerState && !viewOrContainerState !.next) {
        cleanUpView(viewOrContainerState as ViewState);
        viewOrContainerState = getParentState(viewOrContainerState, rootView);
      }
      cleanUpView(viewOrContainerState as ViewState || rootView);

      next = viewOrContainerState && viewOrContainerState.next;
    }
    viewOrContainerState = next;
  }
}

export function insertView(container: LContainer, newView: LView, index: number): LView {
  const state = container.data;
  const children = state.children;

  if (index > 0) {
    // This is a new view, we need to add it to the children.
    setViewNext(children[index - 1], newView);
  }

  if (index < children.length && children[index].data.id !== newView.data.id) {
    // View ID change replace the view.
    setViewNext(newView, children[index]);
    children.splice(index, 0, newView);
  } else if (index >= children.length) {
    children.push(newView);
  }

  if (state.nextIndex <= index) {
    state.nextIndex++;
  }

  // If the container's renderParent is null, we know that it is a root node of its own parent view
  // and we should wait until that parent processes its nodes (otherwise, we will insert this view's
  // nodes twice - once now and once when its parent inserts its views).
  if (container.data.renderParent !== null) {
    addRemoveViewFromContainer(
        container, newView, true, findBeforeNode(index, state, container.native));
  }

  // Notify query that view has been inserted
  container.query && container.query.insert(container, newView, index);
  return newView;
}


export function removeView(container: LContainer, removeIndex: number): LView {
  const children = container.data.children;
  const viewNode = children[removeIndex];
  if (removeIndex > 0) {
    setViewNext(children[removeIndex - 1], viewNode.next);
  }
  children.splice(removeIndex, 1);
  destroyViewTree(viewNode.data);
  addRemoveViewFromContainer(container, viewNode, false);
  // Notify query that view has been removed
  container.query && container.query.remove(container, viewNode, removeIndex);
  return viewNode;
}

export function setViewNext(view: LView, next: LView | null): void {
  view.next = next;
  view.data.next = next ? next.data : null;
}

export function getParentState(
    state: ViewOrContainerState, rootView: ViewState): ViewOrContainerState|null {
  let node;
  if ((node = (state as ViewState) !.node) &&
      (node.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.View) {
    // if it's an embedded view, the state needs to go up to the container, in case the
    // container has a next
    return node.parent !.data as any;
  } else {
    // otherwise, use parent view for containers or component views
    return state.parent === rootView ? null : state.parent;
  }
}

/** Removes all listeners and call all onDestroys in a given view. */
function cleanUpView(viewState: ViewState): void {
  if (!viewState.cleanup) return;
  const cleanup = viewState.cleanup !;
  for (let i = 0; i < cleanup.length - 1; i += 2) {
    if (typeof cleanup[i] === 'string') {
      cleanup ![i + 1].removeEventListener(cleanup[i], cleanup[i + 2], cleanup[i + 3]);
      i += 2;
    } else {
      cleanup[i].call(cleanup[i + 1]);
    }
  }
  viewState.cleanup = null;
}

export function appendChild(parent: LNode, child: RNode | null, currentView: ViewState): boolean {
  // Only add native child element to parent element if the parent element is regular Element.
  // If parent is:
  // - Regular element => add child
  // - Component host element =>
  //    - Current View, and parent view same => content => don't add -> parent component will
  //    re-project if needed.
  //    - Current View, and parent view different => view => add Child
  // - View element => View's get added separately.
  if (child !== null && (parent.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Element &&
      (parent.view !==
           currentView /* Crossing View Boundaries, it is Component, but add Element of View */
       || parent.data === null /* Regular Element. */)) {
    // We only add element if not in View or not projected.

    const renderer = currentView.renderer;
    (renderer as Renderer3Fn).listen ?
        (renderer as Renderer3Fn).appendChild !(parent.native !as RElement, child) :
        parent.native !.appendChild(child);
    return true;
  }
  return false;
}

export function insertChild(node: LNode, currentView: ViewState) {
  const parent = node.parent !;
  // Only add child element to parent element if the parent element is regular Element.
  // If parent is:
  // - Normal element => add child
  // - Component element =>
  //    - Current View, and parent view same => content don't add -> parent component will
  //    re-project if needed.
  //    - Current View, and parent view different => view => add Child
  // - View element => View's get added separately.
  if ((parent.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Element &&
      (parent.view !==
           currentView /* Crossing View Boundaries, its Component, but add Element of View */
       || parent.data === null /* Regular Element. */)) {
    // We only add element if not in View or not projected.

    let sibling = node.next;
    let nativeSibling: RNode|null = null;
    while (sibling && (nativeSibling = sibling.native) === null) {
      sibling = sibling.next;
    }
    const renderer = currentView.renderer;
    (renderer as Renderer3Fn).listen ?
        (renderer as Renderer3Fn).insertBefore !(parent.native !, node.native !, nativeSibling) :
        parent.native !.insertBefore(node.native !, nativeSibling, false);
  }
}

export function processProjectedNode(
    projectedNodes: ProjectionState, node: LElement | LText | LContainer,
    currentParent: LView | LElement, currentView: ViewState) {
  if ((node.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Container &&
      (currentParent.flags & LNodeFlags.TYPE_MASK) === LNodeFlags.Element &&
      currentParent.data === null) {
    // The node we are adding is a Container and we are adding it to Element
    // which is not Component (no more re-projection). Assignee the final
    // projection location.
    const containerState = (node as LContainer).data;
    containerState.renderParent = currentParent as LElement;
    const views = containerState.children;
    for (let i = 0; i < views.length; i++) {
      addRemoveViewFromContainer(node as LContainer, views[i], true, null);
    }
  }
  projectedNodes.push(node);
  appendChild(currentParent, node.native, currentView);
}
