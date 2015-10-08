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
  inject
} from 'angular2/test_lib';
import {SpyChangeDetector} from '../spies';
import {LifeCycle_} from "angular2/src/core/life_cycle/life_cycle";

export function main() {
  describe("LifeCycle", () => {
    it("should throw when reentering tick", () => {
      var cd = <any>new SpyChangeDetector();
      var lc = new LifeCycle_(cd, false);

      cd.spy("detectChanges").andCallFake(() => lc.tick());
      expect(() => lc.tick()).toThrowError("LifeCycle.tick is called recursively");
    });
  });
}
