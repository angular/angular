import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  beforeEachBindings,
  SpyObject
} from 'angular2/testing_internal';

import {HammerGesturesPlugin} from 'angular2/src/core/render/dom/events/hammer_gestures';

export function main() {
  if (typeof window !== 'undefined') {
    describe('HammerGesturesSupport', () => {

      it('should return false if Hammer.js is not loaded', () => {
        const h = new HammerGesturesPlugin();
        expect(h.supports('press')).toEqual(false);
      });

    });
  }
}
