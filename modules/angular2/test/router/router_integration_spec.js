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
import {Component, Directive} from 'angular2/src/core/annotations_impl/annotations';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {bind} from 'angular2/di';
import {View} from 'angular2/src/core/annotations_impl/view';
import {DOCUMENT_TOKEN} from 'angular2/src/render/dom/dom_renderer';
import {RouteConfig} from 'angular2/src/router/route_config_impl';
import {routerInjectables, Router, RouteParams, RouterOutlet} from 'angular2/router';
import {SpyLocation} from 'angular2/src/mock/location_mock';
import {Location} from 'angular2/src/router/location';

export function main() {
  describe('router injectables', () => {
    var fakeDoc, el, testBindings;
    beforeEach(() => {
      fakeDoc = DOM.createHtmlDocument();
      el = DOM.createElement('app-cmp', fakeDoc);
      DOM.appendChild(fakeDoc.body, el);
      testBindings = [
        routerInjectables,
        bind(Location).toClass(SpyLocation),
        bind(DOCUMENT_TOKEN).toValue(fakeDoc)
      ];
    });

    it('should support bootstrap a simple app', inject([AsyncTestCompleter], (async) => {
      bootstrap(AppCmp, testBindings).then((applicationRef) => {
        var router = applicationRef.hostComponent.router;
        router.subscribe((_) => {
          expect(el).toHaveText('outer { hello }');
          async.done();
        });
      });
    }));

    //TODO: add a test in which the child component has bindings
  });
}


@Component({
  selector: 'hello-cmp'
})
@View({
  template: "hello"
})
class HelloCmp {}


@Component({
  selector: 'app-cmp'
})
@View({
  template: "outer { <router-outlet></router-outlet> }",
  directives: [RouterOutlet]
})
@RouteConfig([{
  path: '/', component: HelloCmp
}])
class AppCmp {
  router:Router;
  constructor(router:Router) {
    this.router = router;
  }
}
