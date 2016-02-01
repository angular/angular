import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit
} from 'angular2/testing_internal';

import {assertionsEnabled, IS_DART} from 'angular2/src/facade/lang';

export function main() {
  describe('dev mode', () => {
    it('is enabled in our tests by default', () => { expect(assertionsEnabled()).toBe(true); });
  });

  if (IS_DART) {
    describe('checked mode', () => {
      it('is enabled in our tests', () => {
        try {
          var s: string = <any>42;
          expect(s).toEqual(42);  // without it, dart analyzer will complain that `s` is not used.
          throw "should not be reached";
        } catch (e) {
        }
      });
    });
  }
}
