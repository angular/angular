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
} from 'angular2/testing_internal';
import {SpyChangeDetector} from './spies';
import {ApplicationRef_} from "angular2/src/core/application_ref";
import {ChangeDetectorRef_} from "angular2/src/core/change_detection/change_detector_ref";

export function main() {
  describe("ApplicationRef", () => {
    it("should throw when reentering tick", () => {
      var cd = <any>new SpyChangeDetector();
      var ref = new ApplicationRef_(null, null, null);
      ref.registerChangeDetector(new ChangeDetectorRef_(cd));
      cd.spy("detectChanges").andCallFake(() => ref.tick());
      expect(() => ref.tick()).toThrowError("ApplicationRef.tick is called recursively");
    });
  });
}
