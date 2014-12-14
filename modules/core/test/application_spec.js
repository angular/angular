import {describe, ddescribe, it, iit, xit, xdescribe, expect, beforeEach} from 'test_lib/test_lib';
import {bootstrap, appDocumentToken, appElementToken, documentDependentBindings}
    from 'core/application';
import {Component} from 'core/annotations/annotations';
import {DOM} from 'facade/dom';
import {ListWrapper} from 'facade/collection';
import {PromiseWrapper} from 'facade/async';
import {bind} from 'di/di';
import {TemplateConfig} from 'core/annotations/template_config';

@Component({
  selector: 'hello-app',
  template: new TemplateConfig({
    inline: '{{greeting}} world!',
    directives: []
  })
})
class HelloRootCmp {
  greeting:string;
  constructor() {
    this.greeting = 'hello';
  }
}

@Component({
  selector: 'hello-app-2',
  template: new TemplateConfig({
    inline: '{{greeting}} world, again!',
    directives: []
  })
})
class HelloRootCmp2 {
  greeting:string;
  constructor() {
    this.greeting = 'hello';
  }
}

export function main() {
  var fakeDoc, el, el2;

  beforeEach(() => {
    fakeDoc = DOM.createHtmlDocument();
    el = DOM.createElement('hello-app', fakeDoc);
    el2 = DOM.createElement('hello-app-2', fakeDoc);
    DOM.appendChild(fakeDoc.body, el);
    DOM.appendChild(fakeDoc.body, el2);
  });

  function testBindings(appComponentType) {
    return ListWrapper.concat([bind(appDocumentToken).toValue(fakeDoc),
    ], documentDependentBindings(appComponentType));
  }

  describe('bootstrap factory method', () => {
    it('should throw if no element is found', (done) => {
      var injectorPromise = bootstrap(HelloRootCmp);
      PromiseWrapper.then(injectorPromise, null, (reason) => {
        expect(reason.message).toContain(
            'The app selector "hello-app" did not match any elements');
        done();
      });
    });

    it('should create an injector promise', () => {
      var injectorPromise = bootstrap(HelloRootCmp, testBindings(HelloRootCmp));
      expect(injectorPromise).not.toBe(null);
    });

    it('should resolve an injector promise and contain bindings', (done) => {
      var injectorPromise = bootstrap(HelloRootCmp, testBindings(HelloRootCmp));
      injectorPromise.then((injector) => {
        expect(injector.get(appElementToken)).toBe(el);
        done();
      });
    });

    it('should provide the application component in the injector', (done) => {
      var injectorPromise = bootstrap(HelloRootCmp, testBindings(HelloRootCmp));
      injectorPromise.then((injector) => {
        expect(injector.get(HelloRootCmp)).toBeAnInstanceOf(HelloRootCmp);
        done();
      });
    });

    it('should display hello world', (done) => {
      var injectorPromise = bootstrap(HelloRootCmp, testBindings(HelloRootCmp));
      injectorPromise.then((injector) => {
        expect(injector.get(appElementToken)
            .shadowRoot.childNodes[0].nodeValue).toEqual('hello world!');
        done();
      });
    });

    it('should support multiple calls to bootstrap', (done) => {
      var injectorPromise1 = bootstrap(HelloRootCmp, testBindings(HelloRootCmp));
      var injectorPromise2 = bootstrap(HelloRootCmp2, testBindings(HelloRootCmp2));
      PromiseWrapper.all([injectorPromise1, injectorPromise2]).then((injectors) => {
        expect(injectors[0].get(appElementToken)
            .shadowRoot.childNodes[0].nodeValue).toEqual('hello world!');
        expect(injectors[1].get(appElementToken)
            .shadowRoot.childNodes[0].nodeValue).toEqual('hello world, again!');
        done();
      });
    });
  });
}
