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

import {NoOpAnimationPlayer, AnimationPlayer} from 'angular2/src/core/animation/animation_player';

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
  });
}
