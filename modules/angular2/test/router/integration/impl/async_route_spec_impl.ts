import {
  AsyncTestCompleter,
  beforeEach,
  beforeEachProviders,
  expect,
  iit,
  flushMicrotasks,
  inject,
  it,
  TestComponentBuilder,
  ComponentFixture,
  xit,
} from 'angular2/testing_internal';

import {By} from 'angular2/platform/common_dom';
import {Location} from 'angular2/platform/common';

import {specs, compile, TEST_ROUTER_PROVIDERS, clickOnElement, getHref} from '../util';

import {Router, AsyncRoute, Route} from 'angular2/router';

import {
  HelloCmp,
  helloCmpLoader,
  UserCmp,
  userCmpLoader,
  TeamCmp,
  asyncTeamLoader,
  ParentCmp,
  parentCmpLoader,
  asyncParentCmpLoader,
  asyncDefaultParentCmpLoader,
  ParentWithDefaultCmp,
  parentWithDefaultCmpLoader,
  asyncRouteDataCmp
} from './fixture_components';

function getLinkElement(rtc: ComponentFixture) {
  return rtc.debugElement.query(By.css('a')).nativeElement;
}

function asyncRoutesWithoutChildrenWithRouteData() {
  var fixture;
  var tcb;
  var rtr;

  beforeEachProviders(() => TEST_ROUTER_PROVIDERS);

  beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) => {
    tcb = tcBuilder;
    rtr = router;
  }));

  it('should inject route data into the component', inject([AsyncTestCompleter], (async) => {
       compile(tcb)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config([
             new AsyncRoute(
                 {path: '/route-data', loader: asyncRouteDataCmp, data: {isAdmin: true}})
           ]))
           .then((_) => rtr.navigateByUrl('/route-data'))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('true');
             async.done();
           });
     }));

  it('should inject empty object if the route has no data property',
     inject([AsyncTestCompleter], (async) => {
       compile(tcb)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new AsyncRoute({path: '/route-data-default', loader: asyncRouteDataCmp})]))
           .then((_) => rtr.navigateByUrl('/route-data-default'))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('');
             async.done();
           });
     }));
}

function asyncRoutesWithoutChildrenWithoutParams() {
  var fixture;
  var tcb;
  var rtr;

  beforeEachProviders(() => TEST_ROUTER_PROVIDERS);

  beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) => {
    tcb = tcBuilder;
    rtr = router;
  }));

  it('should navigate by URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new AsyncRoute({path: '/test', loader: helloCmpLoader, name: 'Hello'})]))
           .then((_) => rtr.navigateByUrl('/test'))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('hello');
             async.done();
           });
     }));

  it('should navigate by link DSL', inject([AsyncTestCompleter], (async) => {
       compile(tcb)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new AsyncRoute({path: '/test', loader: helloCmpLoader, name: 'Hello'})]))
           .then((_) => rtr.navigate(['/Hello']))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('hello');
             async.done();
           });
     }));

  it('should generate a link URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `<a [routerLink]="['Hello']">go to hello</a> | <router-outlet></router-outlet>`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new AsyncRoute({path: '/test', loader: helloCmpLoader, name: 'Hello'})]))
           .then((_) => {
             fixture.detectChanges();
             expect(getHref(getLinkElement(fixture))).toEqual('/test');
             async.done();
           });
     }));

  it('should navigate from a link click',
     inject([AsyncTestCompleter, Location], (async, location) => {
       compile(tcb, `<a [routerLink]="['Hello']">go to hello</a> | <router-outlet></router-outlet>`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new AsyncRoute({path: '/test', loader: helloCmpLoader, name: 'Hello'})]))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('go to hello | ');

             rtr.subscribe((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('go to hello | hello');
               expect(location.urlChanges).toEqual(['/test']);
               async.done();
             });

             clickOnElement(getLinkElement(fixture));
           });
     }));
}


function asyncRoutesWithoutChildrenWithParams() {
  var fixture;
  var tcb;
  var rtr;

  beforeEachProviders(() => TEST_ROUTER_PROVIDERS);

  beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) => {
    tcb = tcBuilder;
    rtr = router;
  }));

  it('should navigate by URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new AsyncRoute({path: '/user/:name', loader: userCmpLoader, name: 'User'})]))
           .then((_) => rtr.navigateByUrl('/user/igor'))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('hello igor');
             async.done();
           });
     }));

  it('should navigate by link DSL', inject([AsyncTestCompleter], (async) => {
       compile(tcb)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new Route({path: '/user/:name', component: UserCmp, name: 'User'})]))
           .then((_) => rtr.navigate(['/User', {name: 'brian'}]))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('hello brian');
             async.done();
           });
     }));

  it('should generate a link URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `<a [routerLink]="['User', {name: 'naomi'}]">greet naomi</a> | <router-outlet></router-outlet>`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new AsyncRoute({path: '/user/:name', loader: userCmpLoader, name: 'User'})]))
           .then((_) => {
             fixture.detectChanges();
             expect(getHref(getLinkElement(fixture))).toEqual('/user/naomi');
             async.done();
           });
     }));

  it('should navigate from a link click',
     inject([AsyncTestCompleter, Location], (async, location) => {
       compile(tcb, `<a [routerLink]="['User', {name: 'naomi'}]">greet naomi</a> | <router-outlet></router-outlet>`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new AsyncRoute({path: '/user/:name', loader: userCmpLoader, name: 'User'})]))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('greet naomi | ');

             rtr.subscribe((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('greet naomi | hello naomi');
               expect(location.urlChanges).toEqual(['/user/naomi']);
               async.done();
             });

             clickOnElement(getLinkElement(fixture));
           });
     }));

  it('should navigate between components with different parameters',
     inject([AsyncTestCompleter], (async) => {
       compile(tcb)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new AsyncRoute({path: '/user/:name', loader: userCmpLoader, name: 'User'})]))
           .then((_) => rtr.navigateByUrl('/user/brian'))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('hello brian');
           })
           .then((_) => rtr.navigateByUrl('/user/igor'))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('hello igor');
             async.done();
           });
     }));
}


function asyncRoutesWithSyncChildrenWithoutDefaultRoutes() {
  var fixture;
  var tcb;
  var rtr;

  beforeEachProviders(() => TEST_ROUTER_PROVIDERS);

  beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) => {
    tcb = tcBuilder;
    rtr = router;
  }));

  it('should navigate by URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new AsyncRoute({path: '/a/...', loader: parentCmpLoader, name: 'Parent'})]))
           .then((_) => rtr.navigateByUrl('/a/b'))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
             async.done();
           });
     }));

  it('should navigate by link DSL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new AsyncRoute({path: '/a/...', loader: parentCmpLoader, name: 'Parent'})]))
           .then((_) => rtr.navigate(['/Parent', 'Child']))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
             async.done();
           });
     }));

  it('should generate a link URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `<a [routerLink]="['Parent']">nav to child</a> | outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new AsyncRoute({path: '/a/...', loader: parentCmpLoader, name: 'Parent'})]))
           .then((_) => {
             fixture.detectChanges();
             expect(getHref(getLinkElement(fixture))).toEqual('/a');
             async.done();
           });
     }));

  it('should navigate from a link click',
     inject([AsyncTestCompleter, Location], (async, location) => {
       compile(tcb, `<a [routerLink]="['Parent', 'Child']">nav to child</a> | outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new AsyncRoute({path: '/a/...', loader: parentCmpLoader, name: 'Parent'})]))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('nav to child | outer {  }');

             rtr.subscribe((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement)
                   .toHaveText('nav to child | outer { inner { hello } }');
               expect(location.urlChanges).toEqual(['/a/b']);
               async.done();
             });

             clickOnElement(getLinkElement(fixture));
           });
     }));
}


function asyncRoutesWithSyncChildrenWithDefaultRoutes() {
  var fixture;
  var tcb;
  var rtr;

  beforeEachProviders(() => TEST_ROUTER_PROVIDERS);

  beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) => {
    tcb = tcBuilder;
    rtr = router;
  }));

  it('should navigate by URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config([
             new AsyncRoute({path: '/a/...', loader: parentWithDefaultCmpLoader, name: 'Parent'})
           ]))
           .then((_) => rtr.navigateByUrl('/a'))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
             async.done();
           });
     }));

  it('should navigate by link DSL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config([
             new AsyncRoute({path: '/a/...', loader: parentWithDefaultCmpLoader, name: 'Parent'})
           ]))
           .then((_) => rtr.navigate(['/Parent']))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
             async.done();
           });
     }));

  it('should generate a link URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `<a [routerLink]="['/Parent']">link to inner</a> | outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config([
             new AsyncRoute({path: '/a/...', loader: parentWithDefaultCmpLoader, name: 'Parent'})
           ]))
           .then((_) => {
             fixture.detectChanges();
             expect(getHref(getLinkElement(fixture))).toEqual('/a');
             async.done();
           });
     }));

  it('should navigate from a link click',
     inject([AsyncTestCompleter, Location], (async, location) => {
       compile(tcb, `<a [routerLink]="['/Parent']">link to inner</a> | outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config([
             new AsyncRoute({path: '/a/...', loader: parentWithDefaultCmpLoader, name: 'Parent'})
           ]))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('link to inner | outer {  }');

             rtr.subscribe((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement)
                   .toHaveText('link to inner | outer { inner { hello } }');
               expect(location.urlChanges).toEqual(['/a/b']);
               async.done();
             });

             clickOnElement(getLinkElement(fixture));
           });
     }));
}


function asyncRoutesWithAsyncChildrenWithoutParamsWithoutDefaultRoutes() {
  var rootTC;
  var tcb;
  var rtr;

  beforeEachProviders(() => TEST_ROUTER_PROVIDERS);

  beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) => {
    tcb = tcBuilder;
    rtr = router;
  }));

  it('should navigate by URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {rootTC = rtc})
           .then((_) => rtr.config([
             new AsyncRoute({path: '/a/...', loader: asyncParentCmpLoader, name: 'Parent'})
           ]))
           .then((_) => rtr.navigateByUrl('/a/b'))
           .then((_) => {
             rootTC.detectChanges();
             expect(rootTC.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
             async.done();
           });
     }));

  it('should navigate by link DSL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {rootTC = rtc})
           .then((_) => rtr.config([
             new AsyncRoute({path: '/a/...', loader: asyncParentCmpLoader, name: 'Parent'})
           ]))
           .then((_) => rtr.navigate(['/Parent', 'Child']))
           .then((_) => {
             rootTC.detectChanges();
             expect(rootTC.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
             async.done();
           });
     }));

  it('should generate a link URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `<a [routerLink]="['Parent', 'Child']">nav to child</a> | outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {rootTC = rtc})
           .then((_) => rtr.config([
             new AsyncRoute({path: '/a/...', loader: asyncParentCmpLoader, name: 'Parent'})
           ]))
           .then((_) => {
             rootTC.detectChanges();
             expect(getHref(getLinkElement(rootTC))).toEqual('/a');
             async.done();
           });
     }));

  it('should navigate from a link click',
     inject([AsyncTestCompleter, Location], (async, location) => {
       compile(tcb, `<a [routerLink]="['Parent', 'Child']">nav to child</a> | outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {rootTC = rtc})
           .then((_) => rtr.config([
             new AsyncRoute({path: '/a/...', loader: asyncParentCmpLoader, name: 'Parent'})
           ]))
           .then((_) => {
             rootTC.detectChanges();
             expect(rootTC.debugElement.nativeElement).toHaveText('nav to child | outer {  }');

             rtr.subscribe((_) => {
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement)
                   .toHaveText('nav to child | outer { inner { hello } }');
               expect(location.urlChanges).toEqual(['/a/b']);
               async.done();
             });

             clickOnElement(getLinkElement(rootTC));
           });
     }));
}


function asyncRoutesWithAsyncChildrenWithoutParamsWithDefaultRoutes() {
  var rootTC;
  var tcb;
  var rtr;

  beforeEachProviders(() => TEST_ROUTER_PROVIDERS);

  beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) => {
    tcb = tcBuilder;
    rtr = router;
  }));

  it('should navigate by URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {rootTC = rtc})
           .then((_) => rtr.config([
             new AsyncRoute(
                 {path: '/a/...', loader: asyncDefaultParentCmpLoader, name: 'Parent'})
           ]))
           .then((_) => rtr.navigateByUrl('/a'))
           .then((_) => {
             rootTC.detectChanges();
             expect(rootTC.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
             async.done();
           });
     }));

  it('should navigate by link DSL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {rootTC = rtc})
           .then((_) => rtr.config([
             new AsyncRoute(
                 {path: '/a/...', loader: asyncDefaultParentCmpLoader, name: 'Parent'})
           ]))
           .then((_) => rtr.navigate(['/Parent']))
           .then((_) => {
             rootTC.detectChanges();
             expect(rootTC.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
             async.done();
           });
     }));

  it('should generate a link URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `<a [routerLink]="['Parent']">nav to child</a> | outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {rootTC = rtc})
           .then((_) => rtr.config([
             new AsyncRoute(
                 {path: '/a/...', loader: asyncDefaultParentCmpLoader, name: 'Parent'})
           ]))
           .then((_) => {
             rootTC.detectChanges();
             expect(getHref(getLinkElement(rootTC))).toEqual('/a');
             async.done();
           });
     }));

  it('should navigate from a link click',
     inject([AsyncTestCompleter, Location], (async, location) => {
       compile(tcb, `<a [routerLink]="['Parent']">nav to child</a> | outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {rootTC = rtc})
           .then((_) => rtr.config([
             new AsyncRoute(
                 {path: '/a/...', loader: asyncDefaultParentCmpLoader, name: 'Parent'})
           ]))
           .then((_) => {
             rootTC.detectChanges();
             expect(rootTC.debugElement.nativeElement).toHaveText('nav to child | outer {  }');

             rtr.subscribe((_) => {
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement)
                   .toHaveText('nav to child | outer { inner { hello } }');
               expect(location.urlChanges).toEqual(['/a/b']);
               async.done();
             });

             clickOnElement(getLinkElement(rootTC));
           });
     }));
}


function asyncRoutesWithAsyncChildrenWithParamsWithoutDefaultRoutes() {
  var fixture;
  var tcb;
  var rtr;

  beforeEachProviders(() => TEST_ROUTER_PROVIDERS);

  beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) => {
    tcb = tcBuilder;
    rtr = router;
  }));

  it('should navigate by URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `{ <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config([
             new AsyncRoute({path: '/team/:id/...', loader: asyncTeamLoader, name: 'Team'})
           ]))
           .then((_) => rtr.navigateByUrl('/team/angular/user/matias'))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement)
                 .toHaveText('{ team angular | user { hello matias } }');
             async.done();
           });
     }));

  it('should navigate by link DSL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `{ <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config([
             new AsyncRoute({path: '/team/:id/...', loader: asyncTeamLoader, name: 'Team'})
           ]))
           .then((_) => rtr.navigate(['/Team', {id: 'angular'}, 'User', {name: 'matias'}]))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement)
                 .toHaveText('{ team angular | user { hello matias } }');
             async.done();
           });
     }));

  it('should generate a link URL', inject([AsyncTestCompleter], (async) => {
       compile(
           tcb,
           `<a [routerLink]="['/Team', {id: 'angular'}, 'User', {name: 'matias'}]">nav to matias</a> { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config([
             new AsyncRoute({path: '/team/:id/...', loader: asyncTeamLoader, name: 'Team'})
           ]))
           .then((_) => {
             fixture.detectChanges();
             expect(getHref(getLinkElement(fixture))).toEqual('/team/angular');
             async.done();
           });
     }));

  it('should navigate from a link click',
     inject([AsyncTestCompleter, Location], (async, location) => {
       compile(
           tcb,
           `<a [routerLink]="['/Team', {id: 'angular'}, 'User', {name: 'matias'}]">nav to matias</a> { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config([
             new AsyncRoute({path: '/team/:id/...', loader: asyncTeamLoader, name: 'Team'})
           ]))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('nav to matias {  }');

             rtr.subscribe((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement)
                   .toHaveText('nav to matias { team angular | user { hello matias } }');
               expect(location.urlChanges).toEqual(['/team/angular/user/matias']);
               async.done();
             });

             clickOnElement(getLinkElement(fixture));
           });
     }));
}

export function registerSpecs() {
  specs['asyncRoutesWithoutChildrenWithRouteData'] = asyncRoutesWithoutChildrenWithRouteData;
  specs['asyncRoutesWithoutChildrenWithoutParams'] = asyncRoutesWithoutChildrenWithoutParams;
  specs['asyncRoutesWithoutChildrenWithParams'] = asyncRoutesWithoutChildrenWithParams;
  specs['asyncRoutesWithSyncChildrenWithoutDefaultRoutes'] =
      asyncRoutesWithSyncChildrenWithoutDefaultRoutes;
  specs['asyncRoutesWithSyncChildrenWithDefaultRoutes'] =
      asyncRoutesWithSyncChildrenWithDefaultRoutes;
  specs['asyncRoutesWithAsyncChildrenWithoutParamsWithoutDefaultRoutes'] =
      asyncRoutesWithAsyncChildrenWithoutParamsWithoutDefaultRoutes;
  specs['asyncRoutesWithAsyncChildrenWithoutParamsWithDefaultRoutes'] =
      asyncRoutesWithAsyncChildrenWithoutParamsWithDefaultRoutes;
  specs['asyncRoutesWithAsyncChildrenWithParamsWithoutDefaultRoutes'] =
      asyncRoutesWithAsyncChildrenWithParamsWithoutDefaultRoutes;
}
