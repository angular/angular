/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation} from '../metadata/view';
import {assertDefined, assertDomNode, assertGreaterOrEqual, assertNotSame} from '../util/assert';

import {assertLContainer, assertLView} from './assert';
import {attachPatchData} from './context_discovery';
import {LContainer, NATIVE, VIEWS, unusedValueExportToPlacateAjd as unused1} from './interfaces/container';
import {ComponentDef} from './interfaces/definition';
import {NodeInjectorFactory} from './interfaces/injector';
import {TElementNode, TNode, TNodeFlags, TNodeType, TProjectionNode, TViewNode, unusedValueExportToPlacateAjd as unused2} from './interfaces/node';
import {unusedValueExportToPlacateAjd as unused3} from './interfaces/projection';
import {ProceduralRenderer3, RComment, RElement, RNode, RText, Renderer3, isProceduralRenderer, unusedValueExportToPlacateAjd as unused4} from './interfaces/renderer';
import {StylingContext} from './interfaces/styling';
import {CHILD_HEAD, CHILD_TAIL, CLEANUP, FLAGS, HEADER_OFFSET, HookData, LView, LViewFlags, NEXT, PARENT, QUERIES, RENDERER, TVIEW, T_HOST, unusedValueExportToPlacateAjd as unused5} from './interfaces/view';
import {assertNodeType} from './node_assert';
import {renderStringify} from './util/misc_utils';
import {findComponentView, getLViewParent} from './util/view_traversal_utils';
import {getNativeByTNode, isComponent, isLContainer, isLView, isRootView, unwrapRNode, viewAttachedToContainer} from './util/view_utils';

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
    renderParent: RElement | null, beforeNode?: RNode | null): void {
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
      const componentHost = componentView[T_HOST] as TElementNode;
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
          currentView = componentView[PARENT] !as LView;
          nextTNode = currentView[TVIEW].data[head.index] as TNode;
        }
      }

    } else {
      // Otherwise, this is a View or an ElementContainer
      nextTNode = tNode.child;
    }

    if (nextTNode === null) {
      // this last node was projected, we need to get back down to its projection node
      if (tNode.projectionNext === null && (tNode.flags & TNodeFlags.isProjected)) {
        currentView = projectionNodeStack[projectionNodeIndex--] as LView;
        tNode = projectionNodeStack[projectionNodeIndex--] as TNode;
      }
      nextTNode = (tNode.flags & TNodeFlags.isProjected) ? tNode.projectionNext : tNode.next;

      /**
       * Find the next node in the TNode tree, taking into account the place where a node is
       * projected (in the shadow DOM) rather than where it comes from (in the light DOM).
       *
       * If there is no sibling node, then it goes to the next sibling of the parent node...
       * until it reaches rootNode (at which point null is returned).
       */
      while (!nextTNode) {
        // If parent is null, we're crossing the view boundary, so we should get the host TNode.
        tNode = tNode.parent || currentView[T_HOST];

        if (tNode === null || tNode === rootTNode) return;

        // When exiting a container, the beforeNode must be restored to the previous value
        if (tNode.type === TNodeType.Container) {
          currentView = getLViewParent(currentView) !;
          beforeNode = currentView[tNode.index][NATIVE];
        }

        if (tNode.type === TNodeType.View) {
          /**
           * If current lView doesn't have next pointer, we try to find it by going up parents
           * chain until:
           * - we find an lView with a next pointer
           * - or find a tNode with a parent that has a next pointer
           * - or reach root TNode (in which case we exit, since we traversed all nodes)
           */
          while (!currentView[NEXT] && currentView[PARENT] &&
                 !(tNode.parent && tNode.parent.next)) {
            if (tNode === rootTNode) return;
            currentView = currentView[PARENT] as LView;
            tNode = currentView[T_HOST] !;
          }
          if (currentView[NEXT]) {
            currentView = currentView[NEXT] as LView;
            nextTNode = currentView[T_HOST];
          } else {
            nextTNode = tNode.next;
          }
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
    action: WalkTNodeTreeAction, renderer: Renderer3, parent: RElement | null, node: RNode,
    tNode: TNode, beforeNode?: RNode | null) {
  if (action === WalkTNodeTreeAction.Insert) {
    nativeInsertBefore(renderer, parent !, node, beforeNode || null);
  } else if (action === WalkTNodeTreeAction.Detach) {
    nativeRemoveNode(renderer, node, isComponent(tNode));
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
 * Detach a `LView` from the DOM by detaching its nodes.
 *
 * @param lView the `LView` to be detached.
 */
export function renderDetachView(lView: LView) {
  walkTNodeTree(lView, WalkTNodeTreeAction.Detach, lView[RENDERER], null);
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
    return cleanUpView(rootView);
  }

  while (lViewOrLContainer) {
    let next: LView|LContainer|null = null;

    if (isLView(lViewOrLContainer)) {
      // If LView, traverse down to child.
      next = lViewOrLContainer[CHILD_HEAD];
    } else {
      ngDevMode && assertLContainer(lViewOrLContainer);
      // If container, traverse down to its first LView.
      const views = lViewOrLContainer[VIEWS] as LView[];
      if (views.length > 0) next = views[0];
    }

    if (!next) {
      // Only clean up view when moving to the side or up, as destroy hooks
      // should be called in order from the bottom up.
      while (lViewOrLContainer && !lViewOrLContainer[NEXT] && lViewOrLContainer !== rootView) {
        cleanUpView(lViewOrLContainer);
        lViewOrLContainer = getParentState(lViewOrLContainer, rootView);
      }
      cleanUpView(lViewOrLContainer || rootView);
      next = lViewOrLContainer && lViewOrLContainer[NEXT];
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
 * @param lView The view to insert
 * @param lContainer The container into which the view should be inserted
 * @param index Which index in the container to insert the child view into
 */
export function insertView(lView: LView, lContainer: LContainer, index: number) {
  ngDevMode && assertLView(lView);
  ngDevMode && assertLContainer(lContainer);
  const views = lContainer[VIEWS];
  ngDevMode && assertDefined(views, 'Container must have views');
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

  lView[PARENT] = lContainer;

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
 * @returns Detached LView instance.
 */
export function detachView(lContainer: LContainer, removeIndex: number): LView {
  const views = lContainer[VIEWS];
  const viewToDetach = views[removeIndex];
  if (removeIndex > 0) {
    views[removeIndex - 1][NEXT] = viewToDetach[NEXT] as LView;
  }
  views.splice(removeIndex, 1);
  addRemoveViewFromContainer(viewToDetach, false);

  if ((viewToDetach[FLAGS] & LViewFlags.Attached) &&
      !(viewToDetach[FLAGS] & LViewFlags.Destroyed) && viewToDetach[QUERIES]) {
    viewToDetach[QUERIES] !.removeView();
  }
  viewToDetach[PARENT] = null;
  viewToDetach[NEXT] = null;
  // Unsets the attached flag
  viewToDetach[FLAGS] &= ~LViewFlags.Attached;
  return viewToDetach;
}

/**
 * Removes a view from a container, i.e. detaches it and then destroys the underlying LView.
 *
 * @param lContainer The container from which to remove a view
 * @param removeIndex The index of the view to remove
 */
export function removeView(lContainer: LContainer, removeIndex: number) {
  const view = lContainer[VIEWS][removeIndex];
  detachView(lContainer, removeIndex);
  destroyLView(view);
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
 * @param lViewOrLContainer The LViewOrLContainer for which we need a parent state
 * @param rootView The rootView, so we don't propagate too far up the view tree
 * @returns The correct parent LViewOrLContainer
 */
export function getParentState(lViewOrLContainer: LView | LContainer, rootView: LView): LView|
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
 * @param view The LView to clean up
 */
function cleanUpView(view: LView | LContainer): void {
  if (isLView(view) && !(view[FLAGS] & LViewFlags.Destroyed)) {
    // Usually the Attached flag is removed when the view is detached from its parent, however
    // if it's a root view, the flag won't be unset hence why we're also removing on destroy.
    view[FLAGS] &= ~LViewFlags.Attached;

    // Mark the LView as destroyed *before* executing the onDestroy hooks. An onDestroy hook
    // runs arbitrary user code, which could include its own `viewRef.destroy()` (or similar). If
    // We don't flag the view as destroyed before the hooks, this could lead to an infinite loop.
    // This also aligns with the ViewEngine behavior. It also means that the onDestroy hook is
    // really more of an "afterDestroy" hook if you think about it.
    view[FLAGS] |= LViewFlags.Destroyed;

    executeOnDestroys(view);
    removeListeners(view);
    const hostTNode = view[T_HOST];
    // For component views only, the local renderer is destroyed as clean up time.
    if (hostTNode && hostTNode.type === TNodeType.Element && isProceduralRenderer(view[RENDERER])) {
      ngDevMode && ngDevMode.rendererDestroy++;
      (view[RENDERER] as ProceduralRenderer3).destroy();
    }
    // For embedded views still attached to a container: remove query result from this view.
    if (viewAttachedToContainer(view) && view[QUERIES]) {
      view[QUERIES] !.removeView();
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
            unwrapRNode(lView[idxOrTargetGetter]);
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
    for (let i = 0; i < destroyHooks.length; i += 2) {
      const context = view[destroyHooks[i] as number];

      // Only call the destroy hook if the context has been requested.
      if (!(context instanceof NodeInjectorFactory)) {
        (destroyHooks[i + 1] as() => void).call(context);
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
export function getRenderParent(tNode: TNode, currentView: LView): RElement|null {
  ngDevMode && assertLView(currentView);

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
    const hostTNode = currentView[T_HOST] !;
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
  ngDevMode && assertLView(currentView);
  const hostTNode = currentView[T_HOST];
  return hostTNode && hostTNode.type === TNodeType.Element ?
      (getNativeByTNode(hostTNode, getLViewParent(currentView) !) as RElement) :
      null;
}

/**
 * Inserts a native node before another native node for a given parent using {@link Renderer3}.
 * This is a utility function that can be used when native nodes were determined - it abstracts an
 * actual renderer being used.
 */
export function nativeInsertBefore(
    renderer: Renderer3, parent: RNode, child: RNode, beforeNode: RNode | null): void {
  ngDevMode && assertNotSame(beforeNode, undefined, 'beforeNode must be a node or null');
  ngDevMode && assertDefined(parent, 'parent node must be defined');
  if (isProceduralRenderer(renderer)) {
    if (beforeNode) {
      renderer.insertBefore(parent, child, beforeNode);
    } else {
      // Because the animation renderer has special handling that differs between appendChild and
      // insertChildBefore, we have to use appendChild, even though insertChildBefore with a null
      // anchor is the same thing as appendChild in terms of actual DOM manipulation
      renderer.appendChild(parent as RElement, child);
    }
  } else {
    parent.insertBefore(child, beforeNode, true);
  }
}

/**
 * Removes a native child node from a given native parent node.
 * @param renderer The renderer instance to use to do the manipulation
 * @param parent The parent node to remove the child from
 * @param child The node to remove
 * @param isHostElement A boolean indicating whether or not the element is a host element for a
 * view.
 */
export function nativeRemoveChild(
    renderer: Renderer3, parent: RElement, child: RNode, isHostElement?: boolean): void {
  if (isProceduralRenderer(renderer)) {
    renderer.removeChild(parent, child, isHostElement);
  } else {
    parent.removeChild(child);
  }
}

/**
 * Returns a native parent of a given DOM node.
 * NOTE: This is `parentNode`, not `parentElement`.
 *
 * @param renderer The renderer instance to use to do the introspection
 * @param node The node from which to find the parent node
 */
export function nativeParentNode(renderer: Renderer3, node: RNode): RElement|null {
  ngDevMode && assertDomNode(node);
  return isProceduralRenderer(renderer) ? renderer.parentNode(node) : node.parentElement;
}

/**
 * Gets the `nextSibling` of a given DOM node.
 *
 * @param renderer The renderer instance to use to introspect on the provided node
 * @param node The node to retrieve the `nextSibling` of.
 */
export function nativeNextSibling(renderer: Renderer3, node: RNode): RNode|null {
  ngDevMode && assertDefined(node, 'node must be provided');
  return isProceduralRenderer(renderer) ? renderer.nextSibling(node) : node.nextSibling;
}

/**
 * Appends {@link RNode}(s) to the render parent found in the parent {@link LView}.
 * @param childRNodeOrNodes the nodes to append
 * @param childTNode A {@link TNode} used with the `parentLView` to get the renderParent
 * @param lView The {@link LView} to append nodes in.
 * @param insertBefore Optional anchor node
 */
export function appendChild(
    childRNodeOrNodes: RNode | RNode[], childTNode: TNode, lView: LView,
    insertBefore: RNode | null = null): void {
  if (childTNode.parent === null) {
    // if we don't have a parent then our parent could be an LViewContainer which may
    // want us to insert at a specific location.
    const lContainer = lView[PARENT] !;
    if (isLContainer(lContainer)) {
      insertBefore = getBeforeNodeForContainedView(lContainer, lView);
    }
  }
  insertChildBefore(childRNodeOrNodes, childTNode, lView, insertBefore);
}

/**
* Inserts {@link RNode}(s) to the render parent found in the parent {@link LView} before the
* provided `insertBeforeNode`.
* @param childRNodeOrNodes the nodes to append
* @param childTNode A {@link TNode} used with the `parentLView` to get the renderParent
* @param parentLView The parent {@link LView} to insert the node(s) in.
* @param insertBeforeNode The {@link RNode} to insert the child node(s) before. If `null`, will
* append
* the node(s).
*/
export function insertChildBefore(
    childRNodeOrNodes: RNode | RNode[], childTNode: TNode, parentLView: LView,
    insertBeforeNode: RNode | null): void {
  const renderParent = getRenderParent(childTNode, parentLView);
  renderChild(childRNodeOrNodes, parentLView, insertBeforeNode, renderParent);
}

/**
 * Appends or inserts child nodes into a parent node using the `parentLView`'s renderer.
 *
 * As an exported function, this is a shortcut used for projections.
 *
 * @param childRNodeOrNodes The node or nodes to insert
 * @param parentLView The parent LView to insert the node(s) in
 * @param insertBeforeNode The DOM node to insert the node(s) before, if `null`, it will append
 * the
 * node(s) to the end.
 * @param renderParent The parent node to append or insert the child node(s) into. If `null`, this
 * function is a noop.
 */
export function renderChild(
    childRNodeOrNodes: RNode | RNode[], parentLView: LView, insertBeforeNode: RNode | null,
    renderParent: RNode | null): void {
  if (renderParent) {
    const renderer = parentLView[RENDERER];
    insertNodeOrNodesBefore(renderer, childRNodeOrNodes, renderParent, insertBeforeNode);
  }
}

/**
 * Inserts DOM nodes before a provided `insertBeforeNode`. If the `insertBeforeNode` is `null`, then
 * this will append the DOM nodes as children of the `renderParent`.
 * @param renderer The renderer to use to do the DOM manipulation
 * @param childRNodeOrNodes The DOM node or nodes to insert
 * @param renderParent The parent DOM node (must be the parent of `insertBeforeNode`, if it's
 * provided)
 * @param insertBeforeNode The node to insert the `childRNodeOrNodes` in front of. If `null`, this
 * function will perform an append.
 */
function insertNodeOrNodesBefore(
    renderer: Renderer3, childRNodeOrNodes: RNode | RNode[], renderParent: RNode,
    insertBeforeNode: RNode | null) {
  if (Array.isArray(childRNodeOrNodes)) {
    for (let i = 0; i < childRNodeOrNodes.length; i++) {
      nativeInsertBefore(renderer, renderParent, childRNodeOrNodes[i], insertBeforeNode);
    }
  } else {
    nativeInsertBefore(renderer, renderParent, childRNodeOrNodes, insertBeforeNode);
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

/**
 * Finds the DOM node that we should insert in front of when we insert DOM for a view we're
 * inserting into a container.
 * @param lContainer The container that holds the view we are inserting DOM for.
 * @param lViewInContainer The view in the container we are going to insert DOM nodes for.
 */
export function getBeforeNodeForContainedView(lContainer: LContainer, lViewInContainer: LView) {
  ngDevMode && assertLContainer(lContainer);
  ngDevMode && assertLView(lViewInContainer);
  const views = lContainer[VIEWS];
  const index = views.indexOf(lViewInContainer);
  ngDevMode && assertGreaterOrEqual(index, 0, 'view must be in container');
  const containerNative = lContainer[NATIVE];
  if (index + 1 < views.length) {
    const view = views[index + 1] as LView;
    const viewTNode = view[T_HOST] as TViewNode;
    return viewTNode.child ? getNativeByTNode(viewTNode.child, view) : containerNative;
  } else {
    return containerNative;
  }
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
 * Appends nodes to a target projection place. Nodes to insert were previously re-distribution and
 * stored on a component host level.
 * @param targetLView The view where nodes are to be inserted
 * @param tProjectionNode A projection node where previously re-distribution should be appended
 * (target insertion place)
 * @param selectorIndex A bucket from where nodes to project should be taken
 * @param componentView A where projectable nodes were initially created (source view)
 * @param renderParent The DOM node to insert child nodes into
 * @param insertBefore The DOM node to insert nodes in front of, defaults to appending if `null`.
 */
export function appendProjectedNodes(
    targetLView: LView, tProjectionNode: TProjectionNode, selectorIndex: number,
    componentView: LView, renderParent: RElement, insertBefore: RNode | null): void {
  const projectedView = componentView[PARENT] !as LView;
  const componentNode = componentView[T_HOST] as TElementNode;
  let nodeToProject = (componentNode.projection as(TNode | null)[])[selectorIndex];

  if (Array.isArray(nodeToProject)) {
    renderChild(nodeToProject, targetLView, insertBefore, renderParent);
  } else {
    while (nodeToProject) {
      if (nodeToProject.type === TNodeType.Projection) {
        appendProjectedNodes(
            targetLView, tProjectionNode, (nodeToProject as TProjectionNode).projection,
            findComponentView(projectedView), renderParent, insertBefore);
      } else {
        // This flag must be set now or we won't know that this node is projected
        // if the nodes are inserted into a container later.
        nodeToProject.flags |= TNodeFlags.isProjected;
        appendProjectedNode(
            nodeToProject, tProjectionNode, targetLView, projectedView, renderParent, insertBefore);
      }
      nodeToProject = nodeToProject.projectionNext;
    }
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
 * @param renderParent The parent DOM node to insert child nodes into
 * @param insertBefore The DOM node to insert nodes in front of, defaults to appending if `null`.
 */
function appendProjectedNode(
    projectedTNode: TNode, tProjectionNode: TNode, currentView: LView, projectionView: LView,
    renderParent: RElement, insertBefore: RNode | null): void {
  const native = getNativeByTNode(projectedTNode, projectionView);
  renderChild(native, currentView, insertBefore, renderParent);

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
        appendProjectedNode(
            ngContainerChildTNode, tProjectionNode, currentView, projectionView, renderParent,
            insertBefore);
        ngContainerChildTNode = ngContainerChildTNode.next;
      }
    }

    if (isLContainer(nodeOrContainer)) {
      renderChild(nodeOrContainer[NATIVE], currentView, insertBefore, renderParent);
    }
  }
}

/**
 * Adds an {@link LContainer} as a child to an LView in the dynamic case, where the
 * view may be added at any point in the DOM tree.
 *
 * This assures that the linked list of {@link LView} instances is in the same order as they
 * appear in the DOM, depth first.
 *
 * To simply append a child view to a container in the common case, use {@link appendChildView}
 *
 * @see appendChildView
 * @see LView[CHILD_HEAD]
 * @see LView[CHILD_TAIL]
 * @see LView[NEXT]
 *
 * @param parentLView the LView to add the child container to
 * @param lContainerToAdd The container to add to the parent
 */
export function insertLContainerIntoParentLView(
    parentLView: LView, lContainerToAdd: LContainer): void {
  ngDevMode && assertLView(parentLView);
  ngDevMode && assertLContainer(lContainerToAdd);

  // TODO(benlesh): Switching this from `HOST` to `NATIVE` didn't cause any tests to break!
  const commentNode = lContainerToAdd[NATIVE];
  const tView = parentLView[TVIEW];

  const constsEnd = tView.bindingStartIndex;
  let lastLContainerOrLView: LContainer|LView|null = null;

  // We're iterating over the LView here instead of traversing TNodes, because we need to support
  // directives that inject ViewContainerRef.
  for (let i = HEADER_OFFSET; i < constsEnd; i++) {
    let item = parentLView[i] as LView | RNode | LContainer | StylingContext;
    if (unwrapRNode(item) === commentNode) {
      if (!lastLContainerOrLView) {
        // HEAD
        if ((lContainerToAdd[NEXT] = parentLView[CHILD_HEAD]) === null) {
          parentLView[CHILD_TAIL] = lContainerToAdd;
        }
        parentLView[CHILD_HEAD] = lContainerToAdd;
        return;
      } else if (!lastLContainerOrLView[NEXT]) {
        // TAIL
        lastLContainerOrLView[NEXT] = lContainerToAdd;
        parentLView[CHILD_TAIL] = lContainerToAdd;
        return;
      } else {
        // Middle
        const _next = lastLContainerOrLView[NEXT];
        lastLContainerOrLView[NEXT] = lContainerToAdd;
        lContainerToAdd[NEXT] = _next;
        return;
      }
    } else if (isLContainer(item) || isLView(item)) {
      lastLContainerOrLView = item;
    }
  }
}

/**
 * Adds an {@link LView} or {@link LContainer} to the END of the current view tree.
 *
 * This structure will be used to traverse through nested views to remove listeners
 * and call onDestroy callbacks.
 *
 * For dynamic insertion use {@link insertLContainerIntoParentLView}
 *
 * @see insertLContainerIntoParentLView
 * @see LView[CHILD_HEAD]
 * @see LView[CHILD_TAIL]
 * @see LView[NEXT]
 *
 * @param lView The view where LView or LContainer should be added
 * @param lViewOrLContainer The LView or LContainer to add to the view tree
 * @returns The same `LView` or `LContainer` passed to `lViewOrContainer`.
 */
export function appendChildView<T extends LView|LContainer>(lView: LView, lViewOrLContainer: T): T {
  if (lView[CHILD_HEAD]) {
    lView[CHILD_TAIL] ![NEXT] = lViewOrLContainer;
  } else {
    lView[CHILD_HEAD] = lViewOrLContainer;
  }
  lView[CHILD_TAIL] = lViewOrLContainer;
  return lViewOrLContainer;
}
