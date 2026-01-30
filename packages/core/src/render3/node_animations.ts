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
import {
  queueEnterAnimations,
  addToAnimationQueue,
  removeAnimationsFromQueue,
} from '../animation/queue';
import {Injector} from '../di';
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
  const animations = lView?.[ANIMATIONS];

  // regarding the TNode index to see if it is the same element.
  if (animations?.enter?.has(tNode.index)) {
    removeAnimationsFromQueue(injector, animations.enter.get(tNode.index)!.animateFns);
  }

  const leaveAnimations = animations?.leave;

  const nodesWithExitAnimations = new Map<number, LeaveNodeAnimations>();
  if (leaveAnimations && leaveAnimations.has(tNode.index)) {
    nodesWithExitAnimations.set(tNode.index, leaveAnimations.get(tNode.index)!);
  }

  // We need to check if there are any nested elements that have leave animations.
  // If there are, we need to add them to the list of animations to be run.
  if (lView && leaveAnimations) {
    for (const [index, animationData] of leaveAnimations) {
      if (nodesWithExitAnimations.has(index)) continue;

      const nestedTNode = lView[TVIEW].data[index] as TNode;
      let parent = nestedTNode.parent;
      while (parent) {
        if (parent.index === tNode.index) {
          nodesWithExitAnimations.set(index, animationData);
          break;
        }
        parent = parent.parent;
      }
    }
  }

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
      currentAnimations.running = Promise.allSettled(runningAnimations);
      runAfterLeaveAnimations(lView!, callback);
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

function runAfterLeaveAnimations(lView: LView, callback: Function) {
  const runningAnimations = lView[ANIMATIONS]?.running;
  if (runningAnimations) {
    runningAnimations.then(() => {
      lView[ANIMATIONS]!.running = undefined;
      allLeavingAnimations.delete(lView[ID]);
      callback(true);
    });
    return;
  }
  callback(false);
}
