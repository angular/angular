/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {el} from '@angular/platform-browser/testing/browser_util';

import {NoOpAnimationPlayer} from '../../src/animation/animation_player';
import {AnimationViewContext} from '../../src/linker/animation_view_context';
import {fakeAsync, flushMicrotasks} from '../../testing';
import {describe, expect, iit, it} from '../../testing/testing_internal';

export function main() {
  describe('AnimationViewContext', function() {
    let viewContext: AnimationViewContext;
    let elm: any;
    beforeEach(() => {
      viewContext = new AnimationViewContext();
      elm = el('<div></div>');
    });

    function getPlayers() { return viewContext.getAnimationPlayers(elm); }

    it('should remove the player from the registry once the animation is complete',
       fakeAsync(() => {
         const player = new NoOpAnimationPlayer();

         expect(getPlayers().length).toEqual(0);
         viewContext.queueAnimation(elm, 'someAnimation', player);
         expect(getPlayers().length).toEqual(1);
         player.finish();
         expect(getPlayers().length).toEqual(0);
       }));

    it('should not remove a follow-up player from the registry if another player is queued',
       fakeAsync(() => {
         const player1 = new NoOpAnimationPlayer();
         const player2 = new NoOpAnimationPlayer();

         viewContext.queueAnimation(elm, 'someAnimation', player1);
         expect(getPlayers().length).toBe(1);
         expect(getPlayers()[0]).toBe(player1);

         viewContext.queueAnimation(elm, 'someAnimation', player2);
         expect(getPlayers().length).toBe(1);
         expect(getPlayers()[0]).toBe(player2);

         player1.finish();

         expect(getPlayers().length).toBe(1);
         expect(getPlayers()[0]).toBe(player2);

         player2.finish();

         expect(getPlayers().length).toBe(0);
       }));
  });
}
