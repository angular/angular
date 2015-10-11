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
} from 'angular2/test_lib';
import {isPresent, stringify} from 'angular2/src/core/facade/lang';
import {bootstrap} from 'angular2/bootstrap';
import {ApplicationRef} from 'angular2/src/core/application_ref';
import {Component, Directive, View} from 'angular2/core';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {DOCUMENT} from 'angular2/render';
import {PromiseWrapper} from 'angular2/src/core/facade/async';
import {provide, Inject, Injector, LifeCycle} from 'angular2/core';
import {ExceptionHandler} from 'angular2/src/core/facade/exceptions';
import {Testability, TestabilityRegistry} from 'angular2/src/core/testability/testability';
import {IS_DART} from '../platform';
import {ComponentRef_} from "angular2/src/core/linker/dynamic_component_loader";

@Component({selector: 'hello-app'})
@View({template: '{{greeting}} world!'})
class HelloRootCmp {
  greeting: string;
  constructor() { this.greeting = 'hello'; }
}

@Component({selector: 'hello-app'})
@View({template: 'before: <ng-content></ng-content> after: done'})
class HelloRootCmpContent {
  constructor() {}
}

@Component({selector: 'hello-app-2'})
@View({template: '{{greeting}} world, again!'})
class HelloRootCmp2 {
  greeting: string;
  constructor() { this.greeting = 'hello'; }
}

@Component({selector: 'hello-app'})
@View({template: ''})
class HelloRootCmp3 {
  appBinding;

  constructor(@Inject("appBinding") appBinding) { this.appBinding = appBinding; }
}

@Component({selector: 'hello-app'})
@View({template: ''})
class HelloRootCmp4 {
  lc;

  constructor(@Inject(LifeCycle) lc) { this.lc = lc; }
}

@Component({selector: 'hello-app'})
class HelloRootMissingTemplate {
}

@Directive({selector: 'hello-app'})
class HelloRootDirectiveIsNotCmp {
}

class _ArrayLogger {
  res: any[] = [];
  log(s: any): void { this.res.push(s); }
  logError(s: any): void { this.res.push(s); }
  logGroup(s: any): void { this.res.push(s); }
  logGroupEnd(){};
}


export function main() {
  var fakeDoc, el, el2, testProviders, lightDom;

  describe('bootstrap factory method', () => {
    beforeEach(() => {
      fakeDoc = DOM.createHtmlDocument();
      el = DOM.createElement('hello-app', fakeDoc);
      el2 = DOM.createElement('hello-app-2', fakeDoc);
      lightDom = DOM.createElement('light-dom-el', fakeDoc);
      DOM.appendChild(fakeDoc.body, el);
      DOM.appendChild(fakeDoc.body, el2);
      DOM.appendChild(el, lightDom);
      DOM.setText(lightDom, 'loading');
      testProviders = [provide(DOCUMENT, {asValue: fakeDoc})];
    });

    it('should throw if bootstrapped Directive is not a Component',
       inject([AsyncTestCompleter], (async) => {
         var logger = new _ArrayLogger();
         var exceptionHandler = new ExceptionHandler(logger, false);
         var refPromise =
             bootstrap(HelloRootDirectiveIsNotCmp,
                       [testProviders, provide(ExceptionHandler, {asValue: exceptionHandler})]);

         PromiseWrapper.then(refPromise, null, (exception) => {
           expect(exception).toContainError(
               `Could not compile '${stringify(HelloRootDirectiveIsNotCmp)}' because it is not a component.`);
           expect(logger.res.join("")).toContain("Could not compile");
           async.done();
           return null;
         });
       }));

    it('should throw if no element is found', inject([AsyncTestCompleter], (async) => {
         var logger = new _ArrayLogger();
         var exceptionHandler = new ExceptionHandler(logger, IS_DART ? false : true);

         var refPromise =
             bootstrap(HelloRootCmp, [provide(ExceptionHandler, {asValue: exceptionHandler})]);
         PromiseWrapper.then(refPromise, null, (reason) => {
           expect(reason.message).toContain('The selector "hello-app" did not match any elements');
           async.done();
           return null;
         });
       }));

    if (DOM.supportsDOMEvents()) {
      it('should invoke the default exception handler when bootstrap fails',
         inject([AsyncTestCompleter], (async) => {
           var logger = new _ArrayLogger();
           var exceptionHandler = new ExceptionHandler(logger, IS_DART ? false : true);

           var refPromise =
               bootstrap(HelloRootCmp, [provide(ExceptionHandler, {asValue: exceptionHandler})]);
           PromiseWrapper.then(refPromise, null, (reason) => {
             expect(logger.res.join(""))
                 .toContain('The selector "hello-app" did not match any elements');
             async.done();
             return null;
           });
         }));
    }

    it('should create an injector promise', () => {
      var refPromise = bootstrap(HelloRootCmp, testProviders);
      expect(refPromise).not.toBe(null);
    });

    it('should display hello world', inject([AsyncTestCompleter], (async) => {
         var refPromise = bootstrap(HelloRootCmp, testProviders);
         refPromise.then((ref) => {
           expect(el).toHaveText('hello world!');
           async.done();
         });
       }));

    it('should support multiple calls to bootstrap', inject([AsyncTestCompleter], (async) => {
         var refPromise1 = bootstrap(HelloRootCmp, testProviders);
         var refPromise2 = bootstrap(HelloRootCmp2, testProviders);
         PromiseWrapper.all([refPromise1, refPromise2])
             .then((refs) => {
               expect(el).toHaveText('hello world!');
               expect(el2).toHaveText('hello world, again!');
               async.done();
             });
       }));

    it("should make the provided bindings available to the application component",
       inject([AsyncTestCompleter], (async) => {
         var refPromise = bootstrap(
             HelloRootCmp3, [testProviders, provide("appBinding", {asValue: "BoundValue"})]);

         refPromise.then((ref) => {
           expect(ref.hostComponent.appBinding).toEqual("BoundValue");
           async.done();
         });
       }));

    it("should avoid cyclic dependencies when root component requires Lifecycle through DI",
       inject([AsyncTestCompleter], (async) => {
         var refPromise = bootstrap(HelloRootCmp4, testProviders);

         refPromise.then((ref) => {
           expect(ref.hostComponent.lc).toBe((<ComponentRef_>ref).injector.get(LifeCycle));
           async.done();
         });
       }));

    it('should register each application with the testability registry',
       inject([AsyncTestCompleter], (async) => {
         var refPromise1 = bootstrap(HelloRootCmp, testProviders);
         var refPromise2 = bootstrap(HelloRootCmp2, testProviders);

         PromiseWrapper.all([refPromise1, refPromise2])
             .then((refs: ApplicationRef[]) => {
               var registry = refs[0].injector.get(TestabilityRegistry);
               var testabilities =
                   [refs[0].injector.get(Testability), refs[1].injector.get(Testability)];
               PromiseWrapper.all(testabilities)
                   .then((testabilities: Testability[]) => {
                     expect(registry.findTestabilityInTree(el)).toEqual(testabilities[0]);
                     expect(registry.findTestabilityInTree(el2)).toEqual(testabilities[1]);
                     async.done();
                   });
             });
       }));
  });
}
