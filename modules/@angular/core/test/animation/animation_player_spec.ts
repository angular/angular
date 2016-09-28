/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NoOpAnimationPlayer} from '../../src/animation/animation_player';
import {fakeAsync, flushMicrotasks} from '../../testing';
import {describe, expect, it} from '../../testing/testing_internal';

export function main() {
  describe('NoOpAnimationPlayer', function() {
    it('should call onDone after the next microtask when constructed', fakeAsync(() => {
         var player = new NoOpAnimationPlayer();
         var completed = false;
         player.onDone(() => completed = true);
         expect(completed).toEqual(false);
         flushMicrotasks();
         expect(completed).toEqual(true);
       }));

    it('should be able to run each of the player methods', fakeAsync(() => {
         var player = new NoOpAnimationPlayer();
         player.pause();
         player.play();
         player.finish();
         player.restart();
         player.destroy();
       }));

    it('should run the onStart method when started but only once', fakeAsync(() => {
         var player = new NoOpAnimationPlayer();
         var calls = 0;
         player.onStart(() => calls++);
         expect(calls).toEqual(0);
         player.play();
         expect(calls).toEqual(1);
         player.pause();
         player.play();
         expect(calls).toEqual(1);
       }));
  });
}
