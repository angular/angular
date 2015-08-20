import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  el,
  AsyncTestCompleter,
  fakeAsync,
  tick,
  inject,
  SpyChangeDetector,
} from 'angular2/test_lib';
import {LifeCycle} from 'angular2/core';
import {IMPLEMENTS} from 'angular2/src/core/facade/lang';

export function main() {
  describe("LifeCycle", () => {
    it("should throw when reentering tick", () => {
      var cd = <any>new SpyChangeDetector();
      var lc = new LifeCycle(cd, false);

      cd.spy("detectChanges").andCallFake(() => lc.tick());
      expect(() => lc.tick()).toThrowError("LifeCycle.tick is called recursively");
    });
  });
}
