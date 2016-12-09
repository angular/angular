/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationQueue} from '@angular/core/src/animation/animation_queue';

import {NgZone} from '../../src/zone/ng_zone';
import {TestBed, fakeAsync, flushMicrotasks} from '../../testing';
import {MockAnimationPlayer} from '../../testing/mock_animation_player';
import {beforeEach, describe, expect, it} from '../../testing/testing_internal';

export function main() {
  describe('AnimationQueue', function() {
    beforeEach(() => { TestBed.configureTestingModule({declarations: [], imports: []}); });

    it('should queue animation players and run when flushed, but only as the next scheduled microtask',
       fakeAsync(() => {
         const zone = TestBed.get(NgZone);
         const queue = new AnimationQueue(zone);

         const log: string[] = [];
         const p1 = new MockAnimationPlayer();
         const p2 = new MockAnimationPlayer();
         const p3 = new MockAnimationPlayer();

         p1.onStart(() => log.push('1'));
         p2.onStart(() => log.push('2'));
         p3.onStart(() => log.push('3'));

         queue.enqueue(p1);
         queue.enqueue(p2);
         queue.enqueue(p3);
         expect(log).toEqual([]);

         queue.flush();
         expect(log).toEqual([]);

         flushMicrotasks();
         expect(log).toEqual(['1', '2', '3']);
       }));

    it('should always run each of the animation players outside of the angular zone on start',
       fakeAsync(() => {
         const zone = TestBed.get(NgZone);
         const queue = new AnimationQueue(zone);

         const player = new MockAnimationPlayer();
         let eventHasRun = false;
         player.onStart(() => {
           NgZone.assertNotInAngularZone();
           eventHasRun = true;
         });

         zone.run(() => {
           NgZone.assertInAngularZone();
           queue.enqueue(player);
           queue.flush();
           flushMicrotasks();
         });

         expect(eventHasRun).toBe(true);
       }));

    it('should always run each of the animation players outside of the angular zone on done',
       fakeAsync(() => {
         const zone = TestBed.get(NgZone);
         const queue = new AnimationQueue(zone);

         const player = new MockAnimationPlayer();
         let eventHasRun = false;
         player.onDone(() => {
           NgZone.assertNotInAngularZone();
           eventHasRun = true;
         });

         zone.run(() => {
           NgZone.assertInAngularZone();
           queue.enqueue(player);
           queue.flush();
           flushMicrotasks();
         });

         expect(eventHasRun).toBe(false);
         player.finish();
         expect(eventHasRun).toBe(true);
       }));

    it('should not run animations again incase an animation midway fails', fakeAsync(() => {
         const zone = TestBed.get(NgZone);
         const queue = new AnimationQueue(zone);

         const log: string[] = [];
         const p1 = new PlayerThatFails(false);
         const p2 = new PlayerThatFails(true);
         const p3 = new PlayerThatFails(false);

         p1.onStart(() => log.push('1'));
         p2.onStart(() => log.push('2'));
         p3.onStart(() => log.push('3'));

         queue.enqueue(p1);
         queue.enqueue(p2);
         queue.enqueue(p3);

         queue.flush();

         expect(() => flushMicrotasks()).toThrowError();

         expect(log).toEqual(['1', '2']);

         // let's reset this so that it gets triggered again
         p2.reset();
         p2.onStart(() => log.push('2'));

         queue.flush();

         expect(() => flushMicrotasks()).not.toThrowError();

         expect(log).toEqual(['1', '2', '3']);
       }));
  });
}

class PlayerThatFails extends MockAnimationPlayer {
  private _animationStarted = false;

  constructor(public doFail: boolean) { super(); }

  play() {
    super.play();
    this._animationStarted = true;
    if (this.doFail) {
      throw new Error('Oh nooooo');
    }
  }

  reset() { this._animationStarted = false; }

  hasStarted() { return this._animationStarted; }
}
