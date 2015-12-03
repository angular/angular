library angular2.test.core.application_ref_spec;

import "package:angular2/testing_internal.dart"
    show
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
        inject;
import "spies.dart" show SpyChangeDetector;
import "package:angular2/src/core/application_ref.dart"
    show ApplicationRef_, PlatformRef_;
import "package:angular2/core.dart" show Injector, Provider;
import "package:angular2/src/core/change_detection/change_detector_ref.dart"
    show ChangeDetectorRef_;
import "package:angular2/src/facade/async.dart" show PromiseWrapper;
import "package:angular2/src/facade/collection.dart" show ListWrapper;

main() {
  describe("ApplicationRef", () {
    it("should throw when reentering tick", () {
      var cd = (new SpyChangeDetector() as dynamic);
      var ref = new ApplicationRef_(null, null, null);
      ref.registerChangeDetector(new ChangeDetectorRef_(cd));
      cd.spy("detectChanges").andCallFake(() => ref.tick());
      expect(() => ref.tick())
          .toThrowError("ApplicationRef.tick is called recursively");
    });
  });
  describe("PlatformRef", () {
    describe("asyncApplication", () {
      it(
          "should merge syncronous and asyncronous providers",
          inject([AsyncTestCompleter, Injector], (async, injector) {
            var ref = new PlatformRef_(injector, null);
            var ASYNC_PROVIDERS = [new Provider(Foo, useValue: new Foo())];
            var SYNC_PROVIDERS = [new Provider(Bar, useValue: new Bar())];
            ref
                .asyncApplication(
                    (zone) => PromiseWrapper.resolve(ASYNC_PROVIDERS),
                    SYNC_PROVIDERS)
                .then((appRef) {
              var providers =
                  ListWrapper.concat(ASYNC_PROVIDERS, SYNC_PROVIDERS);
              for (var i = 0; i < providers.length; i++) {
                var provider = providers[i];
                expect(appRef.injector.get(provider.token))
                    .toBe(provider.useValue);
              }
              async.done();
            });
          }));
    });
  });
}

class Foo {
  Foo() {}
}

class Bar {
  Bar() {}
}
