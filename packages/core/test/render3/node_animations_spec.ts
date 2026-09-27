/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AnimationLViewData} from '../../src/animation/interfaces';
import {allLeavingAnimations} from '../../src/animation/longest_animation';
import {ANIMATION_QUEUE, AnimationQueue} from '../../src/animation/queue';
import {Injector} from '../../src/di/injector';
import {TNode, TNodeType} from '../../src/render3/interfaces/node';
import {RElement} from '../../src/render3/interfaces/renderer_dom';
import {ANIMATIONS, ID, LView, TVIEW} from '../../src/render3/interfaces/view';
import {
  clearViewDetachAnimations,
  enableAnimationRuntimeSupport,
  enableViewDetachAnimationsSupport,
  initViewDetachAnimations,
  maybeQueueEnterAnimation,
  resetAnimationRuntimeSupportForTests,
  runLeaveAnimationsWithCallback,
} from '../../src/render3/node_animations';

describe('node animations runtime switch', () => {
  const tNode = {
    index: 22,
    type: TNodeType.Element,
    parent: null,
    child: null,
    next: null,
  } as unknown as TNode;
  const parent = {} as RElement;
  let queue: AnimationQueue;
  let injector: Injector;

  // A view with no child nodes whose node 22 carries the given animation data, the way the
  // animate instructions record it.
  function viewWith(animations: AnimationLViewData): LView {
    const lView: unknown[] = [];
    lView[TVIEW] = {firstChild: null};
    lView[ID] = 4242;
    lView[ANIMATIONS] = animations;
    return lView as unknown as LView;
  }

  beforeEach(() => {
    resetAnimationRuntimeSupportForTests();
    queue = {queue: new Set(), isScheduled: false, scheduler: null, injector: null!};
    injector = Injector.create({providers: [{provide: ANIMATION_QUEUE, useValue: queue}]});
  });

  afterEach(() => {
    resetAnimationRuntimeSupportForTests();
    allLeavingAnimations.delete(4242);
  });

  describe('before an animate instruction ran', () => {
    it('should remove a node right away, without touching the animation queue', () => {
      const animateFn = jasmine.createSpy('animateFn');
      const lView = viewWith({leave: new Map([[tNode.index, {animateFns: [animateFn]}]])});
      const callback = jasmine.createSpy('callback');

      runLeaveAnimationsWithCallback(lView, tNode, injector, callback);

      expect(callback).toHaveBeenCalledOnceWith(false);
      expect(animateFn).not.toHaveBeenCalled();
      expect(queue.queue.size).toBe(0);
    });

    it('should not queue enter animations', () => {
      const animateFn = jasmine.createSpy('animateFn');
      const lView = viewWith({enter: new Map([[tNode.index, {animateFns: [animateFn]}]])});

      maybeQueueEnterAnimation(lView, parent, tNode, injector);

      expect(queue.queue.size).toBe(0);
    });

    it('should not track leave animations across a detach', () => {
      const lView = viewWith({});

      initViewDetachAnimations(lView);
      expect(lView[ANIMATIONS]!.detachedLeaveAnimationFns).toBeUndefined();

      clearViewDetachAnimations(lView);
      expect(lView[ANIMATIONS]!.detachedLeaveAnimationFns).toBeUndefined();
    });
  });

  describe('once an animate instruction enabled the runtime', () => {
    it('should queue the leave animation and wait before removing the node', () => {
      enableAnimationRuntimeSupport();
      const animateFn = jasmine.createSpy('animateFn');
      const lView = viewWith({leave: new Map([[tNode.index, {animateFns: [animateFn]}]])});
      const callback = jasmine.createSpy('callback');

      runLeaveAnimationsWithCallback(lView, tNode, injector, callback);

      expect(callback).not.toHaveBeenCalled();
      expect(queue.queue.size).toBe(1);
    });

    it('should queue enter animations', () => {
      enableAnimationRuntimeSupport();
      const animateFn = jasmine.createSpy('animateFn');
      const lView = viewWith({enter: new Map([[tNode.index, {animateFns: [animateFn]}]])});

      maybeQueueEnterAnimation(lView, parent, tNode, injector);

      expect(queue.queue.has(animateFn)).toBe(true);
    });

    it('should track leave animations across a detach only when leave is enabled', () => {
      enableAnimationRuntimeSupport();
      const lView = viewWith({});

      initViewDetachAnimations(lView);
      expect(lView[ANIMATIONS]!.detachedLeaveAnimationFns).toBeUndefined();

      enableViewDetachAnimationsSupport();
      initViewDetachAnimations(lView);
      expect(lView[ANIMATIONS]!.detachedLeaveAnimationFns).toEqual([]);

      clearViewDetachAnimations(lView);
      expect(lView[ANIMATIONS]!.detachedLeaveAnimationFns).toBeUndefined();
    });
  });
});
