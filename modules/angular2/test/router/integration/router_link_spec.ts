import {
  RootTestComponent,
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
  SpyObject
} from 'angular2/test_lib';

import {NumberWrapper} from 'angular2/src/core/facade/lang';
import {PromiseWrapper} from 'angular2/src/core/facade/async';

import {provide, Component, DirectiveResolver, View} from 'angular2/core';

import {SpyLocation} from 'angular2/src/mock/location_mock';
import {
  Location,
  Router,
  RouteRegistry,
  RouterLink,
  RouterOutlet,
  AsyncRoute,
  Route,
  RouteParams,
  RouteConfig,
  ROUTER_DIRECTIVES
} from 'angular2/router';
import {RootRouter} from 'angular2/src/router/router';

import {DOM} from 'angular2/src/core/dom/dom_adapter';

export function main() {
  describe('router-link directive', function() {
    var tcb: TestComponentBuilder;
    var rootTC: RootTestComponent;
    var router, location;

    beforeEachBindings(() => [
      RouteRegistry,
      DirectiveResolver,
      provide(Location, {useClass: SpyLocation}),
      provide(Router,
              {
                useFactory:
                    (registry, location) => { return new RootRouter(registry, location, MyComp); },
                deps: [RouteRegistry, Location]
              })
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
         compile('<a href="hello" [router-link]="[\'./User\']"></a>')
             .then((_) =>
                       router.config([new Route({path: '/user', component: UserCmp, as: 'User'})]))
             .then((_) => router.navigateByUrl('/a/b'))
             .then((_) => {
               rootTC.detectChanges();
               expect(getHref(rootTC)).toEqual('/my/base/user');
               async.done();
             });
       }));


    it('should generate link hrefs without params', inject([AsyncTestCompleter], (async) => {
         compile('<a href="hello" [router-link]="[\'./User\']"></a>')
             .then((_) =>
                       router.config([new Route({path: '/user', component: UserCmp, as: 'User'})]))
             .then((_) => router.navigateByUrl('/a/b'))
             .then((_) => {
               rootTC.detectChanges();
               expect(getHref(rootTC)).toEqual('/user');
               async.done();
             });
       }));


    it('should generate link hrefs with params', inject([AsyncTestCompleter], (async) => {
         compile('<a href="hello" [router-link]="[\'./User\', {name: name}]">{{name}}</a>')
             .then((_) => router.config(
                       [new Route({path: '/user/:name', component: UserCmp, as: 'User'})]))
             .then((_) => router.navigateByUrl('/a/b'))
             .then((_) => {
               rootTC.debugElement.componentInstance.name = 'brian';
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement).toHaveText('brian');
               expect(DOM.getAttribute(rootTC.debugElement.componentViewChildren[0].nativeElement,
                                       'href'))
                   .toEqual('/user/brian');
               async.done();
             });
       }));

    it('should generate link hrefs from a child to its sibling',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => router.config(
                       [new Route({path: '/page/:number', component: SiblingPageCmp, as: 'Page'})]))
             .then((_) => router.navigateByUrl('/page/1'))
             .then((_) => {
               rootTC.detectChanges();
               expect(DOM.getAttribute(rootTC.debugElement.componentViewChildren[1]
                                           .componentViewChildren[0]
                                           .nativeElement,
                                       'href'))
                   .toEqual('/page/2');
               async.done();
             });
       }));

    it('should generate link hrefs when asynchronously loaded',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => router.config([
               new AsyncRoute({
                 path: '/child-with-grandchild/...',
                 loader: parentCmpLoader,
                 as: 'ChildWithGrandchild'
               })
             ]))
             .then((_) => router.navigate(['/ChildWithGrandchild']))
             .then((_) => {
               rootTC.detectChanges();
               expect(DOM.getAttribute(rootTC.debugElement.componentViewChildren[1]
                                           .componentViewChildren[0]
                                           .nativeElement,
                                       'href'))
                   .toEqual('/child-with-grandchild/grandchild');
               async.done();
             });
       }));

    it('should generate relative links preserving the existing parent route',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => router.config(
                       [new Route({path: '/book/:title/...', component: BookCmp, as: 'Book'})]))
             .then((_) => router.navigateByUrl('/book/1984/page/1'))
             .then((_) => {
               rootTC.detectChanges();
               expect(DOM.getAttribute(rootTC.debugElement.componentViewChildren[1]
                                           .componentViewChildren[0]
                                           .nativeElement,
                                       'href'))
                   .toEqual('/book/1984/page/100');

               expect(DOM.getAttribute(rootTC.debugElement.componentViewChildren[1]
                                           .componentViewChildren[2]
                                           .componentViewChildren[0]
                                           .nativeElement,
                                       'href'))
                   .toEqual('/book/1984/page/2');
               async.done();
             });
       }));


    describe('router-link-active CSS class', () => {
      it('should be added to the associated element', inject([AsyncTestCompleter], (async) => {
           router.config([
                   new Route({path: '/child', component: HelloCmp, as: 'Child'}),
                   new Route({path: '/better-child', component: Hello2Cmp, as: 'BetterChild'})
                 ])
               .then((_) => compile(`<a [router-link]="['./Child']" class="child-link">Child</a>
                                <a [router-link]="['./BetterChild']" class="better-child-link">Better Child</a>
                                <router-outlet></router-outlet>`))
               .then((_) => {
                 var element = rootTC.debugElement.nativeElement;

                 rootTC.detectChanges();

                 var link1 = DOM.querySelector(element, '.child-link');
                 var link2 = DOM.querySelector(element, '.better-child-link');

                 expect(link1).not.toHaveCssClass('router-link-active');
                 expect(link2).not.toHaveCssClass('router-link-active');

                 router.subscribe((_) => {
                   rootTC.detectChanges();

                   expect(link1).not.toHaveCssClass('router-link-active');
                   expect(link2).toHaveCssClass('router-link-active');

                   async.done();
                 });
                 router.navigateByUrl('/better-child');
               });
         }));

      it('should be added to links in child routes', inject([AsyncTestCompleter], (async) => {
           router.config([
                   new Route({path: '/child', component: HelloCmp, as: 'Child'}),
                   new Route({
                     path: '/child-with-grandchild/...',
                     component: ParentCmp,
                     as: 'ChildWithGrandchild'
                   })
                 ])
               .then((_) => compile(`<a [router-link]="['./Child']" class="child-link">Child</a>
                                <a [router-link]="['./ChildWithGrandchild/Grandchild']" class="child-with-grandchild-link">Better Child</a>
                                <router-outlet></router-outlet>`))
               .then((_) => {
                 var element = rootTC.debugElement.nativeElement;

                 rootTC.detectChanges();

                 var link1 = DOM.querySelector(element, '.child-link');
                 var link2 = DOM.querySelector(element, '.child-with-grandchild-link');

                 expect(link1).not.toHaveCssClass('router-link-active');
                 expect(link2).not.toHaveCssClass('router-link-active');

                 router.subscribe((_) => {
                   rootTC.detectChanges();

                   expect(link1).not.toHaveCssClass('router-link-active');
                   expect(link2).toHaveCssClass('router-link-active');

                   var link3 = DOM.querySelector(element, '.grandchild-link');
                   var link4 = DOM.querySelector(element, '.better-grandchild-link');

                   expect(link3).toHaveCssClass('router-link-active');
                   expect(link4).not.toHaveCssClass('router-link-active');

                   async.done();
                 });
                 router.navigateByUrl('/child-with-grandchild/grandchild');
               });
         }));
    });

    describe('when clicked', () => {

      var clickOnElement = function(view) {
        var anchorEl = rootTC.debugElement.componentViewChildren[0].nativeElement;
        var dispatchedEvent = DOM.createMouseEvent('click');
        DOM.dispatchEvent(anchorEl, dispatchedEvent);
        return dispatchedEvent;
      };

      it('should navigate to link hrefs without params', inject([AsyncTestCompleter], (async) => {
           compile('<a href="hello" [router-link]="[\'./User\']"></a>')
               .then((_) => router.config(
                         [new Route({path: '/user', component: UserCmp, as: 'User'})]))
               .then((_) => router.navigateByUrl('/a/b'))
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
           compile('<a href="hello" [router-link]="[\'./User\']"></a>')
               .then((_) => router.config(
                         [new Route({path: '/user', component: UserCmp, as: 'User'})]))
               .then((_) => router.navigateByUrl('/a/b'))
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

function getHref(tc: RootTestComponent) {
  return DOM.getAttribute(tc.debugElement.componentViewChildren[0].nativeElement, 'href');
}

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
      `page #{{pageNumber}} | <a href="hello" [router-link]="[\'../Page\', {number: nextPage}]">next</a>`,
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

@Component({selector: 'hello-cmp'})
@View({template: 'hello'})
class HelloCmp {
}

@Component({selector: 'hello2-cmp'})
@View({template: 'hello2'})
class Hello2Cmp {
}

function parentCmpLoader() {
  return PromiseWrapper.resolve(ParentCmp);
}

@Component({selector: 'parent-cmp'})
@View({
  template: `{ <a [router-link]="['./Grandchild']" class="grandchild-link">Grandchild</a>
               <a [router-link]="['./BetterGrandchild']" class="better-grandchild-link">Better Grandchild</a>
               <router-outlet></router-outlet> }`,
  directives: ROUTER_DIRECTIVES
})
@RouteConfig([
  new Route({path: '/grandchild', component: HelloCmp, as: 'Grandchild'}),
  new Route({path: '/better-grandchild', component: Hello2Cmp, as: 'BetterGrandchild'})
])
class ParentCmp {
  constructor(public router: Router) {}
}

@Component({selector: 'book-cmp'})
@View({
  template: `<a href="hello" [router-link]="[\'./Page\', {number: 100}]">{{title}}</a> |
    <router-outlet></router-outlet>`,
  directives: ROUTER_DIRECTIVES
})
@RouteConfig([new Route({path: '/page/:number', component: SiblingPageCmp, as: 'Page'})])
class BookCmp {
  title: string;
  constructor(params: RouteParams) { this.title = params.get('title'); }
}
