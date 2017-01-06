/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationSequencePlayer} from '../../src/animation/animation_sequence_player';
import {fakeAsync, flushMicrotasks} from '../../testing';
import {MockAnimationPlayer} from '../../testing/mock_animation_player';
import {beforeEach, describe, expect, it} from '../../testing/testing_internal';

export function main() {
  describe('AnimationSequencePlayer', function() {
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

    it('should pause/play the active player', () => {
      const sequence = new AnimationSequencePlayer(players);

      assertPlaying(players[0], false);
      assertPlaying(players[1], false);
      assertPlaying(players[2], false);

      sequence.play();

      assertPlaying(players[0], true);
      assertPlaying(players[1], false);
      assertPlaying(players[2], false);

      sequence.pause();

      assertPlaying(players[0], false);
      assertPlaying(players[1], false);
      assertPlaying(players[2], false);

      sequence.play();
      players[0].finish();

      assertPlaying(players[0], false);
      assertPlaying(players[1], true);
      assertPlaying(players[2], false);

      players[1].finish();

      assertPlaying(players[0], false);
      assertPlaying(players[1], false);
      assertPlaying(players[2], true);

      players[2].finish();
      sequence.pause();

      assertPlaying(players[0], false);
      assertPlaying(players[1], false);
      assertPlaying(players[2], false);
    });

    it('should finish when all players have finished', () => {
      const sequence = new AnimationSequencePlayer(players);

      let completed = false;
      sequence.onDone(() => completed = true);
      sequence.play();

      expect(completed).toBeFalsy();

      players[0].finish();

      expect(completed).toBeFalsy();

      players[1].finish();

      expect(completed).toBeFalsy();

      players[2].finish();

      expect(completed).toBeTruthy();
    });

    it('should restart all the players', () => {
      const sequence = new AnimationSequencePlayer(players);

      sequence.play();

      assertPlaying(players[0], true);
      assertPlaying(players[1], false);
      assertPlaying(players[2], false);

      players[0].finish();

      assertPlaying(players[0], false);
      assertPlaying(players[1], true);
      assertPlaying(players[2], false);

      sequence.restart();

      assertLastStatus(players[0], 'restart', true);
      assertLastStatus(players[1], 'reset', true);
      assertLastStatus(players[2], 'reset', true);
    });

    it('should finish all the players', () => {
      const sequence = new AnimationSequencePlayer(players);

      let completed = false;
      sequence.onDone(() => completed = true);

      sequence.play();

      assertLastStatus(players[0], 'finish', false);
      assertLastStatus(players[1], 'finish', false);
      assertLastStatus(players[2], 'finish', false);

      sequence.finish();

      assertLastStatus(players[0], 'finish', true);
      assertLastStatus(players[1], 'finish', true);
      assertLastStatus(players[2], 'finish', true);

      expect(completed).toBeTruthy();
    });

    it('should not call destroy automatically when finished even if a parent player is present',
       () => {
         const sequence = new AnimationSequencePlayer(players);
         const parent = new AnimationSequencePlayer([sequence, new MockAnimationPlayer()]);

         sequence.play();

         assertLastStatus(players[0], 'destroy', false);
         assertLastStatus(players[1], 'destroy', false);
         assertLastStatus(players[2], 'destroy', false);

         sequence.finish();

         assertLastStatus(players[0], 'destroy', false);
         assertLastStatus(players[1], 'destroy', false);
         assertLastStatus(players[2], 'destroy', false);

         parent.finish();

         assertLastStatus(players[0], 'destroy', false);
         assertLastStatus(players[1], 'destroy', false);
         assertLastStatus(players[2], 'destroy', false);
       });

    it('should function without any players', () => {
      const sequence = new AnimationSequencePlayer([]);
      sequence.onDone(() => {});
      sequence.pause();
      sequence.play();
      sequence.finish();
      sequence.restart();
      sequence.destroy();
    });

    it('should run the onStart method when started but only once', () => {
      const player = new AnimationSequencePlayer([]);
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
         const sequence = new AnimationSequencePlayer([]);
         let completed = false;
         sequence.onDone(() => completed = true);
         expect(completed).toEqual(false);
         flushMicrotasks();
         expect(completed).toEqual(true);
       }));

    it('should not allow the player to be destroyed if it already has been destroyed unless reset',
       fakeAsync(() => {
         const p1 = new MockAnimationPlayer();
         const p2 = new MockAnimationPlayer();
         const innerPlayers = [p1, p2];

         const sequencePlayer = new AnimationSequencePlayer(innerPlayers);
         expect(p1.log[p1.log.length - 1]).not.toContain('destroy');
         expect(p2.log[p2.log.length - 1]).not.toContain('destroy');

         sequencePlayer.destroy();
         expect(p1.log[p1.log.length - 1]).toContain('destroy');
         expect(p2.log[p2.log.length - 1]).toContain('destroy');

         p1.log = p2.log = [];

         sequencePlayer.destroy();
         expect(p1.log[p1.log.length - 1]).not.toContain('destroy');
         expect(p2.log[p2.log.length - 1]).not.toContain('destroy');

         sequencePlayer.reset();
         sequencePlayer.destroy();
         expect(p1.log[p1.log.length - 1]).toContain('destroy');
         expect(p2.log[p2.log.length - 1]).toContain('destroy');
       }));
  });
}
