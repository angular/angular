/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {afterNextRender} from '../render3/after_render/hooks';
import {InjectionToken, EnvironmentInjector, Injector, inject} from '../di';
import {AnimationLViewData, EnterNodeAnimations} from './interfaces';

export interface AnimationQueue {
  queue: Set<VoidFunction>;
  isScheduled: boolean;
  scheduler: typeof initializeAnimationQueueScheduler | null;
  injector: EnvironmentInjector;
}

/**
 * A [DI token](api/core/InjectionToken) for the queue of all animations.
 */
export const ANIMATION_QUEUE = new InjectionToken<AnimationQueue>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'AnimationQueue' : '',
  {
    factory: () => {
      return {
        queue: new Set(),
        isScheduled: false,
        scheduler: null,
        injector: inject(EnvironmentInjector), // should be the root injector
      };
    },
  },
);

export function addToAnimationQueue(
  injector: Injector,
  animationFns: VoidFunction | VoidFunction[],
  animationData?: AnimationLViewData,
) {
  const animationQueue = injector.get(ANIMATION_QUEUE);
  if (Array.isArray(animationFns)) {
    for (const animateFn of animationFns) {
      animationQueue.queue.add(animateFn);
      // If a node is detached, we need to keep track of the queued animation functions
      // so we can later remove them from the global animation queue if the view
      // is re-attached before the animation queue runs.
      animationData?.detachedLeaveAnimationFns?.push(animateFn);
    }
  } else {
    animationQueue.queue.add(animationFns);
    // If a node is detached, we need to keep track of the queued animation functions
    // so we can later remove them from the global animation queue if the view
    // is re-attached before the animation queue runs.
    animationData?.detachedLeaveAnimationFns?.push(animationFns);
  }
  animationQueue.scheduler && animationQueue.scheduler(injector);
}

export function removeFromAnimationQueue(injector: Injector, animationData: AnimationLViewData) {
  const animationQueue = injector.get(ANIMATION_QUEUE);
  if (animationData.detachedLeaveAnimationFns) {
    for (const animationFn of animationData.detachedLeaveAnimationFns) {
      animationQueue.queue.delete(animationFn);
    }
    animationData.detachedLeaveAnimationFns = undefined;
  }
}

export function scheduleAnimationQueue(injector: Injector) {
  const animationQueue = injector.get(ANIMATION_QUEUE);
  // We only want to schedule the animation queue if it hasn't already been scheduled.
  if (!animationQueue.isScheduled) {
    afterNextRender(
      () => {
        animationQueue.isScheduled = false;
        for (let animateFn of animationQueue.queue) {
          animateFn();
        }
        animationQueue.queue.clear();
      },
      {injector: animationQueue.injector},
    );
    animationQueue.isScheduled = true;
  }
}

export function initializeAnimationQueueScheduler(injector: Injector) {
  const animationQueue = injector.get(ANIMATION_QUEUE);
  animationQueue.scheduler = scheduleAnimationQueue;
  animationQueue.scheduler(injector);
}

export function queueEnterAnimations(
  injector: Injector,
  enterAnimations: Map<number, EnterNodeAnimations>,
) {
  for (const [_, nodeAnimations] of enterAnimations) {
    addToAnimationQueue(injector, nodeAnimations.animateFns);
  }
}
