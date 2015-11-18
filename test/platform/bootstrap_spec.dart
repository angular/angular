library angular2.test.platform.bootstrap_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        afterEach,
        ddescribe,
        describe,
        expect,
        iit,
        inject,
        it,
        xdescribe,
        Log,
        xit;
import "package:angular2/src/facade/lang.dart"
    show IS_DART, isPresent, stringify;
import "package:angular2/platform/browser.dart" show bootstrap;
import "package:angular2/src/core/application_ref.dart" show ApplicationRef;
import "package:angular2/core.dart"
    show Component, Directive, View, OnDestroy, platform;
import "package:angular2/platform/browser.dart"
    show BROWSER_PROVIDERS, BROWSER_APP_PROVIDERS;
import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;
import "package:angular2/src/platform/dom/dom_tokens.dart" show DOCUMENT;
import "package:angular2/src/facade/async.dart" show PromiseWrapper;
import "package:angular2/core.dart"
    show provide, Inject, Injector, PLATFORM_INITIALIZER, APP_INITIALIZER;
import "package:angular2/src/core/application_ref.dart" show disposePlatform;
import "package:angular2/src/facade/exceptions.dart" show ExceptionHandler;
import "package:angular2/src/core/testability/testability.dart"
    show Testability, TestabilityRegistry;
import "package:angular2/src/core/linker/dynamic_component_loader.dart"
    show ComponentRef_;

@Component(selector: "hello-app")
@View(template: "{{greeting}} world!")
class HelloRootCmp {
  String greeting;
  HelloRootCmp() {
    this.greeting = "hello";
  }
}

@Component(selector: "hello-app")
@View(template: "before: <ng-content></ng-content> after: done")
class HelloRootCmpContent {
  HelloRootCmpContent() {}
}

@Component(selector: "hello-app-2")
@View(template: "{{greeting}} world, again!")
class HelloRootCmp2 {
  String greeting;
  HelloRootCmp2() {
    this.greeting = "hello";
  }
}

@Component(selector: "hello-app")
@View(template: "")
class HelloRootCmp3 {
  var appBinding;
  HelloRootCmp3(@Inject("appBinding") appBinding) {
    this.appBinding = appBinding;
  }
}

@Component(selector: "hello-app")
@View(template: "")
class HelloRootCmp4 {
  var appRef;
  HelloRootCmp4(@Inject(ApplicationRef) appRef) {
    this.appRef = appRef;
  }
}

@Component(selector: "hello-app")
class HelloRootMissingTemplate {}

@Directive(selector: "hello-app")
class HelloRootDirectiveIsNotCmp {}

@Component(selector: "hello-app")
@View(template: "")
class HelloOnDestroyTickCmp implements OnDestroy {
  ApplicationRef appRef;
  HelloOnDestroyTickCmp(@Inject(ApplicationRef) appRef) {
    this.appRef = appRef;
  }
  void onDestroy() {
    this.appRef.tick();
  }
}

class _ArrayLogger {
  List<dynamic> res = [];
  void log(dynamic s) {
    this.res.add(s);
  }

  void logError(dynamic s) {
    this.res.add(s);
  }

  void logGroup(dynamic s) {
    this.res.add(s);
  }

  logGroupEnd() {}
}

main() {
  var fakeDoc, el, el2, testProviders, lightDom;
  describe("bootstrap factory method", () {
    beforeEach(() {
      fakeDoc = DOM.createHtmlDocument();
      el = DOM.createElement("hello-app", fakeDoc);
      el2 = DOM.createElement("hello-app-2", fakeDoc);
      lightDom = DOM.createElement("light-dom-el", fakeDoc);
      DOM.appendChild(fakeDoc.body, el);
      DOM.appendChild(fakeDoc.body, el2);
      DOM.appendChild(el, lightDom);
      DOM.setText(lightDom, "loading");
      testProviders = [provide(DOCUMENT, useValue: fakeDoc)];
    });
    afterEach(disposePlatform);
    it(
        "should throw if bootstrapped Directive is not a Component",
        inject([AsyncTestCompleter], (async) {
          var logger = new _ArrayLogger();
          var exceptionHandler = new ExceptionHandler(logger, false);
          var refPromise = bootstrap(HelloRootDirectiveIsNotCmp, [
            testProviders,
            provide(ExceptionHandler, useValue: exceptionHandler)
          ]);
          PromiseWrapper.then(refPromise, null, (exception) {
            expect(exception).toContainError(
                '''Could not compile \'${ stringify ( HelloRootDirectiveIsNotCmp )}\' because it is not a component.''');
            expect(logger.res.join("")).toContain("Could not compile");
            async.done();
            return null;
          });
        }));
    it(
        "should throw if no element is found",
        inject([AsyncTestCompleter], (async) {
          var logger = new _ArrayLogger();
          var exceptionHandler =
              new ExceptionHandler(logger, IS_DART ? false : true);
          var refPromise = bootstrap(HelloRootCmp,
              [provide(ExceptionHandler, useValue: exceptionHandler)]);
          PromiseWrapper.then(refPromise, null, (reason) {
            expect(reason.message).toContain(
                "The selector \"hello-app\" did not match any elements");
            async.done();
            return null;
          });
        }));
    if (DOM.supportsDOMEvents()) {
      it(
          "should invoke the default exception handler when bootstrap fails",
          inject([AsyncTestCompleter], (async) {
            var logger = new _ArrayLogger();
            var exceptionHandler =
                new ExceptionHandler(logger, IS_DART ? false : true);
            var refPromise = bootstrap(HelloRootCmp,
                [provide(ExceptionHandler, useValue: exceptionHandler)]);
            PromiseWrapper.then(refPromise, null, (reason) {
              expect(logger.res.join("")).toContain(
                  "The selector \"hello-app\" did not match any elements");
              async.done();
              return null;
            });
          }));
    }
    it("should create an injector promise", () {
      var refPromise = bootstrap(HelloRootCmp, testProviders);
      expect(refPromise).not.toBe(null);
    });
    it(
        "should display hello world",
        inject([AsyncTestCompleter], (async) {
          var refPromise = bootstrap(HelloRootCmp, testProviders);
          refPromise.then((ref) {
            expect(el).toHaveText("hello world!");
            async.done();
          });
        }));
    it(
        "should support multiple calls to bootstrap",
        inject([AsyncTestCompleter], (async) {
          var refPromise1 = bootstrap(HelloRootCmp, testProviders);
          var refPromise2 = bootstrap(HelloRootCmp2, testProviders);
          PromiseWrapper.all([refPromise1, refPromise2]).then((refs) {
            expect(el).toHaveText("hello world!");
            expect(el2).toHaveText("hello world, again!");
            async.done();
          });
        }));
    it(
        "should not crash if change detection is invoked when the root component is disposed",
        inject([AsyncTestCompleter], (async) {
          bootstrap(HelloOnDestroyTickCmp, testProviders).then((ref) {
            expect(() => ref.dispose()).not.toThrow();
            async.done();
          });
        }));
    it(
        "should unregister change detectors when components are disposed",
        inject([AsyncTestCompleter], (async) {
          var app = platform(BROWSER_PROVIDERS)
              .application([BROWSER_APP_PROVIDERS, testProviders]);
          app.bootstrap(HelloRootCmp).then((ref) {
            ref.dispose();
            expect(() => app.tick()).not.toThrow();
            async.done();
          });
        }));
    it(
        "should make the provided bindings available to the application component",
        inject([AsyncTestCompleter], (async) {
          var refPromise = bootstrap(HelloRootCmp3,
              [testProviders, provide("appBinding", useValue: "BoundValue")]);
          refPromise.then((ref) {
            expect(ref.hostComponent.appBinding).toEqual("BoundValue");
            async.done();
          });
        }));
    it(
        "should avoid cyclic dependencies when root component requires Lifecycle through DI",
        inject([AsyncTestCompleter], (async) {
          var refPromise = bootstrap(HelloRootCmp4, testProviders);
          refPromise.then((ref) {
            expect(ref.hostComponent.appRef)
                .toBe(((ref as ComponentRef_)).injector.get(ApplicationRef));
            async.done();
          });
        }));
    it(
        "should run platform initializers",
        inject([Log], (Log log) {
          var p = platform([
            BROWSER_PROVIDERS,
            provide(PLATFORM_INITIALIZER,
                useValue: log.fn("platform_init1"), multi: true),
            provide(PLATFORM_INITIALIZER,
                useValue: log.fn("platform_init2"), multi: true)
          ]);
          expect(log.result()).toEqual("platform_init1; platform_init2");
          log.clear();
          p.application([
            BROWSER_APP_PROVIDERS,
            provide(APP_INITIALIZER,
                useValue: log.fn("app_init1"), multi: true),
            provide(APP_INITIALIZER, useValue: log.fn("app_init2"), multi: true)
          ]);
          expect(log.result()).toEqual("app_init1; app_init2");
        }));
    it(
        "should register each application with the testability registry",
        inject([AsyncTestCompleter], (async) {
          var refPromise1 = bootstrap(HelloRootCmp, testProviders);
          var refPromise2 = bootstrap(HelloRootCmp2, testProviders);
          PromiseWrapper.all([refPromise1, refPromise2])
              .then((List<ApplicationRef> refs) {
            var registry = refs[0].injector.get(TestabilityRegistry);
            var testabilities = [
              refs[0].injector.get(Testability),
              refs[1].injector.get(Testability)
            ];
            PromiseWrapper
                .all(testabilities)
                .then((List<Testability> testabilities) {
              expect(registry.findTestabilityInTree(el))
                  .toEqual(testabilities[0]);
              expect(registry.findTestabilityInTree(el2))
                  .toEqual(testabilities[1]);
              async.done();
            });
          });
        }));
  });
}
