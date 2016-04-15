import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  dispatchEvent,
  expect,
  iit,
  inject,
  beforeEachProviders,
  it,
  xit,
  containsRegexp,
  stringifyElement,
  TestComponentBuilder,
  fakeAsync,
  clearPendingTimers,
  ComponentFixture,
  tick,
  flushMicrotasks,
} from 'angular2/testing_internal';

import {AnimationSequencePlayer} from 'angular2/src/core/animation/animation_sequence_player';
import {MockAnimationPlayer} from 'angular2/src/mock/mock_animation_player';

export function main() {
  describe('AnimationSequencePlayer', function() {
    var players;
    beforeEach(() => {
      players = [
        new MockAnimationPlayer(),
        new MockAnimationPlayer(),
        new MockAnimationPlayer(),
      ];
    });

    var assertLastStatus =
        (player: MockAnimationPlayer, status: string, match: boolean) => {
          var index = player.log.length - 1;
          var actual = player.log.length > 0 ? player.log[index] : null;
          if (match) {
            expect(actual).toEqual(status);
          } else {
            expect(actual).not.toEqual(status);
          }
        }

    var assertPlaying = (player: MockAnimationPlayer, isPlaying: boolean) => {
      assertLastStatus(player, 'play', isPlaying);
    };

    it('should pause/play the active player', () => {
      var sequence = new AnimationSequencePlayer(players);

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
      var sequence = new AnimationSequencePlayer(players);

      var completed = false;
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
      var sequence = new AnimationSequencePlayer(players);

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
      var sequence = new AnimationSequencePlayer(players);

      var completed = false;
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

    it('should destroy all the players', () => {
      var sequence = new AnimationSequencePlayer(players);

      sequence.play();

      assertLastStatus(players[0], 'destroy', false);
      assertLastStatus(players[1], 'destroy', false);
      assertLastStatus(players[2], 'destroy', false);

      sequence.finish();

      assertLastStatus(players[0], 'destroy', false);
      assertLastStatus(players[1], 'destroy', false);
      assertLastStatus(players[2], 'destroy', false);

      sequence.destroy();

      assertLastStatus(players[0], 'destroy', true);
      assertLastStatus(players[1], 'destroy', true);
      assertLastStatus(players[2], 'destroy', true);
    });

    it('should function without any players', () => {
      var sequence = new AnimationSequencePlayer([]);
      sequence.onDone(() => {});
      sequence.pause();
      sequence.play();
      sequence.finish();
      sequence.restart();
      sequence.destroy();
    });

    it('should call onDone after the next microtask if no players are provided', fakeAsync(() => {
         var sequence = new AnimationSequencePlayer([]);
         var completed = false;
         sequence.onDone(() => completed = true);
         expect(completed).toEqual(false);
         flushMicrotasks();
         expect(completed).toEqual(true);
       }));
  });
}
