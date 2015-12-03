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
import {ApplicationRef_, PlatformRef_} from "angular2/src/core/application_ref";
import {Injector, Provider} from "angular2/core";
import {ChangeDetectorRef_} from "angular2/src/core/change_detection/change_detector_ref";
import {PromiseWrapper} from "angular2/src/facade/async";
import {ListWrapper} from "angular2/src/facade/collection";

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

  describe("PlatformRef", () => {
    describe("asyncApplication", () => {
      it("should merge syncronous and asyncronous providers",
         inject([AsyncTestCompleter, Injector], (async, injector) => {
           let ref = new PlatformRef_(injector, null);
           let ASYNC_PROVIDERS = [new Provider(Foo, {useValue: new Foo()})];
           let SYNC_PROVIDERS = [new Provider(Bar, {useValue: new Bar()})];
           ref.asyncApplication((zone) => PromiseWrapper.resolve(ASYNC_PROVIDERS), SYNC_PROVIDERS)
               .then((appRef) => {
                 var providers = ListWrapper.concat(ASYNC_PROVIDERS, SYNC_PROVIDERS);
                 for (var i = 0; i < providers.length; i++) {
                   var provider = providers[i];
                   expect(appRef.injector.get(provider.token)).toBe(provider.useValue);
                 }
                 async.done();
               });
         }));
    });
  });
}

class Foo {
  constructor() {}
}

class Bar {
  constructor() {}
}
