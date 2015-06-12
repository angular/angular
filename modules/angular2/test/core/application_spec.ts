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
  xit,
  IS_DARTIUM
} from 'angular2/test_lib';
import {isPresent, stringify} from 'angular2/src/facade/lang';
import {bootstrap, ApplicationRef} from 'angular2/src/core/application';
import {Component, Directive, View} from 'angular2/annotations';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {bind, Inject, Injector} from 'angular2/di';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {Testability, TestabilityRegistry} from 'angular2/src/core/testability/testability';
import {DOCUMENT_TOKEN} from 'angular2/src/render/dom/dom_renderer';

@Component({selector: 'hello-app'})
@View({template: '{{greeting}} world!'})
class HelloRootCmp {
  greeting: string;
  constructor() { this.greeting = 'hello'; }
}

@Component({selector: 'hello-app'})
@View({template: 'before: <content></content> after: done'})
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

export function main() {
  var fakeDoc, el, el2, testBindings, lightDom;

  beforeEach(() => {
    fakeDoc = DOM.createHtmlDocument();
    el = DOM.createElement('hello-app', fakeDoc);
    el2 = DOM.createElement('hello-app-2', fakeDoc);
    lightDom = DOM.createElement('light-dom-el', fakeDoc);
    DOM.appendChild(fakeDoc.body, el);
    DOM.appendChild(fakeDoc.body, el2);
    DOM.appendChild(el, lightDom);
    DOM.setText(lightDom, 'loading');
    testBindings = [bind(DOCUMENT_TOKEN).toValue(fakeDoc)];
  });

  describe('bootstrap factory method', () => {
    it('should throw if bootstrapped Directive is not a Component',
       inject([AsyncTestCompleter], (async) => {
         var refPromise =
             bootstrap(HelloRootDirectiveIsNotCmp, testBindings, (e, t) => { throw e; });
         PromiseWrapper.then(refPromise, null, (reason) => {
           expect(reason.message)
               .toContain(
                   `Could not load '${stringify(HelloRootDirectiveIsNotCmp)}' because it is not a component.`);
           async.done();
           return null;
         });
       }));

    it('should throw if no element is found', inject([AsyncTestCompleter], (async) => {
         var refPromise = bootstrap(HelloRootCmp, [], (e, t) => { throw e; });
         PromiseWrapper.then(refPromise, null, (reason) => {
           expect(reason.message).toContain('The selector "hello-app" did not match any elements');
           async.done();
           return null;
         });
       }));

    it('should create an injector promise', () => {
      var refPromise = bootstrap(HelloRootCmp, testBindings);
      expect(refPromise).not.toBe(null);
    });

    it('should resolve an injector promise and contain bindings',
       inject([AsyncTestCompleter], (async) => {
         var refPromise = bootstrap(HelloRootCmp, testBindings);
         refPromise.then((ref) => {
           expect(ref.injector.get(HelloRootCmp)).toBeAnInstanceOf(HelloRootCmp);
           async.done();
         });
       }));

    it('should provide the application component in the injector',
       inject([AsyncTestCompleter], (async) => {
         var refPromise = bootstrap(HelloRootCmp, testBindings);
         refPromise.then((ref) => {
           expect(ref.injector.get(HelloRootCmp)).toBeAnInstanceOf(HelloRootCmp);
           async.done();
         });
       }));

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
           expect(ref.injector.get(HelloRootCmp3).appBinding).toEqual("BoundValue");
           async.done();
         });
       }));

    it("should avoid cyclic dependencies when root component requires Lifecycle through DI",
       inject([AsyncTestCompleter], (async) => {
         var refPromise = bootstrap(HelloRootCmp4, testBindings);

         refPromise.then((ref) => {
           expect(ref.injector.get(HelloRootCmp4).lc).toBe(ref.injector.get(LifeCycle));
           async.done();
         });
       }));

    it("should support shadow dom content tag", inject([AsyncTestCompleter], (async) => {
         var refPromise = bootstrap(HelloRootCmpContent, testBindings);
         refPromise.then((ref) => {
           expect(el).toHaveText('before: loading after: done');
           async.done();
         });
       }));

    it('should register each application with the testability registry',
       inject([AsyncTestCompleter], (async) => {
         var refPromise1 = bootstrap(HelloRootCmp, testBindings);
         var refPromise2 = bootstrap(HelloRootCmp2, testBindings);

         PromiseWrapper.all([refPromise1, refPromise2])
             .then((refs: ApplicationRef[]) => {
               var registry = refs[0].injector.get(TestabilityRegistry);
               var testabilities =
                   [refs[0].injector.asyncGet(Testability), refs[1].injector.asyncGet(Testability)];
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
