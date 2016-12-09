/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {el} from '@angular/platform-browser/testing/browser_util';

import {NoOpAnimationPlayer} from '../../src/animation/animation_player';
import {AnimationQueue} from '../../src/animation/animation_queue';
import {AnimationViewContext} from '../../src/linker/animation_view_context';
import {TestBed, fakeAsync, flushMicrotasks} from '../../testing';
import {describe, expect, iit, it} from '../../testing/testing_internal';

export function main() {
  describe('AnimationViewContext', function() {
    let elm: any;
    beforeEach(() => { elm = el('<div></div>'); });

    function getPlayers(vc: any) { return vc.getAnimationPlayers(elm); }

    it('should remove the player from the registry once the animation is complete',
       fakeAsync(() => {
         const player = new NoOpAnimationPlayer();
         const animationQueue = TestBed.get(AnimationQueue) as AnimationQueue;
         const vc = new AnimationViewContext(animationQueue);

         expect(getPlayers(vc).length).toEqual(0);
         vc.queueAnimation(elm, 'someAnimation', player);
         expect(getPlayers(vc).length).toEqual(1);
         player.finish();
         expect(getPlayers(vc).length).toEqual(0);
       }));

    it('should not remove a follow-up player from the registry if another player is queued',
       fakeAsync(() => {
         const player1 = new NoOpAnimationPlayer();
         const player2 = new NoOpAnimationPlayer();
         const animationQueue = TestBed.get(AnimationQueue) as AnimationQueue;
         const vc = new AnimationViewContext(animationQueue);

         vc.queueAnimation(elm, 'someAnimation', player1);
         expect(getPlayers(vc).length).toBe(1);
         expect(getPlayers(vc)[0]).toBe(player1);

         vc.queueAnimation(elm, 'someAnimation', player2);
         expect(getPlayers(vc).length).toBe(1);
         expect(getPlayers(vc)[0]).toBe(player2);

         player1.finish();

         expect(getPlayers(vc).length).toBe(1);
         expect(getPlayers(vc)[0]).toBe(player2);

         player2.finish();

         expect(getPlayers(vc).length).toBe(0);
       }));
  });
}
