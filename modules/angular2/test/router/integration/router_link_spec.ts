import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  dispatchEvent,
  expect,
  iit,
  inject,
  beforeEachBindings,
  it,
  xit,
  TestComponentBuilder,
  proxy,
  SpyObject,
  By
} from 'angular2/test_lib';

import {NumberWrapper} from 'angular2/src/core/facade/lang';

import {bind, Component, View} from 'angular2/angular2';

import {SpyLocation} from 'angular2/src/mock/location_mock';
import {
  Location,
  Router,
  RootRouter,
  RouteRegistry,
  Pipeline,
  RouterLink,
  RouterOutlet,
  Route,
  RouteParams,
  RouteConfig
} from 'angular2/router';
import {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';

import {DOM} from 'angular2/src/core/dom/dom_adapter';

export function main() {
  describe('router-link directive', function() {
    var tcb: TestComponentBuilder;
    var rootTC, router, location;

    beforeEachBindings(() => [
      Pipeline,
      RouteRegistry,
      DirectiveResolver,
      bind(Location).toClass(SpyLocation),
      bind(Router)
          .toFactory((registry, pipeline,
                      location) => { return new RootRouter(registry, pipeline, location, AppCmp); },
                     [RouteRegistry, Pipeline, Location])
    ]);

    beforeEach(inject([TestComponentBuilder, Router, Location], (tcBuilder, rtr, loc) => {
      tcb = tcBuilder;
      router = rtr;
      location = loc;
    }));

    function compile(template: string = "<router-outlet></router-outlet>") {
      return tcb.overrideView(MyComp, new View({
                                template: ('<div>' + template + '</div>'),
                                directives: [RouterOutlet, RouterLink]
                              }))
          .createAsync(MyComp)
          .then((tc) => { rootTC = tc; });
    }

    it('should generate absolute hrefs that include the base href',
       inject([AsyncTestCompleter], (async) => {
         location.setBaseHref('/my/base');
         compile('<a href="hello" [router-link]="[\'./user\']"></a>')
             .then((_) =>
                       router.config([new Route({path: '/user', component: UserCmp, as: 'user'})]))
             .then((_) => router.navigate('/a/b'))
             .then((_) => {
               rootTC.detectChanges();
               expect(getHref(rootTC)).toEqual('/my/base/user');
               async.done();
             });
       }));


    it('should generate link hrefs without params', inject([AsyncTestCompleter], (async) => {
         compile('<a href="hello" [router-link]="[\'./user\']"></a>')
             .then((_) =>
                       router.config([new Route({path: '/user', component: UserCmp, as: 'user'})]))
             .then((_) => router.navigate('/a/b'))
             .then((_) => {
               rootTC.detectChanges();
               expect(getHref(rootTC)).toEqual('/user');
               async.done();
             });
       }));



    it('should generate link hrefs with params', inject([AsyncTestCompleter], (async) => {
         compile('<a href="hello" [router-link]="[\'./user\', {name: name}]">{{name}}</a>')
             .then((_) => router.config(
                       [new Route({path: '/user/:name', component: UserCmp, as: 'user'})]))
             .then((_) => router.navigate('/a/b'))
             .then((_) => {
               rootTC.componentInstance.name = 'brian';
               rootTC.detectChanges();
               expect(rootTC.nativeElement).toHaveText('brian');
               expect(DOM.getAttribute(rootTC.componentViewChildren[0].nativeElement, 'href'))
                   .toEqual('/user/brian');
               async.done();
             });
       }));

    it('should generate link hrefs from a child to its sibling',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => router.config(
                       [new Route({path: '/page/:number', component: SiblingPageCmp, as: 'page'})]))
             .then((_) => router.navigate('/page/1'))
             .then((_) => {
               rootTC.detectChanges();
               expect(DOM.getAttribute(
                          rootTC.componentViewChildren[1].componentViewChildren[0].nativeElement,
                          'href'))
                   .toEqual('/page/2');
               async.done();
             });
       }));

    it('should generate relative links preserving the existing parent route',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => router.config(
                       [new Route({path: '/book/:title/...', component: BookCmp, as: 'book'})]))
             .then((_) => router.navigate('/book/1984/page/1'))
             .then((_) => {
               rootTC.detectChanges();
               expect(DOM.getAttribute(
                          rootTC.componentViewChildren[1].componentViewChildren[0].nativeElement,
                          'href'))
                   .toEqual('/book/1984/page/100');

               expect(DOM.getAttribute(rootTC.componentViewChildren[1]
                                           .componentViewChildren[2]
                                           .componentViewChildren[0]
                                           .nativeElement,
                                       'href'))
                   .toEqual('/book/1984/page/2');
               async.done();
             });
       }));


    describe('when clicked', () => {

      var clickOnElement = function(view) {
        var anchorEl = rootTC.componentViewChildren[0].nativeElement;
        var dispatchedEvent = DOM.createMouseEvent('click');
        DOM.dispatchEvent(anchorEl, dispatchedEvent);
        return dispatchedEvent;
      };

      it('should navigate to link hrefs without params', inject([AsyncTestCompleter], (async) => {
           compile('<a href="hello" [router-link]="[\'./user\']"></a>')
               .then((_) => router.config(
                         [new Route({path: '/user', component: UserCmp, as: 'user'})]))
               .then((_) => router.navigate('/a/b'))
               .then((_) => {
                 rootTC.detectChanges();

                 var dispatchedEvent = clickOnElement(rootTC);
                 expect(DOM.isPrevented(dispatchedEvent)).toBe(true);

                 // router navigation is async.
                 router.subscribe((_) => {
                   expect(location.urlChanges).toEqual(['/user']);
                   async.done();
                 });
               });
         }));

      it('should navigate to link hrefs in presence of base href',
         inject([AsyncTestCompleter], (async) => {
           location.setBaseHref('/base');
           compile('<a href="hello" [router-link]="[\'./user\']"></a>')
               .then((_) => router.config(
                         [new Route({path: '/user', component: UserCmp, as: 'user'})]))
               .then((_) => router.navigate('/a/b'))
               .then((_) => {
                 rootTC.detectChanges();

                 var dispatchedEvent = clickOnElement(rootTC);
                 expect(DOM.isPrevented(dispatchedEvent)).toBe(true);

                 // router navigation is async.
                 router.subscribe((_) => {
                   expect(location.urlChanges).toEqual(['/base/user']);
                   async.done();
                 });
               });
         }));
    });
  });
}

function getHref(tc) {
  return DOM.getAttribute(tc.componentViewChildren[0].nativeElement, 'href');
}

class AppCmp {}

@Component({selector: 'my-comp'})
class MyComp {
  name;
}

@Component({selector: 'user-cmp'})
@View({template: "hello {{user}}"})
class UserCmp {
  user: string;
  constructor(params: RouteParams) { this.user = params.get('name'); }
}

@Component({selector: 'page-cmp'})
@View({
  template:
      `page #{{pageNumber}} | <a href="hello" [router-link]="[\'../page\', {number: nextPage}]">next</a>`,
  directives: [RouterLink]
})
class SiblingPageCmp {
  pageNumber: number;
  nextPage: number;
  constructor(params: RouteParams) {
    this.pageNumber = NumberWrapper.parseInt(params.get('number'), 10);
    this.nextPage = this.pageNumber + 1;
  }
}

@Component({selector: 'book-cmp'})
@View({
  template: `<a href="hello" [router-link]="[\'./page\', {number: 100}]">{{title}}</a> |
    <router-outlet></router-outlet>`,
  directives: [RouterLink, RouterOutlet]
})
@RouteConfig([new Route({path: '/page/:number', component: SiblingPageCmp, as: 'page'})])
class BookCmp {
  title: string;
  constructor(params: RouteParams) { this.title = params.get('title'); }
}
