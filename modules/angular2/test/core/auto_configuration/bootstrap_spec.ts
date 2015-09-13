import {
  AsyncTestCompleter,
  beforeEach,
  xdescribe,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it
} from 'angular2/test_lib';

import {
  Configuration,
  Autoconfigured
} from 'angular2/src/core/auto_configuration/auto_configuration';

import {bootstrap} from 'angular2/src/core/bootstrap';
import {Component, View, Directive} from 'angular2/src/core/metadata';
import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {DOCUMENT} from 'angular2/src/core/render/render';
import {bind, Inject, Injector, Injectable} from 'angular2/src/core/di';

@Injectable()
class Service {
  constructor() {}
  getMessage() { return 'hello'; }
}

@Autoconfigured()
@Component({selector: 'hello-app'})
@View({template: '{{greeting}} world!'})
class HelloRootCmp {
  greeting: string;
  constructor(service: Service) { this.greeting = service.getMessage(); }
}

@Configuration()
class ConfigureTests {
  getBindings() { return [Service] }
}

export function main() {
  var fakeDoc, el, testBindings;

  describe('regular bootstrapping with auto configuration', () => {
    beforeEach(() => {
      fakeDoc = DOM.createHtmlDocument();
      el = DOM.createElement('hello-app', fakeDoc);
      DOM.appendChild(fakeDoc.body, el);
      testBindings = [bind(DOCUMENT).toValue(fakeDoc)];
    });

    it('should display hello world', inject([AsyncTestCompleter], (async) => {
         var refPromise = bootstrap(HelloRootCmp, testBindings);
         refPromise.then((ref) => {
           expect(el).toHaveText('hello world!');
           async.done();
         });
       }));
  });
}
