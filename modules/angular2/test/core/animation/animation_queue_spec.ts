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

import {AnimationQueue} from 'angular2/src/core/animation/animation_queue';
import {MockAnimationPlayer} from 'angular2/src/mock/mock_animation_player';
import {MockNgZone} from 'angular2/src/mock/ng_zone_mock';

export function main() {
  describe('AnimationGroupPlayer', function() {
    var queue;
    beforeEach(() => {
      var mockZone = new MockNgZone();
      queue = new AnimationQueue(mockZone);
    });

    it('should queue up a series of players and run play when flushed', () => {
      var e1 = el('<div></div>');
      var e2 = el('<div></div>');
      var e3 = el('<div></div>');

      var players = [
        new MockAnimationPlayer(),
        new MockAnimationPlayer(),
        new MockAnimationPlayer(),
      ];

      var count = 0;
      var countFn = () => count++;

      queue.schedule(e1, 1, players[0], countFn);
      queue.schedule(e2, 1, players[1], countFn);
      queue.schedule(e3, 1, players[2], countFn);

      expect(count).toEqual(0);

      queue.flush();

      players[0].finish();
      players[1].finish();
      players[2].finish();

      expect(count).toEqual(3);
    });

    it('should finish up a previously scheduled player if the new priority is higher on the same element',
       () => {
         var players = [
           new MockAnimationPlayer(),
           new MockAnimationPlayer(),
           new MockAnimationPlayer(),
         ];

         var lookup = {};
         var trackFn = (letter) => { return () => { lookup[letter] = true; }; }

         var element = el('<div></div>');

         queue.schedule(element, 100, players[0], trackFn('1'));
         expect(lookup['1']).toBeFalsy();

         queue.schedule(element, 200, players[1], trackFn('2'));
         expect(lookup['1']).toBeTruthy();
         expect(lookup['2']).toBeFalsy();

         queue.schedule(element, 150, players[2], trackFn('3'));
         expect(lookup['1']).toBeTruthy();
         expect(lookup['2']).toBeFalsy();
         expect(lookup['3']).toBeTruthy();
       });

    it('should cancel an already running animation which is on the same element only if the follow-up priority is higher',
       () => {
         var player1 = new MockAnimationPlayer();
         var player2 = new MockAnimationPlayer();
         var player3 = new MockAnimationPlayer();
         var element = el('<div></div>');

         var lookup = {};
         var trackFn = (letter) => { return () => { lookup[letter] = true; }; }

                                   queue.schedule(element, 100, player1, trackFn('A'));

         queue.flush();

         expect(lookup['A']).toBeFalsy();
         expect(lookup['B']).toBeFalsy();

         queue.schedule(element, 200, player2, trackFn('B'));

         expect(lookup['A']).toBeTruthy();
         expect(lookup['B']).toBeFalsy();

         queue.schedule(element, 150, player3, trackFn('C'));

         expect(lookup['A']).toBeTruthy();
         expect(lookup['B']).toBeFalsy();
         expect(lookup['C']).toBeTruthy();
       });
  });
}
