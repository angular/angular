/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {consumerDestroy, setActiveConsumer} from '../../primitives/signals';

import {NotificationSource} from '../change_detection/scheduling/zoneless_scheduling';
import {hasInSkipHydrationBlockFlag} from '../hydration/skip_hydration';
import {ViewEncapsulation} from '../metadata/view';
import {RendererStyleFlags2} from '../render/api_flags';
import {
  assertDefined,
  assertEqual,
  assertFunction,
  assertNotReactive,
  assertNumber,
} from '../util/assert';

import {isDetachedByI18n} from '../i18n/utils';
import {
  assertLContainer,
  assertParentView,
  assertProjectionSlots,
  assertTNodeForLView,
} from './assert';
import {attachPatchData} from './context_discovery';
import {
  nativeAppendChild,
  nativeAppendOrInsertBefore,
  nativeInsertBefore,
  nativeRemoveNode,
} from './dom_node_manipulation';
import {icuContainerIterate} from './i18n/i18n_tree_shaking';
import {CONTAINER_HEADER_OFFSET, LContainer, MOVED_VIEWS, NATIVE} from './interfaces/container';
import {ComponentDef} from './interfaces/definition';
import {NodeInjectorFactory} from './interfaces/injector';
import {unregisterLView} from './interfaces/lview_tracking';
import {
  TElementNode,
  TIcuContainerNode,
  TNode,
  TNodeFlags,
  TNodeType,
  TProjectionNode,
} from './interfaces/node';
import {Renderer} from './interfaces/renderer';
import {RElement, RNode} from './interfaces/renderer_dom';
import {isComponentHost, isDestroyed, isLContainer, isLView} from './interfaces/type_checks';
import {
  CHILD_HEAD,
  CLEANUP,
  DECLARATION_COMPONENT_VIEW,
  DECLARATION_LCONTAINER,
  DestroyHookData,
  EFFECTS,
  ENVIRONMENT,
  FLAGS,
  HookData,
  HookFn,
  HOST,
  ANIMATIONS,
  LView,
  LViewFlags,
  NEXT,
  ON_DESTROY_HOOKS,
  PARENT,
  QUERIES,
  REACTIVE_TEMPLATE_CONSUMER,
  RENDERER,
  T_HOST,
  TVIEW,
  TView,
  TViewType,
} from './interfaces/view';
import {assertTNodeType} from './node_assert';
import {profiler} from './profiler';
import {ProfilerEvent} from './profiler_types';
import {getLViewParent, getNativeByTNode, unwrapRNode} from './util/view_utils';
import {allLeavingAnimations} from '../animation/longest_animation';

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
  action: WalkTNodeTreeAction,
  renderer: Renderer,
  parent: RElement | null,
  lNodeToHandle: RNode | LContainer | LView,
  beforeNode?: RNode | null,
  parentLView?: LView,
) {
  // If this slot was allocated for a text node dynamically created by i18n, the text node itself
  // won't be created until i18nApply() in the update block, so this node should be skipped.
  // For more info, see "ICU expressions should work inside an ngTemplateOutlet inside an ngFor"
  // in `i18n_spec.ts`.
  if (lNodeToHandle != null) {
    let lContainer: LContainer | undefined;
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

    if (action === WalkTNodeTreeAction.Create && parent !== null) {
      if (beforeNode == null) {
        nativeAppendChild(renderer, parent, rNode);
      } else {
        nativeInsertBefore(renderer, parent, rNode, beforeNode || null, true);
      }
    } else if (action === WalkTNodeTreeAction.Insert && parent !== null) {
      nativeInsertBefore(renderer, parent, rNode, beforeNode || null, true);
    } else if (action === WalkTNodeTreeAction.Detach) {
      runLeaveAnimationsWithCallback(parentLView, () => {
        nativeRemoveNode(renderer, rNode, isComponent);
      });
    } else if (action === WalkTNodeTreeAction.Destroy) {
      runLeaveAnimationsWithCallback(parentLView, () => {
        renderer.destroyNode!(rNode);
      });
    }
    if (lContainer != null) {
      applyContainer(renderer, action, lContainer, parent, beforeNode);
    }
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
export function removeViewFromDOM(tView: TView, lView: LView): void {
  detachViewFromDOM(tView, lView);
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
export function addViewToDOM(
  tView: TView,
  parentTNode: TNode,
  renderer: Renderer,
  lView: LView,
  parentNativeNode: RElement,
  beforeNode: RNode | null,
): void {
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
export function detachViewFromDOM(tView: TView, lView: LView) {
  // When we remove a view from the DOM, we need to rerun afterRender hooks
  // We don't necessarily needs to run change detection. DOM removal only requires
  // change detection if animations are enabled (this notification is handled by animations).
  lView[ENVIRONMENT].changeDetectionScheduler?.notify(NotificationSource.ViewDetachedFromDOM);
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
    let next: LView | LContainer | null = null;

    if (isLView(lViewOrLContainer)) {
      // If LView, traverse down to child.
      next = lViewOrLContainer[CHILD_HEAD];
    } else {
      ngDevMode && assertLContainer(lViewOrLContainer);
      // If container, traverse down to its first LView.
      const firstView: LView | undefined = lViewOrLContainer[CONTAINER_HEADER_OFFSET];
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

export function detachMovedView(declarationContainer: LContainer, lView: LView) {
  ngDevMode && assertLContainer(declarationContainer);
  ngDevMode &&
    assertDefined(
      declarationContainer[MOVED_VIEWS],
      'A projected view should belong to a non-empty projected views collection',
    );
  const movedViews = declarationContainer[MOVED_VIEWS]!;
  const declarationViewIndex = movedViews.indexOf(lView);
  movedViews.splice(declarationViewIndex, 1);
}

/**
 * A standalone function which destroys an LView,
 * conducting clean up (e.g. removing listeners, calling onDestroys).
 *
 * @param tView The `TView' of the `LView` to be destroyed
 * @param lView The view to be destroyed.
 */
export function destroyLView(tView: TView, lView: LView) {
  if (isDestroyed(lView)) {
    return;
  }
  const renderer = lView[RENDERER];

  if (renderer.destroyNode) {
    applyView(tView, lView, renderer, WalkTNodeTreeAction.Destroy, null, null);
  }
  destroyViewTree(lView);
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
  if (isDestroyed(lView)) {
    return;
  }

  const prevConsumer = setActiveConsumer(null);
  try {
    // Usually the Attached flag is removed when the view is detached from its parent, however
    // if it's a root view, the flag won't be unset hence why we're also removing on destroy.
    lView[FLAGS] &= ~LViewFlags.Attached;

    // Mark the LView as destroyed *before* executing the onDestroy hooks. An onDestroy hook
    // runs arbitrary user code, which could include its own `viewRef.destroy()` (or similar). If
    // We don't flag the view as destroyed before the hooks, this could lead to an infinite loop.
    // This also aligns with the ViewEngine behavior. It also means that the onDestroy hook is
    // really more of an "afterDestroy" hook if you think about it.
    lView[FLAGS] |= LViewFlags.Destroyed;

    lView[REACTIVE_TEMPLATE_CONSUMER] && consumerDestroy(lView[REACTIVE_TEMPLATE_CONSUMER]);

    executeOnDestroys(tView, lView);
    processCleanups(tView, lView);
    // For component views only, the local renderer is destroyed at clean up time.
    if (lView[TVIEW].type === TViewType.Component) {
      lView[RENDERER].destroy();
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

    // Unregister the view once everything else has been cleaned up.
    unregisterLView(lView);
  } finally {
    setActiveConsumer(prevConsumer);
  }
}

function runLeaveAnimationsWithCallback(lView: LView | undefined, callback: Function) {
  if (lView && lView[ANIMATIONS] && lView[ANIMATIONS].leave) {
    const runningAnimations = [];
    for (let animateFn of lView[ANIMATIONS].leave) {
      runningAnimations.push(animateFn());
    }
    lView[ANIMATIONS].running = Promise.allSettled(runningAnimations);
    lView[ANIMATIONS].leave = undefined;
  }
  runAfterLeaveAnimations(lView, callback);
}

function runAfterLeaveAnimations(lView: LView | undefined, callback: Function) {
  if (lView && lView[ANIMATIONS] && lView[ANIMATIONS].running) {
    lView[ANIMATIONS].running.then(() => {
      if (lView[ANIMATIONS] && lView[ANIMATIONS].running) {
        lView[ANIMATIONS].running = undefined;
      }
      allLeavingAnimations.delete(lView);
      callback();
    });
    return;
  }
  callback();
}

/** Removes listeners and unsubscribes from output subscriptions */
function processCleanups(tView: TView, lView: LView): void {
  ngDevMode && assertNotReactive(processCleanups.name);
  const tCleanup = tView.cleanup;
  const lCleanup = lView[CLEANUP]!;
  if (tCleanup !== null) {
    for (let i = 0; i < tCleanup.length - 1; i += 2) {
      if (typeof tCleanup[i] === 'string') {
        // This is a native DOM listener. It will occupy 4 entries in the TCleanup array (hence i +=
        // 2 at the end of this block).
        const targetIdx = tCleanup[i + 3];
        ngDevMode && assertNumber(targetIdx, 'cleanup target must be a number');
        if (targetIdx >= 0) {
          // Destroy anything whose teardown is a function call (e.g. QueryList, ModelSignal).
          lCleanup[targetIdx]();
        } else {
          // Subscription
          lCleanup[-targetIdx].unsubscribe();
        }
        i += 2;
      } else {
        // This is a cleanup function that is grouped with the index of its context
        const context = lCleanup[tCleanup[i + 1]];
        tCleanup[i].call(context);
      }
    }
  }
  if (lCleanup !== null) {
    lView[CLEANUP] = null;
  }
  const destroyHooks = lView[ON_DESTROY_HOOKS];
  if (destroyHooks !== null) {
    // Reset the ON_DESTROY_HOOKS array before iterating over it to prevent hooks that unregister
    // themselves from mutating the array during iteration.
    lView[ON_DESTROY_HOOKS] = null;
    for (let i = 0; i < destroyHooks.length; i++) {
      const destroyHooksFn = destroyHooks[i];
      ngDevMode && assertFunction(destroyHooksFn, 'Expecting destroy hook to be a function.');
      destroyHooksFn();
    }
  }

  // Destroy effects registered to the view. Many of these will have been processed above.
  const effects = lView[EFFECTS];
  if (effects !== null) {
    lView[EFFECTS] = null;
    for (const effect of effects) {
      effect.destroy();
    }
  }
}

/** Calls onDestroy hooks for this view */
function executeOnDestroys(tView: TView, lView: LView): void {
  ngDevMode && assertNotReactive(executeOnDestroys.name);
  let destroyHooks: DestroyHookData | null;

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
export function getParentRElement(tView: TView, tNode: TNode, lView: LView): RElement | null {
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
export function getClosestRElement(
  tView: TView,
  tNode: TNode | null,
  lView: LView,
): RElement | null {
  let parentTNode: TNode | null = tNode;
  // Skip over element and ICU containers as those are represented by a comment node and
  // can't be used as a render parent. Also skip let declarations since they don't have a
  // corresponding DOM node at all.
  while (
    parentTNode !== null &&
    parentTNode.type & (TNodeType.ElementContainer | TNodeType.Icu | TNodeType.LetDeclaration)
  ) {
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
    if (isComponentHost(parentTNode)) {
      ngDevMode && assertTNodeForLView(parentTNode, lView);
      const {encapsulation} = tView.data[
        parentTNode.directiveStart + parentTNode.componentOffset
      ] as ComponentDef<unknown>;
      // We've got a parent which is an element in the current view. We just need to verify if the
      // parent element is not a component. Component's content nodes are not inserted immediately
      // because they will be projected, and so doing insert at this point would be wasteful.
      // Since the projection would then move it to its final destination. Note that we can't
      // make this assumption when using the Shadow DOM, because the native projection placeholders
      // (<content> or <slot>) have to be in place as elements are being inserted.
      if (
        encapsulation === ViewEncapsulation.None ||
        encapsulation === ViewEncapsulation.Emulated
      ) {
        return null;
      }
    }

    return getNativeByTNode(parentTNode, lView) as RElement;
  }
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
function getInsertInFrontOfRNode(
  parentTNode: TNode,
  currentTNode: TNode,
  lView: LView,
): RNode | null {
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
  parentTNode: TNode,
  currentTNode: TNode,
  lView: LView,
): RNode | null {
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
let _getInsertInFrontOfRNodeWithI18n: (
  parentTNode: TNode,
  currentTNode: TNode,
  lView: LView,
) => RNode | null = getInsertInFrontOfRNodeWithNoI18n;

/**
 * Tree shakable boundary for `processI18nInsertBefore` function.
 *
 * This function will only be set if i18n code runs.
 */
let _processI18nInsertBefore: (
  renderer: Renderer,
  childTNode: TNode,
  lView: LView,
  childRNode: RNode | RNode[],
  parentRElement: RElement | null,
) => void;

export function setI18nHandling(
  getInsertInFrontOfRNodeWithI18n: (
    parentTNode: TNode,
    currentTNode: TNode,
    lView: LView,
  ) => RNode | null,
  processI18nInsertBefore: (
    renderer: Renderer,
    childTNode: TNode,
    lView: LView,
    childRNode: RNode | RNode[],
    parentRElement: RElement | null,
  ) => void,
) {
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
  tView: TView,
  lView: LView,
  childRNode: RNode | RNode[],
  childTNode: TNode,
): void {
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
export function getFirstNativeNode(lView: LView, tNode: TNode | null): RNode | null {
  if (tNode !== null) {
    ngDevMode &&
      assertTNodeType(
        tNode,
        TNodeType.AnyRNode |
          TNodeType.AnyContainer |
          TNodeType.Icu |
          TNodeType.Projection |
          TNodeType.LetDeclaration,
      );

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
    } else if (tNodeType & TNodeType.LetDeclaration) {
      return getFirstNativeNode(lView, tNode.next);
    } else if (tNodeType & TNodeType.Icu) {
      let nextRNode = icuContainerIterate(tNode as TIcuContainerNode, lView);
      let rNode: RNode | null = nextRNode();
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

export function getProjectionNodes(lView: LView, tNode: TNode | null): TNode | RNode[] | null {
  if (tNode !== null) {
    const componentView = lView[DECLARATION_COMPONENT_VIEW];
    const componentHost = componentView[T_HOST] as TElementNode;
    const slotIdx = tNode.projection as number;
    ngDevMode && assertProjectionSlots(lView);
    return componentHost.projection![slotIdx];
  }
  return null;
}

export function getBeforeNodeForView(
  viewIndexInContainer: number,
  lContainer: LContainer,
): RNode | null {
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
 * Performs the operation of `action` on the node. Typically this involves inserting or removing
 * nodes on the LView or projection boundary.
 */
function applyNodes(
  renderer: Renderer,
  action: WalkTNodeTreeAction,
  tNode: TNode | null,
  lView: LView,
  parentRElement: RElement | null,
  beforeNode: RNode | null,
  isProjection: boolean,
) {
  while (tNode != null) {
    ngDevMode && assertTNodeForLView(tNode, lView);

    // Let declarations don't have corresponding DOM nodes so we skip over them.
    if (tNode.type === TNodeType.LetDeclaration) {
      tNode = tNode.next;
      continue;
    }

    ngDevMode &&
      assertTNodeType(
        tNode,
        TNodeType.AnyRNode | TNodeType.AnyContainer | TNodeType.Projection | TNodeType.Icu,
      );
    const rawSlotValue = lView[tNode.index];
    const tNodeType = tNode.type;
    if (isProjection) {
      if (action === WalkTNodeTreeAction.Create) {
        rawSlotValue && attachPatchData(unwrapRNode(rawSlotValue), lView);
        tNode.flags |= TNodeFlags.isProjected;
      }
    }
    if (!isDetachedByI18n(tNode)) {
      if (tNodeType & TNodeType.ElementContainer) {
        applyNodes(renderer, action, tNode.child, lView, parentRElement, beforeNode, false);
        applyToElementOrContainer(
          action,
          renderer,
          parentRElement,
          rawSlotValue,
          beforeNode,
          lView,
        );
      } else if (tNodeType & TNodeType.Icu) {
        const nextRNode = icuContainerIterate(tNode as TIcuContainerNode, lView);
        let rNode: RNode | null;
        while ((rNode = nextRNode())) {
          applyToElementOrContainer(action, renderer, parentRElement, rNode, beforeNode, lView);
        }
        applyToElementOrContainer(
          action,
          renderer,
          parentRElement,
          rawSlotValue,
          beforeNode,
          lView,
        );
      } else if (tNodeType & TNodeType.Projection) {
        applyProjectionRecursive(
          renderer,
          action,
          lView,
          tNode as TProjectionNode,
          parentRElement,
          beforeNode,
        );
      } else {
        ngDevMode && assertTNodeType(tNode, TNodeType.AnyRNode | TNodeType.Container);
        applyToElementOrContainer(
          action,
          renderer,
          parentRElement,
          rawSlotValue,
          beforeNode,
          lView,
        );
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
  tView: TView,
  lView: LView,
  renderer: Renderer,
  action: WalkTNodeTreeAction.Destroy,
  parentRElement: null,
  beforeNode: null,
): void;
function applyView(
  tView: TView,
  lView: LView,
  renderer: Renderer,
  action: WalkTNodeTreeAction,
  parentRElement: RElement | null,
  beforeNode: RNode | null,
): void;
function applyView(
  tView: TView,
  lView: LView,
  renderer: Renderer,
  action: WalkTNodeTreeAction,
  parentRElement: RElement | null,
  beforeNode: RNode | null,
): void {
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
    renderer,
    WalkTNodeTreeAction.Create,
    lView,
    tProjectionNode,
    parentRNode,
    beforeNode,
  );
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
  renderer: Renderer,
  action: WalkTNodeTreeAction,
  lView: LView,
  tProjectionNode: TProjectionNode,
  parentRElement: RElement | null,
  beforeNode: RNode | null,
) {
  const componentLView = lView[DECLARATION_COMPONENT_VIEW];
  const componentNode = componentLView[T_HOST] as TElementNode;
  ngDevMode &&
    assertEqual(typeof tProjectionNode.projection, 'number', 'expecting projection index');
  const nodeToProjectOrRNodes = componentNode.projection![tProjectionNode.projection]!;
  if (Array.isArray(nodeToProjectOrRNodes)) {
    // This should not exist, it is a bit of a hack. When we bootstrap a top level node and we
    // need to support passing projectable nodes, so we cheat and put them in the TNode
    // of the Host TView. (Yes we put instance info at the T Level). We can get away with it
    // because we know that TView is not shared and therefore it will not be a problem.
    // This should be refactored and cleaned up.
    for (let i = 0; i < nodeToProjectOrRNodes.length; i++) {
      const rNode = nodeToProjectOrRNodes[i];
      applyToElementOrContainer(action, renderer, parentRElement, rNode, beforeNode, lView);
    }
  } else {
    let nodeToProject: TNode | null = nodeToProjectOrRNodes;
    const projectedComponentLView = componentLView[PARENT] as LView;
    // If a parent <ng-content> is located within a skip hydration block,
    // annotate an actual node that is being projected with the same flag too.
    if (hasInSkipHydrationBlockFlag(tProjectionNode)) {
      nodeToProject.flags |= TNodeFlags.inSkipHydrationBlock;
    }
    applyNodes(
      renderer,
      action,
      nodeToProject,
      projectedComponentLView,
      parentRElement,
      beforeNode,
      true,
    );
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
  renderer: Renderer,
  action: WalkTNodeTreeAction,
  lContainer: LContainer,
  parentRElement: RElement | null,
  beforeNode: RNode | null | undefined,
) {
  ngDevMode && assertLContainer(lContainer);
  const anchor = lContainer[NATIVE]; // LContainer has its own before node.
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
  renderer: Renderer,
  isClassBased: boolean,
  rNode: RElement,
  prop: string,
  value: any,
) {
  if (isClassBased) {
    // We actually want JS true/false here because any truthy value should add the class
    if (!value) {
      renderer.removeClass(rNode, prop);
    } else {
      renderer.addClass(rNode, prop);
    }
  } else {
    let flags = prop.indexOf('-') === -1 ? undefined : (RendererStyleFlags2.DashCase as number);
    if (value == null /** || value === undefined */) {
      renderer.removeStyle(rNode, prop, flags);
    } else {
      // A value is important if it ends with `!important`. The style
      // parser strips any semicolons at the end of the value.
      const isImportant = typeof value === 'string' ? value.endsWith('!important') : false;

      if (isImportant) {
        // !important has to be stripped from the value for it to be valid.
        value = value.slice(0, -10);
        flags! |= RendererStyleFlags2.Important;
      }

      renderer.setStyle(rNode, prop, value, flags);
    }
  }
}
