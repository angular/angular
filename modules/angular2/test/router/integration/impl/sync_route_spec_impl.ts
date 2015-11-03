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
  RootTestComponent,
  xit,
} from 'angular2/testing_internal';

import {specs, compile, TEST_ROUTER_PROVIDERS, clickOnElement, getHref} from '../util';

import {Router, Route, Location} from 'angular2/router';

import {HelloCmp, UserCmp, TeamCmp, ParentCmp, ParentWithDefaultCmp} from './fixture_components';


function getLinkElement(rtc: RootTestComponent) {
  return rtc.debugElement.componentViewChildren[0].nativeElement;
}

function syncRoutesWithoutChildrenWithoutParams() {
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
           .then((_) =>
                     rtr.config([new Route({path: '/test', component: HelloCmp, name: 'Hello'})]))
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
           .then((_) =>
                     rtr.config([new Route({path: '/test', component: HelloCmp, name: 'Hello'})]))
           .then((_) => rtr.navigate(['/Hello']))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('hello');
             async.done();
           });
     }));

  it('should generate a link URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `<a [router-link]="['Hello']">go to hello</a> | <router-outlet></router-outlet>`)
           .then((rtc) => {fixture = rtc})
           .then((_) =>
                     rtr.config([new Route({path: '/test', component: HelloCmp, name: 'Hello'})]))
           .then((_) => {
             fixture.detectChanges();
             expect(getHref(getLinkElement(fixture))).toEqual('/test');
             async.done();
           });
     }));

  it('should navigate from a link click',
     inject([AsyncTestCompleter, Location], (async, location) => {
       compile(tcb, `<a [router-link]="['Hello']">go to hello</a> | <router-outlet></router-outlet>`)
           .then((rtc) => {fixture = rtc})
           .then((_) =>
                     rtr.config([new Route({path: '/test', component: HelloCmp, name: 'Hello'})]))
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


function syncRoutesWithoutChildrenWithParams() {
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
                     [new Route({path: '/user/:name', component: UserCmp, name: 'User'})]))
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
       compile(tcb, `<a [router-link]="['User', {name: 'naomi'}]">greet naomi</a> | <router-outlet></router-outlet>`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new Route({path: '/user/:name', component: UserCmp, name: 'User'})]))
           .then((_) => {
             fixture.detectChanges();
             expect(getHref(getLinkElement(fixture))).toEqual('/user/naomi');
             async.done();
           });
     }));

  it('should navigate from a link click',
     inject([AsyncTestCompleter, Location], (async, location) => {
       compile(tcb, `<a [router-link]="['User', {name: 'naomi'}]">greet naomi</a> | <router-outlet></router-outlet>`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new Route({path: '/user/:name', component: UserCmp, name: 'User'})]))
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
                     [new Route({path: '/user/:name', component: UserCmp, name: 'User'})]))
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


function syncRoutesWithSyncChildrenWithoutDefaultRoutesWithoutParams() {
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
                     [new Route({path: '/a/...', component: ParentCmp, name: 'Parent'})]))
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
                     [new Route({path: '/a/...', component: ParentCmp, name: 'Parent'})]))
           .then((_) => rtr.navigate(['/Parent', 'Child']))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
             async.done();
           });
     }));

  it('should generate a link URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `<a [router-link]="['Parent', 'Child']">nav to child</a> | outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new Route({path: '/a/...', component: ParentCmp, name: 'Parent'})]))
           .then((_) => {
             fixture.detectChanges();
             expect(getHref(getLinkElement(fixture))).toEqual('/a/b');
             async.done();
           });
     }));

  it('should navigate from a link click',
     inject([AsyncTestCompleter, Location], (async, location) => {
       compile(tcb, `<a [router-link]="['Parent', 'Child']">nav to child</a> | outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new Route({path: '/a/...', component: ParentCmp, name: 'Parent'})]))
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


function syncRoutesWithSyncChildrenWithoutDefaultRoutesWithParams() {
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
           .then((_) => rtr.config(
                     [new Route({path: '/team/:id/...', component: TeamCmp, name: 'Team'})]))
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
           .then((_) => rtr.config(
                     [new Route({path: '/team/:id/...', component: TeamCmp, name: 'Team'})]))
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
           `<a [router-link]="['/Team', {id: 'angular'}, 'User', {name: 'matias'}]">nav to matias</a> { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new Route({path: '/team/:id/...', component: TeamCmp, name: 'Team'})]))
           .then((_) => {
             fixture.detectChanges();
             expect(getHref(getLinkElement(fixture))).toEqual('/team/angular/user/matias');
             async.done();
           });
     }));

  it('should navigate from a link click',
     inject([AsyncTestCompleter, Location], (async, location) => {
       compile(
           tcb,
           `<a [router-link]="['/Team', {id: 'angular'}, 'User', {name: 'matias'}]">nav to matias</a> { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then((_) => rtr.config(
                     [new Route({path: '/team/:id/...', component: TeamCmp, name: 'Team'})]))
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


function syncRoutesWithSyncChildrenWithDefaultRoutesWithoutParams() {
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
           .then(
               (_) => rtr.config(
                   [new Route({path: '/a/...', component: ParentWithDefaultCmp, name: 'Parent'})]))
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
           .then(
               (_) => rtr.config(
                   [new Route({path: '/a/...', component: ParentWithDefaultCmp, name: 'Parent'})]))
           .then((_) => rtr.navigate(['/Parent']))
           .then((_) => {
             fixture.detectChanges();
             expect(fixture.debugElement.nativeElement).toHaveText('outer { inner { hello } }');
             async.done();
           });
     }));

  it('should generate a link URL', inject([AsyncTestCompleter], (async) => {
       compile(tcb, `<a [router-link]="['/Parent']">link to inner</a> | outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then(
               (_) => rtr.config(
                   [new Route({path: '/a/...', component: ParentWithDefaultCmp, name: 'Parent'})]))
           .then((_) => {
             fixture.detectChanges();
             expect(getHref(getLinkElement(fixture))).toEqual('/a');
             async.done();
           });
     }));

  it('should navigate from a link click',
     inject([AsyncTestCompleter, Location], (async, location) => {
       compile(tcb, `<a [router-link]="['/Parent']">link to inner</a> | outer { <router-outlet></router-outlet> }`)
           .then((rtc) => {fixture = rtc})
           .then(
               (_) => rtr.config(
                   [new Route({path: '/a/...', component: ParentWithDefaultCmp, name: 'Parent'})]))
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

export function registerSpecs() {
  specs['syncRoutesWithoutChildrenWithoutParams'] = syncRoutesWithoutChildrenWithoutParams;
  specs['syncRoutesWithoutChildrenWithParams'] = syncRoutesWithoutChildrenWithParams;
  specs['syncRoutesWithSyncChildrenWithoutDefaultRoutesWithoutParams'] =
      syncRoutesWithSyncChildrenWithoutDefaultRoutesWithoutParams;
  specs['syncRoutesWithSyncChildrenWithoutDefaultRoutesWithParams'] =
      syncRoutesWithSyncChildrenWithoutDefaultRoutesWithParams;
  specs['syncRoutesWithSyncChildrenWithDefaultRoutesWithoutParams'] =
      syncRoutesWithSyncChildrenWithDefaultRoutesWithoutParams;
}
