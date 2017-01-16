/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationGroupPlayer} from '../../src/animation/animation_group_player';
import {fakeAsync, flushMicrotasks} from '../../testing';
import {MockAnimationPlayer} from '../../testing/mock_animation_player';
import {beforeEach, describe, expect, it} from '../../testing/testing_internal';

export function main() {
  describe('AnimationGroupPlayer', function() {
    let players: any /** TODO #9100 */;
    beforeEach(() => {
      players = [
        new MockAnimationPlayer(),
        new MockAnimationPlayer(),
        new MockAnimationPlayer(),
      ];
    });

    const assertLastStatus =
        (player: MockAnimationPlayer, status: string, match: boolean, iOffset: number = 0) => {
          const index = player.log.length - 1 + iOffset;
          const actual = player.log.length > 0 ? player.log[index] : null;
          if (match) {
            expect(actual).toEqual(status);
          } else {
            expect(actual).not.toEqual(status);
          }
        };

    const assertPlaying = (player: MockAnimationPlayer, isPlaying: boolean) => {
      assertLastStatus(player, 'play', isPlaying);
    };

    it('should play and pause all players in parallel', () => {
      const group = new AnimationGroupPlayer(players);

      assertPlaying(players[0], false);
      assertPlaying(players[1], false);
      assertPlaying(players[2], false);

      group.play();

      assertPlaying(players[0], true);
      assertPlaying(players[1], true);
      assertPlaying(players[2], true);

      group.pause();

      assertPlaying(players[0], false);
      assertPlaying(players[1], false);
      assertPlaying(players[2], false);
    });

    it('should finish when all players have finished', () => {
      const group = new AnimationGroupPlayer(players);
      let completed = false;
      group.onDone(() => completed = true);

      group.play();

      expect(completed).toBeFalsy();

      players[0].finish();

      expect(completed).toBeFalsy();

      players[1].finish();

      expect(completed).toBeFalsy();

      players[2].finish();

      expect(completed).toBeTruthy();
    });

    it('should restart all the players', () => {
      const group = new AnimationGroupPlayer(players);

      group.play();

      assertLastStatus(players[0], 'restart', false);
      assertLastStatus(players[1], 'restart', false);
      assertLastStatus(players[2], 'restart', false);

      group.restart();

      assertLastStatus(players[0], 'restart', true);
      assertLastStatus(players[1], 'restart', true);
      assertLastStatus(players[2], 'restart', true);
    });

    it('should not destroy the inner the players when finished', () => {
      const group = new AnimationGroupPlayer(players);

      let completed = false;
      group.onDone(() => completed = true);

      expect(completed).toBeFalsy();

      group.play();

      assertLastStatus(players[0], 'finish', false);
      assertLastStatus(players[1], 'finish', false);
      assertLastStatus(players[2], 'finish', false);

      expect(completed).toBeFalsy();

      group.finish();

      assertLastStatus(players[0], 'finish', true);
      assertLastStatus(players[1], 'finish', true);
      assertLastStatus(players[2], 'finish', true);

      expect(completed).toBeTruthy();
    });

    it('should not call destroy automatically when finished even if a parent player finishes',
       () => {
         const group = new AnimationGroupPlayer(players);
         const parent = new AnimationGroupPlayer([group, new MockAnimationPlayer()]);

         group.play();

         assertLastStatus(players[0], 'destroy', false);
         assertLastStatus(players[1], 'destroy', false);
         assertLastStatus(players[2], 'destroy', false);

         group.finish();

         assertLastStatus(players[0], 'destroy', false);
         assertLastStatus(players[1], 'destroy', false);
         assertLastStatus(players[2], 'destroy', false);

         parent.finish();

         assertLastStatus(players[0], 'destroy', false);
         assertLastStatus(players[1], 'destroy', false);
         assertLastStatus(players[2], 'destroy', false);
       });

    it('should function without any players', () => {
      const group = new AnimationGroupPlayer([]);
      group.onDone(() => {});
      group.pause();
      group.play();
      group.finish();
      group.restart();
      group.destroy();
    });

    it('should run the onStart method when started but only once', () => {
      const player = new AnimationGroupPlayer([]);
      let calls = 0;
      player.onStart(() => calls++);
      expect(calls).toEqual(0);
      player.play();
      expect(calls).toEqual(1);
      player.pause();
      player.play();
      expect(calls).toEqual(1);
    });

    it('should call onDone after the next microtask if no players are provided', fakeAsync(() => {
         const group = new AnimationGroupPlayer([]);
         let completed = false;
         group.onDone(() => completed = true);
         expect(completed).toEqual(false);
         flushMicrotasks();
         expect(completed).toEqual(true);
       }));

    it('should not allow the player to be destroyed if it already has been destroyed unless reset',
       fakeAsync(() => {
         const p1 = new MockAnimationPlayer();
         const p2 = new MockAnimationPlayer();
         const innerPlayers = [p1, p2];

         const groupPlayer = new AnimationGroupPlayer(innerPlayers);
         expect(p1.log[p1.log.length - 1]).not.toContain('destroy');
         expect(p2.log[p2.log.length - 1]).not.toContain('destroy');

         groupPlayer.destroy();
         expect(p1.log[p1.log.length - 1]).toContain('destroy');
         expect(p2.log[p2.log.length - 1]).toContain('destroy');

         p1.log = p2.log = [];

         groupPlayer.destroy();
         expect(p1.log[p1.log.length - 1]).not.toContain('destroy');
         expect(p2.log[p2.log.length - 1]).not.toContain('destroy');

         groupPlayer.reset();
         groupPlayer.destroy();
         expect(p1.log[p1.log.length - 1]).toContain('destroy');
         expect(p2.log[p2.log.length - 1]).toContain('destroy');
       }));
  });
}
