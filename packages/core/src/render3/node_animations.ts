/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  RunLeaveAnimationFn,
  LeaveNodeAnimations,
  AnimationLViewData,
} from '../animation/interfaces';
import {allLeavingAnimations} from '../animation/longest_animation';
import {queueEnterAnimations, addToAnimationQueue} from '../animation/queue';
import {Injector, INJECTOR} from '../di';
import {CONTAINER_HEADER_OFFSET} from './interfaces/container';
import {TNode, TNodeType} from './interfaces/node';
import {RElement} from './interfaces/renderer_dom';
import {isComponentHost, isLContainer} from './interfaces/type_checks';
import {ANIMATIONS, ID, LView, TVIEW} from './interfaces/view';
import {getComponentLViewByIndex} from './util/view_utils';

export function maybeQueueEnterAnimation(
  parentLView: LView | undefined,
  parent: RElement | null,
  tNode: TNode,
  injector: Injector,
): void {
  const enterAnimations = parentLView?.[ANIMATIONS]?.enter;
  if (parent !== null && enterAnimations && enterAnimations.has(tNode.index)) {
    queueEnterAnimations(injector, enterAnimations);
  }
}

export function runLeaveAnimationsWithCallback(
  lView: LView | undefined,
  tNode: TNode,
  injector: Injector,
  callback: Function,
) {
  // It's possible that the AppRef has been destroyed, which would also destroy
  // the injector tree. If this happens, we will get an error when we try to
  // get the injector, so we catch it here and avoid the error and return
  // safely.
  try {
    injector.get(INJECTOR);
  } catch {
    return callback(false);
  }

  const animations = lView?.[ANIMATIONS];

  // get all nodes in the current view that are descendants of tNode and have leave animations
  const nodesWithExitAnimations = aggregateDescendantAnimations(lView, tNode, animations);

  if (nodesWithExitAnimations.size === 0) {
    let hasNestedAnimations = false;
    if (lView) {
      const nestedPromises: Promise<unknown>[] = [];
      collectNestedViewAnimations(lView, tNode, nestedPromises);
      hasNestedAnimations = nestedPromises.length > 0;
    }

    if (!hasNestedAnimations) {
      return callback(false);
    }
  }

  if (lView) allLeavingAnimations.add(lView[ID]);

  addToAnimationQueue(
    injector,
    () =>
      executeLeaveAnimations(
        lView,
        tNode,
        animations || undefined,
        nodesWithExitAnimations,
        callback,
      ),
    animations || undefined,
  );
}

// Identifies all elements that are descendants of `tNode` *within the same component view*
// (LView) and have active leave animations. Since `tNode` is being removed, its descendants
// will also be removed. We must execute their leave animations and wait for them to finish
// before physically removing `tNode` from the DOM.
//
// Instead of performing a potentially expensive downward traversal of the
// entire `tNode` subtree to find animated descendants, we iterate over the `leaveAnimations`
// map. This map contains all pending leave animations in the current LView and is typically
// very small.
//
// Note: Animations across LView boundaries (e.g., in child components or embedded views)
// are collected separately via `collectNestedViewAnimations`.
function aggregateDescendantAnimations(
  lView: LView | undefined,
  tNode: TNode,
  animations: AnimationLViewData | null | undefined,
): Map<number, LeaveNodeAnimations> {
  const nodesWithExitAnimations = new Map<number, LeaveNodeAnimations>();
  const leaveAnimations = animations?.leave;

  if (leaveAnimations && leaveAnimations.has(tNode.index)) {
    nodesWithExitAnimations.set(tNode.index, leaveAnimations.get(tNode.index)!);
  }

  if (lView && leaveAnimations) {
    for (const [index, animationData] of leaveAnimations) {
      if (nodesWithExitAnimations.has(index)) continue;

      // Get the tNode for the animation. This node might be a descendant of the tNode we are removing.
      // If so, we need to run its leave animation as well.
      const nestedTNode = lView[TVIEW].data[index] as TNode;
      let parent = nestedTNode.parent;

      // Traverse upward to check if `tNode` is an ancestor of `nestedTNode`
      // For each animation in the map, we retrieve its corresponding TNode (`nestedTNode`) and
      // traverse UP the tree using parent pointers. If we encounter `tNode` during this upward
      // traversal, we know the animated element is a descendant, and we add its animation data
      // to `nodesWithExitAnimations`.
      while (parent) {
        if (parent === tNode) {
          nodesWithExitAnimations.set(index, animationData);
          break;
        }
        parent = parent.parent;
      }
    }
  }
  return nodesWithExitAnimations;
}

function executeLeaveAnimations(
  lView: LView | undefined,
  tNode: TNode,
  animations: AnimationLViewData | undefined,
  nodesWithExitAnimations: Map<number, LeaveNodeAnimations>,
  callback: Function,
) {
  // it's possible that in the time between when the leave animation was
  // and the time it was executed, the data structure changed. So we need
  // to be safe here.
  const runningAnimations: Promise<unknown>[] = [];

  if (animations && animations.leave) {
    for (const [index] of nodesWithExitAnimations) {
      if (!animations.leave.has(index)) continue;

      const currentAnimationData = animations.leave.get(index)!;
      for (const animationFn of currentAnimationData.animateFns) {
        const {promise} = animationFn() as ReturnType<RunLeaveAnimationFn>;
        runningAnimations.push(promise);
      }
      animations.detachedLeaveAnimationFns = undefined;
    }
  }

  // Also add nested view animations
  if (lView) {
    collectNestedViewAnimations(lView, tNode, runningAnimations);
  }

  if (runningAnimations.length > 0) {
    const currentAnimations = animations || lView?.[ANIMATIONS];
    if (currentAnimations) {
      const prevRunning = currentAnimations.running;
      if (prevRunning) {
        runningAnimations.push(prevRunning);
      }
      currentAnimations.running = Promise.allSettled(runningAnimations);
      runAfterLeaveAnimations(lView!, currentAnimations.running, callback);
    } else {
      Promise.allSettled(runningAnimations).then(() => {
        if (lView) allLeavingAnimations.delete(lView[ID]);
        callback(true);
      });
    }
  } else {
    if (lView) allLeavingAnimations.delete(lView[ID]);
    callback(false);
  }
}

/**
 * Collects leave animations from nested views (components and containers)
 * starting from the given TNode's children.
 */
function collectNestedViewAnimations(
  lView: LView,
  tNode: TNode,
  collectedPromises: Promise<unknown>[],
) {
  if (isComponentHost(tNode)) {
    const componentView = getComponentLViewByIndex(tNode.index, lView);
    collectAllViewLeaveAnimations(componentView, collectedPromises);
  } else if (tNode.type & TNodeType.AnyContainer) {
    const lContainer = lView[tNode.index];
    if (isLContainer(lContainer)) {
      for (let i = CONTAINER_HEADER_OFFSET; i < lContainer.length; i++) {
        const subView = lContainer[i] as LView;
        collectAllViewLeaveAnimations(subView, collectedPromises);
      }
    }
  }

  let child = tNode.child;
  while (child) {
    collectNestedViewAnimations(lView, child, collectedPromises);
    child = child.next;
  }
}

/**
 * Recursively collects all leave animations from a view and its children.
 */
function collectAllViewLeaveAnimations(view: LView, collectedPromises: Promise<unknown>[]) {
  const animations = view[ANIMATIONS];
  if (animations && animations.leave) {
    for (const animationData of animations.leave.values()) {
      for (const animationFn of animationData.animateFns) {
        // We interpret the animation function to get the promise
        const {promise} = animationFn() as ReturnType<RunLeaveAnimationFn>;
        collectedPromises.push(promise);
      }
    }
  }

  let child = view[TVIEW].firstChild;
  while (child) {
    collectNestedViewAnimations(view, child, collectedPromises);
    child = child.next;
  }
}

function runAfterLeaveAnimations(
  lView: LView,
  runningAnimations: Promise<unknown>,
  callback: Function,
) {
  runningAnimations.then(() => {
    // We only want to clear the running flag and the allLeavingAnimations set if
    // the current running animation is the same as the one we just waited for.
    // If it's different, it means another animation started while we were waiting,
    // and that other animation is now responsible for clearing the flag.
    if (lView[ANIMATIONS]?.running === runningAnimations) {
      lView[ANIMATIONS]!.running = undefined;
      allLeavingAnimations.delete(lView[ID]);
    }
    callback(true);
  });
}
