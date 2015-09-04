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
import {bootstrap, ApplicationRef} from 'angular2/src/core/application';
import {Component, Directive, View} from 'angular2/metadata';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {PromiseWrapper, TimerWrapper} from 'angular2/src/core/facade/async';
import {bind, Inject, Injector} from 'angular2/di';
import {LifeCycle} from 'angular2/core';
import {ExceptionHandler} from 'angular2/src/core/exception_handler';
import {Testability, TestabilityRegistry} from 'angular2/src/core/testability/testability';
import {DOCUMENT} from 'angular2/src/core/render/render';
import {IS_DART} from '../platform';
import {NgIf} from 'angular2/src/core/directives/ng_if';

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

@Component({selector: 'cd-count'})
@View({template: '<p *ng-if="condition()"></p>', directives: [NgIf]})
class ChangeDetectionCounterComponent {
  cdCount: number = 0;

  condition(): boolean {
    this.cdCount++;
    return true;
  }
}

class _ArrayLogger {
  res: any[] = [];
  log(s: any): void { this.res.push(s); }
  logError(s: any): void { this.res.push(s); }
  logGroup(s: any): void { this.res.push(s); }
  logGroupEnd() {}
}

export function main() {
  var fakeDoc, el, el2, testBindings, lightDom;

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
      let cdCountEl = DOM.createElement('cd-count', fakeDoc);
      DOM.appendChild(fakeDoc.body, cdCountEl);
      testBindings = [bind(DOCUMENT).toValue(fakeDoc)];
    });

    it('should throw if bootstrapped Directive is not a Component',
       inject([AsyncTestCompleter], (async) => {
         var logger = new _ArrayLogger();
         var exceptionHandler = new ExceptionHandler(logger, false);
         var refPromise =
             bootstrap(HelloRootDirectiveIsNotCmp,
                       [testBindings, bind(ExceptionHandler).toValue(exceptionHandler)]);

         PromiseWrapper.then(refPromise, null, (exception) => {
           expect(exception).toContainError(
               `Could not load '${stringify(HelloRootDirectiveIsNotCmp)}' because it is not a component.`);
           expect(logger.res.join("")).toContain("Could not load");
           async.done();
           return null;
         });
       }));

    it('should throw if no element is found', inject([AsyncTestCompleter], (async) => {
         var logger = new _ArrayLogger();
         var exceptionHandler = new ExceptionHandler(logger, IS_DART ? false : true);

         var refPromise =
             bootstrap(HelloRootCmp, [bind(ExceptionHandler).toValue(exceptionHandler)]);
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
               bootstrap(HelloRootCmp, [bind(ExceptionHandler).toValue(exceptionHandler)]);
           PromiseWrapper.then(refPromise, null, (reason) => {
             expect(logger.res.join(""))
                 .toContain('The selector "hello-app" did not match any elements');
             async.done();
             return null;
           });
         }));
    }

    it('should create an injector promise', () => {
      var refPromise = bootstrap(HelloRootCmp, testBindings);
      expect(refPromise).not.toBe(null);
    });

    it('should display hello world', inject([AsyncTestCompleter], (async) => {
         var refPromise = bootstrap(HelloRootCmp, testBindings);
         refPromise.then((ref) => {
           expect(el).toHaveText('hello world!');
           async.done();
         });
       }));

    it('should support multiple calls to bootstrap', inject([AsyncTestCompleter], (async) => {
         var refPromise1 = bootstrap(HelloRootCmp, testBindings);
         var refPromise2 = bootstrap(HelloRootCmp2, testBindings);
         PromiseWrapper.all([refPromise1, refPromise2])
             .then((refs) => {
               expect(el).toHaveText('hello world!');
               expect(el2).toHaveText('hello world, again!');
               async.done();
             });
       }));

    it("should make the provided bindings available to the application component",
       inject([AsyncTestCompleter], (async) => {
         var refPromise =
             bootstrap(HelloRootCmp3, [testBindings, bind("appBinding").toValue("BoundValue")]);

         refPromise.then((ref) => {
           expect(ref.hostComponent.appBinding).toEqual("BoundValue");
           async.done();
         });
       }));

    it("should avoid cyclic dependencies when root component requires Lifecycle through DI",
       inject([AsyncTestCompleter], (async) => {
         var refPromise = bootstrap(HelloRootCmp4, testBindings);

         refPromise.then((ref) => {
           expect(ref.hostComponent.lc).toBe(ref.injector.get(LifeCycle));
           async.done();
         });
       }));

    // see https://github.com/angular/angular/issues/3701
    it("should run the change detection only once", inject([AsyncTestCompleter], (async) => {
         var refPromise = bootstrap(ChangeDetectionCounterComponent, testBindings);

         refPromise.then((ref) => {
           TimerWrapper.setTimeout(() => {
             expect(ref.hostComponent.cdCount).toEqual(1);
             async.done();
           }, 500);
         });

       }), 1000);

    it('should register each application with the testability registry',
       inject([AsyncTestCompleter], (async) => {
         var refPromise1 = bootstrap(HelloRootCmp, testBindings);
         var refPromise2 = bootstrap(HelloRootCmp2, testBindings);

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
