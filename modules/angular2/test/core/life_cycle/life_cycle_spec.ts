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
  SpyObject,
  inject,
  proxy
} from 'angular2/test_lib';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {ChangeDetector} from 'angular2/change_detection';
import {IMPLEMENTS} from 'angular2/src/facade/lang';

@proxy
@IMPLEMENTS(ChangeDetector)
class SpyChangeDetector extends SpyObject {
  constructor() { super(ChangeDetector); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

export function main() {
  describe("LifeCycle", () => {
    it("should throw when reentering tick", () => {
      var cd = <any>new SpyChangeDetector();
      var lc = new LifeCycle(null, cd, false);
      cd.spy("detectChanges").andCallFake(() => lc.tick());
      expect(() => lc.tick()).toThrowError("LifeCycle.tick is called recursively");
    });
  });
}
