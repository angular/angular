/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {afterNextRender} from '../render3/after_render/hooks';
import {InjectionToken, Injector} from '../di';
import {NodeAnimations, RunEnterAnimationFn} from './interfaces';

export interface AnimationQueue {
  queue: Set<VoidFunction>;
  isScheduled: boolean;
  scheduler: typeof initializeAnimationQueueScheduler | null;
}

/**
 * A [DI token](api/core/InjectionToken) for the queue of all animations.
 */
export const ANIMATION_QUEUE = new InjectionToken<AnimationQueue>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'AnimationQueue' : '',
  {
    providedIn: 'root',
    factory: () => {
      return {
        queue: new Set(),
        isScheduled: false,
        scheduler: null,
      };
    },
  },
);

export function addToAnimationQueue(
  injector: Injector,
  animationFns: VoidFunction | VoidFunction[],
) {
  const animationQueue = injector.get(ANIMATION_QUEUE);
  if (Array.isArray(animationFns)) {
    for (const animateFn of animationFns) {
      animationQueue.queue.add(animateFn);
    }
  } else {
    animationQueue.queue.add(animationFns);
  }
  animationQueue.scheduler && animationQueue.scheduler(injector);
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
      {injector},
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
  enterAnimations: Map<number, NodeAnimations<RunEnterAnimationFn>>,
) {
  for (const [_, nodeAnimations] of enterAnimations) {
    addToAnimationQueue(injector, nodeAnimations.animateFns);
  }
}
