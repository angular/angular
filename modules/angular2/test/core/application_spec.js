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
} from 'angular2/test_lib';
import {bootstrap} from 'angular2/src/core/application';
import {appDocumentToken, appElementToken} from 'angular2/src/core/application_tokens';
import {Component, Decorator} from 'angular2/src/core/annotations/annotations';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {ListWrapper} from 'angular2/src/facade/collection';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {bind, Inject} from 'angular2/di';
import {View} from 'angular2/src/core/annotations/view';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {Testability, TestabilityRegistry} from 'angular2/src/core/testability/testability';

@Component({selector: 'hello-app'})
@View({template: '{{greeting}} world!'})
class HelloRootCmp {
  greeting:string;
  constructor() {
    this.greeting = 'hello';
  }
}

@Component({selector: 'hello-app'})
@View({template: 'before: <content></content> after: done'})
class HelloRootCmpContent {
  constructor() { }
}

@Component({selector: 'hello-app-2'})
@View({template: '{{greeting}} world, again!'})
class HelloRootCmp2 {
  greeting:string;
  constructor() {
    this.greeting = 'hello';
  }
}

@Component({selector: 'hello-app'})
@View({template: ''})
class HelloRootCmp3 {
  appBinding;

  constructor(@Inject("appBinding") appBinding) {
    this.appBinding = appBinding;
  }
}

@Component({selector: 'hello-app'})
@View({template: ''})
class HelloRootCmp4 {
  lc;

  constructor(@Inject(LifeCycle) lc) {
    this.lc = lc;
  }
}

@Component({selector: 'hello-app'})
class HelloRootMissingTemplate { }

@Decorator({selector: 'hello-app'})
class HelloRootDirectiveIsNotCmp { }

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
    testBindings = [bind(appDocumentToken).toValue(fakeDoc)];
  });

  describe('bootstrap factory method', () => {
    it('should throw if no View found', inject([AsyncTestCompleter], (async) => {
      var injectorPromise = bootstrap(HelloRootMissingTemplate, testBindings, (e,t) => {throw e;});
      PromiseWrapper.then(injectorPromise, null, (reason) => {
        expect(reason.message).toContain('No template found for HelloRootMissingTemplate');
        async.done();
      });
    }));

    it('should throw if bootstrapped Directive is not a Component', inject([AsyncTestCompleter], (async) => {
      var injectorPromise = bootstrap(HelloRootDirectiveIsNotCmp, testBindings, (e,t) => {throw e;});
      PromiseWrapper.then(injectorPromise, null, (reason) => {
        expect(reason.message).toContain(`Could not load 'HelloRootDirectiveIsNotCmp' because it is not a component.`);
        async.done();
      });
    }));

    it('should throw if no element is found', inject([AsyncTestCompleter], (async) => {
      var injectorPromise = bootstrap(HelloRootCmp, [], (e,t) => {throw e;});
      PromiseWrapper.then(injectorPromise, null, (reason) => {
        expect(reason.message).toContain(
            'The app selector "hello-app" did not match any elements');
        async.done();
      });
    }));

    it('should create an injector promise', () => {
      var injectorPromise = bootstrap(HelloRootCmp, testBindings);
      expect(injectorPromise).not.toBe(null);
    });

    it('should resolve an injector promise and contain bindings', inject([AsyncTestCompleter], (async) => {
      var injectorPromise = bootstrap(HelloRootCmp, testBindings);
      injectorPromise.then((injector) => {
        expect(injector.get(appElementToken)).toBe(el);
        async.done();
      });
    }));

    it('should provide the application component in the injector', inject([AsyncTestCompleter], (async) => {
      var injectorPromise = bootstrap(HelloRootCmp, testBindings);
      injectorPromise.then((injector) => {
        expect(injector.get(HelloRootCmp)).toBeAnInstanceOf(HelloRootCmp);
        async.done();
      });
    }));

    it('should display hello world', inject([AsyncTestCompleter], (async) => {
      var injectorPromise = bootstrap(HelloRootCmp, testBindings);
      injectorPromise.then((injector) => {
        expect(injector.get(appElementToken)).toHaveText('hello world!');
        async.done();
      });
    }));

    it('should support multiple calls to bootstrap', inject([AsyncTestCompleter], (async) => {
      var injectorPromise1 = bootstrap(HelloRootCmp, testBindings);
      var injectorPromise2 = bootstrap(HelloRootCmp2, testBindings);
      PromiseWrapper.all([injectorPromise1, injectorPromise2]).then((injectors) => {
        expect(injectors[0].get(appElementToken)).toHaveText('hello world!');
        expect(injectors[1].get(appElementToken)).toHaveText('hello world, again!');
        async.done();
      });
    }));

    it("should make the provided bindings available to the application component", inject([AsyncTestCompleter], (async) => {
      var injectorPromise = bootstrap(HelloRootCmp3, [
        testBindings,
        bind("appBinding").toValue("BoundValue")
      ]);

      injectorPromise.then((injector) => {
        expect(injector.get(HelloRootCmp3).appBinding).toEqual("BoundValue");
        async.done();
      });
    }));

    it("should avoid cyclic dependencies when root component requires Lifecycle through DI", inject([AsyncTestCompleter], (async) => {
      var injectorPromise = bootstrap(HelloRootCmp4, testBindings);

      injectorPromise.then((injector) => {
        expect(injector.get(HelloRootCmp4).lc).toBe(injector.get(LifeCycle));
        async.done();
      });
    }));

    it("should support shadow dom content tag", inject([AsyncTestCompleter], (async) => {
      var injectorPromise = bootstrap(HelloRootCmpContent, testBindings);
      injectorPromise.then((injector) => {
        expect(injector.get(appElementToken)).toHaveText('before: loading after: done');
        async.done();
      });
    }));

    it('should register each application with the testability registry', inject([AsyncTestCompleter], (async) => {
      var injectorPromise1 = bootstrap(HelloRootCmp, testBindings);
      var injectorPromise2 = bootstrap(HelloRootCmp2, testBindings);

      PromiseWrapper.all([injectorPromise1, injectorPromise2]).then((injectors) => {
        var registry = injectors[0].get(TestabilityRegistry);
        PromiseWrapper.all([
            injectors[0].asyncGet(Testability),
            injectors[1].asyncGet(Testability)]).then((testabilities) => {
          expect(registry.findTestabilityInTree(el)).toEqual(testabilities[0]);
          expect(registry.findTestabilityInTree(el2)).toEqual(testabilities[1]);
          async.done();
        });
      });
    }));
  });
}
