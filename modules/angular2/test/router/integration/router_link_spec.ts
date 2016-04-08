import {
  ComponentFixture,
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  dispatchEvent,
  expect,
  iit,
  inject,
  beforeEachProviders,
  it,
  xit,
  TestComponentBuilder,
  proxy,
  SpyObject
} from 'angular2/testing_internal';

import {By} from 'angular2/platform/common_dom';
import {Location} from 'angular2/platform/common';
import {NumberWrapper} from 'angular2/src/facade/lang';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';

import {provide, Component} from 'angular2/core';

import {SpyLocation} from 'angular2/src/mock/location_mock';
import {
  Router,
  RouteRegistry,
  RouterLink,
  RouterOutlet,
  AsyncRoute,
  AuxRoute,
  Route,
  RouteParams,
  RouteConfig,
  ROUTER_DIRECTIVES,
  ROUTER_PRIMARY_COMPONENT
} from 'angular2/router';
import {RootRouter} from 'angular2/src/router/router';

import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {TEMPLATE_TRANSFORMS} from 'angular2/compiler';
import {RouterLinkTransform} from 'angular2/src/router/directives/router_link_transform';

export function main() {
  describe('routerLink directive', function() {
    var tcb: TestComponentBuilder;
    var fixture: ComponentFixture;
    var router: Router;
    var location: Location;

    beforeEachProviders(() => [
      RouteRegistry,
      provide(Location, {useClass: SpyLocation}),
      provide(ROUTER_PRIMARY_COMPONENT, {useValue: MyComp}),
      provide(Router, {useClass: RootRouter}),
      provide(TEMPLATE_TRANSFORMS, {useClass: RouterLinkTransform, multi: true})
    ]);

    beforeEach(inject([TestComponentBuilder, Router, Location],
                      (tcBuilder, rtr: Router, loc: Location) => {
                        tcb = tcBuilder;
                        router = rtr;
                        location = loc;
                      }));

    function compile(template: string = "<router-outlet></router-outlet>") {
      return tcb.overrideTemplate(MyComp, ('<div>' + template + '</div>'))
          .createAsync(MyComp)
          .then((tc) => { fixture = tc; });
    }

    it('should generate absolute hrefs that include the base href',
       inject([AsyncTestCompleter], (async) => {
         (<SpyLocation>location).setBaseHref('/my/base');
         compile('<a href="hello" [routerLink]="[\'./User\']"></a>')
             .then((_) => router.config(
                       [new Route({path: '/user', component: UserCmp, name: 'User'})]))
             .then((_) => router.navigateByUrl('/a/b'))
             .then((_) => {
               fixture.detectChanges();
               expect(getHref(fixture)).toEqual('/my/base/user');
               async.done();
             });
       }));


    it('should generate link hrefs without params', inject([AsyncTestCompleter], (async) => {
         compile('<a href="hello" [routerLink]="[\'./User\']"></a>')
             .then((_) => router.config(
                       [new Route({path: '/user', component: UserCmp, name: 'User'})]))
             .then((_) => router.navigateByUrl('/a/b'))
             .then((_) => {
               fixture.detectChanges();
               expect(getHref(fixture)).toEqual('/user');
               async.done();
             });
       }));


    it('should generate link hrefs with params', inject([AsyncTestCompleter], (async) => {
         compile('<a href="hello" [routerLink]="[\'./User\', {name: name}]">{{name}}</a>')
             .then((_) => router.config(
                       [new Route({path: '/user/:name', component: UserCmp, name: 'User'})]))
             .then((_) => router.navigateByUrl('/a/b'))
             .then((_) => {
               fixture.debugElement.componentInstance.name = 'brian';
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('brian');
               expect(getHref(fixture)).toEqual('/user/brian');
               async.done();
             });
       }));

    it('should generate link hrefs from a child to its sibling',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then(
                 (_) => router.config(
                     [new Route({path: '/page/:number', component: SiblingPageCmp, name: 'Page'})]))
             .then((_) => router.navigateByUrl('/page/1'))
             .then((_) => {
               fixture.detectChanges();
               expect(getHref(fixture)).toEqual('/page/2');
               async.done();
             });
       }));

    it('should generate link hrefs from a child to its sibling with no leading slash',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => router.config([
               new Route(
                   {path: '/page/:number', component: NoPrefixSiblingPageCmp, name: 'Page'})
             ]))
             .then((_) => router.navigateByUrl('/page/1'))
             .then((_) => {
               fixture.detectChanges();
               expect(getHref(fixture)).toEqual('/page/2');
               async.done();
             });
       }));

    it('should generate link hrefs to a child with no leading slash',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => router.config([
               new Route({path: '/book/:title/...', component: NoPrefixBookCmp, name: 'Book'})
             ]))
             .then((_) => router.navigateByUrl('/book/1984/page/1'))
             .then((_) => {
               fixture.detectChanges();
               expect(getHref(fixture)).toEqual('/book/1984/page/100');
               async.done();
             });
       }));

    it('should throw when links without a leading slash are ambiguous',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => router.config([
               new Route({path: '/book/:title/...', component: AmbiguousBookCmp, name: 'Book'})
             ]))
             .then((_) => router.navigateByUrl('/book/1984/page/1'))
             .then((_) => {
               var link = ListWrapper.toJSON(['Book', {number: 100}]);
               expect(() => fixture.detectChanges())
                   .toThrowErrorWith(
                       `Link "${link}" is ambiguous, use "./" or "../" to disambiguate.`);
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
                 name: 'ChildWithGrandchild'
               })
             ]))
             .then((_) => router.navigateByUrl('/child-with-grandchild/grandchild'))
             .then((_) => {
               fixture.detectChanges();
               expect(getHref(fixture)).toEqual('/child-with-grandchild/grandchild');
               async.done();
             });
       }));

    it('should generate relative links preserving the existing parent route',
       inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => router.config(
                       [new Route({path: '/book/:title/...', component: BookCmp, name: 'Book'})]))
             .then((_) => router.navigateByUrl('/book/1984/page/1'))
             .then((_) => {
               fixture.detectChanges();
               // TODO(juliemr): This should be one By.css('book-cmp a') query, but the parse5
               // adapter
               // can't handle css child selectors.
               expect(DOM.getAttribute(fixture.debugElement.query(By.css('book-cmp'))
                                           .query(By.css('a'))
                                           .nativeElement,
                                       'href'))
                   .toEqual('/book/1984/page/100');

               expect(DOM.getAttribute(fixture.debugElement.query(By.css('page-cmp'))
                                           .query(By.css('a'))
                                           .nativeElement,
                                       'href'))
                   .toEqual('/book/1984/page/2');
               async.done();
             });
       }));

    it('should generate links to auxiliary routes', inject([AsyncTestCompleter], (async) => {
         compile()
             .then((_) => router.config([new Route({path: '/...', component: AuxLinkCmp})]))
             .then((_) => router.navigateByUrl('/'))
             .then((_) => {
               fixture.detectChanges();
               expect(getHref(fixture)).toEqual('/(aside)');
               async.done();
             });
       }));


    describe('router-link-active CSS class', () => {
      it('should be added to the associated element', inject([AsyncTestCompleter], (async) => {
           router.config([
                   new Route({path: '/child', component: HelloCmp, name: 'Child'}),
                   new Route({path: '/better-child', component: Hello2Cmp, name: 'BetterChild'})
                 ])
               .then((_) => compile(`<a [routerLink]="['./Child']" class="child-link">Child</a>
                                <a [routerLink]="['./BetterChild']" class="better-child-link">Better Child</a>
                                <router-outlet></router-outlet>`))
               .then((_) => {
                 var element = fixture.debugElement.nativeElement;

                 fixture.detectChanges();

                 var link1 = DOM.querySelector(element, '.child-link');
                 var link2 = DOM.querySelector(element, '.better-child-link');

                 expect(link1).not.toHaveCssClass('router-link-active');
                 expect(link2).not.toHaveCssClass('router-link-active');

                 router.subscribe((_) => {
                   fixture.detectChanges();

                   expect(link1).not.toHaveCssClass('router-link-active');
                   expect(link2).toHaveCssClass('router-link-active');

                   async.done();
                 });
                 router.navigateByUrl('/better-child?extra=0');
               });
         }));

      it('should be added to links in child routes', inject([AsyncTestCompleter], (async) => {
           router.config([
                   new Route({path: '/child', component: HelloCmp, name: 'Child'}),
                   new Route({
                     path: '/child-with-grandchild/...',
                     component: ParentCmp,
                     name: 'ChildWithGrandchild'
                   })
                 ])
               .then((_) => compile(`<a [routerLink]="['./Child']" class="child-link">Child</a>
                                <a [routerLink]="['./ChildWithGrandchild/Grandchild']" class="child-with-grandchild-link">Better Child</a>
                                <router-outlet></router-outlet>`))
               .then((_) => {
                 var element = fixture.debugElement.nativeElement;

                 fixture.detectChanges();

                 var link1 = DOM.querySelector(element, '.child-link');
                 var link2 = DOM.querySelector(element, '.child-with-grandchild-link');

                 expect(link1).not.toHaveCssClass('router-link-active');
                 expect(link2).not.toHaveCssClass('router-link-active');

                 router.subscribe((_) => {
                   fixture.detectChanges();

                   expect(link1).not.toHaveCssClass('router-link-active');
                   expect(link2).toHaveCssClass('router-link-active');

                   var link3 = DOM.querySelector(element, '.grandchild-link');
                   var link4 = DOM.querySelector(element, '.better-grandchild-link');

                   expect(link3).toHaveCssClass('router-link-active');
                   expect(link4).not.toHaveCssClass('router-link-active');

                   async.done();
                 });
                 router.navigateByUrl('/child-with-grandchild/grandchild?extra=0');
               });
         }));


      describe('router link dsl', () => {
        it('should generate link hrefs with params', inject([AsyncTestCompleter], (async) => {
             compile('<a href="hello" [routerLink]="route:./User(name: name)">{{name}}</a>')
                 .then((_) => router.config(
                           [new Route({path: '/user/:name', component: UserCmp, name: 'User'})]))
                 .then((_) => router.navigateByUrl('/a/b'))
                 .then((_) => {
                   fixture.debugElement.componentInstance.name = 'brian';
                   fixture.detectChanges();
                   expect(fixture.debugElement.nativeElement).toHaveText('brian');
                   expect(getHref(fixture)).toEqual('/user/brian');
                   async.done();
                 });
           }));
      });
    });

    describe('when clicked', () => {

      var clickOnElement = function(view) {
        var anchorEl = fixture.debugElement.query(By.css('a')).nativeElement;
        var dispatchedEvent = DOM.createMouseEvent('click');
        DOM.dispatchEvent(anchorEl, dispatchedEvent);
        return dispatchedEvent;
      };

      it('should navigate to link hrefs without params', inject([AsyncTestCompleter], (async) => {
           compile('<a href="hello" [routerLink]="[\'./User\']"></a>')
               .then((_) => router.config(
                         [new Route({path: '/user', component: UserCmp, name: 'User'})]))
               .then((_) => router.navigateByUrl('/a/b'))
               .then((_) => {
                 fixture.detectChanges();

                 var dispatchedEvent = clickOnElement(fixture);
                 expect(DOM.isPrevented(dispatchedEvent)).toBe(true);

                 // router navigation is async.
                 router.subscribe((_) => {
                   expect((<SpyLocation>location).urlChanges).toEqual(['/user']);
                   async.done();
                 });
               });
         }));

      it('should navigate to link hrefs in presence of base href',
         inject([AsyncTestCompleter], (async) => {
           (<SpyLocation>location).setBaseHref('/base');
           compile('<a href="hello" [routerLink]="[\'./User\']"></a>')
               .then((_) => router.config(
                         [new Route({path: '/user', component: UserCmp, name: 'User'})]))
               .then((_) => router.navigateByUrl('/a/b'))
               .then((_) => {
                 fixture.detectChanges();


                 var dispatchedEvent = clickOnElement(fixture);
                 expect(DOM.isPrevented(dispatchedEvent)).toBe(true);

                 // router navigation is async.
                 router.subscribe((_) => {
                   expect((<SpyLocation>location).urlChanges).toEqual(['/base/user']);
                   async.done();
                 });
               });
         }));
    });
  });
}

function getHref(tc: ComponentFixture) {
  return DOM.getAttribute(tc.debugElement.query(By.css('a')).nativeElement, 'href');
}

@Component({selector: 'my-comp', template: '', directives: [ROUTER_DIRECTIVES]})
class MyComp {
  name;
}

@Component({selector: 'user-cmp', template: "hello {{user}}"})
class UserCmp {
  user: string;
  constructor(params: RouteParams) { this.user = params.get('name'); }
}

@Component({
  selector: 'page-cmp',
  template:
      `page #{{pageNumber}} | <a href="hello" [routerLink]="[\'../Page\', {number: nextPage}]">next</a>`,
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

@Component({
  selector: 'page-cmp',
  template:
      `page #{{pageNumber}} | <a href="hello" [routerLink]="[\'Page\', {number: nextPage}]">next</a>`,
  directives: [RouterLink]
})
class NoPrefixSiblingPageCmp {
  pageNumber: number;
  nextPage: number;
  constructor(params: RouteParams) {
    this.pageNumber = NumberWrapper.parseInt(params.get('number'), 10);
    this.nextPage = this.pageNumber + 1;
  }
}

@Component({selector: 'hello-cmp', template: 'hello'})
class HelloCmp {
}

@Component({selector: 'hello2-cmp', template: 'hello2'})
class Hello2Cmp {
}

function parentCmpLoader() {
  return PromiseWrapper.resolve(ParentCmp);
}

@Component({
  selector: 'parent-cmp',
  template: `{ <a [routerLink]="['./Grandchild']" class="grandchild-link">Grandchild</a>
               <a [routerLink]="['./BetterGrandchild']" class="better-grandchild-link">Better Grandchild</a>
               <router-outlet></router-outlet> }`,
  directives: ROUTER_DIRECTIVES
})
@RouteConfig([
  new Route({path: '/grandchild', component: HelloCmp, name: 'Grandchild'}),
  new Route({path: '/better-grandchild', component: Hello2Cmp, name: 'BetterGrandchild'})
])
class ParentCmp {
}

@Component({
  selector: 'book-cmp',
  template: `<a href="hello" [routerLink]="[\'./Page\', {number: 100}]">{{title}}</a> |
    <router-outlet></router-outlet>`,
  directives: ROUTER_DIRECTIVES
})
@RouteConfig([new Route({path: '/page/:number', component: SiblingPageCmp, name: 'Page'})])
class BookCmp {
  title: string;
  constructor(params: RouteParams) { this.title = params.get('title'); }
}

@Component({
  selector: 'book-cmp',
  template: `<a href="hello" [routerLink]="[\'Page\', {number: 100}]">{{title}}</a> |
    <router-outlet></router-outlet>`,
  directives: ROUTER_DIRECTIVES
})
@RouteConfig([new Route({path: '/page/:number', component: SiblingPageCmp, name: 'Page'})])
class NoPrefixBookCmp {
  title: string;
  constructor(params: RouteParams) { this.title = params.get('title'); }
}

@Component({
  selector: 'book-cmp',
  template: `<a href="hello" [routerLink]="[\'Book\', {number: 100}]">{{title}}</a> |
    <router-outlet></router-outlet>`,
  directives: ROUTER_DIRECTIVES
})
@RouteConfig([new Route({path: '/page/:number', component: SiblingPageCmp, name: 'Book'})])
class AmbiguousBookCmp {
  title: string;
  constructor(params: RouteParams) { this.title = params.get('title'); }
}

@Component({
  selector: 'aux-cmp',
  template:
      `<a [routerLink]="[\'./Hello\', [ \'Aside\' ] ]">aside</a> |
    <router-outlet></router-outlet> | aside <router-outlet name="aside"></router-outlet>`,
  directives: ROUTER_DIRECTIVES
})
@RouteConfig([
  new Route({path: '/', component: HelloCmp, name: 'Hello'}),
  new AuxRoute({path: '/aside', component: Hello2Cmp, name: 'Aside'})
])
class AuxLinkCmp {
}
