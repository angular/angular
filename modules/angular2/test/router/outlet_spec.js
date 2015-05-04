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
import {Component} from 'angular2/src/core/annotations_impl/annotations';
import {View} from 'angular2/src/core/annotations_impl/view';

import {RootRouter} from 'angular2/src/router/router';
import {Pipeline} from 'angular2/src/router/pipeline';
import {Router, RouterOutlet, RouterLink, RouteConfig, RouteParams} from 'angular2/router';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {SpyLocation} from 'angular2/src/mock/location_mock';
import {Location} from 'angular2/src/router/location';
import {RouteRegistry} from 'angular2/src/router/route_registry';
import {DirectiveMetadataReader} from 'angular2/src/core/compiler/directive_metadata_reader';

export function main() {
  describe('Outlet Directive', () => {

    var ctx, tb, view, rtr;

    beforeEachBindings(() => [
      Pipeline,
      RouteRegistry,
      DirectiveMetadataReader,
      bind(Location).toClass(SpyLocation),
      bind(Router).toFactory((registry, pipeline, location) => {
        return new RootRouter(registry, pipeline, location, MyComp);
      }, [RouteRegistry, Pipeline, Location])
    ]);

    beforeEach(inject([TestBed, Router], (testBed, router) => {
      tb = testBed;
      ctx = new MyComp();
      rtr = router;
    }));

    function compile(template:string = "<router-outlet></router-outlet>") {
      tb.overrideView(MyComp, new View({template: ('<div>' + template + '</div>'), directives: [RouterOutlet, RouterLink]}));
      return tb.createView(MyComp, {context: ctx}).then((v) => {
        view = v;
      });
    }

    it('should work in a simple case', inject([AsyncTestCompleter], (async) => {
      compile()
        .then((_) => rtr.config({'path': '/test', 'component': HelloCmp}))
        .then((_) => rtr.navigate('/test'))
        .then((_) => {
          view.detectChanges();
          expect(view.rootNodes).toHaveText('hello');
          async.done();
        });
    }));


    it('should navigate between components with different parameters', inject([AsyncTestCompleter], (async) => {
      compile()
        .then((_) => rtr.config({'path': '/user/:name', 'component': UserCmp}))
        .then((_) => rtr.navigate('/user/brian'))
        .then((_) => {
          view.detectChanges();
          expect(view.rootNodes).toHaveText('hello brian');
        })
        .then((_) => rtr.navigate('/user/igor'))
        .then((_) => {
          view.detectChanges();
          expect(view.rootNodes).toHaveText('hello igor');
          async.done();
        });
    }));


    it('should work with child routers', inject([AsyncTestCompleter], (async) => {
      compile('outer { <router-outlet></router-outlet> }')
        .then((_) => rtr.config({'path': '/a', 'component': ParentCmp}))
        .then((_) => rtr.navigate('/a/b'))
        .then((_) => {
          view.detectChanges();
          expect(view.rootNodes).toHaveText('outer { inner { hello } }');
          async.done();
        });
    }));


    it('should work with sibling routers', inject([AsyncTestCompleter], (async) => {
      compile('left { <router-outlet name="left"></router-outlet> } | right { <router-outlet name="right"></router-outlet> }')
        .then((_) => rtr.config({'path': '/ab', 'components': {'left': A, 'right': B} }))
        .then((_) => rtr.config({'path': '/ba', 'components': {'left': B, 'right': A} }))
        .then((_) => rtr.navigate('/ab'))
        .then((_) => {
          view.detectChanges();
          expect(view.rootNodes).toHaveText('left { A } | right { B }');
        })
        .then((_) => rtr.navigate('/ba'))
        .then((_) => {
          view.detectChanges();
          expect(view.rootNodes).toHaveText('left { B } | right { A }');
          async.done();
        });
    }));


    it('should work with redirects', inject([AsyncTestCompleter, Location], (async, location) => {
      compile()
        .then((_) => rtr.config({'path': '/original', 'redirectTo': '/redirected' }))
        .then((_) => rtr.config({'path': '/redirected', 'component': A }))
        .then((_) => rtr.navigate('/original'))
        .then((_) => {
          view.detectChanges();
          expect(view.rootNodes).toHaveText('A');
          expect(location.urlChanges).toEqual(['/redirected']);
          async.done();
        });
    }));


    it('should generate link hrefs', inject([AsyncTestCompleter], (async) => {
      ctx.name = 'brian';
      compile('<a href="hello" router-link="user" [router-params]="{name: name}">{{name}}</a>')
        .then((_) => rtr.config({'path': '/user/:name', 'component': UserCmp, 'as': 'user'}))
        .then((_) => rtr.navigate('/a/b'))
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
  selector: 'a-cmp'
})
@View({
  template: "A"
})
class A {}


@Component({
  selector: 'b-cmp'
})
@View({
  template: "B"
})
class B {}


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
@RouteConfig([{
  path: '/b',
  component: HelloCmp
}])
class ParentCmp {
  constructor() {}
}

@Component({
  selector: 'my-comp'
})
class MyComp {
  name;
}
