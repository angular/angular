import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  beforeEachBindings,
  it,
  xit
  } from 'angular2/test_lib';

import {TestBed} from 'angular2/test';

import {Injector, bind} from 'angular2/di';
import {Component, Viewport} from 'angular2/src/core/annotations_impl/annotations';
import {View} from 'angular2/src/core/annotations_impl/view';

import {RootRouter} from 'angular2/src/router/router';
import {Pipeline} from 'angular2/src/router/pipeline';
import {Router, RouterOutlet, RouterLink, RouteConfig, RouteParams} from 'angular2/router';

import {DOM} from 'angular2/src/dom/dom_adapter';

export function main() {
  describe('Outlet Directive', () => {

    var ctx, tb, view, router;

    beforeEach(inject([TestBed], (testBed) => {
      tb = testBed;
      ctx = new MyComp();
    }));

    beforeEachBindings(() => {
      router = new RootRouter(new Pipeline());
      return [
        bind(Router).toValue(router)
      ];
    });

    function compile(template:string = "<router-outlet></router-outlet>") {
      tb.overrideView(MyComp, new View({template: ('<div>' + template + '</div>'), directives: [RouterOutlet, RouterLink]}));
      return tb.createView(MyComp, {context: ctx}).then((v) => {
        view = v;
      });
    }

    it('should work in a simple case', inject([AsyncTestCompleter], (async) => {
      compile()
        .then((_) => router.config('/test', HelloCmp))
        .then((_) => router.navigate('/test'))
        .then((_) => {
          view.detectChanges();
          expect(view.rootNodes).toHaveText('hello');
          async.done();
        });
    }));


    it('should navigate between components with different parameters', inject([AsyncTestCompleter], (async) => {
      compile()
        .then((_) => router.config('/user/:name', UserCmp))
        .then((_) => router.navigate('/user/brian'))
        .then((_) => {
          view.detectChanges();
          expect(view.rootNodes).toHaveText('hello brian');
        })
        .then((_) => router.navigate('/user/igor'))
        .then((_) => {
          view.detectChanges();
          expect(view.rootNodes).toHaveText('hello igor');
          async.done();
        });
    }));


    it('should work with child routers', inject([AsyncTestCompleter], (async) => {
      compile('outer { <router-outlet></router-outlet> }')
        .then((_) => router.config('/a', ParentCmp))
        .then((_) => router.navigate('/a/b'))
        .then((_) => {
          view.detectChanges();
          expect(view.rootNodes).toHaveText('outer { inner { hello } }');
          async.done();
        });
    }));


    it('should generate link hrefs', inject([AsyncTestCompleter], (async) => {
      ctx.name = 'brian';
      compile('<a href="hello" router-link="user" [router-params]="{name: name}">{{name}}</a>')
        .then((_) => router.config('/user/:name', UserCmp, 'user'))
        .then((_) => router.navigate('/a/b'))
        .then((_) => {
          view.detectChanges();
          expect(view.rootNodes).toHaveText('brian');
          expect(DOM.getAttribute(view.rootNodes[0].childNodes[0], 'href')).toEqual('/user/brian');
          async.done();
        });
    }));

  });
}


@Component({
  selector: 'hello-cmp'
})
@View({
  template: "{{greeting}}"
})
class HelloCmp {
  greeting:string;
  constructor() {
    this.greeting = "hello";
  }
}


@Component({
  selector: 'user-cmp'
})
@View({
  template: "hello {{user}}"
})
class UserCmp {
  user:string;
  constructor(params:RouteParams) {
    this.user = params.get('name');
  }
}


@Component({
  selector: 'parent-cmp'
})
@View({
  template: "inner { <router-outlet></router-outlet> }",
  directives: [RouterOutlet]
})
@RouteConfig({
  path: '/b',
  component: HelloCmp
})
class ParentCmp {
  constructor() {}
}

@Component({
  selector: 'my-comp'
})
class MyComp {
  name;
}
