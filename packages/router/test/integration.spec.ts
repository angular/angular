/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, HashLocationStrategy, Location, LocationStrategy} from '@angular/common';
import {provideLocationMocks, SpyLocation} from '@angular/common/testing';
import {ChangeDetectionStrategy, Component, EnvironmentInjector, inject as coreInject, Inject, Injectable, InjectionToken, NgModule, NgModuleRef, NgZone, OnDestroy, QueryList, Type, ViewChild, ViewChildren, ɵConsole as Console, ɵNoopNgZone as NoopNgZone} from '@angular/core';
import {ComponentFixture, fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ActivatedRoute, ActivatedRouteSnapshot, ActivationEnd, ActivationStart, ChildActivationEnd, ChildActivationStart, DefaultUrlSerializer, DetachedRouteHandle, Event, GuardsCheckEnd, GuardsCheckStart, Navigation, NavigationCancel, NavigationCancellationCode, NavigationEnd, NavigationError, NavigationSkipped, NavigationStart, ParamMap, Params, PreloadAllModules, PreloadingStrategy, PRIMARY_OUTLET, ResolveEnd, ResolveStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouteReuseStrategy, RouterEvent, RouterLink, RouterLinkActive, RouterModule, RouterOutlet, RouterPreloader, RouterStateSnapshot, RoutesRecognized, RunGuardsAndResolvers, UrlHandlingStrategy, UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree} from '@angular/router';
import {concat, EMPTY, Observable, Observer, of, Subscription} from 'rxjs';
import {delay, filter, first, last, map, mapTo, takeWhile, tap} from 'rxjs/operators';

import {CanActivateChildFn, CanActivateFn, CanMatchFn, Data, ResolveFn} from '../src/models';
import {provideRouter, withNavigationErrorHandler, withRouterConfig} from '../src/provide_router';
import {wrapIntoObservable} from '../src/utils/collection';
import {getLoadedRoutes} from '../src/utils/config';

const ROUTER_DIRECTIVES = [RouterLink, RouterLinkActive, RouterOutlet];

describe('Integration', () => {
  const noopConsole: Console = {log() {}, warn() {}};

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...ROUTER_DIRECTIVES, TestModule],
      providers: [
        {provide: Console, useValue: noopConsole},
        provideLocationMocks(),
        provideRouter([{path: 'simple', component: SimpleCmp}]),
      ]
    });
  });

  it('should navigate with a provided config',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = createRoot(router, RootCmp);

       router.navigateByUrl('/simple');
       advance(fixture);

       expect(location.path()).toEqual('/simple');
     })));

  it('should navigate from ngOnInit hook',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       router.resetConfig([
         {path: '', component: SimpleCmp},
         {path: 'one', component: RouteCmp},
       ]);

       const fixture = createRoot(router, RootCmpWithOnInit);
       expect(location.path()).toEqual('/one');
       expect(fixture.nativeElement).toHaveText('route');
     })));

  describe('navigation', function() {
    it('should navigate to the current URL', fakeAsync(() => {
         TestBed.configureTestingModule({
           providers: [
             provideRouter([], withRouterConfig({onSameUrlNavigation: 'reload'})),
           ]
         });
         const router = TestBed.inject(Router);
         router.resetConfig([
           {path: '', component: SimpleCmp},
           {path: 'simple', component: SimpleCmp},
         ]);

         const events: (NavigationStart|NavigationEnd)[] = [];
         router.events.subscribe(e => onlyNavigationStartAndEnd(e) && events.push(e));

         router.navigateByUrl('/simple');
         tick();

         router.navigateByUrl('/simple');
         tick();

         expectEvents(events, [
           [NavigationStart, '/simple'], [NavigationEnd, '/simple'], [NavigationStart, '/simple'],
           [NavigationEnd, '/simple']
         ]);
       }));

    it('should override default onSameUrlNavigation with extras', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([], withRouterConfig({onSameUrlNavigation: 'ignore'})),
        ]
      });
      const router = TestBed.inject(Router);
      router.resetConfig([
        {path: '', component: SimpleCmp},
        {path: 'simple', component: SimpleCmp},
      ]);

      const events: (NavigationStart|NavigationEnd)[] = [];
      router.events.subscribe(e => onlyNavigationStartAndEnd(e) && events.push(e));

      await router.navigateByUrl('/simple');
      await router.navigateByUrl('/simple');
      // By default, the second navigation is ignored
      expectEvents(events, [[NavigationStart, '/simple'], [NavigationEnd, '/simple']]);
      await router.navigateByUrl('/simple', {onSameUrlNavigation: 'reload'});
      // We overrode the `onSameUrlNavigation` value. This navigation should be processed.
      expectEvents(events, [
        [NavigationStart, '/simple'], [NavigationEnd, '/simple'], [NavigationStart, '/simple'],
        [NavigationEnd, '/simple']
      ]);
    });

    it('should ignore empty paths in relative links',
       fakeAsync(inject([Router], (router: Router) => {
         router.resetConfig([{
           path: 'foo',
           children: [{path: 'bar', children: [{path: '', component: RelativeLinkCmp}]}]
         }]);

         const fixture = createRoot(router, RootCmp);

         router.navigateByUrl('/foo/bar');
         advance(fixture);

         const link = fixture.nativeElement.querySelector('a');
         expect(link.getAttribute('href')).toEqual('/foo/simple');
       })));

    it('should set the restoredState to null when executing imperative navigations',
       fakeAsync(inject([Router], (router: Router) => {
         router.resetConfig([
           {path: '', component: SimpleCmp},
           {path: 'simple', component: SimpleCmp},
         ]);

         const fixture = createRoot(router, RootCmp);
         let event: NavigationStart;
         router.events.subscribe(e => {
           if (e instanceof NavigationStart) {
             event = e;
           }
         });

         router.navigateByUrl('/simple');
         tick();

         expect(event!.navigationTrigger).toEqual('imperative');
         expect(event!.restoredState).toEqual(null);
       })));

    it('should set history.state if passed using imperative navigation',
       fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
         router.resetConfig([
           {path: '', component: SimpleCmp},
           {path: 'simple', component: SimpleCmp},
         ]);

         const fixture = createRoot(router, RootCmp);
         let navigation: Navigation = null!;
         router.events.subscribe(e => {
           if (e instanceof NavigationStart) {
             navigation = router.getCurrentNavigation()!;
           }
         });

         router.navigateByUrl('/simple', {state: {foo: 'bar'}});
         tick();

         const history = (location as any)._history;
         expect(history[history.length - 1].state.foo).toBe('bar');
         expect(history[history.length - 1].state)
             .toEqual({foo: 'bar', navigationId: history.length});
         expect(navigation.extras.state).toBeDefined();
         expect(navigation.extras.state).toEqual({foo: 'bar'});
       })));

    it('should set history.state when navigation with browser back and forward',
       fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
         router.resetConfig([
           {path: '', component: SimpleCmp},
           {path: 'simple', component: SimpleCmp},
         ]);

         const fixture = createRoot(router, RootCmp);
         let navigation: Navigation = null!;
         router.events.subscribe(e => {
           if (e instanceof NavigationStart) {
             navigation = <Navigation>router.getCurrentNavigation()!;
           }
         });

         let state: Record<string, string> = {foo: 'bar'};
         router.navigateByUrl('/simple', {state});
         tick();
         location.back();
         tick();
         location.forward();
         tick();

         expect(navigation.extras.state).toBeDefined();
         expect(navigation.extras.state).toEqual(state);

         // Manually set state rather than using navigate()
         state = {bar: 'foo'};
         location.replaceState(location.path(), '', state);
         location.back();
         tick();
         location.forward();
         tick();

         expect(navigation.extras.state).toBeDefined();
         expect(navigation.extras.state).toEqual(state);
       })));

    it('should navigate correctly when using `Location#historyGo',
       fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
         router.resetConfig([
           {path: 'first', component: SimpleCmp},
           {path: 'second', component: SimpleCmp},

         ]);

         createRoot(router, RootCmp);

         router.navigateByUrl('/first');
         tick();
         router.navigateByUrl('/second');
         tick();
         expect(router.url).toEqual('/second');

         location.historyGo(-1);
         tick();
         expect(router.url).toEqual('/first');

         location.historyGo(1);
         tick();
         expect(router.url).toEqual('/second');

         location.historyGo(-100);
         tick();
         expect(router.url).toEqual('/second');

         location.historyGo(100);
         tick();
         expect(router.url).toEqual('/second');

         location.historyGo(0);
         tick();
         expect(router.url).toEqual('/second');

         location.historyGo();
         tick();
         expect(router.url).toEqual('/second');
       })));

    it('should not error if state is not {[key: string]: any}',
       fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
         router.resetConfig([
           {path: '', component: SimpleCmp},
           {path: 'simple', component: SimpleCmp},
         ]);

         const fixture = createRoot(router, RootCmp);
         let navigation: Navigation = null!;
         router.events.subscribe(e => {
           if (e instanceof NavigationStart) {
             navigation = <Navigation>router.getCurrentNavigation()!;
           }
         });

         location.replaceState('', '', 42);
         router.navigateByUrl('/simple');
         tick();
         location.back();
         advance(fixture);

         // Angular does not support restoring state to the primitive.
         expect(navigation.extras.state).toEqual(undefined);
         expect(location.getState()).toEqual({navigationId: 3});
       })));

    it('should not pollute browser history when replaceUrl is set to true',
       fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
         router.resetConfig([
           {path: '', component: SimpleCmp}, {path: 'a', component: SimpleCmp},
           {path: 'b', component: SimpleCmp}
         ]);

         const fixture = createRoot(router, RootCmp);

         router.navigateByUrl('/a', {replaceUrl: true});
         router.navigateByUrl('/b', {replaceUrl: true});
         tick();

         expect(location.urlChanges).toEqual(['replace: /', 'replace: /b']);
       })));

    it('should skip navigation if another navigation is already scheduled',
       fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
         router.resetConfig([
           {path: '', component: SimpleCmp}, {path: 'a', component: SimpleCmp},
           {path: 'b', component: SimpleCmp}
         ]);

         const fixture = createRoot(router, RootCmp);

         router.navigate(
             ['/a'], {queryParams: {a: true}, queryParamsHandling: 'merge', replaceUrl: true});
         router.navigate(
             ['/b'], {queryParams: {b: true}, queryParamsHandling: 'merge', replaceUrl: true});
         tick();

         /**
          * Why do we have '/b?b=true' and not '/b?a=true&b=true'?
          *
          * This is because the router has the right to stop a navigation mid-flight if another
          * navigation has been already scheduled. This is why we can use a top-level guard
          * to perform redirects. Calling `navigate` in such a guard will stop the navigation, and
          * the components won't be instantiated.
          *
          * This is a fundamental property of the router: it only cares about its latest state.
          *
          * This means that components should only map params to something else, not reduce them.
          * In other words, the following component is asking for trouble:
          *
          * ```
          * class MyComponent {
          *  constructor(a: ActivatedRoute) {
          *    a.params.scan(...)
          *  }
          * }
          * ```
          *
          * This also means "queryParamsHandling: 'merge'" should only be used to merge with
          * long-living query parameters (e.g., debug).
          */
         expect(router.url).toEqual('/b?b=true');
       })));
  });

  describe('navigation warning', () => {
    const isInAngularZoneFn = NgZone.isInAngularZone;
    let warnings: string[] = [];
    let isInAngularZone = true;

    class MockConsole {
      warn(message: string) {
        warnings.push(message);
      }
    }

    beforeEach(() => {
      warnings = [];
      isInAngularZone = true;
      NgZone.isInAngularZone = () => isInAngularZone;
      TestBed.overrideProvider(Console, {useValue: new MockConsole()});
    });

    afterEach(() => {
      NgZone.isInAngularZone = isInAngularZoneFn;
    });

    describe('with NgZone enabled', () => {
      it('should warn when triggered outside Angular zone',
         fakeAsync(inject([Router], (router: Router) => {
           isInAngularZone = false;
           router.navigateByUrl('/simple');

           expect(warnings.length).toBe(1);
           expect(warnings[0])
               .toBe(
                   `Navigation triggered outside Angular zone, did you forget to call 'ngZone.run()'?`);
         })));

      it('should not warn when triggered inside Angular zone',
         fakeAsync(inject([Router], (router: Router) => {
           router.navigateByUrl('/simple');

           expect(warnings.length).toBe(0);
         })));
    });

    describe('with NgZone disabled', () => {
      beforeEach(() => {
        TestBed.overrideProvider(NgZone, {useValue: new NoopNgZone()});
      });

      it('should not warn when triggered outside Angular zone',
         fakeAsync(inject([Router], (router: Router) => {
           isInAngularZone = false;
           router.navigateByUrl('/simple');

           expect(warnings.length).toBe(0);
         })));
    });
  });

  describe('should execute navigations serially', () => {
    let log: Array<string|Params> = [];

    beforeEach(() => {
      log = [];

      TestBed.configureTestingModule({
        providers: [
          {
            provide: 'trueRightAway',
            useValue: () => {
              log.push('trueRightAway');
              return true;
            }
          },
          {
            provide: 'trueIn2Seconds',
            useValue: () => {
              log.push('trueIn2Seconds-start');
              let res: ((value: boolean) => void);
              const p = new Promise<boolean>(r => res = r);
              setTimeout(() => {
                log.push('trueIn2Seconds-end');
                res(true);
              }, 2000);
              return p;
            }
          }
        ]
      });
    });

    describe('route activation', () => {
      @Component({template: '<router-outlet></router-outlet>'})
      class Parent {
        constructor(route: ActivatedRoute) {
          route.params.subscribe((s: Params) => {
            log.push(s);
          });
        }
      }

      @Component({
        template: `
         <router-outlet (deactivate)="logDeactivate('primary')"></router-outlet>
         <router-outlet name="first" (deactivate)="logDeactivate('first')"></router-outlet>
         <router-outlet name="second" (deactivate)="logDeactivate('second')"></router-outlet>
         `
      })
      class NamedOutletHost {
        logDeactivate(route: string) {
          log.push(route + ' deactivate');
        }
      }

      @Component({template: 'child1'})
      class Child1 {
        constructor() {
          log.push('child1 constructor');
        }
        ngOnDestroy() {
          log.push('child1 destroy');
        }
      }

      @Component({template: 'child2'})
      class Child2 {
        constructor() {
          log.push('child2 constructor');
        }
        ngOnDestroy() {
          log.push('child2 destroy');
        }
      }

      @Component({template: 'child3'})
      class Child3 {
        constructor() {
          log.push('child3 constructor');
        }
        ngOnDestroy() {
          log.push('child3 destroy');
        }
      }

      @NgModule({
        declarations: [Parent, NamedOutletHost, Child1, Child2, Child3],
        imports: [RouterModule.forRoot([])]
      })
      class TestModule {
      }

      it('should advance the parent route after deactivating its children', fakeAsync(() => {
           TestBed.configureTestingModule({imports: [TestModule]});
           const router = TestBed.inject(Router);
           const location = TestBed.inject(Location);
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{
             path: 'parent/:id',
             component: Parent,
             children: [
               {path: 'child1', component: Child1},
               {path: 'child2', component: Child2},
             ]
           }]);

           router.navigateByUrl('/parent/1/child1');
           advance(fixture);

           router.navigateByUrl('/parent/2/child2');
           advance(fixture);

           expect(location.path()).toEqual('/parent/2/child2');
           expect(log).toEqual([
             {id: '1'},
             'child1 constructor',
             'child1 destroy',
             {id: '2'},
             'child2 constructor',
           ]);
         }));

      it('should deactivate outlet children with componentless parent', fakeAsync(() => {
           TestBed.configureTestingModule({imports: [TestModule]});
           const router = TestBed.inject(Router);
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([
             {
               path: 'named-outlets',
               component: NamedOutletHost,
               children: [
                 {
                   path: 'home',
                   children: [
                     {path: '', component: Child1, outlet: 'first'},
                     {path: '', component: Child2, outlet: 'second'},
                     {path: 'primary', component: Child3},
                   ]
                 },
                 {
                   path: 'about',
                   children: [
                     {path: '', component: Child1, outlet: 'first'},
                     {path: '', component: Child2, outlet: 'second'},
                   ]
                 },

               ]
             },
             {
               path: 'other',
               component: Parent,
             },
           ]);

           router.navigateByUrl('/named-outlets/home/primary');
           advance(fixture);
           expect(log).toEqual([
             'child3 constructor',  // primary outlet always first
             'child1 constructor',
             'child2 constructor',
           ]);
           log.length = 0;

           router.navigateByUrl('/named-outlets/about');
           advance(fixture);
           expect(log).toEqual([
             'child3 destroy',
             'primary deactivate',
             'child1 destroy',
             'first deactivate',
             'child2 destroy',
             'second deactivate',
             'child1 constructor',
             'child2 constructor',
           ]);
           log.length = 0;

           router.navigateByUrl('/other');
           advance(fixture);
           expect(log).toEqual([
             'child1 destroy',
             'first deactivate',
             'child2 destroy',
             'second deactivate',
             // route param subscription from 'Parent' component
             {},
           ]);
         }));

      it('should work between aux outlets under two levels of empty path parents', fakeAsync(() => {
           TestBed.configureTestingModule({imports: [TestModule]});
           const router = TestBed.inject(Router);
           router.resetConfig([{
             path: '',
             children: [
               {
                 path: '',
                 component: NamedOutletHost,
                 children: [
                   {path: 'one', component: Child1, outlet: 'first'},
                   {path: 'two', component: Child2, outlet: 'first'},
                 ]
               },
             ]
           }]);

           const fixture = createRoot(router, RootCmp);

           router.navigateByUrl('/(first:one)');
           advance(fixture);
           expect(log).toEqual(['child1 constructor']);

           log.length = 0;
           router.navigateByUrl('/(first:two)');
           advance(fixture);
           expect(log).toEqual([
             'child1 destroy',
             'first deactivate',
             'child2 constructor',
           ]);
         }));
    });

    it('should not wait for prior navigations to start a new navigation',
       fakeAsync(inject([Router, Location], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {path: 'a', component: SimpleCmp, canActivate: ['trueRightAway', 'trueIn2Seconds']},
           {path: 'b', component: SimpleCmp, canActivate: ['trueRightAway', 'trueIn2Seconds']}
         ]);

         router.navigateByUrl('/a');
         tick(100);
         fixture.detectChanges();

         router.navigateByUrl('/b');
         tick(100);  // 200
         fixture.detectChanges();

         expect(log).toEqual(
             ['trueRightAway', 'trueIn2Seconds-start', 'trueRightAway', 'trueIn2Seconds-start']);

         tick(2000);  // 2200
         fixture.detectChanges();

         expect(log).toEqual([
           'trueRightAway', 'trueIn2Seconds-start', 'trueRightAway', 'trueIn2Seconds-start',
           'trueIn2Seconds-end', 'trueIn2Seconds-end'
         ]);
       })));
  });

  it('Should work inside ChangeDetectionStrategy.OnPush components', fakeAsync(() => {
       @Component({
         selector: 'root-cmp',
         template: `<router-outlet></router-outlet>`,
         changeDetection: ChangeDetectionStrategy.OnPush,
       })
       class OnPushOutlet {
       }

       @Component({selector: 'need-cd', template: `{{'it works!'}}`})
       class NeedCdCmp {
       }

       @NgModule({
         declarations: [OnPushOutlet, NeedCdCmp],
         imports: [RouterModule.forRoot([])],
       })
       class TestModule {
       }

       TestBed.configureTestingModule({imports: [TestModule]});

       const router: Router = TestBed.inject(Router);
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{
         path: 'on',
         component: OnPushOutlet,
         children: [{
           path: 'push',
           component: NeedCdCmp,
         }],
       }]);

       advance(fixture);
       router.navigateByUrl('on');
       advance(fixture);
       router.navigateByUrl('on/push');
       advance(fixture);

       expect(fixture.nativeElement).toHaveText('it works!');
     }));

  it('should not error when no url left and no children are matching',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([
         {path: 'team/:id', component: TeamCmp, children: [{path: 'simple', component: SimpleCmp}]}
       ]);

       router.navigateByUrl('/team/33/simple');
       advance(fixture);

       expect(location.path()).toEqual('/team/33/simple');
       expect(fixture.nativeElement).toHaveText('team 33 [ simple, right:  ]');

       router.navigateByUrl('/team/33');
       advance(fixture);

       expect(location.path()).toEqual('/team/33');
       expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
     })));

  it('should work when an outlet is in an ngIf',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{
         path: 'child',
         component: OutletInNgIf,
         children: [{path: 'simple', component: SimpleCmp}]
       }]);

       router.navigateByUrl('/child/simple');
       advance(fixture);

       expect(location.path()).toEqual('/child/simple');
     })));

  it('should work when an outlet is added/removed', fakeAsync(() => {
       @Component({
         selector: 'someRoot',
         template: `[<div *ngIf="cond"><router-outlet></router-outlet></div>]`
       })
       class RootCmpWithLink {
         cond: boolean = true;
       }
       TestBed.configureTestingModule({declarations: [RootCmpWithLink]});

       const router: Router = TestBed.inject(Router);

       const fixture = createRoot(router, RootCmpWithLink);

       router.resetConfig([
         {path: 'simple', component: SimpleCmp},
         {path: 'blank', component: BlankCmp},
       ]);

       router.navigateByUrl('/simple');
       advance(fixture);
       expect(fixture.nativeElement).toHaveText('[simple]');

       fixture.componentInstance.cond = false;
       advance(fixture);
       expect(fixture.nativeElement).toHaveText('[]');

       fixture.componentInstance.cond = true;
       advance(fixture);
       expect(fixture.nativeElement).toHaveText('[simple]');
     }));

  it('should update location when navigating', fakeAsync(() => {
       @Component({template: `record`})
       class RecordLocationCmp {
         private storedPath: string;
         constructor(loc: Location) {
           this.storedPath = loc.path();
         }
       }

       @NgModule({declarations: [RecordLocationCmp]})
       class TestModule {
       }

       TestBed.configureTestingModule({imports: [TestModule]});

       const router = TestBed.inject(Router);
       const location = TestBed.inject(Location);
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'record/:id', component: RecordLocationCmp}]);

       router.navigateByUrl('/record/22');
       advance(fixture);

       const c = fixture.debugElement.children[1].componentInstance;
       expect(location.path()).toEqual('/record/22');
       expect(c.storedPath).toEqual('/record/22');

       router.navigateByUrl('/record/33');
       advance(fixture);
       expect(location.path()).toEqual('/record/33');
     }));

  it('should skip location update when using NavigationExtras.skipLocationChange with navigateByUrl',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = TestBed.createComponent(RootCmp);
       advance(fixture);

       router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

       router.navigateByUrl('/team/22');
       advance(fixture);
       expect(location.path()).toEqual('/team/22');

       expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');

       router.navigateByUrl('/team/33', {skipLocationChange: true});
       advance(fixture);

       expect(location.path()).toEqual('/team/22');

       expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
     })));

  it('should skip location update when using NavigationExtras.skipLocationChange with navigate',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = TestBed.createComponent(RootCmp);
       advance(fixture);

       router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

       router.navigate(['/team/22']);
       advance(fixture);
       expect(location.path()).toEqual('/team/22');

       expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');

       router.navigate(['/team/33'], {skipLocationChange: true});
       advance(fixture);

       expect(location.path()).toEqual('/team/22');

       expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
     })));

  it('should navigate after navigation with skipLocationChange',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = TestBed.createComponent(RootCmpWithNamedOutlet);
       advance(fixture);

       router.resetConfig([{path: 'show', outlet: 'main', component: SimpleCmp}]);

       router.navigate([{outlets: {main: 'show'}}], {skipLocationChange: true});
       advance(fixture);
       expect(location.path()).toEqual('');

       expect(fixture.nativeElement).toHaveText('main [simple]');

       router.navigate([{outlets: {main: null}}], {skipLocationChange: true});
       advance(fixture);

       expect(location.path()).toEqual('');

       expect(fixture.nativeElement).toHaveText('main []');
     })));

  describe('"eager" urlUpdateStrategy', () => {
    @Injectable()
    class AuthGuard {
      canActivateResult = true;

      canActivate() {
        return this.canActivateResult;
      }
    }
    @Injectable()
    class DelayedGuard {
      canActivate() {
        return of('').pipe(delay(1000), mapTo(true));
      }
    }

    beforeEach(() => {
      const serializer = new DefaultUrlSerializer();
      TestBed.configureTestingModule({
        providers: [
          {
            provide: 'authGuardFail',
            useValue: (a: any, b: any) => {
              return new Promise(res => {
                setTimeout(() => res(serializer.parse('/login')), 1);
              });
            }
          },
          AuthGuard,
          DelayedGuard,
        ]
      });
    });


    it('should eagerly update the URL with urlUpdateStrategy="eager"',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = TestBed.createComponent(RootCmp);
         advance(fixture);

         router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

         router.navigateByUrl('/team/22');
         advance(fixture);
         expect(location.path()).toEqual('/team/22');

         expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');

         router.urlUpdateStrategy = 'eager';
         router.events.subscribe(e => {
           if (!(e instanceof GuardsCheckStart)) {
             return;
           }
           expect(location.path()).toEqual('/team/33');
           expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');
           return of(null);
         });
         router.navigateByUrl('/team/33');

         advance(fixture);
         expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
       })));

    it('should eagerly update the URL with urlUpdateStrategy="eager"',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = TestBed.createComponent(RootCmp);
         advance(fixture);

         router.urlUpdateStrategy = 'eager';

         router.resetConfig([
           {path: 'team/:id', component: SimpleCmp, canActivate: ['authGuardFail']},
           {path: 'login', component: AbsoluteSimpleLinkCmp}
         ]);

         router.navigateByUrl('/team/22');
         advance(fixture);
         expect(location.path()).toEqual('/team/22');

         // Redirects to /login
         advance(fixture, 1);
         expect(location.path()).toEqual('/login');

         // Perform the same logic again, and it should produce the same result
         router.navigateByUrl('/team/22');
         advance(fixture);
         expect(location.path()).toEqual('/team/22');

         // Redirects to /login
         advance(fixture, 1);
         expect(location.path()).toEqual('/login');
       })));

    it('should set browserUrlTree with urlUpdateStrategy="eager" and false `shouldProcessUrl`',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = TestBed.createComponent(RootCmp);
         advance(fixture);

         router.urlUpdateStrategy = 'eager';

         router.resetConfig([
           {path: 'team/:id', component: SimpleCmp},
           {path: 'login', component: AbsoluteSimpleLinkCmp}
         ]);

         router.navigateByUrl('/team/22');
         advance(fixture, 1);

         expect((router as any).browserUrlTree.toString()).toBe('/team/22');

         // Force to not process URL changes
         router.urlHandlingStrategy.shouldProcessUrl = (url: UrlTree) => false;

         router.navigateByUrl('/login');
         advance(fixture, 1);

         // Do not change locations
         expect((router as any).browserUrlTree.toString()).toBe('/team/22');
       })));

    it('should eagerly update URL after redirects are applied with urlUpdateStrategy="eager"',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = TestBed.createComponent(RootCmp);
         advance(fixture);

         router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

         router.navigateByUrl('/team/22');
         advance(fixture);
         expect(location.path()).toEqual('/team/22');

         expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');

         router.urlUpdateStrategy = 'eager';

         let urlAtNavStart = '';
         let urlAtRoutesRecognized = '';
         router.events.subscribe(e => {
           if (e instanceof NavigationStart) {
             urlAtNavStart = location.path();
           }
           if (e instanceof RoutesRecognized) {
             urlAtRoutesRecognized = location.path();
           }
         });

         router.navigateByUrl('/team/33');

         advance(fixture);
         expect(urlAtNavStart).toBe('/team/22');
         expect(urlAtRoutesRecognized).toBe('/team/33');
         expect(fixture.nativeElement).toHaveText('team 33 [ , right:  ]');
       })));

    it('should set `state` with urlUpdateStrategy="eager"',
       fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
         router.urlUpdateStrategy = 'eager';
         router.resetConfig([
           {path: '', component: SimpleCmp},
           {path: 'simple', component: SimpleCmp},
         ]);

         const fixture = createRoot(router, RootCmp);
         let navigation: Navigation = null!;
         router.events.subscribe(e => {
           if (e instanceof NavigationStart) {
             navigation = router.getCurrentNavigation()!;
           }
         });

         router.navigateByUrl('/simple', {state: {foo: 'bar'}});
         tick();

         const history = (location as any)._history;
         expect(history[history.length - 1].state.foo).toBe('bar');
         expect(history[history.length - 1].state)
             .toEqual({foo: 'bar', navigationId: history.length});
         expect(navigation.extras.state).toBeDefined();
         expect(navigation.extras.state).toEqual({foo: 'bar'});
       })));

    it('can renavigate to rejected URL', fakeAsync(() => {
         const router = TestBed.inject(Router);
         const canActivate = TestBed.inject(AuthGuard);
         const location = TestBed.inject(Location) as SpyLocation;
         router.urlUpdateStrategy = 'eager';
         router.resetConfig([
           {path: '', component: BlankCmp},
           {
             path: 'simple',
             component: SimpleCmp,
             canActivate: [() => coreInject(AuthGuard).canActivate()]
           },
         ]);
         const fixture = createRoot(router, RootCmp);

         // Try to navigate to /simple but guard rejects
         canActivate.canActivateResult = false;
         router.navigateByUrl('/simple');
         advance(fixture);
         expect(location.path()).toEqual('/');
         expect(fixture.nativeElement.innerHTML).not.toContain('simple');

         // Renavigate to /simple without guard rejection, should succeed.
         canActivate.canActivateResult = true;
         router.navigateByUrl('/simple');
         advance(fixture);
         expect(location.path()).toEqual('/simple');
         expect(fixture.nativeElement.innerHTML).toContain('simple');
       }));

    it('can renavigate to same URL during in-flight navigation', fakeAsync(() => {
         const router = TestBed.inject(Router);
         const location = TestBed.inject(Location) as SpyLocation;
         router.urlUpdateStrategy = 'eager';
         router.resetConfig([
           {path: '', component: BlankCmp},
           {
             path: 'simple',
             component: SimpleCmp,
             canActivate: [() => coreInject(DelayedGuard).canActivate()]
           },
         ]);
         const fixture = createRoot(router, RootCmp);

         // Start navigating to /simple, but do not flush the guard delay
         router.navigateByUrl('/simple');
         tick();
         // eager update strategy so URL is already updated.
         expect(location.path()).toEqual('/simple');
         expect(fixture.nativeElement.innerHTML).not.toContain('simple');

         // Start an additional navigation to /simple and ensure at least one of those succeeds.
         // It's not super important which one gets processed, but in the past, the router would
         // cancel the in-flight one and not process the new one.
         router.navigateByUrl('/simple');
         tick(1000);
         expect(location.path()).toEqual('/simple');
         expect(fixture.nativeElement.innerHTML).toContain('simple');
       }));
  });

  it('should navigate back and forward',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{
         path: 'team/:id',
         component: TeamCmp,
         children:
             [{path: 'simple', component: SimpleCmp}, {path: 'user/:name', component: UserCmp}]
       }]);

       let event: NavigationStart;
       router.events.subscribe(e => {
         if (e instanceof NavigationStart) {
           event = e;
         }
       });

       router.navigateByUrl('/team/33/simple');
       advance(fixture);
       expect(location.path()).toEqual('/team/33/simple');
       const simpleNavStart = event!;

       router.navigateByUrl('/team/22/user/victor');
       advance(fixture);
       const userVictorNavStart = event!;


       location.back();
       advance(fixture);
       expect(location.path()).toEqual('/team/33/simple');
       expect(event!.navigationTrigger).toEqual('popstate');
       expect(event!.restoredState!.navigationId).toEqual(simpleNavStart.id);

       location.forward();
       advance(fixture);
       expect(location.path()).toEqual('/team/22/user/victor');
       expect(event!.navigationTrigger).toEqual('popstate');
       expect(event!.restoredState!.navigationId).toEqual(userVictorNavStart.id);
     })));

  it('should navigate to the same url when config changes',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'a', component: SimpleCmp}]);

       router.navigate(['/a']);
       advance(fixture);
       expect(location.path()).toEqual('/a');
       expect(fixture.nativeElement).toHaveText('simple');

       router.resetConfig([{path: 'a', component: RouteCmp}]);

       router.navigate(['/a']);
       advance(fixture);
       expect(location.path()).toEqual('/a');
       expect(fixture.nativeElement).toHaveText('route');
     })));

  it('should navigate when locations changes',
     fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{
         path: 'team/:id',
         component: TeamCmp,
         children: [{path: 'user/:name', component: UserCmp}]
       }]);

       const recordedEvents: (NavigationStart|NavigationEnd)[] = [];
       router.events.forEach(e => onlyNavigationStartAndEnd(e) && recordedEvents.push(e));

       router.navigateByUrl('/team/22/user/victor');
       advance(fixture);

       location.simulateHashChange('/team/22/user/fedor');
       advance(fixture);

       location.simulateUrlPop('/team/22/user/fedor');
       advance(fixture);

       expect(fixture.nativeElement).toHaveText('team 22 [ user fedor, right:  ]');

       expectEvents(recordedEvents, [
         [NavigationStart, '/team/22/user/victor'], [NavigationEnd, '/team/22/user/victor'],
         [NavigationStart, '/team/22/user/fedor'], [NavigationEnd, '/team/22/user/fedor']
       ]);
     })));

  it('should update the location when the matched route does not change',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: '**', component: CollectParamsCmp}]);

       router.navigateByUrl('/one/two');
       advance(fixture);
       const cmp = fixture.debugElement.children[1].componentInstance;
       expect(location.path()).toEqual('/one/two');
       expect(fixture.nativeElement).toHaveText('collect-params');

       expect(cmp.recordedUrls()).toEqual(['one/two']);

       router.navigateByUrl('/three/four');
       advance(fixture);
       expect(location.path()).toEqual('/three/four');
       expect(fixture.nativeElement).toHaveText('collect-params');
       expect(cmp.recordedUrls()).toEqual(['one/two', 'three/four']);
     })));

  describe('duplicate in-flight navigations', () => {
    @Injectable()
    class RedirectingGuard {
      skipLocationChange = false;
      constructor(private router: Router) {}
      canActivate() {
        this.router.navigate(['/simple'], {skipLocationChange: this.skipLocationChange});
        return false;
      }
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: 'in1Second',
            useValue: (c: any, a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
              let res: any = null;
              const p = new Promise(_ => res = _);
              setTimeout(() => res(true), 1000);
              return p;
            }
          },
          RedirectingGuard
        ]
      });
    });

    it('should reset location if a navigation by location is successful', fakeAsync(() => {
         const router = TestBed.inject(Router);
         const location = TestBed.inject(Location) as SpyLocation;
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{path: 'simple', component: SimpleCmp, canActivate: ['in1Second']}]);

         // Trigger two location changes to the same URL.
         // Because of the guard the order will look as follows:
         // - location change 'simple'
         // - start processing the change, start a guard
         // - location change 'simple'
         // - the first location change gets canceled, the URL gets reset to '/'
         // - the second location change gets finished, the URL should be reset to '/simple'
         location.simulateUrlPop('/simple');
         location.simulateUrlPop('/simple');

         tick(2000);
         advance(fixture);

         expect(location.path()).toEqual('/simple');
       }));

    it('should skip duplicate location events', fakeAsync(() => {
         const router = TestBed.inject(Router);
         const location = TestBed.inject(Location) as unknown as SpyLocation;
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {
             path: 'blocked',
             component: BlankCmp,
             canActivate: [() => coreInject(RedirectingGuard).canActivate()]
           },
           {path: 'simple', component: SimpleCmp}
         ]);
         router.navigateByUrl('/simple');
         advance(fixture);

         location.simulateHashChange('/blocked');

         advance(fixture);
         expect(fixture.nativeElement.innerHTML).toContain('simple');
       }));

    it('should not cause URL thrashing', fakeAsync(() => {
         const router = TestBed.inject(Router);
         const location = TestBed.inject(Location) as unknown as SpyLocation;
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {path: 'home', component: SimpleCmp}, {
             path: 'blocked',
             component: BlankCmp,
             canActivate: [() => coreInject(RedirectingGuard).canActivate()]
           },
           {path: 'simple', component: SimpleCmp}
         ]);
         router.navigateByUrl('/home');
         advance(fixture);
         location.urlChanges = [];

         location.simulateHashChange('/blocked');
         advance(fixture);
         expect(fixture.nativeElement.innerHTML).toContain('simple');
         expect(location.urlChanges).toEqual(['hash: /blocked', '/simple']);
       }));

    it('can render a 404 page without changing the URL', fakeAsync(() => {
         const router = TestBed.inject(Router);
         router.urlUpdateStrategy = 'eager';
         TestBed.inject(RedirectingGuard).skipLocationChange = true;
         const location = TestBed.inject(Location) as unknown as SpyLocation;
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {path: 'home', component: SimpleCmp},
           {
             path: 'blocked',
             component: BlankCmp,
             canActivate: [() => coreInject(RedirectingGuard).canActivate()]
           },
           {path: 'simple', redirectTo: '404'},
           {path: '404', component: SimpleCmp},
         ]);
         router.navigateByUrl('/home');
         advance(fixture);
         location.urlChanges = [];

         location.simulateHashChange('/blocked');
         advance(fixture);
         expect(location.path()).toEqual('/blocked');
         expect(fixture.nativeElement.innerHTML).toContain('simple');
         expect(location.urlChanges).toEqual(['hash: /blocked']);
       }));

    it('should accurately track currentNavigation', fakeAsync(() => {
         const router = TestBed.inject(Router);
         router.resetConfig([
           {path: 'one', component: SimpleCmp, canActivate: ['in1Second']},
           {path: 'two', component: BlankCmp, canActivate: ['in1Second']},
         ]);

         router.events.subscribe((e) => {
           if (e instanceof NavigationStart) {
             if (e.url === '/one') {
               router.navigateByUrl('two');
             }
             router.events.subscribe((e) => {
               if (e instanceof GuardsCheckEnd) {
                 expect(router.getCurrentNavigation()?.extractedUrl.toString()).toEqual('/two');
                 expect(router.getCurrentNavigation()?.extras).toBeDefined();
               }
             });
           }
         });

         router.navigateByUrl('one');
         tick(1000);
       }));
  });

  it('should support secondary routes', fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{
         path: 'team/:id',
         component: TeamCmp,
         children: [
           {path: 'user/:name', component: UserCmp},
           {path: 'simple', component: SimpleCmp, outlet: 'right'}
         ]
       }]);

       router.navigateByUrl('/team/22/(user/victor//right:simple)');
       advance(fixture);

       expect(fixture.nativeElement).toHaveText('team 22 [ user victor, right: simple ]');
     })));

  it('should support secondary routes in separate commands',
     fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{
         path: 'team/:id',
         component: TeamCmp,
         children: [
           {path: 'user/:name', component: UserCmp},
           {path: 'simple', component: SimpleCmp, outlet: 'right'}
         ]
       }]);

       router.navigateByUrl('/team/22/user/victor');
       advance(fixture);
       router.navigate(['team/22', {outlets: {right: 'simple'}}]);
       advance(fixture);

       expect(fixture.nativeElement).toHaveText('team 22 [ user victor, right: simple ]');
     })));

  it('should support secondary routes as child of empty path parent',
     fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{
         path: '',
         component: TeamCmp,
         children: [{path: 'simple', component: SimpleCmp, outlet: 'right'}]
       }]);

       router.navigateByUrl('/(right:simple)');
       advance(fixture);

       expect(fixture.nativeElement).toHaveText('team  [ , right: simple ]');
     })));

  it('should deactivate outlets', fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{
         path: 'team/:id',
         component: TeamCmp,
         children: [
           {path: 'user/:name', component: UserCmp},
           {path: 'simple', component: SimpleCmp, outlet: 'right'}
         ]
       }]);

       router.navigateByUrl('/team/22/(user/victor//right:simple)');
       advance(fixture);

       router.navigateByUrl('/team/22/user/victor');
       advance(fixture);

       expect(fixture.nativeElement).toHaveText('team 22 [ user victor, right:  ]');
     })));

  it('should deactivate nested outlets', fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([
         {
           path: 'team/:id',
           component: TeamCmp,
           children: [
             {path: 'user/:name', component: UserCmp},
             {path: 'simple', component: SimpleCmp, outlet: 'right'}
           ]
         },
         {path: '', component: BlankCmp}
       ]);

       router.navigateByUrl('/team/22/(user/victor//right:simple)');
       advance(fixture);

       router.navigateByUrl('/');
       advance(fixture);

       expect(fixture.nativeElement).toHaveText('');
     })));

  it('should set query params and fragment', fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'query', component: QueryParamsAndFragmentCmp}]);

       router.navigateByUrl('/query?name=1#fragment1');
       advance(fixture);
       expect(fixture.nativeElement).toHaveText('query: 1 fragment: fragment1');

       router.navigateByUrl('/query?name=2#fragment2');
       advance(fixture);
       expect(fixture.nativeElement).toHaveText('query: 2 fragment: fragment2');
     })));

  it('should handle empty or missing fragments', fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'query', component: QueryParamsAndFragmentCmp}]);

       router.navigateByUrl('/query#');
       advance(fixture);
       expect(fixture.nativeElement).toHaveText('query:  fragment: ');

       router.navigateByUrl('/query');
       advance(fixture);
       expect(fixture.nativeElement).toHaveText('query:  fragment: null');
     })));

  it('should ignore null and undefined query params',
     fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'query', component: EmptyQueryParamsCmp}]);

       router.navigate(['query'], {queryParams: {name: 1, age: null, page: undefined}});
       advance(fixture);
       const cmp = fixture.debugElement.children[1].componentInstance;
       expect(cmp.recordedParams).toEqual([{name: '1'}]);
     })));

  it('should throw an error when one of the commands is null/undefined',
     fakeAsync(inject([Router], (router: Router) => {
       createRoot(router, RootCmp);

       router.resetConfig([{path: 'query', component: EmptyQueryParamsCmp}]);

       expect(() => router.navigate([
         undefined, 'query'
       ])).toThrowError(/The requested path contains undefined segment at index 0/);
     })));

  it('should push params only when they change', fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{
         path: 'team/:id',
         component: TeamCmp,
         children: [{path: 'user/:name', component: UserCmp}]
       }]);

       router.navigateByUrl('/team/22/user/victor');
       advance(fixture);
       const team = fixture.debugElement.children[1].componentInstance;
       const user = fixture.debugElement.children[1].children[1].componentInstance;

       expect(team.recordedParams).toEqual([{id: '22'}]);
       expect(team.snapshotParams).toEqual([{id: '22'}]);
       expect(user.recordedParams).toEqual([{name: 'victor'}]);
       expect(user.snapshotParams).toEqual([{name: 'victor'}]);

       router.navigateByUrl('/team/22/user/fedor');
       advance(fixture);

       expect(team.recordedParams).toEqual([{id: '22'}]);
       expect(team.snapshotParams).toEqual([{id: '22'}]);
       expect(user.recordedParams).toEqual([{name: 'victor'}, {name: 'fedor'}]);
       expect(user.snapshotParams).toEqual([{name: 'victor'}, {name: 'fedor'}]);
     })));

  it('should work when navigating to /', fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([
         {path: '', pathMatch: 'full', component: SimpleCmp},
         {path: 'user/:name', component: UserCmp}
       ]);

       router.navigateByUrl('/user/victor');
       advance(fixture);

       expect(fixture.nativeElement).toHaveText('user victor');

       router.navigateByUrl('/');
       advance(fixture);

       expect(fixture.nativeElement).toHaveText('simple');
     })));

  it('should cancel in-flight navigations', fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'user/:name', component: UserCmp}]);

       const recordedEvents: Event[] = [];
       router.events.forEach(e => recordedEvents.push(e));

       router.navigateByUrl('/user/init');
       advance(fixture);

       const user = fixture.debugElement.children[1].componentInstance;

       let r1: any, r2: any;
       router.navigateByUrl('/user/victor').then(_ => r1 = _);
       router.navigateByUrl('/user/fedor').then(_ => r2 = _);
       advance(fixture);

       expect(r1).toEqual(false);  // returns false because it was canceled
       expect(r2).toEqual(true);   // returns true because it was successful

       expect(fixture.nativeElement).toHaveText('user fedor');
       expect(user.recordedParams).toEqual([{name: 'init'}, {name: 'fedor'}]);

       expectEvents(recordedEvents, [
         [NavigationStart, '/user/init'],
         [RoutesRecognized, '/user/init'],
         [GuardsCheckStart, '/user/init'],
         [ChildActivationStart],
         [ActivationStart],
         [GuardsCheckEnd, '/user/init'],
         [ResolveStart, '/user/init'],
         [ResolveEnd, '/user/init'],
         [ActivationEnd],
         [ChildActivationEnd],
         [NavigationEnd, '/user/init'],

         [NavigationStart, '/user/victor'],
         [NavigationCancel, '/user/victor'],

         [NavigationStart, '/user/fedor'],
         [RoutesRecognized, '/user/fedor'],
         [GuardsCheckStart, '/user/fedor'],
         [ChildActivationStart],
         [ActivationStart],
         [GuardsCheckEnd, '/user/fedor'],
         [ResolveStart, '/user/fedor'],
         [ResolveEnd, '/user/fedor'],
         [ActivationEnd],
         [ChildActivationEnd],
         [NavigationEnd, '/user/fedor']
       ]);
     })));

  it('should properly set currentNavigation when cancelling in-flight navigations',
     fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'user/:name', component: UserCmp}]);

       router.navigateByUrl('/user/init');
       advance(fixture);

       router.navigateByUrl('/user/victor');
       expect(router.getCurrentNavigation()).not.toBe(null);
       router.navigateByUrl('/user/fedor');
       // Due to https://github.com/angular/angular/issues/29389, this would be `false`
       // when running a second navigation.
       expect(router.getCurrentNavigation()).not.toBe(null);
       advance(fixture);

       expect(router.getCurrentNavigation()).toBe(null);
       expect(fixture.nativeElement).toHaveText('user fedor');
     })));

  it('should handle failed navigations gracefully', fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'user/:name', component: UserCmp}]);

       const recordedEvents: Event[] = [];
       router.events.forEach(e => recordedEvents.push(e));

       let e: any;
       router.navigateByUrl('/invalid').catch(_ => e = _);
       advance(fixture);
       expect(e.message).toContain('Cannot match any routes');

       router.navigateByUrl('/user/fedor');
       advance(fixture);

       expect(fixture.nativeElement).toHaveText('user fedor');

       expectEvents(recordedEvents, [
         [NavigationStart, '/invalid'], [NavigationError, '/invalid'],

         [NavigationStart, '/user/fedor'], [RoutesRecognized, '/user/fedor'],
         [GuardsCheckStart, '/user/fedor'], [ChildActivationStart], [ActivationStart],
         [GuardsCheckEnd, '/user/fedor'], [ResolveStart, '/user/fedor'],
         [ResolveEnd, '/user/fedor'], [ActivationEnd], [ChildActivationEnd],
         [NavigationEnd, '/user/fedor']
       ]);
     })));

  it('should be able to provide an error handler with DI dependencies', async () => {
    @Injectable({providedIn: 'root'})
    class Handler {
      handlerCalled = false;
    }
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
            [{
              path: 'throw',
              canMatch: [() => {
                throw new Error('');
              }],
              component: BlankCmp
            }],
            withNavigationErrorHandler(() => coreInject(Handler).handlerCalled = true)),
      ]
    });
    const router = TestBed.inject(Router);
    await expectAsync(router.navigateByUrl('/throw')).toBeRejected();
    expect(TestBed.inject(Handler).handlerCalled).toBeTrue();
  });

  // Errors should behave the same for both deferred and eager URL update strategies
  ['deferred', 'eager'].forEach((strat: any) => {
    it('should dispatch NavigationError after the url has been reset back', fakeAsync(() => {
         const router: Router = TestBed.inject(Router);
         const location = TestBed.inject(Location) as SpyLocation;
         const fixture = createRoot(router, RootCmp);

         router.resetConfig(
             [{path: 'simple', component: SimpleCmp}, {path: 'throwing', component: ThrowingCmp}]);
         router.urlUpdateStrategy = strat;

         router.navigateByUrl('/simple');
         advance(fixture);

         let routerUrlBeforeEmittingError = '';
         let locationUrlBeforeEmittingError = '';
         router.events.forEach(e => {
           if (e instanceof NavigationError) {
             routerUrlBeforeEmittingError = router.url;
             locationUrlBeforeEmittingError = location.path();
           }
         });
         router.navigateByUrl('/throwing').catch(() => null);
         advance(fixture);

         expect(routerUrlBeforeEmittingError).toEqual('/simple');
         expect(locationUrlBeforeEmittingError).toEqual('/simple');
       }));

    it('can renavigate to throwing component', fakeAsync(() => {
         const router = TestBed.inject(Router);
         const location = TestBed.inject(Location) as SpyLocation;
         router.urlUpdateStrategy = 'eager';
         router.resetConfig([
           {path: '', component: BlankCmp},
           {path: 'throwing', component: ConditionalThrowingCmp},
         ]);
         const fixture = createRoot(router, RootCmp);

         // Try navigating to a component which throws an error during activation.
         ConditionalThrowingCmp.throwError = true;
         expect(() => {
           router.navigateByUrl('/throwing');
           advance(fixture);
         }).toThrow();
         expect(location.path()).toEqual('/');
         expect(fixture.nativeElement.innerHTML).not.toContain('throwing');

         // Ensure we can re-navigate to that same URL and succeed.
         ConditionalThrowingCmp.throwError = false;
         router.navigateByUrl('/throwing');
         advance(fixture);
         expect(location.path()).toEqual('/throwing');
         expect(fixture.nativeElement.innerHTML).toContain('throwing');
       }));

    it('should reset the url with the right state when navigation errors', fakeAsync(() => {
         const router: Router = TestBed.inject(Router);
         const location = TestBed.inject(Location) as SpyLocation;
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {path: 'simple1', component: SimpleCmp}, {path: 'simple2', component: SimpleCmp},
           {path: 'throwing', component: ThrowingCmp}
         ]);
         router.urlUpdateStrategy = strat;

         let event: NavigationStart;
         router.events.subscribe(e => {
           if (e instanceof NavigationStart) {
             event = e;
           }
         });

         router.navigateByUrl('/simple1');
         advance(fixture);
         const simple1NavStart = event!;

         router.navigateByUrl('/throwing').catch(() => null);
         advance(fixture);

         router.navigateByUrl('/simple2');
         advance(fixture);

         location.back();
         tick();

         expect(event!.restoredState!.navigationId).toEqual(simple1NavStart.id);
       }));

    it('should not trigger another navigation when resetting the url back due to a NavigationError',
       fakeAsync(() => {
         const router = TestBed.inject(Router);
         router.onSameUrlNavigation = 'reload';

         const fixture = createRoot(router, RootCmp);

         router.resetConfig(
             [{path: 'simple', component: SimpleCmp}, {path: 'throwing', component: ThrowingCmp}]);
         router.urlUpdateStrategy = strat;

         const events: any[] = [];
         router.events.forEach((e: any) => {
           if (e instanceof NavigationStart) {
             events.push(e.url);
           }
         });

         router.navigateByUrl('/simple');
         advance(fixture);

         router.navigateByUrl('/throwing').catch(() => null);
         advance(fixture);

         // we do not trigger another navigation to /simple
         expect(events).toEqual(['/simple', '/throwing']);
       }));
  });

  it('should dispatch NavigationCancel after the url has been reset back', fakeAsync(() => {
       TestBed.configureTestingModule(
           {providers: [{provide: 'returnsFalse', useValue: () => false}]});

       const router: Router = TestBed.inject(Router);
       const location = TestBed.inject(Location) as SpyLocation;

       const fixture = createRoot(router, RootCmp);

       router.resetConfig([
         {path: 'simple', component: SimpleCmp}, {
           path: 'throwing',
           loadChildren: jasmine.createSpy('doesnotmatter'),
           canLoad: ['returnsFalse']
         }
       ]);

       router.navigateByUrl('/simple');
       advance(fixture);

       let routerUrlBeforeEmittingError = '';
       let locationUrlBeforeEmittingError = '';
       router.events.forEach(e => {
         if (e instanceof NavigationCancel) {
           expect(e.code).toBe(NavigationCancellationCode.GuardRejected);
           routerUrlBeforeEmittingError = router.url;
           locationUrlBeforeEmittingError = location.path();
         }
       });

       location.simulateHashChange('/throwing');
       advance(fixture);

       expect(routerUrlBeforeEmittingError).toEqual('/simple');
       expect(locationUrlBeforeEmittingError).toEqual('/simple');
     }));

  it('should support custom error handlers', fakeAsync(inject([Router], (router: Router) => {
       router.errorHandler = (error) => 'resolvedValue';
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'user/:name', component: UserCmp}]);

       const recordedEvents: any[] = [];
       router.events.forEach(e => recordedEvents.push(e));

       let e: any;
       router.navigateByUrl('/invalid')!.then(_ => e = _);
       advance(fixture);
       expect(e).toEqual('resolvedValue');

       expectEvents(recordedEvents, [[NavigationStart, '/invalid'], [NavigationError, '/invalid']]);
     })));

  it('should recover from malformed uri errors',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       router.resetConfig([{path: 'simple', component: SimpleCmp}]);
       const fixture = createRoot(router, RootCmp);
       router.navigateByUrl('/invalid/url%with%percent');
       advance(fixture);
       expect(location.path()).toEqual('/');
     })));

  it('should support custom malformed uri error handler',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const customMalformedUriErrorHandler =
           (e: URIError, urlSerializer: UrlSerializer, url: string): UrlTree => {
             return urlSerializer.parse('/?error=The-URL-you-went-to-is-invalid');
           };
       router.malformedUriErrorHandler = customMalformedUriErrorHandler;

       router.resetConfig([{path: 'simple', component: SimpleCmp}]);

       const fixture = createRoot(router, RootCmp);
       router.navigateByUrl('/invalid/url%with%percent');
       advance(fixture);
       expect(location.path()).toEqual('/?error=The-URL-you-went-to-is-invalid');
     })));

  it('should not swallow errors', fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'simple', component: SimpleCmp}]);

       router.navigateByUrl('/invalid');
       expect(() => advance(fixture)).toThrow();

       router.navigateByUrl('/invalid2');
       expect(() => advance(fixture)).toThrow();
     })));


  it('should replace state when path is equal to current path',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{
         path: 'team/:id',
         component: TeamCmp,
         children:
             [{path: 'simple', component: SimpleCmp}, {path: 'user/:name', component: UserCmp}]
       }]);

       router.navigateByUrl('/team/33/simple');
       advance(fixture);

       router.navigateByUrl('/team/22/user/victor');
       advance(fixture);

       router.navigateByUrl('/team/22/user/victor');
       advance(fixture);

       location.back();
       advance(fixture);
       expect(location.path()).toEqual('/team/33/simple');
     })));

  it('should handle componentless paths',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = createRoot(router, RootCmpWithTwoOutlets);

       router.resetConfig([
         {
           path: 'parent/:id',
           children: [
             {path: 'simple', component: SimpleCmp},
             {path: 'user/:name', component: UserCmp, outlet: 'right'}
           ]
         },
         {path: 'user/:name', component: UserCmp}
       ]);


       // navigate to a componentless route
       router.navigateByUrl('/parent/11/(simple//right:user/victor)');
       advance(fixture);
       expect(location.path()).toEqual('/parent/11/(simple//right:user/victor)');
       expect(fixture.nativeElement).toHaveText('primary [simple] right [user victor]');

       // navigate to the same route with different params (reuse)
       router.navigateByUrl('/parent/22/(simple//right:user/fedor)');
       advance(fixture);
       expect(location.path()).toEqual('/parent/22/(simple//right:user/fedor)');
       expect(fixture.nativeElement).toHaveText('primary [simple] right [user fedor]');

       // navigate to a normal route (check deactivation)
       router.navigateByUrl('/user/victor');
       advance(fixture);
       expect(location.path()).toEqual('/user/victor');
       expect(fixture.nativeElement).toHaveText('primary [user victor] right []');

       // navigate back to a componentless route
       router.navigateByUrl('/parent/11/(simple//right:user/victor)');
       advance(fixture);
       expect(location.path()).toEqual('/parent/11/(simple//right:user/victor)');
       expect(fixture.nativeElement).toHaveText('primary [simple] right [user victor]');
     })));

  it('should not deactivate aux routes when navigating from a componentless routes',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = createRoot(router, TwoOutletsCmp);

       router.resetConfig([
         {path: 'simple', component: SimpleCmp},
         {path: 'componentless', children: [{path: 'simple', component: SimpleCmp}]},
         {path: 'user/:name', outlet: 'aux', component: UserCmp}
       ]);

       router.navigateByUrl('/componentless/simple(aux:user/victor)');
       advance(fixture);
       expect(location.path()).toEqual('/componentless/simple(aux:user/victor)');
       expect(fixture.nativeElement).toHaveText('[ simple, aux: user victor ]');

       router.navigateByUrl('/simple(aux:user/victor)');
       advance(fixture);
       expect(location.path()).toEqual('/simple(aux:user/victor)');
       expect(fixture.nativeElement).toHaveText('[ simple, aux: user victor ]');
     })));

  it('should emit an event when an outlet gets activated', fakeAsync(() => {
       @Component({
         selector: 'container',
         template:
             `<router-outlet (activate)="recordActivate($event)" (deactivate)="recordDeactivate($event)"></router-outlet>`
       })
       class Container {
         activations: any[] = [];
         deactivations: any[] = [];

         recordActivate(component: any): void {
           this.activations.push(component);
         }

         recordDeactivate(component: any): void {
           this.deactivations.push(component);
         }
       }

       TestBed.configureTestingModule({declarations: [Container]});

       const router: Router = TestBed.inject(Router);

       const fixture = createRoot(router, Container);
       const cmp = fixture.componentInstance;

       router.resetConfig(
           [{path: 'blank', component: BlankCmp}, {path: 'simple', component: SimpleCmp}]);

       cmp.activations = [];
       cmp.deactivations = [];

       router.navigateByUrl('/blank');
       advance(fixture);

       expect(cmp.activations.length).toEqual(1);
       expect(cmp.activations[0] instanceof BlankCmp).toBe(true);

       router.navigateByUrl('/simple');
       advance(fixture);

       expect(cmp.activations.length).toEqual(2);
       expect(cmp.activations[1] instanceof SimpleCmp).toBe(true);
       expect(cmp.deactivations.length).toEqual(1);
       expect(cmp.deactivations[0] instanceof BlankCmp).toBe(true);
     }));

  it('should update url and router state before activating components',
     fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'cmp', component: ComponentRecordingRoutePathAndUrl}]);

       router.navigateByUrl('/cmp');
       advance(fixture);

       const cmp: ComponentRecordingRoutePathAndUrl =
           fixture.debugElement.children[1].componentInstance;

       expect(cmp.url).toBe('/cmp');
       expect(cmp.path.length).toEqual(2);
     })));



  describe('data', () => {
    class ResolveSix {
      resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): number {
        return 6;
      }
    }

    @Component({selector: 'nested-cmp', template: 'nested-cmp'})
    class NestedComponentWithData {
      data: any = [];
      constructor(private route: ActivatedRoute) {
        route.data.forEach(d => this.data.push(d));
      }
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: 'resolveTwo', useValue: (a: any, b: any) => 2},
          {provide: 'resolveFour', useValue: (a: any, b: any) => 4},
          {provide: 'resolveSix', useClass: ResolveSix},
          {provide: 'resolveError', useValue: (a: any, b: any) => Promise.reject('error')},
          {provide: 'resolveNullError', useValue: (a: any, b: any) => Promise.reject(null)},
          {provide: 'resolveEmpty', useValue: (a: any, b: any) => EMPTY},
          {provide: 'numberOfUrlSegments', useValue: (a: any, b: any) => a.url.length},
          {
            provide: 'overridingGuard',
            useValue: (route: ActivatedRouteSnapshot) => {
              route.data = {prop: 10};
              return true;
            }
          },
        ]
      });
    });

    it('should provide resolved data', fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmpWithTwoOutlets);

         router.resetConfig([{
           path: 'parent/:id',
           data: {one: 1},
           resolve: {two: 'resolveTwo'},
           children: [
             {path: '', data: {three: 3}, resolve: {four: 'resolveFour'}, component: RouteCmp},
             {
               path: '',
               data: {five: 5},
               resolve: {six: 'resolveSix'},
               component: RouteCmp,
               outlet: 'right'
             },
           ]
         }]);

         router.navigateByUrl('/parent/1');
         advance(fixture);

         const primaryCmp = fixture.debugElement.children[1].componentInstance;
         const rightCmp = fixture.debugElement.children[3].componentInstance;

         expect(primaryCmp.route.snapshot.data).toEqual({one: 1, two: 2, three: 3, four: 4});
         expect(rightCmp.route.snapshot.data).toEqual({one: 1, two: 2, five: 5, six: 6});

         const primaryRecorded: any[] = [];
         primaryCmp.route.data.forEach((rec: any) => primaryRecorded.push(rec));

         const rightRecorded: any[] = [];
         rightCmp.route.data.forEach((rec: any) => rightRecorded.push(rec));

         router.navigateByUrl('/parent/2');
         advance(fixture);

         expect(primaryRecorded).toEqual([{one: 1, three: 3, two: 2, four: 4}]);
         expect(rightRecorded).toEqual([{one: 1, five: 5, two: 2, six: 6}]);
       })));

    it('should handle errors', fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig(
             [{path: 'simple', component: SimpleCmp, resolve: {error: 'resolveError'}}]);

         const recordedEvents: any[] = [];
         router.events.subscribe(e => e instanceof RouterEvent && recordedEvents.push(e));

         let e: any = null;
         router.navigateByUrl('/simple')!.catch(error => e = error);
         advance(fixture);

         expectEvents(recordedEvents, [
           [NavigationStart, '/simple'], [RoutesRecognized, '/simple'],
           [GuardsCheckStart, '/simple'], [GuardsCheckEnd, '/simple'], [ResolveStart, '/simple'],
           [NavigationError, '/simple']
         ]);

         expect(e).toEqual('error');
       })));

    it('should handle empty errors', fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig(
             [{path: 'simple', component: SimpleCmp, resolve: {error: 'resolveNullError'}}]);

         const recordedEvents: any[] = [];
         router.events.subscribe(e => e instanceof RouterEvent && recordedEvents.push(e));

         let e: any = 'some value';
         router.navigateByUrl('/simple').catch(error => e = error);
         advance(fixture);

         expect(e).toEqual(null);
       })));

    it('should not navigate when all resolvers return empty result',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {path: 'simple', component: SimpleCmp, resolve: {e1: 'resolveEmpty', e2: 'resolveEmpty'}}
         ]);

         const recordedEvents: any[] = [];
         router.events.subscribe(e => e instanceof RouterEvent && recordedEvents.push(e));

         let e: any = null;
         router.navigateByUrl('/simple').catch(error => e = error);
         advance(fixture);

         expectEvents(recordedEvents, [
           [NavigationStart, '/simple'],
           [RoutesRecognized, '/simple'],
           [GuardsCheckStart, '/simple'],
           [GuardsCheckEnd, '/simple'],
           [ResolveStart, '/simple'],
           [NavigationCancel, '/simple'],
         ]);

         expect((recordedEvents[recordedEvents.length - 1] as NavigationCancel).code)
             .toBe(NavigationCancellationCode.NoDataFromResolver);

         expect(e).toEqual(null);
       })));

    it('should not navigate when at least one resolver returns empty result',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {path: 'simple', component: SimpleCmp, resolve: {e1: 'resolveTwo', e2: 'resolveEmpty'}}
         ]);

         const recordedEvents: any[] = [];
         router.events.subscribe(e => e instanceof RouterEvent && recordedEvents.push(e));

         let e: any = null;
         router.navigateByUrl('/simple').catch(error => e = error);
         advance(fixture);

         expectEvents(recordedEvents, [
           [NavigationStart, '/simple'],
           [RoutesRecognized, '/simple'],
           [GuardsCheckStart, '/simple'],
           [GuardsCheckEnd, '/simple'],
           [ResolveStart, '/simple'],
           [NavigationCancel, '/simple'],
         ]);

         expect(e).toEqual(null);
       })));

    it('should not navigate when all resolvers for a child route from forChild() returns empty result',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         @Component({selector: 'lazy-cmp', template: 'lazy-loaded-1'})
         class LazyComponent1 {
         }


         @NgModule({
           declarations: [LazyComponent1],
           imports: [
             RouterModule.forChild([{
               path: 'loaded',
               component: LazyComponent1,
               resolve: {e1: 'resolveEmpty', e2: 'resolveEmpty'}
             }]),
           ],
         })
         class LoadedModule {
         }

         router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

         const recordedEvents: any[] = [];
         router.events.subscribe(e => e instanceof RouterEvent && recordedEvents.push(e));

         let e: any = null;
         router.navigateByUrl('lazy/loaded').catch(error => e = error);
         advance(fixture);

         expectEvents(recordedEvents, [
           [NavigationStart, '/lazy/loaded'],
           [RoutesRecognized, '/lazy/loaded'],
           [GuardsCheckStart, '/lazy/loaded'],
           [GuardsCheckEnd, '/lazy/loaded'],
           [ResolveStart, '/lazy/loaded'],
           [NavigationCancel, '/lazy/loaded'],
         ]);

         expect(e).toEqual(null);
       })));

    it('should not navigate when at least one resolver for a child route from forChild() returns empty result',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         @Component({selector: 'lazy-cmp', template: 'lazy-loaded-1'})
         class LazyComponent1 {
         }

         @NgModule({
           declarations: [LazyComponent1],
           imports: [
             RouterModule.forChild([{
               path: 'loaded',
               component: LazyComponent1,
               resolve: {e1: 'resolveTwo', e2: 'resolveEmpty'}
             }]),
           ],
         })
         class LoadedModule {
         }

         router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

         const recordedEvents: any[] = [];
         router.events.subscribe(e => e instanceof RouterEvent && recordedEvents.push(e));

         let e: any = null;
         router.navigateByUrl('lazy/loaded').catch(error => e = error);
         advance(fixture);

         expectEvents(recordedEvents, [
           [NavigationStart, '/lazy/loaded'],
           [RoutesRecognized, '/lazy/loaded'],
           [GuardsCheckStart, '/lazy/loaded'],
           [GuardsCheckEnd, '/lazy/loaded'],
           [ResolveStart, '/lazy/loaded'],
           [NavigationCancel, '/lazy/loaded'],
         ]);

         expect(e).toEqual(null);
       })));

    it('should include target snapshot in NavigationError when resolver throws', async () => {
      const router = TestBed.inject(Router);
      const errorMessage = 'throwing resolver';
      @Injectable({providedIn: 'root'})
      class ThrowingResolver {
        resolve() {
          throw new Error(errorMessage);
        }
      }

      let caughtError: NavigationError|undefined;
      router.events.subscribe(e => {
        if (e instanceof NavigationError) {
          caughtError = e;
        }
      });
      router.resetConfig(
          [{path: 'throwing', resolve: {thrower: ThrowingResolver}, component: BlankCmp}]);
      try {
        await router.navigateByUrl('/throwing');
        fail('navigation should throw');
      } catch (e: unknown) {
        expect((e as Error).message).toEqual(errorMessage);
      }

      expect(caughtError).toBeDefined();
      expect(caughtError?.target).toBeDefined();
    });

    it('should preserve resolved data', fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'parent',
           resolve: {two: 'resolveTwo'},
           children: [
             {path: 'child1', component: CollectParamsCmp},
             {path: 'child2', component: CollectParamsCmp}
           ]
         }]);

         router.navigateByUrl('/parent/child1');
         advance(fixture);

         router.navigateByUrl('/parent/child2');
         advance(fixture);

         const cmp: CollectParamsCmp = fixture.debugElement.children[1].componentInstance;
         expect(cmp.route.snapshot.data).toEqual({two: 2});
       })));

    it('should override route static data with resolved data',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: '',
           component: NestedComponentWithData,
           resolve: {prop: 'resolveTwo'},
           data: {prop: 'static'},
         }]);

         router.navigateByUrl('/');
         advance(fixture);
         const cmp = fixture.debugElement.children[1].componentInstance;

         expect(cmp.data).toEqual([{prop: 2}]);
       })));

    it('should correctly override inherited route static data with resolved data',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'a',
           component: WrapperCmp,
           resolve: {prop2: 'resolveTwo'},
           data: {prop: 'wrapper-a'},
           children: [
             // will inherit data from this child route because it has `path` and its parent has
             // component
             {
               path: 'b',
               data: {prop: 'nested-b'},
               resolve: {prop3: 'resolveFour'},
               children: [
                 {
                   path: 'c',
                   children:
                       [{path: '', component: NestedComponentWithData, data: {prop3: 'nested'}}]
                 },
               ]
             },
           ],
         }]);

         router.navigateByUrl('/a/b/c');
         advance(fixture);

         const pInj =
             fixture.debugElement.queryAll(By.directive(NestedComponentWithData))[0].injector!;
         const cmp = pInj.get(NestedComponentWithData);
         expect(cmp.data).toEqual([{prop: 'nested-b', prop3: 'nested'}]);
       })));

    it('should not override inherited resolved data with inherited static data',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'a',
           component: WrapperCmp,
           resolve: {prop2: 'resolveTwo'},
           data: {prop: 'wrapper-a'},
           children: [
             // will inherit data from this child route because it has `path` and its parent has
             // component
             {
               path: 'b',
               data: {prop2: 'parent-b', prop: 'parent-b'},
               children: [
                 {
                   path: 'c',
                   resolve: {prop2: 'resolveFour'},
                   children: [
                     {
                       path: '',
                       component: NestedComponentWithData,
                       data: {prop: 'nested-d'},
                     },
                   ]
                 },
               ]
             },
           ],
         }]);

         router.navigateByUrl('/a/b/c');
         advance(fixture);

         const pInj =
             fixture.debugElement.queryAll(By.directive(NestedComponentWithData))[0].injector!;
         const cmp = pInj.get(NestedComponentWithData);
         expect(cmp.data).toEqual([{prop: 'nested-d', prop2: 4}]);
       })));

    it('should not override nested route static data when both are using resolvers',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {
             path: 'child',
             component: WrapperCmp,
             resolve: {prop: 'resolveTwo'},
             children: [{
               path: '',
               pathMatch: 'full',
               component: NestedComponentWithData,
               resolve: {prop: 'resolveFour'}
             }]
           },
         ]);

         router.navigateByUrl('/child');
         advance(fixture);

         const pInj = fixture.debugElement.query(By.directive(NestedComponentWithData)).injector!;
         const cmp = pInj.get(NestedComponentWithData);
         expect(cmp.data).toEqual([{prop: 4}]);
       })));

    it('should not override child route\'s static data when both are using static data',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {
             path: 'child',
             component: WrapperCmp,
             data: {prop: 'wrapper'},
             children: [{
               path: '',
               pathMatch: 'full',
               component: NestedComponentWithData,
               data: {prop: 'inner'}
             }]
           },
         ]);

         router.navigateByUrl('/child');
         advance(fixture);

         const pInj = fixture.debugElement.query(By.directive(NestedComponentWithData)).injector!;
         const cmp = pInj.get(NestedComponentWithData);
         expect(cmp.data).toEqual([{prop: 'inner'}]);
       })));

    it('should not override child route\'s static data when wrapper is using resolved data and the child route static data',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {
             path: 'nested',
             component: WrapperCmp,
             resolve: {prop: 'resolveTwo', prop2: 'resolveSix'},
             data: {prop3: 'wrapper-static', prop4: 'another-static'},
             children: [{
               path: '',
               pathMatch: 'full',
               component: NestedComponentWithData,
               data: {prop: 'nested', prop4: 'nested-static'}
             }]
           },
         ]);

         router.navigateByUrl('/nested');
         advance(fixture);

         const pInj = fixture.debugElement.query(By.directive(NestedComponentWithData)).injector!;
         const cmp = pInj.get(NestedComponentWithData);
         // Issue 34361 - `prop` should contain value defined in `data` object from the nested
         // route.
         expect(cmp.data).toEqual(
             [{prop: 'nested', prop2: 6, prop3: 'wrapper-static', prop4: 'nested-static'}]);
       })));

    it('should allow guards alter data resolved by routes',
       fakeAsync(inject([Router], (router: Router) => {
         // This is not documented or recommended behavior but is here to prevent unexpected
         // regressions. This behavior isn't necessary 'by design' but it was discovered during a
         // refactor that some teams depend on it.
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {
             path: 'route',
             component: NestedComponentWithData,
             canActivate: ['overridingGuard'],
           },
         ]);

         router.navigateByUrl('/route');
         advance(fixture);

         const pInj = fixture.debugElement.query(By.directive(NestedComponentWithData)).injector!;
         const cmp = pInj.get(NestedComponentWithData);
         expect(cmp.data).toEqual([{prop: 10}]);
       })));

    it('should rerun resolvers when the urls segments of a wildcard route change',
       fakeAsync(inject([Router, Location], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: '**',
           component: CollectParamsCmp,
           resolve: {numberOfUrlSegments: 'numberOfUrlSegments'}
         }]);

         router.navigateByUrl('/one/two');
         advance(fixture);
         const cmp = fixture.debugElement.children[1].componentInstance;

         expect(cmp.route.snapshot.data).toEqual({numberOfUrlSegments: 2});

         router.navigateByUrl('/one/two/three');
         advance(fixture);

         expect(cmp.route.snapshot.data).toEqual({numberOfUrlSegments: 3});
       })));

    describe('should run resolvers for the same route concurrently', () => {
      let log: string[];
      let observer: Observer<unknown>;

      beforeEach(() => {
        log = [];
        TestBed.configureTestingModule({
          providers: [
            {
              provide: 'resolver1',
              useValue: () => {
                const obs$ = new Observable((obs) => {
                  observer = obs;
                  return () => {};
                });
                return obs$.pipe(map(() => log.push('resolver1')));
              }
            },
            {
              provide: 'resolver2',
              useValue: () => {
                return of(null).pipe(map(() => {
                  log.push('resolver2');
                  observer.next(null);
                  observer.complete();
                }));
              }
            },
          ]
        });
      });

      it('works', fakeAsync(inject([Router], (router: Router) => {
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{
             path: 'a',
             resolve: {
               one: 'resolver1',
               two: 'resolver2',
             },
             component: SimpleCmp
           }]);

           router.navigateByUrl('/a');
           advance(fixture);

           expect(log).toEqual(['resolver2', 'resolver1']);
         })));
    });

    it('can resolve symbol keys', fakeAsync(() => {
         const router = TestBed.inject(Router);
         const fixture = createRoot(router, RootCmp);
         const symbolKey = Symbol('key');

         router.resetConfig(
             [{path: 'simple', component: SimpleCmp, resolve: {[symbolKey]: 'resolveFour'}}]);

         router.navigateByUrl('/simple');
         advance(fixture);

         expect(router.routerState.root.snapshot.firstChild!.data[symbolKey]).toEqual(4);
       }));

    it('should allow resolvers as pure functions', fakeAsync(() => {
         const router = TestBed.inject(Router);
         const fixture = createRoot(router, RootCmp);
         const user = Symbol('user');

         const userResolver: ResolveFn<string> = (route: ActivatedRouteSnapshot) =>
             route.params['user'];
         router.resetConfig(
             [{path: ':user', component: SimpleCmp, resolve: {[user]: userResolver}}]);

         router.navigateByUrl('/atscott');
         advance(fixture);

         expect(router.routerState.root.snapshot.firstChild!.data[user]).toEqual('atscott');
       }));

    it('should allow DI in resolvers as pure functions', fakeAsync(() => {
         const router = TestBed.inject(Router);
         const fixture = createRoot(router, RootCmp);
         const user = Symbol('user');

         @Injectable({providedIn: 'root'})
         class LoginState {
           user = 'atscott';
         }

         router.resetConfig([{
           path: '**',
           component: SimpleCmp,
           resolve: {
             [user]: () => coreInject(LoginState).user,
           },
         }]);

         router.navigateByUrl('/');
         advance(fixture);

         expect(router.routerState.root.snapshot.firstChild!.data[user]).toEqual('atscott');
       }));
  });

  describe('router links', () => {
    it('should support skipping location update for anchor router links',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = TestBed.createComponent(RootCmp);
         advance(fixture);

         router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

         router.navigateByUrl('/team/22');
         advance(fixture);
         expect(location.path()).toEqual('/team/22');
         expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');

         const teamCmp = fixture.debugElement.childNodes[1].componentInstance;

         teamCmp.routerLink = ['/team/0'];
         advance(fixture);
         const anchor = fixture.debugElement.query(By.css('a')).nativeElement;
         anchor.click();
         advance(fixture);
         expect(fixture.nativeElement).toHaveText('team 0 [ , right:  ]');
         expect(location.path()).toEqual('/team/22');

         teamCmp.routerLink = ['/team/1'];
         advance(fixture);
         const button = fixture.debugElement.query(By.css('button')).nativeElement;
         button.click();
         advance(fixture);
         expect(fixture.nativeElement).toHaveText('team 1 [ , right:  ]');
         expect(location.path()).toEqual('/team/22');
       })));

    it('should support string router links', fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children:
               [{path: 'link', component: StringLinkCmp}, {path: 'simple', component: SimpleCmp}]
         }]);

         router.navigateByUrl('/team/22/link');
         advance(fixture);
         expect(fixture.nativeElement).toHaveText('team 22 [ link, right:  ]');

         const native = fixture.nativeElement.querySelector('a');
         expect(native.getAttribute('href')).toEqual('/team/33/simple');
         expect(native.getAttribute('target')).toEqual('_self');
         native.click();
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('team 33 [ simple, right:  ]');
       })));

    it('should not preserve query params and fragment by default', fakeAsync(() => {
         @Component({
           selector: 'someRoot',
           template: `<router-outlet></router-outlet><a routerLink="/home">Link</a>`
         })
         class RootCmpWithLink {
         }

         TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
         const router: Router = TestBed.inject(Router);

         const fixture = createRoot(router, RootCmpWithLink);

         router.resetConfig([{path: 'home', component: SimpleCmp}]);

         const native = fixture.nativeElement.querySelector('a');

         router.navigateByUrl('/home?q=123#fragment');
         advance(fixture);
         expect(native.getAttribute('href')).toEqual('/home');
       }));

    it('should not throw when commands is null or undefined', fakeAsync(() => {
         @Component({
           selector: 'someCmp',
           template: `<router-outlet></router-outlet>
                <a [routerLink]="null">Link</a>
                <button [routerLink]="null">Button</button>
                <a [routerLink]="undefined">Link</a>
                <button [routerLink]="undefined">Button</button>
                `
         })
         class CmpWithLink {
         }

         TestBed.configureTestingModule({declarations: [CmpWithLink]});
         const router: Router = TestBed.inject(Router);

         let fixture: ComponentFixture<CmpWithLink> = createRoot(router, CmpWithLink);
         router.resetConfig([{path: 'home', component: SimpleCmp}]);
         const anchors = fixture.nativeElement.querySelectorAll('a');
         const buttons = fixture.nativeElement.querySelectorAll('button');
         expect(() => anchors[0].click()).not.toThrow();
         expect(() => anchors[1].click()).not.toThrow();
         expect(() => buttons[0].click()).not.toThrow();
         expect(() => buttons[1].click()).not.toThrow();
       }));

    it('should not throw when some command is null', fakeAsync(() => {
         @Component({
           selector: 'someCmp',
           template:
               `<router-outlet></router-outlet><a [routerLink]="[null]">Link</a><button [routerLink]="[null]">Button</button>`
         })
         class CmpWithLink {
         }

         TestBed.configureTestingModule({declarations: [CmpWithLink]});
         const router: Router = TestBed.inject(Router);

         expect(() => createRoot(router, CmpWithLink)).not.toThrow();
       }));

    it('should not throw when some command is undefined', fakeAsync(() => {
         @Component({
           selector: 'someCmp',
           template:
               `<router-outlet></router-outlet><a [routerLink]="[undefined]">Link</a><button [routerLink]="[undefined]">Button</button>`
         })
         class CmpWithLink {
         }

         TestBed.configureTestingModule({declarations: [CmpWithLink]});
         const router: Router = TestBed.inject(Router);

         expect(() => createRoot(router, CmpWithLink)).not.toThrow();
       }));

    it('should update hrefs when query params or fragment change', fakeAsync(() => {
         @Component({
           selector: 'someRoot',
           template:
               `<router-outlet></router-outlet><a routerLink="/home" queryParamsHandling="preserve" preserveFragment>Link</a>`
         })
         class RootCmpWithLink {
         }
         TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
         const router: Router = TestBed.inject(Router);
         const fixture = createRoot(router, RootCmpWithLink);

         router.resetConfig([{path: 'home', component: SimpleCmp}]);

         const native = fixture.nativeElement.querySelector('a');

         router.navigateByUrl('/home?q=123');
         advance(fixture);
         expect(native.getAttribute('href')).toEqual('/home?q=123');

         router.navigateByUrl('/home?q=456');
         advance(fixture);
         expect(native.getAttribute('href')).toEqual('/home?q=456');

         router.navigateByUrl('/home?q=456#1');
         advance(fixture);
         expect(native.getAttribute('href')).toEqual('/home?q=456#1');
       }));

    it('should correctly use the preserve strategy', fakeAsync(() => {
         @Component({
           selector: 'someRoot',
           template:
               `<router-outlet></router-outlet><a routerLink="/home" [queryParams]="{q: 456}" queryParamsHandling="preserve">Link</a>`
         })
         class RootCmpWithLink {
         }
         TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
         const router: Router = TestBed.inject(Router);
         const fixture = createRoot(router, RootCmpWithLink);

         router.resetConfig([{path: 'home', component: SimpleCmp}]);

         const native = fixture.nativeElement.querySelector('a');

         router.navigateByUrl('/home?a=123');
         advance(fixture);
         expect(native.getAttribute('href')).toEqual('/home?a=123');
       }));

    it('should correctly use the merge strategy', fakeAsync(() => {
         @Component({
           selector: 'someRoot',
           template:
               `<router-outlet></router-outlet><a routerLink="/home" [queryParams]="{removeMe: null, q: 456}" queryParamsHandling="merge">Link</a>`
         })
         class RootCmpWithLink {
         }
         TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
         const router: Router = TestBed.inject(Router);
         const fixture = createRoot(router, RootCmpWithLink);

         router.resetConfig([{path: 'home', component: SimpleCmp}]);

         const native = fixture.nativeElement.querySelector('a');

         router.navigateByUrl('/home?a=123&removeMe=123');
         advance(fixture);
         expect(native.getAttribute('href')).toEqual('/home?a=123&q=456');
       }));

    it('should support using links on non-a tags', fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children: [
             {path: 'link', component: StringLinkButtonCmp}, {path: 'simple', component: SimpleCmp}
           ]
         }]);

         router.navigateByUrl('/team/22/link');
         advance(fixture);
         expect(fixture.nativeElement).toHaveText('team 22 [ link, right:  ]');

         const button = fixture.nativeElement.querySelector('button');
         expect(button.getAttribute('tabindex')).toEqual('0');
         button.click();
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('team 33 [ simple, right:  ]');
       })));

    it('should support absolute router links', fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children:
               [{path: 'link', component: AbsoluteLinkCmp}, {path: 'simple', component: SimpleCmp}]
         }]);

         router.navigateByUrl('/team/22/link');
         advance(fixture);
         expect(fixture.nativeElement).toHaveText('team 22 [ link, right:  ]');

         const native = fixture.nativeElement.querySelector('a');
         expect(native.getAttribute('href')).toEqual('/team/33/simple');
         native.click();
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('team 33 [ simple, right:  ]');
       })));

    it('should support relative router links', fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children:
               [{path: 'link', component: RelativeLinkCmp}, {path: 'simple', component: SimpleCmp}]
         }]);

         router.navigateByUrl('/team/22/link');
         advance(fixture);
         expect(fixture.nativeElement).toHaveText('team 22 [ link, right:  ]');

         const native = fixture.nativeElement.querySelector('a');
         expect(native.getAttribute('href')).toEqual('/team/22/simple');
         native.click();
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('team 22 [ simple, right:  ]');
       })));

    it('should support top-level link', fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RelativeLinkInIfCmp);
         advance(fixture);

         router.resetConfig(
             [{path: 'simple', component: SimpleCmp}, {path: '', component: BlankCmp}]);

         router.navigateByUrl('/');
         advance(fixture);
         expect(fixture.nativeElement).toHaveText('');
         const cmp = fixture.componentInstance;

         cmp.show = true;
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('link');
         const native = fixture.nativeElement.querySelector('a');

         expect(native.getAttribute('href')).toEqual('/simple');
         native.click();
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('linksimple');
       })));

    it('should support query params and fragments',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children: [
             {path: 'link', component: LinkWithQueryParamsAndFragment},
             {path: 'simple', component: SimpleCmp}
           ]
         }]);

         router.navigateByUrl('/team/22/link');
         advance(fixture);

         const native = fixture.nativeElement.querySelector('a');
         expect(native.getAttribute('href')).toEqual('/team/22/simple?q=1#f');
         native.click();
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('team 22 [ simple, right:  ]');

         expect(location.path()).toEqual('/team/22/simple?q=1#f');
       })));

    describe('should support history and state', () => {
      let component: typeof LinkWithState|typeof DivLinkWithState;
      it('for anchor elements', () => {
        // Test logic in afterEach to reduce duplication
        component = LinkWithState;
      });

      it('for non-anchor elements', () => {
        // Test logic in afterEach to reduce duplication
        component = DivLinkWithState;
      });

      afterEach(fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
        const fixture = createRoot(router, RootCmp);

        router.resetConfig([{
          path: 'team/:id',
          component: TeamCmp,
          children: [{path: 'link', component}, {path: 'simple', component: SimpleCmp}]
        }]);

        router.navigateByUrl('/team/22/link');
        advance(fixture);

        const native = fixture.nativeElement.querySelector('#link');
        native.click();
        advance(fixture);

        expect(fixture.nativeElement).toHaveText('team 22 [ simple, right:  ]');

        // Check the history entry
        const history = (location as any)._history;
        expect(history[history.length - 1].state)
            .toEqual({foo: 'bar', navigationId: history.length});
      })));
    });

    it('should set href on area elements', fakeAsync(() => {
         @Component({
           selector: 'someRoot',
           template: `<router-outlet></router-outlet><map><area routerLink="/home" /></map>`
         })
         class RootCmpWithArea {
         }

         TestBed.configureTestingModule({declarations: [RootCmpWithArea]});
         const router: Router = TestBed.inject(Router);

         const fixture = createRoot(router, RootCmpWithArea);

         router.resetConfig([{path: 'home', component: SimpleCmp}]);

         const native = fixture.nativeElement.querySelector('area');
         expect(native.getAttribute('href')).toEqual('/home');
       }));
  });

  describe('redirects', () => {
    it('should work', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {path: 'old/team/:id', redirectTo: 'team/:id'}, {path: 'team/:id', component: TeamCmp}
         ]);

         router.navigateByUrl('old/team/22');
         advance(fixture);

         expect(location.path()).toEqual('/team/22');
       })));

    it('can redirect from componentless named outlets', fakeAsync(() => {
         const router = TestBed.inject(Router);
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {path: 'main', outlet: 'aux', component: BlankCmp},
           {path: '', pathMatch: 'full', outlet: 'aux', redirectTo: 'main'},
         ]);

         router.navigateByUrl('');
         advance(fixture);

         expect(TestBed.inject(Location).path()).toEqual('/(aux:main)');
       }));

    it('should update Navigation object after redirects are applied',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);
         let initialUrl, afterRedirectUrl;

         router.resetConfig([
           {path: 'old/team/:id', redirectTo: 'team/:id'}, {path: 'team/:id', component: TeamCmp}
         ]);

         router.events.subscribe(e => {
           if (e instanceof NavigationStart) {
             const navigation = router.getCurrentNavigation();
             initialUrl = navigation && navigation.finalUrl;
           }
           if (e instanceof RoutesRecognized) {
             const navigation = router.getCurrentNavigation();
             afterRedirectUrl = navigation && navigation.finalUrl;
           }
         });

         router.navigateByUrl('old/team/22');
         advance(fixture);

         expect(initialUrl).toBeUndefined();
         expect(router.serializeUrl(afterRedirectUrl as any)).toBe('/team/22');
       })));

    it('should not break the back button when trigger by location change', fakeAsync(() => {
         TestBed.configureTestingModule(
             {providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}]});
         const router = TestBed.inject(Router);
         const location = TestBed.inject(Location) as SpyLocation;
         const fixture = TestBed.createComponent(RootCmp);
         advance(fixture);
         router.resetConfig([
           {path: 'initial', component: BlankCmp}, {path: 'old/team/:id', redirectTo: 'team/:id'},
           {path: 'team/:id', component: TeamCmp}
         ]);

         location.go('initial');
         location.go('old/team/22');

         // initial navigation
         router.initialNavigation();
         advance(fixture);
         expect(location.path()).toEqual('/team/22');

         location.back();
         advance(fixture);
         expect(location.path()).toEqual('/initial');

         // location change
         location.simulateHashChange('/old/team/33');

         advance(fixture);
         expect(location.path()).toEqual('/team/33');

         location.back();
         advance(fixture);
         expect(location.path()).toEqual('/initial');
       }));
  });
  describe('guards', () => {
    describe('CanActivate', () => {
      describe('should not activate a route when CanActivate returns false', () => {
        beforeEach(() => {
          TestBed.configureTestingModule(
              {providers: [{provide: 'alwaysFalse', useValue: (a: any, b: any) => false}]});
        });

        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             const recordedEvents: Event[] = [];
             router.events.forEach(e => recordedEvents.push(e));

             router.resetConfig(
                 [{path: 'team/:id', component: TeamCmp, canActivate: ['alwaysFalse']}]);

             router.navigateByUrl('/team/22');
             advance(fixture);

             expect(location.path()).toEqual('/');
             expectEvents(recordedEvents, [
               [NavigationStart, '/team/22'],
               [RoutesRecognized, '/team/22'],
               [GuardsCheckStart, '/team/22'],
               [ChildActivationStart],
               [ActivationStart],
               [GuardsCheckEnd, '/team/22'],
               [NavigationCancel, '/team/22'],
             ]);
             expect((recordedEvents[5] as GuardsCheckEnd).shouldActivate).toBe(false);
           })));
      });

      describe(
          'should not activate a route when CanActivate returns false (componentless route)',
          () => {
            beforeEach(() => {
              TestBed.configureTestingModule(
                  {providers: [{provide: 'alwaysFalse', useValue: (a: any, b: any) => false}]});
            });

            it('works',
               fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
                 const fixture = createRoot(router, RootCmp);

                 router.resetConfig([{
                   path: 'parent',
                   canActivate: ['alwaysFalse'],
                   children: [{path: 'team/:id', component: TeamCmp}]
                 }]);

                 router.navigateByUrl('parent/team/22');
                 advance(fixture);

                 expect(location.path()).toEqual('/');
               })));
          });

      describe('should activate a route when CanActivate returns true', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [{
              provide: 'alwaysTrue',
              useValue: (a: ActivatedRouteSnapshot, s: RouterStateSnapshot) => true
            }]
          });
        });

        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig(
                 [{path: 'team/:id', component: TeamCmp, canActivate: ['alwaysTrue']}]);

             router.navigateByUrl('/team/22');
             advance(fixture);
             expect(location.path()).toEqual('/team/22');
           })));
      });

      describe('should work when given a class', () => {
        class AlwaysTrue {
          canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
            return true;
          }
        }

        beforeEach(() => {
          TestBed.configureTestingModule({providers: [AlwaysTrue]});
        });

        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig(
                 [{path: 'team/:id', component: TeamCmp, canActivate: [AlwaysTrue]}]);

             router.navigateByUrl('/team/22');
             advance(fixture);

             expect(location.path()).toEqual('/team/22');
           })));
      });

      describe('should work when returns an observable', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [{
              provide: 'CanActivate',
              useValue: (a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                return new Observable<boolean>((observer) => {
                  observer.next(false);
                });
              }
            }]
          });
        });


        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig(
                 [{path: 'team/:id', component: TeamCmp, canActivate: ['CanActivate']}]);

             router.navigateByUrl('/team/22');
             advance(fixture);
             expect(location.path()).toEqual('/');
           })));
      });

      describe('should work when returns a promise', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [{
              provide: 'CanActivate',
              useValue: (a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                if (a.params['id'] === '22') {
                  return Promise.resolve(true);
                } else {
                  return Promise.resolve(false);
                }
              }
            }]
          });
        });


        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig(
                 [{path: 'team/:id', component: TeamCmp, canActivate: ['CanActivate']}]);

             router.navigateByUrl('/team/22');
             advance(fixture);
             expect(location.path()).toEqual('/team/22');

             router.navigateByUrl('/team/33');
             advance(fixture);
             expect(location.path()).toEqual('/team/22');
           })));
      });

      describe('should reset the location when cancelling a navigation', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [
              {
                provide: 'alwaysFalse',
                useValue: (a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                  return false;
                }
              },
              {provide: LocationStrategy, useClass: HashLocationStrategy}
            ]
          });
        });

        it('works',
           fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig([
               {path: 'one', component: SimpleCmp},
               {path: 'two', component: SimpleCmp, canActivate: ['alwaysFalse']}
             ]);

             router.navigateByUrl('/one');
             advance(fixture);
             expect(location.path()).toEqual('/one');

             location.simulateHashChange('/two');
             advance(fixture);
             expect(location.path()).toEqual('/one');
           })));
      });

      describe('should redirect to / when guard returns false', () => {
        beforeEach(() => TestBed.configureTestingModule({
          providers: [{
            provide: 'returnFalseAndNavigate',
            useFactory: (router: Router) => () => {
              router.navigate(['/']);
              return false;
            },
            deps: [Router]
          }]
        }));

        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             router.resetConfig([
               {
                 path: '',
                 component: SimpleCmp,
               },
               {path: 'one', component: RouteCmp, canActivate: ['returnFalseAndNavigate']}
             ]);

             const fixture = TestBed.createComponent(RootCmp);
             router.navigateByUrl('/one');
             advance(fixture);
             expect(location.path()).toEqual('/');
             expect(fixture.nativeElement).toHaveText('simple');
           })));
      });

      describe('should redirect when guard returns UrlTree', () => {
        beforeEach(() => TestBed.configureTestingModule({
          providers: [
            {
              provide: 'returnUrlTree',
              useFactory: (router: Router) => () => {
                return router.parseUrl('/redirected');
              },
              deps: [Router]
            },
            {
              provide: 'returnRootUrlTree',
              useFactory: (router: Router) => () => {
                return router.parseUrl('/');
              },
              deps: [Router]
            }
          ]
        }));

        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const recordedEvents: Event[] = [];
             let cancelEvent: NavigationCancel = null!;
             router.events.forEach((e) => {
               recordedEvents.push(e);
               if (e instanceof NavigationCancel) cancelEvent = e;
             });
             router.resetConfig([
               {path: '', component: SimpleCmp},
               {path: 'one', component: RouteCmp, canActivate: ['returnUrlTree']},
               {path: 'redirected', component: SimpleCmp}
             ]);

             const fixture = TestBed.createComponent(RootCmp);
             router.navigateByUrl('/one');

             advance(fixture);

             expect(location.path()).toEqual('/redirected');
             expect(fixture.nativeElement).toHaveText('simple');
             expect(cancelEvent && cancelEvent.reason)
                 .toBe('NavigationCancelingError: Redirecting to "/redirected"');
             expectEvents(recordedEvents, [
               [NavigationStart, '/one'],
               [RoutesRecognized, '/one'],
               [GuardsCheckStart, '/one'],
               [ChildActivationStart, undefined],
               [ActivationStart, undefined],
               [NavigationCancel, '/one'],
               [NavigationStart, '/redirected'],
               [RoutesRecognized, '/redirected'],
               [GuardsCheckStart, '/redirected'],
               [ChildActivationStart, undefined],
               [ActivationStart, undefined],
               [GuardsCheckEnd, '/redirected'],
               [ResolveStart, '/redirected'],
               [ResolveEnd, '/redirected'],
               [ActivationEnd, undefined],
               [ChildActivationEnd, undefined],
               [NavigationEnd, '/redirected'],
             ]);
           })));

        it('works with root url',
           fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const recordedEvents: Event[] = [];
             let cancelEvent: NavigationCancel = null!;
             router.events.forEach((e: any) => {
               recordedEvents.push(e);
               if (e instanceof NavigationCancel) cancelEvent = e;
             });
             router.resetConfig([
               {path: '', component: SimpleCmp},
               {path: 'one', component: RouteCmp, canActivate: ['returnRootUrlTree']}
             ]);

             const fixture = TestBed.createComponent(RootCmp);
             router.navigateByUrl('/one');

             advance(fixture);

             expect(location.path()).toEqual('/');
             expect(fixture.nativeElement).toHaveText('simple');
             expect(cancelEvent && cancelEvent.reason)
                 .toBe('NavigationCancelingError: Redirecting to "/"');
             expectEvents(recordedEvents, [
               [NavigationStart, '/one'],
               [RoutesRecognized, '/one'],
               [GuardsCheckStart, '/one'],
               [ChildActivationStart, undefined],
               [ActivationStart, undefined],
               [NavigationCancel, '/one'],
               [NavigationStart, '/'],
               [RoutesRecognized, '/'],
               [GuardsCheckStart, '/'],
               [ChildActivationStart, undefined],
               [ActivationStart, undefined],
               [GuardsCheckEnd, '/'],
               [ResolveStart, '/'],
               [ResolveEnd, '/'],
               [ActivationEnd, undefined],
               [ChildActivationEnd, undefined],
               [NavigationEnd, '/'],
             ]);
           })));

        it('replaces URL when URL is updated eagerly so back button can still work',
           fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
             router.urlUpdateStrategy = 'eager';
             router.resetConfig([
               {path: '', component: SimpleCmp},
               {path: 'one', component: RouteCmp, canActivate: ['returnUrlTree']},
               {path: 'redirected', component: SimpleCmp}
             ]);
             const fixture = createRoot(router, RootCmp);
             router.navigateByUrl('/one');

             tick();

             expect(location.path()).toEqual('/redirected');
             expect(location.urlChanges).toEqual(['replace: /', '/one', 'replace: /redirected']);
           })));

        it('should resolve navigateByUrl promise after redirect finishes',
           fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
             let resolvedPath = '';
             router.urlUpdateStrategy = 'eager';
             router.resetConfig([
               {path: '', component: SimpleCmp},
               {path: 'one', component: RouteCmp, canActivate: ['returnUrlTree']},
               {path: 'redirected', component: SimpleCmp}
             ]);
             const fixture = createRoot(router, RootCmp);
             router.navigateByUrl('/one').then(v => {
               resolvedPath = location.path();
             });

             tick();
             expect(resolvedPath).toBe('/redirected');
           })));
      });

      describe('runGuardsAndResolvers', () => {
        let guardRunCount = 0;
        let resolverRunCount = 0;

        beforeEach(() => {
          guardRunCount = 0;
          resolverRunCount = 0;
          TestBed.configureTestingModule({
            providers: [
              {
                provide: 'guard',
                useValue: () => {
                  guardRunCount++;
                  return true;
                }
              },
              {provide: 'resolver', useValue: () => resolverRunCount++}
            ]
          });
        });

        function configureRouter(router: Router, runGuardsAndResolvers: RunGuardsAndResolvers):
            ComponentFixture<RootCmpWithTwoOutlets> {
          const fixture = createRoot(router, RootCmpWithTwoOutlets);

          router.resetConfig([
            {
              path: 'a',
              runGuardsAndResolvers,
              component: RouteCmp,
              canActivate: ['guard'],
              resolve: {data: 'resolver'}
            },
            {path: 'b', component: SimpleCmp, outlet: 'right'}, {
              path: 'c/:param',
              runGuardsAndResolvers,
              component: RouteCmp,
              canActivate: ['guard'],
              resolve: {data: 'resolver'}
            },
            {
              path: 'd/:param',
              component: WrapperCmp,
              runGuardsAndResolvers,
              children: [
                {
                  path: 'e/:param',
                  component: SimpleCmp,
                  canActivate: ['guard'],
                  resolve: {data: 'resolver'},
                },
              ]
            },
            {
              path: 'throwing',
              runGuardsAndResolvers,
              component: ThrowingCmp,
              canActivate: ['guard'],
              resolve: {data: 'resolver'}
            }
          ]);

          router.navigateByUrl('/a');
          advance(fixture);
          return fixture;
        }


        it('should rerun guards and resolvers when params change',
           fakeAsync(inject([Router], (router: Router) => {
             const fixture = configureRouter(router, 'paramsChange');

             const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
             const recordedData: Data[] = [];
             cmp.route.data.subscribe((data) => recordedData.push(data));

             expect(guardRunCount).toEqual(1);
             expect(recordedData).toEqual([{data: 0}]);

             router.navigateByUrl('/a;p=1');
             advance(fixture);
             expect(guardRunCount).toEqual(2);
             expect(recordedData).toEqual([{data: 0}, {data: 1}]);

             router.navigateByUrl('/a;p=2');
             advance(fixture);
             expect(guardRunCount).toEqual(3);
             expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);

             router.navigateByUrl('/a;p=2?q=1');
             advance(fixture);
             expect(guardRunCount).toEqual(3);
             expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);
           })));

        it('should rerun guards and resolvers when query params change',
           fakeAsync(inject([Router], (router: Router) => {
             const fixture = configureRouter(router, 'paramsOrQueryParamsChange');

             const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
             const recordedData: Data[] = [];
             cmp.route.data.subscribe((data) => recordedData.push(data));

             expect(guardRunCount).toEqual(1);
             expect(recordedData).toEqual([{data: 0}]);

             router.navigateByUrl('/a;p=1');
             advance(fixture);
             expect(guardRunCount).toEqual(2);
             expect(recordedData).toEqual([{data: 0}, {data: 1}]);

             router.navigateByUrl('/a;p=2');
             advance(fixture);
             expect(guardRunCount).toEqual(3);
             expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);

             router.navigateByUrl('/a;p=2?q=1');
             advance(fixture);
             expect(guardRunCount).toEqual(4);
             expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}, {data: 3}]);

             router.navigateByUrl('/a;p=2(right:b)?q=1');
             advance(fixture);
             expect(guardRunCount).toEqual(4);
             expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}, {data: 3}]);
           })));

        it('should always rerun guards and resolvers',
           fakeAsync(inject([Router], (router: Router) => {
             const fixture = configureRouter(router, 'always');

             const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
             const recordedData: Data[] = [];
             cmp.route.data.subscribe((data) => recordedData.push(data));

             expect(guardRunCount).toEqual(1);
             expect(recordedData).toEqual([{data: 0}]);

             router.navigateByUrl('/a;p=1');
             advance(fixture);
             expect(guardRunCount).toEqual(2);
             expect(recordedData).toEqual([{data: 0}, {data: 1}]);

             router.navigateByUrl('/a;p=2');
             advance(fixture);
             expect(guardRunCount).toEqual(3);
             expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);

             router.navigateByUrl('/a;p=2?q=1');
             advance(fixture);
             expect(guardRunCount).toEqual(4);
             expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}, {data: 3}]);

             router.navigateByUrl('/a;p=2(right:b)?q=1');
             advance(fixture);
             expect(guardRunCount).toEqual(5);
             expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}, {data: 3}, {data: 4}]);

             // Issue #39030, always running guards and resolvers should not throw
             // when navigating away from a component with a throwing constructor.
             expect(() => {
               router.navigateByUrl('/throwing').catch(() => {});
               advance(fixture);
               router.navigateByUrl('/a;p=1');
               advance(fixture);
             }).not.toThrow();
           })));

        it('should rerun rerun guards and resolvers when path params change',
           fakeAsync(inject([Router], (router: Router) => {
             const fixture = configureRouter(router, 'pathParamsChange');

             const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
             const recordedData: Data[] = [];
             cmp.route.data.subscribe((data) => recordedData.push(data));

             // First navigation has already run
             expect(guardRunCount).toEqual(1);
             expect(recordedData).toEqual([{data: 0}]);

             // Changing any optional params will not result in running guards or resolvers
             router.navigateByUrl('/a;p=1');
             advance(fixture);
             expect(guardRunCount).toEqual(1);
             expect(recordedData).toEqual([{data: 0}]);

             router.navigateByUrl('/a;p=2');
             advance(fixture);
             expect(guardRunCount).toEqual(1);
             expect(recordedData).toEqual([{data: 0}]);

             router.navigateByUrl('/a;p=2?q=1');
             advance(fixture);
             expect(guardRunCount).toEqual(1);
             expect(recordedData).toEqual([{data: 0}]);

             router.navigateByUrl('/a;p=2(right:b)?q=1');
             advance(fixture);
             expect(guardRunCount).toEqual(1);
             expect(recordedData).toEqual([{data: 0}]);

             // Change to new route with path param should run guards and resolvers
             router.navigateByUrl('/c/paramValue');
             advance(fixture);

             expect(guardRunCount).toEqual(2);

             // Modifying a path param should run guards and resolvers
             router.navigateByUrl('/c/paramValueChanged');
             advance(fixture);
             expect(guardRunCount).toEqual(3);

             // Adding optional params should not cause guards/resolvers to run
             router.navigateByUrl('/c/paramValueChanged;p=1?q=2');
             advance(fixture);
             expect(guardRunCount).toEqual(3);
           })));

        it('should rerun when a parent segment changes',
           fakeAsync(inject([Router], (router: Router) => {
             const fixture = configureRouter(router, 'pathParamsChange');

             const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;

             // Land on an initial page
             router.navigateByUrl('/d/1;dd=11/e/2;dd=22');
             advance(fixture);

             expect(guardRunCount).toEqual(2);

             // Changes cause re-run on the config with the guard
             router.navigateByUrl('/d/1;dd=11/e/3;ee=22');
             advance(fixture);

             expect(guardRunCount).toEqual(3);

             // Changes to the parent also cause re-run
             router.navigateByUrl('/d/2;dd=11/e/3;ee=22');
             advance(fixture);

             expect(guardRunCount).toEqual(4);
           })));

        it('should rerun rerun guards and resolvers when path or query params change',
           fakeAsync(inject([Router], (router: Router) => {
             const fixture = configureRouter(router, 'pathParamsOrQueryParamsChange');

             const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
             const recordedData: Data[] = [];
             cmp.route.data.subscribe((data) => recordedData.push(data));

             // First navigation has already run
             expect(guardRunCount).toEqual(1);
             expect(recordedData).toEqual([{data: 0}]);

             // Changing matrix params will not result in running guards or resolvers
             router.navigateByUrl('/a;p=1');
             advance(fixture);
             expect(guardRunCount).toEqual(1);
             expect(recordedData).toEqual([{data: 0}]);

             router.navigateByUrl('/a;p=2');
             advance(fixture);
             expect(guardRunCount).toEqual(1);
             expect(recordedData).toEqual([{data: 0}]);

             // Adding query params will re-run guards/resolvers
             router.navigateByUrl('/a;p=2?q=1');
             advance(fixture);
             expect(guardRunCount).toEqual(2);
             expect(recordedData).toEqual([{data: 0}, {data: 1}]);

             // Changing query params will re-run guards/resolvers
             router.navigateByUrl('/a;p=2?q=2');
             advance(fixture);
             expect(guardRunCount).toEqual(3);
             expect(recordedData).toEqual([{data: 0}, {data: 1}, {data: 2}]);
           })));

        it('should allow a predicate function to determine when to run guards and resolvers',
           fakeAsync(inject([Router], (router: Router) => {
             const fixture = configureRouter(router, (from, to) => to.paramMap.get('p') === '2');

             const cmp: RouteCmp = fixture.debugElement.children[1].componentInstance;
             const recordedData: Data[] = [];
             cmp.route.data.subscribe((data) => recordedData.push(data));

             // First navigation has already run
             expect(guardRunCount).toEqual(1);
             expect(recordedData).toEqual([{data: 0}]);

             // Adding `p` param shouldn't cause re-run
             router.navigateByUrl('/a;p=1');
             advance(fixture);
             expect(guardRunCount).toEqual(1);
             expect(recordedData).toEqual([{data: 0}]);

             // Re-run should trigger on p=2
             router.navigateByUrl('/a;p=2');
             advance(fixture);
             expect(guardRunCount).toEqual(2);
             expect(recordedData).toEqual([{data: 0}, {data: 1}]);

             // Any other changes don't pass the predicate
             router.navigateByUrl('/a;p=3?q=1');
             advance(fixture);
             expect(guardRunCount).toEqual(2);
             expect(recordedData).toEqual([{data: 0}, {data: 1}]);

             // Changing query params will re-run guards/resolvers
             router.navigateByUrl('/a;p=3?q=2');
             advance(fixture);
             expect(guardRunCount).toEqual(2);
             expect(recordedData).toEqual([{data: 0}, {data: 1}]);
           })));
      });

      describe('should wait for parent to complete', () => {
        let log: string[];

        beforeEach(() => {
          log = [];
          TestBed.configureTestingModule({
            providers: [
              {
                provide: 'parentGuard',
                useValue: () => {
                  return delayPromise(10).then(() => {
                    log.push('parent');
                    return true;
                  });
                }
              },
              {
                provide: 'childGuard',
                useValue: () => {
                  return delayPromise(5).then(() => {
                    log.push('child');
                    return true;
                  });
                }
              }
            ]
          });
        });

        function delayPromise(delay: number): Promise<boolean> {
          let resolve: (val: boolean) => void;
          const promise = new Promise<boolean>(res => resolve = res);
          setTimeout(() => resolve(true), delay);
          return promise;
        }

        it('works', fakeAsync(inject([Router], (router: Router) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig([{
               path: 'parent',
               canActivate: ['parentGuard'],
               children: [
                 {path: 'child', component: SimpleCmp, canActivate: ['childGuard']},
               ]
             }]);

             router.navigateByUrl('/parent/child');
             advance(fixture);
             tick(15);
             expect(log).toEqual(['parent', 'child']);
           })));
      });
    });

    describe('CanDeactivate', () => {
      let log: any;

      beforeEach(() => {
        log = [];

        TestBed.configureTestingModule({
          providers: [
            {
              provide: 'CanDeactivateParent',
              useValue: (c: any, a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                return a.params['id'] === '22';
              }
            },
            {
              provide: 'CanDeactivateTeam',
              useValue: (c: any, a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                return c.route.snapshot.params['id'] === '22';
              }
            },
            {
              provide: 'CanDeactivateUser',
              useValue: (c: any, a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                return a.params['name'] === 'victor';
              }
            },
            {
              provide: 'RecordingDeactivate',
              useValue: (c: any, a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                log.push({path: a.routeConfig!.path, component: c});
                return true;
              }
            },
            {
              provide: 'alwaysFalse',
              useValue: (c: any, a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                return false;
              }
            },
            {
              provide: 'alwaysFalseAndLogging',
              useValue: (c: any, a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                log.push('called');
                return false;
              }
            },
            {
              provide: 'alwaysFalseWithDelayAndLogging',
              useValue: () => {
                log.push('called');
                let resolve: (result: boolean) => void;
                const promise = new Promise(res => resolve = res);
                setTimeout(() => resolve(false), 0);
                return promise;
              }
            },
            {
              provide: 'canActivate_alwaysTrueAndLogging',
              useValue: () => {
                log.push('canActivate called');
                return true;
              }
            },
          ]
        });
      });

      describe('should not deactivate a route when CanDeactivate returns false', () => {
        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig(
                 [{path: 'team/:id', component: TeamCmp, canDeactivate: ['CanDeactivateTeam']}]);

             router.navigateByUrl('/team/22');
             advance(fixture);
             expect(location.path()).toEqual('/team/22');

             let successStatus: boolean = false;
             router.navigateByUrl('/team/33')!.then(res => successStatus = res);
             advance(fixture);
             expect(location.path()).toEqual('/team/33');
             expect(successStatus).toEqual(true);

             let canceledStatus: boolean = false;
             router.navigateByUrl('/team/44')!.then(res => canceledStatus = res);
             advance(fixture);
             expect(location.path()).toEqual('/team/33');
             expect(canceledStatus).toEqual(false);
           })));

        it('works with componentless routes',
           fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig([
               {
                 path: 'grandparent',
                 canDeactivate: ['RecordingDeactivate'],
                 children: [{
                   path: 'parent',
                   canDeactivate: ['RecordingDeactivate'],
                   children: [{
                     path: 'child',
                     canDeactivate: ['RecordingDeactivate'],
                     children: [{
                       path: 'simple',
                       component: SimpleCmp,
                       canDeactivate: ['RecordingDeactivate']
                     }]
                   }]
                 }]
               },
               {path: 'simple', component: SimpleCmp}
             ]);

             router.navigateByUrl('/grandparent/parent/child/simple');
             advance(fixture);
             expect(location.path()).toEqual('/grandparent/parent/child/simple');

             router.navigateByUrl('/simple');
             advance(fixture);

             const child = fixture.debugElement.children[1].componentInstance;

             expect(log.map((a: any) => a.path)).toEqual([
               'simple', 'child', 'parent', 'grandparent'
             ]);
             expect(log[0].component instanceof SimpleCmp).toBeTruthy();
             [1, 2, 3].forEach(i => expect(log[i].component).toBeNull());
             expect(child instanceof SimpleCmp).toBeTruthy();
             expect(child).not.toBe(log[0].component);
           })));

        it('works with aux routes',
           fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig([{
               path: 'two-outlets',
               component: TwoOutletsCmp,
               children: [
                 {path: 'a', component: BlankCmp}, {
                   path: 'b',
                   canDeactivate: ['RecordingDeactivate'],
                   component: SimpleCmp,
                   outlet: 'aux'
                 }
               ]
             }]);

             router.navigateByUrl('/two-outlets/(a//aux:b)');
             advance(fixture);
             expect(location.path()).toEqual('/two-outlets/(a//aux:b)');

             router.navigate(['two-outlets', {outlets: {aux: null}}]);
             advance(fixture);

             expect(log.map((a: any) => a.path)).toEqual(['b']);
             expect(location.path()).toEqual('/two-outlets/a');
           })));

        it('works with a nested route',
           fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig([{
               path: 'team/:id',
               component: TeamCmp,
               children: [
                 {path: '', pathMatch: 'full', component: SimpleCmp},
                 {path: 'user/:name', component: UserCmp, canDeactivate: ['CanDeactivateUser']}
               ]
             }]);

             router.navigateByUrl('/team/22/user/victor');
             advance(fixture);

             // this works because we can deactivate victor
             router.navigateByUrl('/team/33');
             advance(fixture);
             expect(location.path()).toEqual('/team/33');

             router.navigateByUrl('/team/33/user/fedor');
             advance(fixture);

             // this doesn't work cause we cannot deactivate fedor
             router.navigateByUrl('/team/44');
             advance(fixture);
             expect(location.path()).toEqual('/team/33/user/fedor');
           })));
      });

      it('should use correct component to deactivate forChild route',
         fakeAsync(inject([Router], (router: Router) => {
           @Component({selector: 'admin', template: ''})
           class AdminComponent {
           }

           @NgModule({
             declarations: [AdminComponent],
             imports: [RouterModule.forChild([{
               path: '',
               component: AdminComponent,
               canDeactivate: ['RecordingDeactivate'],
             }])],
           })
           class LazyLoadedModule {
           }

           const fixture = createRoot(router, RootCmp);

           router.resetConfig([
             {
               path: 'a',
               component: WrapperCmp,
               children: [
                 {path: '', pathMatch: 'full', loadChildren: () => LazyLoadedModule},
               ]
             },
             {path: 'b', component: SimpleCmp},
           ]);

           router.navigateByUrl('/a');
           advance(fixture);
           router.navigateByUrl('/b');
           advance(fixture);

           expect(log[0].component).toBeAnInstanceOf(AdminComponent);
         })));

      it('should not create a route state if navigation is canceled',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{
             path: 'main',
             component: TeamCmp,
             children: [
               {path: 'component1', component: SimpleCmp, canDeactivate: ['alwaysFalse']},
               {path: 'component2', component: SimpleCmp}
             ]
           }]);

           router.navigateByUrl('/main/component1');
           advance(fixture);

           router.navigateByUrl('/main/component2');
           advance(fixture);

           const teamCmp = fixture.debugElement.children[1].componentInstance;
           expect(teamCmp.route.firstChild.url.value[0].path).toEqual('component1');
           expect(location.path()).toEqual('/main/component1');
         })));

      it('should not run CanActivate when CanDeactivate returns false',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{
             path: 'main',
             component: TeamCmp,
             children: [
               {
                 path: 'component1',
                 component: SimpleCmp,
                 canDeactivate: ['alwaysFalseWithDelayAndLogging']
               },
               {
                 path: 'component2',
                 component: SimpleCmp,
                 canActivate: ['canActivate_alwaysTrueAndLogging']
               },
             ]
           }]);

           router.navigateByUrl('/main/component1');
           advance(fixture);
           expect(location.path()).toEqual('/main/component1');

           router.navigateByUrl('/main/component2');
           advance(fixture);
           expect(location.path()).toEqual('/main/component1');
           expect(log).toEqual(['called']);
         })));

      it('should call guards every time when navigating to the same url over and over again',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([
             {path: 'simple', component: SimpleCmp, canDeactivate: ['alwaysFalseAndLogging']},
             {path: 'blank', component: BlankCmp}

           ]);

           router.navigateByUrl('/simple');
           advance(fixture);

           router.navigateByUrl('/blank');
           advance(fixture);
           expect(log).toEqual(['called']);
           expect(location.path()).toEqual('/simple');

           router.navigateByUrl('/blank');
           advance(fixture);
           expect(log).toEqual(['called', 'called']);
           expect(location.path()).toEqual('/simple');
         })));

      describe('next state', () => {
        let log: string[];

        class ClassWithNextState {
          canDeactivate(
              component: TeamCmp, currentRoute: ActivatedRouteSnapshot,
              currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): boolean {
            log.push(currentState.url, nextState.url);
            return true;
          }
        }

        beforeEach(() => {
          log = [];
          TestBed.configureTestingModule({
            providers: [
              ClassWithNextState, {
                provide: 'FunctionWithNextState',
                useValue:
                    (cmp: any, currentRoute: ActivatedRouteSnapshot,
                     currentState: RouterStateSnapshot, nextState: RouterStateSnapshot) => {
                      log.push(currentState.url, nextState.url);
                      return true;
                    }
              }
            ]
          });
        });

        it('should pass next state as the 4 argument when guard is a class',
           fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig([{
               path: 'team/:id',
               component: TeamCmp,
               canDeactivate:
                   [(component: TeamCmp, currentRoute: ActivatedRouteSnapshot,
                     currentState: RouterStateSnapshot, nextState: RouterStateSnapshot) =>
                        coreInject(ClassWithNextState)
                            .canDeactivate(component, currentRoute, currentState, nextState)]
             }]);

             router.navigateByUrl('/team/22');
             advance(fixture);
             expect(location.path()).toEqual('/team/22');

             router.navigateByUrl('/team/33');
             advance(fixture);
             expect(location.path()).toEqual('/team/33');
             expect(log).toEqual(['/team/22', '/team/33']);
           })));

        it('should pass next state as the 4 argument when guard is a function',
           fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig([
               {path: 'team/:id', component: TeamCmp, canDeactivate: ['FunctionWithNextState']}
             ]);

             router.navigateByUrl('/team/22');
             advance(fixture);
             expect(location.path()).toEqual('/team/22');

             router.navigateByUrl('/team/33');
             advance(fixture);
             expect(location.path()).toEqual('/team/33');
             expect(log).toEqual(['/team/22', '/team/33']);
           })));
      });

      describe('should work when given a class', () => {
        class AlwaysTrue {
          canDeactivate(): boolean {
            return true;
          }
        }

        beforeEach(() => {
          TestBed.configureTestingModule({providers: [AlwaysTrue]});
        });

        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig([{
               path: 'team/:id',
               component: TeamCmp,
               canDeactivate: [() => coreInject(AlwaysTrue).canDeactivate()]
             }]);

             router.navigateByUrl('/team/22');
             advance(fixture);
             expect(location.path()).toEqual('/team/22');

             router.navigateByUrl('/team/33');
             advance(fixture);
             expect(location.path()).toEqual('/team/33');
           })));
      });


      describe('should work when returns an observable', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [{
              provide: 'CanDeactivate',
              useValue: (c: TeamCmp, a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                return new Observable<boolean>((observer) => {
                  observer.next(false);
                });
              }
            }]
          });
        });

        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig(
                 [{path: 'team/:id', component: TeamCmp, canDeactivate: ['CanDeactivate']}]);

             router.navigateByUrl('/team/22');
             advance(fixture);
             expect(location.path()).toEqual('/team/22');

             router.navigateByUrl('/team/33');
             advance(fixture);
             expect(location.path()).toEqual('/team/22');
           })));
      });
    });

    describe('CanActivateChild', () => {
      describe('should be invoked when activating a child', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [{
              provide: 'alwaysFalse',
              useValue: (a: any, b: any) => a.paramMap.get('id') === '22',
            }]
          });
        });

        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig([{
               path: '',
               canActivateChild: ['alwaysFalse'],
               children: [{path: 'team/:id', component: TeamCmp}]
             }]);

             router.navigateByUrl('/team/22');
             advance(fixture);

             expect(location.path()).toEqual('/team/22');

             router.navigateByUrl('/team/33')!.catch(() => {});
             advance(fixture);

             expect(location.path()).toEqual('/team/22');
           })));
      });

      it('should find the guard provided in lazy loaded module',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           @Component({selector: 'admin', template: '<router-outlet></router-outlet>'})
           class AdminComponent {
           }

           @Component({selector: 'lazy', template: 'lazy-loaded'})
           class LazyLoadedComponent {
           }

           @NgModule({
             declarations: [AdminComponent, LazyLoadedComponent],
             imports: [RouterModule.forChild([{
               path: '',
               component: AdminComponent,
               children: [{
                 path: '',
                 canActivateChild: ['alwaysTrue'],
                 children: [{path: '', component: LazyLoadedComponent}]
               }]
             }])],
             providers: [{provide: 'alwaysTrue', useValue: () => true}],
           })
           class LazyLoadedModule {
           }

           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{path: 'admin', loadChildren: () => LazyLoadedModule}]);

           router.navigateByUrl('/admin');
           advance(fixture);

           expect(location.path()).toEqual('/admin');
           expect(fixture.nativeElement).toHaveText('lazy-loaded');
         })));
    });

    describe('CanLoad', () => {
      let canLoadRunCount = 0;
      beforeEach(() => {
        canLoadRunCount = 0;
        TestBed.configureTestingModule({
          providers: [
            {provide: 'alwaysFalse', useValue: (a: any) => false},
            {
              provide: 'returnUrlTree',
              useFactory: (router: Router) => () => {
                return router.createUrlTree(['blank']);
              },
              deps: [Router],
            },
            {
              provide: 'returnFalseAndNavigate',
              useFactory: (router: Router) => (a: any) => {
                router.navigate(['blank']);
                return false;
              },
              deps: [Router],
            },
            {
              provide: 'alwaysTrue',
              useValue: () => {
                canLoadRunCount++;
                return true;
              }
            },
          ]
        });
      });

      it('should not load children when CanLoad returns false',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           @Component({selector: 'lazy', template: 'lazy-loaded'})
           class LazyLoadedComponent {
           }

           @NgModule({
             declarations: [LazyLoadedComponent],
             imports: [RouterModule.forChild([{path: 'loaded', component: LazyLoadedComponent}])]
           })
           class LoadedModule {
           }

           const fixture = createRoot(router, RootCmp);

           router.resetConfig([
             {path: 'lazyFalse', canLoad: ['alwaysFalse'], loadChildren: () => LoadedModule},
             {path: 'lazyTrue', canLoad: ['alwaysTrue'], loadChildren: () => LoadedModule}
           ]);

           const recordedEvents: Event[] = [];
           router.events.forEach(e => recordedEvents.push(e));


           // failed navigation
           router.navigateByUrl('/lazyFalse/loaded');
           advance(fixture);

           expect(location.path()).toEqual('/');

           expectEvents(recordedEvents, [
             [NavigationStart, '/lazyFalse/loaded'],
             //  [GuardsCheckStart, '/lazyFalse/loaded'],
             [NavigationCancel, '/lazyFalse/loaded'],
           ]);

           expect((recordedEvents[1] as NavigationCancel).code)
               .toBe(NavigationCancellationCode.GuardRejected);

           recordedEvents.splice(0);

           // successful navigation
           router.navigateByUrl('/lazyTrue/loaded');
           advance(fixture);

           expect(location.path()).toEqual('/lazyTrue/loaded');

           expectEvents(recordedEvents, [
             [NavigationStart, '/lazyTrue/loaded'],
             [RouteConfigLoadStart],
             [RouteConfigLoadEnd],
             [RoutesRecognized, '/lazyTrue/loaded'],
             [GuardsCheckStart, '/lazyTrue/loaded'],
             [ChildActivationStart],
             [ActivationStart],
             [ChildActivationStart],
             [ActivationStart],
             [GuardsCheckEnd, '/lazyTrue/loaded'],
             [ResolveStart, '/lazyTrue/loaded'],
             [ResolveEnd, '/lazyTrue/loaded'],
             [ActivationEnd],
             [ChildActivationEnd],
             [ActivationEnd],
             [ChildActivationEnd],
             [NavigationEnd, '/lazyTrue/loaded'],
           ]);
         })));

      it('should support navigating from within the guard',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([
             {
               path: 'lazyFalse',
               canLoad: ['returnFalseAndNavigate'],
               loadChildren: jasmine.createSpy('lazyFalse')
             },
             {path: 'blank', component: BlankCmp}
           ]);

           const recordedEvents: Event[] = [];
           router.events.forEach(e => recordedEvents.push(e));


           router.navigateByUrl('/lazyFalse/loaded');
           advance(fixture);

           expect(location.path()).toEqual('/blank');

           expectEvents(recordedEvents, [
             [NavigationStart, '/lazyFalse/loaded'],
             // No GuardCheck events as `canLoad` is a special guard that's not actually part of
             // the guard lifecycle.
             [NavigationCancel, '/lazyFalse/loaded'],

             [NavigationStart, '/blank'], [RoutesRecognized, '/blank'],
             [GuardsCheckStart, '/blank'], [ChildActivationStart], [ActivationStart],
             [GuardsCheckEnd, '/blank'], [ResolveStart, '/blank'], [ResolveEnd, '/blank'],
             [ActivationEnd], [ChildActivationEnd], [NavigationEnd, '/blank']
           ]);

           expect((recordedEvents[1] as NavigationCancel).code)
               .toBe(NavigationCancellationCode.SupersededByNewNavigation);
         })));

      it('should support returning UrlTree from within the guard',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([
             {
               path: 'lazyFalse',
               canLoad: ['returnUrlTree'],
               loadChildren: jasmine.createSpy('lazyFalse')
             },
             {path: 'blank', component: BlankCmp}
           ]);

           const recordedEvents: Event[] = [];
           router.events.forEach(e => recordedEvents.push(e));


           router.navigateByUrl('/lazyFalse/loaded');
           advance(fixture);

           expect(location.path()).toEqual('/blank');

           expectEvents(recordedEvents, [
             [NavigationStart, '/lazyFalse/loaded'],
             // No GuardCheck events as `canLoad` is a special guard that's not actually part of
             // the guard lifecycle.
             [NavigationCancel, '/lazyFalse/loaded'],

             [NavigationStart, '/blank'], [RoutesRecognized, '/blank'],
             [GuardsCheckStart, '/blank'], [ChildActivationStart], [ActivationStart],
             [GuardsCheckEnd, '/blank'], [ResolveStart, '/blank'], [ResolveEnd, '/blank'],
             [ActivationEnd], [ChildActivationEnd], [NavigationEnd, '/blank']
           ]);

           expect((recordedEvents[1] as NavigationCancel).code)
               .toBe(NavigationCancellationCode.Redirect);
         })));

      // Regression where navigateByUrl with false CanLoad no longer resolved `false` value on
      // navigateByUrl promise: https://github.com/angular/angular/issues/26284
      it('should resolve navigateByUrl promise after CanLoad executes',
         fakeAsync(inject([Router], (router: Router) => {
           @Component({selector: 'lazy', template: 'lazy-loaded'})
           class LazyLoadedComponent {
           }

           @NgModule({
             declarations: [LazyLoadedComponent],
             imports: [RouterModule.forChild([{path: 'loaded', component: LazyLoadedComponent}])]
           })
           class LazyLoadedModule {
           }

           const fixture = createRoot(router, RootCmp);

           router.resetConfig([
             {path: 'lazy-false', canLoad: ['alwaysFalse'], loadChildren: () => LazyLoadedModule},
             {path: 'lazy-true', canLoad: ['alwaysTrue'], loadChildren: () => LazyLoadedModule},
           ]);

           let navFalseResult = true;
           let navTrueResult = false;
           router.navigateByUrl('/lazy-false').then(v => {
             navFalseResult = v;
           });
           advance(fixture);
           router.navigateByUrl('/lazy-true').then(v => {
             navTrueResult = v;
           });
           advance(fixture);

           expect(navFalseResult).toBe(false);
           expect(navTrueResult).toBe(true);
         })));

      it('should execute CanLoad only once',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           @Component({selector: 'lazy', template: 'lazy-loaded'})
           class LazyLoadedComponent {
           }

           @NgModule({
             declarations: [LazyLoadedComponent],
             imports: [RouterModule.forChild([{path: 'loaded', component: LazyLoadedComponent}])]
           })
           class LazyLoadedModule {
           }

           const fixture = createRoot(router, RootCmp);

           router.resetConfig(
               [{path: 'lazy', canLoad: ['alwaysTrue'], loadChildren: () => LazyLoadedModule}]);

           router.navigateByUrl('/lazy/loaded');
           advance(fixture);
           expect(location.path()).toEqual('/lazy/loaded');
           expect(canLoadRunCount).toEqual(1);

           router.navigateByUrl('/');
           advance(fixture);
           expect(location.path()).toEqual('/');

           router.navigateByUrl('/lazy/loaded');
           advance(fixture);
           expect(location.path()).toEqual('/lazy/loaded');
           expect(canLoadRunCount).toEqual(1);
         })));

      it('cancels guard execution when a new navigation happens', fakeAsync(() => {
           @Injectable({providedIn: 'root'})
           class DelayedGuard {
             static delayedExecutions = 0;
             static canLoadCalls = 0;
             canLoad() {
               DelayedGuard.canLoadCalls++;
               return of(true).pipe(delay(1000), tap(() => {
                                      DelayedGuard.delayedExecutions++;
                                    }));
             }
           }
           const router = TestBed.inject(Router);
           router.resetConfig([
             {path: 'a', canLoad: [DelayedGuard], loadChildren: () => [], component: SimpleCmp},
             {path: 'team/:id', component: TeamCmp},
           ]);
           const fixture = createRoot(router, RootCmp);

           router.navigateByUrl('/a');
           tick(10);
           // The delayed guard should have started
           expect(DelayedGuard.canLoadCalls).toEqual(1);
           router.navigateByUrl('/team/1');
           advance(fixture, 1000);
           expect(fixture.nativeElement.innerHTML).toContain('team');
           // The delayed guard should not execute the delayed condition because a new navigation
           // cancels the current one and unsubscribes from intermediate results.
           expect(DelayedGuard.delayedExecutions).toEqual(0);
         }));
    });

    describe('should run CanLoad guards concurrently', () => {
      function delayObservable(delayMs: number): Observable<boolean> {
        return of(delayMs).pipe(delay(delayMs), mapTo(true));
      }

      let log: string[];

      beforeEach(() => {
        log = [];
        TestBed.configureTestingModule({
          providers: [
            {
              provide: 'guard1',
              useValue: () => {
                return delayObservable(5).pipe(tap({next: () => log.push('guard1')}));
              }
            },
            {
              provide: 'guard2',
              useValue: () => {
                return delayObservable(0).pipe(tap({next: () => log.push('guard2')}));
              }
            },
            {
              provide: 'returnFalse',
              useValue: () => {
                log.push('returnFalse');
                return false;
              }
            },
            {
              provide: 'returnFalseAndNavigate',
              useFactory: (router: Router) => () => {
                log.push('returnFalseAndNavigate');
                router.navigateByUrl('/redirected');
                return false;
              },
              deps: [Router]
            },
            {
              provide: 'returnUrlTree',
              useFactory: (router: Router) => () => {
                return delayObservable(15).pipe(
                    mapTo(router.parseUrl('/redirected')),
                    tap({next: () => log.push('returnUrlTree')}));
              },
              deps: [Router]
            },
          ]
        });
      });

      it('should only execute canLoad guards of routes being activated', fakeAsync(() => {
           const router = TestBed.inject(Router);

           router.resetConfig([
             {path: 'lazy', canLoad: ['guard1'], loadChildren: () => of(ModuleWithBlankCmpAsRoute)},
             {path: 'redirected', component: SimpleCmp},
             // canLoad should not run for this route because 'lazy' activates first
             {
               path: '',
               canLoad: ['returnFalseAndNavigate'],
               loadChildren: () => of(ModuleWithBlankCmpAsRoute)
             },
           ]);

           router.navigateByUrl('/lazy');
           tick(5);
           expect(log.length).toEqual(1);
           expect(log).toEqual(['guard1']);
         }));

      it('should execute canLoad guards', fakeAsync(inject([Router], (router: Router) => {
           router.resetConfig([{
             path: 'lazy',
             canLoad: ['guard1', 'guard2'],
             loadChildren: () => ModuleWithBlankCmpAsRoute
           }]);

           router.navigateByUrl('/lazy');
           tick(5);

           expect(log.length).toEqual(2);
           expect(log).toEqual(['guard2', 'guard1']);
         })));

      it('should redirect with UrlTree if higher priority guards have resolved',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           router.resetConfig([
             {
               path: 'lazy',
               canLoad: ['returnUrlTree', 'guard1', 'guard2'],
               loadChildren: () => ModuleWithBlankCmpAsRoute
             },
             {path: 'redirected', component: SimpleCmp}
           ]);

           router.navigateByUrl('/lazy');
           tick(15);

           expect(log.length).toEqual(3);
           expect(log).toEqual(['guard2', 'guard1', 'returnUrlTree']);
           expect(location.path()).toEqual('/redirected');
         })));

      it('should redirect with UrlTree if UrlTree is lower priority',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           router.resetConfig([
             {
               path: 'lazy',
               canLoad: ['guard1', 'returnUrlTree'],
               loadChildren: () => ModuleWithBlankCmpAsRoute
             },
             {path: 'redirected', component: SimpleCmp}
           ]);

           router.navigateByUrl('/lazy');
           tick(15);

           expect(log.length).toEqual(2);
           expect(log).toEqual(['guard1', 'returnUrlTree']);
           expect(location.path()).toEqual('/redirected');
         })));
    });

    describe('order', () => {
      class Logger {
        logs: string[] = [];
        add(thing: string) {
          this.logs.push(thing);
        }
      }

      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [
            Logger, {
              provide: 'canActivateChild_parent',
              useFactory: (logger: Logger) => () => (logger.add('canActivateChild_parent'), true),
              deps: [Logger]
            },
            {
              provide: 'canActivate_team',
              useFactory: (logger: Logger) => () => (logger.add('canActivate_team'), true),
              deps: [Logger]
            },
            {
              provide: 'canDeactivate_team',
              useFactory: (logger: Logger) => () => (logger.add('canDeactivate_team'), true),
              deps: [Logger]
            },
            {
              provide: 'canDeactivate_simple',
              useFactory: (logger: Logger) => () => (logger.add('canDeactivate_simple'), true),
              deps: [Logger]
            }
          ]
        });
      });

      it('should call guards in the right order',
         fakeAsync(inject(
             [Router, Location, Logger], (router: Router, location: Location, logger: Logger) => {
               const fixture = createRoot(router, RootCmp);

               router.resetConfig([{
                 path: '',
                 canActivateChild: ['canActivateChild_parent'],
                 children: [{
                   path: 'team/:id',
                   canActivate: ['canActivate_team'],
                   canDeactivate: ['canDeactivate_team'],
                   component: TeamCmp
                 }]
               }]);

               router.navigateByUrl('/team/22');
               advance(fixture);

               router.navigateByUrl('/team/33');
               advance(fixture);

               expect(logger.logs).toEqual([
                 'canActivateChild_parent', 'canActivate_team',

                 'canDeactivate_team', 'canActivateChild_parent', 'canActivate_team'
               ]);
             })));

      it('should call deactivate guards from bottom to top',
         fakeAsync(inject(
             [Router, Location, Logger], (router: Router, location: Location, logger: Logger) => {
               const fixture = createRoot(router, RootCmp);

               router.resetConfig([{
                 path: '',
                 children: [{
                   path: 'team/:id',
                   canDeactivate: ['canDeactivate_team'],
                   children:
                       [{path: '', component: SimpleCmp, canDeactivate: ['canDeactivate_simple']}],
                   component: TeamCmp
                 }]
               }]);

               router.navigateByUrl('/team/22');
               advance(fixture);

               router.navigateByUrl('/team/33');
               advance(fixture);

               expect(logger.logs).toEqual(['canDeactivate_simple', 'canDeactivate_team']);
             })));
    });

    describe('canMatch', () => {
      @Injectable({providedIn: 'root'})
      class ConfigurableGuard {
        result: Promise<boolean|UrlTree>|Observable<boolean|UrlTree>|boolean|UrlTree = false;
        canMatch() {
          return this.result;
        }
      }

      it('falls back to second route when canMatch returns false', fakeAsync(() => {
           const router = TestBed.inject(Router);
           router.resetConfig([
             {
               path: 'a',
               canMatch: [() => coreInject(ConfigurableGuard).canMatch()],
               component: BlankCmp
             },
             {path: 'a', component: SimpleCmp},
           ]);
           const fixture = createRoot(router, RootCmp);

           router.navigateByUrl('/a');
           advance(fixture);
           expect(fixture.nativeElement.innerHTML).toContain('simple');
         }));

      it('uses route when canMatch returns true', fakeAsync(() => {
           const router = TestBed.inject(Router);
           TestBed.inject(ConfigurableGuard).result = Promise.resolve(true);
           router.resetConfig([
             {
               path: 'a',
               canMatch: [() => coreInject(ConfigurableGuard).canMatch()],
               component: SimpleCmp
             },
             {path: 'a', component: BlankCmp},
           ]);
           const fixture = createRoot(router, RootCmp);


           router.navigateByUrl('/a');
           advance(fixture);
           expect(fixture.nativeElement.innerHTML).toContain('simple');
         }));

      it('can return UrlTree from canMatch guard', fakeAsync(() => {
           const router = TestBed.inject(Router);
           TestBed.inject(ConfigurableGuard).result =
               Promise.resolve(router.createUrlTree(['/team/1']));
           router.resetConfig([
             {
               path: 'a',
               canMatch: [() => coreInject(ConfigurableGuard).canMatch()],
               component: SimpleCmp
             },
             {path: 'team/:id', component: TeamCmp},
           ]);
           const fixture = createRoot(router, RootCmp);


           router.navigateByUrl('/a');
           advance(fixture);
           expect(fixture.nativeElement.innerHTML).toContain('team');
         }));

      it('can return UrlTree from CanMatchFn guard', fakeAsync(() => {
           const canMatchTeamSection = new InjectionToken('CanMatchTeamSection');
           const canMatchFactory: (router: Router) => CanMatchFn = (router: Router) => () =>
               router.createUrlTree(['/team/1']);

           TestBed.overrideProvider(
               canMatchTeamSection, {useFactory: canMatchFactory, deps: [Router]});

           const router = TestBed.inject(Router);

           router.resetConfig([
             {path: 'a', canMatch: [canMatchTeamSection], component: SimpleCmp},
             {path: 'team/:id', component: TeamCmp},
           ]);
           const fixture = createRoot(router, RootCmp);


           router.navigateByUrl('/a');
           advance(fixture);
           expect(fixture.nativeElement.innerHTML).toContain('team');
         }));

      it('runs canMatch guards provided in lazy module', fakeAsync(() => {
           const router = TestBed.inject(Router);
           @Component(
               {selector: 'lazy', template: 'lazy-loaded-parent [<router-outlet></router-outlet>]'})
           class ParentLazyLoadedComponent {
           }

           @Component({selector: 'lazy', template: 'lazy-loaded-child'})
           class ChildLazyLoadedComponent {
           }
           @Injectable()
           class LazyCanMatchFalse {
             canMatch() {
               return false;
             }
           }
           @Component({template: 'restricted'})
           class Restricted {
           }
           @NgModule({
             declarations: [ParentLazyLoadedComponent, ChildLazyLoadedComponent, Restricted],
             providers: [LazyCanMatchFalse],
             imports: [RouterModule.forChild([
               {
                 path: 'loaded',
                 canMatch: [LazyCanMatchFalse],
                 component: Restricted,
                 children: [{path: 'child', component: Restricted}],
               },
               {
                 path: 'loaded',
                 component: ParentLazyLoadedComponent,
                 children: [{path: 'child', component: ChildLazyLoadedComponent}]
               }
             ])]
           })
           class LoadedModule {
           }


           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);
           router.navigateByUrl('/lazy/loaded/child');
           advance(fixture);

           expect(TestBed.inject(Location).path()).toEqual('/lazy/loaded/child');
           expect(fixture.nativeElement).toHaveText('lazy-loaded-parent [lazy-loaded-child]');
         }));

      it('cancels guard execution when a new navigation happens', fakeAsync(() => {
           @Injectable({providedIn: 'root'})
           class DelayedGuard {
             static delayedExecutions = 0;
             canMatch() {
               return of(true).pipe(delay(1000), tap(() => {
                                      DelayedGuard.delayedExecutions++;
                                    }));
             }
           }
           const router = TestBed.inject(Router);
           const delayedGuardSpy = spyOn(TestBed.inject(DelayedGuard), 'canMatch');
           delayedGuardSpy.and.callThrough();
           const configurableMatchSpy = spyOn(TestBed.inject(ConfigurableGuard), 'canMatch');
           configurableMatchSpy.and.callFake(() => {
             router.navigateByUrl('/team/1');
             return false;
           });
           router.resetConfig([
             {path: 'a', canMatch: [ConfigurableGuard, DelayedGuard], component: SimpleCmp},
             {path: 'a', canMatch: [ConfigurableGuard, DelayedGuard], component: SimpleCmp},
             {path: 'a', canMatch: [ConfigurableGuard, DelayedGuard], component: SimpleCmp},
             {path: 'team/:id', component: TeamCmp},
           ]);
           const fixture = createRoot(router, RootCmp);


           router.navigateByUrl('/a');
           advance(fixture);
           expect(fixture.nativeElement.innerHTML).toContain('team');

           expect(configurableMatchSpy.calls.count()).toEqual(1);

           // The delayed guard should not execute the delayed condition because the other guard
           // initiates a new navigation, which cancels the current one and unsubscribes from
           // intermediate results.
           expect(DelayedGuard.delayedExecutions).toEqual(0);
           // The delayed guard should still have executed once because guards are executed at the
           // same time
           expect(delayedGuardSpy.calls.count()).toEqual(1);
         }));
    });

    it('should allow guards as functions', fakeAsync(() => {
         @Component({
           template: '',
           standalone: true,
         })
         class BlankCmp {
         }
         const router = TestBed.inject(Router);
         const fixture = createRoot(router, RootCmp);
         const guards = {
           canActivate() {
             return true;
           },
           canDeactivate() {
             return true;
           },
           canActivateChild() {
             return true;
           },
           canMatch() {
             return true;
           },
           canLoad() {
             return true;
           }
         };
         spyOn(guards, 'canActivate').and.callThrough();
         spyOn(guards, 'canActivateChild').and.callThrough();
         spyOn(guards, 'canDeactivate').and.callThrough();
         spyOn(guards, 'canLoad').and.callThrough();
         spyOn(guards, 'canMatch').and.callThrough();
         router.resetConfig([
           {
             path: '',
             component: BlankCmp,
             loadChildren: () => [{path: '', component: BlankCmp}],
             canActivate: [guards.canActivate],
             canActivateChild: [guards.canActivateChild],
             canLoad: [guards.canLoad],
             canDeactivate: [guards.canDeactivate],
             canMatch: [guards.canMatch],
           },
           {
             path: 'other',
             component: BlankCmp,
           }
         ]);

         router.navigateByUrl('/');
         advance(fixture);
         expect(guards.canMatch).toHaveBeenCalled();
         expect(guards.canLoad).toHaveBeenCalled();
         expect(guards.canActivate).toHaveBeenCalled();
         expect(guards.canActivateChild).toHaveBeenCalled();

         router.navigateByUrl('/other');
         advance(fixture);
         expect(guards.canDeactivate).toHaveBeenCalled();
       }));

    it('should allow DI in plain function guards', fakeAsync(() => {
         @Component({
           template: '',
           standalone: true,
         })
         class BlankCmp {
         }

         @Injectable({providedIn: 'root'})
         class State {
           value = true;
         }
         const router = TestBed.inject(Router);
         const fixture = createRoot(router, RootCmp);
         const guards = {
           canActivate() {
             return coreInject(State).value;
           },
           canDeactivate() {
             return coreInject(State).value;
           },
           canActivateChild() {
             return coreInject(State).value;
           },
           canMatch() {
             return coreInject(State).value;
           },
           canLoad() {
             return coreInject(State).value;
           }
         };
         spyOn(guards, 'canActivate').and.callThrough();
         spyOn(guards, 'canActivateChild').and.callThrough();
         spyOn(guards, 'canDeactivate').and.callThrough();
         spyOn(guards, 'canLoad').and.callThrough();
         spyOn(guards, 'canMatch').and.callThrough();
         router.resetConfig([
           {
             path: '',
             component: BlankCmp,
             loadChildren: () => [{path: '', component: BlankCmp}],
             canActivate: [guards.canActivate],
             canActivateChild: [guards.canActivateChild],
             canLoad: [guards.canLoad],
             canDeactivate: [guards.canDeactivate],
             canMatch: [guards.canMatch],
           },
           {
             path: 'other',
             component: BlankCmp,
           }
         ]);

         router.navigateByUrl('/');
         advance(fixture);
         expect(guards.canMatch).toHaveBeenCalled();
         expect(guards.canLoad).toHaveBeenCalled();
         expect(guards.canActivate).toHaveBeenCalled();
         expect(guards.canActivateChild).toHaveBeenCalled();

         router.navigateByUrl('/other');
         advance(fixture);
         expect(guards.canDeactivate).toHaveBeenCalled();
       }));

    it('can run functional guards serially', fakeAsync(() => {
         function runSerially(guards: CanActivateFn[]|CanActivateChildFn[]): CanActivateFn|
             CanActivateChildFn {
           return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
             const injector = coreInject(EnvironmentInjector);
             const observables = guards.map(guard => {
               const guardResult = injector.runInContext(() => guard(route, state));
               return wrapIntoObservable(guardResult).pipe(first());
             });
             return concat(...observables).pipe(takeWhile(v => v === true), last());
           };
         }

         const guardDone: string[] = [];

         const guard1: CanActivateFn = () =>
             of(true).pipe(delay(100), tap(() => guardDone.push('guard1')));
         const guard2: CanActivateFn = () => of(true).pipe(tap(() => guardDone.push('guard2')));
         const guard3: CanActivateFn = () =>
             of(true).pipe(delay(50), tap(() => guardDone.push('guard3')));
         const guard4: CanActivateFn = () =>
             of(true).pipe(delay(200), tap(() => guardDone.push('guard4')));
         const router = TestBed.inject(Router);
         router.resetConfig([{
           path: '**',
           component: BlankCmp,
           canActivate: [runSerially([guard1, guard2, guard3, guard4])]
         }]);
         router.navigateByUrl('');

         tick(100);
         expect(guardDone).toEqual(['guard1', 'guard2']);
         tick(50);
         expect(guardDone).toEqual(['guard1', 'guard2', 'guard3']);
         tick(200);
         expect(guardDone).toEqual(['guard1', 'guard2', 'guard3', 'guard4']);
       }));
  });

  describe('route events', () => {
    it('should fire matching (Child)ActivationStart/End events',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{path: 'user/:name', component: UserCmp}]);

         const recordedEvents: Event[] = [];
         router.events.forEach(e => recordedEvents.push(e));

         router.navigateByUrl('/user/fedor');
         advance(fixture);

         const event3 = recordedEvents[3] as ChildActivationStart;
         const event9 = recordedEvents[9] as ChildActivationEnd;

         expect(fixture.nativeElement).toHaveText('user fedor');
         expect(event3 instanceof ChildActivationStart).toBe(true);
         expect(event3.snapshot).toBe(event9.snapshot.root);
         expect(event9 instanceof ChildActivationEnd).toBe(true);
         expect(event9.snapshot).toBe(event9.snapshot.root);

         const event4 = recordedEvents[4] as ActivationStart;
         const event8 = recordedEvents[8] as ActivationEnd;

         expect(event4 instanceof ActivationStart).toBe(true);
         expect(event4.snapshot.routeConfig?.path).toBe('user/:name');
         expect(event8 instanceof ActivationEnd).toBe(true);
         expect(event8.snapshot.routeConfig?.path).toBe('user/:name');

         expectEvents(recordedEvents, [
           [NavigationStart, '/user/fedor'], [RoutesRecognized, '/user/fedor'],
           [GuardsCheckStart, '/user/fedor'], [ChildActivationStart], [ActivationStart],
           [GuardsCheckEnd, '/user/fedor'], [ResolveStart, '/user/fedor'],
           [ResolveEnd, '/user/fedor'], [ActivationEnd], [ChildActivationEnd],
           [NavigationEnd, '/user/fedor']
         ]);
       })));

    it('should allow redirection in NavigationStart',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {path: 'blank', component: UserCmp},
           {path: 'user/:name', component: BlankCmp},
         ]);

         const navigateSpy = spyOn(router, 'navigate').and.callThrough();
         const recordedEvents: Event[] = [];

         const navStart$ = router.events.pipe(
             tap(e => recordedEvents.push(e)),
             filter((e): e is NavigationStart => e instanceof NavigationStart), first());

         navStart$.subscribe((e: NavigationStart|NavigationError) => {
           router.navigate(
               ['/blank'], {queryParams: {state: 'redirected'}, queryParamsHandling: 'merge'});
           advance(fixture);
         });

         router.navigate(['/user/:fedor']);
         advance(fixture);

         expect(navigateSpy.calls.mostRecent().args[1]!.queryParams);
       })));


    it('should stop emitting events after the router is destroyed',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);
         router.resetConfig([{path: 'user/:name', component: UserCmp}]);

         let events = 0;
         const subscription = router.events.subscribe(() => events++);

         router.navigateByUrl('/user/frodo');
         advance(fixture);
         expect(events).toBeGreaterThan(0);

         const previousCount = events;
         router.dispose();
         router.navigateByUrl('/user/bilbo');
         advance(fixture);

         expect(events).toBe(previousCount);
         subscription.unsubscribe();
       })));

    it('should resolve navigation promise with false after the router is destroyed',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);
         let result = null as boolean | null;
         const callback = (r: boolean) => result = r;
         router.resetConfig([{path: 'user/:name', component: UserCmp}]);

         router.navigateByUrl('/user/frodo').then(callback);
         advance(fixture);
         expect(result).toBe(true);
         result = null as boolean | null;

         router.dispose();

         router.navigateByUrl('/user/bilbo').then(callback);
         advance(fixture);
         expect(result).toBe(false);
         result = null as boolean | null;

         router.navigate(['/user/bilbo']).then(callback);
         advance(fixture);
         expect(result).toBe(false);
       })));
  });

  describe('routerLinkActive', () => {
    it('should set the class when the link is active (a tag)',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children: [{
             path: 'link',
             component: DummyLinkCmp,
             children: [{path: 'simple', component: SimpleCmp}, {path: '', component: BlankCmp}]
           }]
         }]);

         router.navigateByUrl('/team/22/link;exact=true');
         advance(fixture);
         advance(fixture);
         expect(location.path()).toEqual('/team/22/link;exact=true');

         const nativeLink = fixture.nativeElement.querySelector('a');
         const nativeButton = fixture.nativeElement.querySelector('button');
         expect(nativeLink.className).toEqual('active');
         expect(nativeButton.className).toEqual('active');

         router.navigateByUrl('/team/22/link/simple');
         advance(fixture);
         expect(location.path()).toEqual('/team/22/link/simple');
         expect(nativeLink.className).toEqual('');
         expect(nativeButton.className).toEqual('');
       })));

    it('should not set the class until the first navigation succeeds', fakeAsync(() => {
         @Component({
           template:
               '<router-outlet></router-outlet><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" ></a>'
         })
         class RootCmpWithLink {
         }

         TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
         const router: Router = TestBed.inject(Router);

         const f = TestBed.createComponent(RootCmpWithLink);
         advance(f);

         const link = f.nativeElement.querySelector('a');
         expect(link.className).toEqual('');

         router.initialNavigation();
         advance(f);

         expect(link.className).toEqual('active');
       }));


    it('should set the class on a parent element when the link is active',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children: [{
             path: 'link',
             component: DummyLinkWithParentCmp,
             children: [{path: 'simple', component: SimpleCmp}, {path: '', component: BlankCmp}]
           }]
         }]);

         router.navigateByUrl('/team/22/link;exact=true');
         advance(fixture);
         advance(fixture);
         expect(location.path()).toEqual('/team/22/link;exact=true');

         const native = fixture.nativeElement.querySelector('#link-parent');
         expect(native.className).toEqual('active');

         router.navigateByUrl('/team/22/link/simple');
         advance(fixture);
         expect(location.path()).toEqual('/team/22/link/simple');
         expect(native.className).toEqual('');
       })));

    it('should set the class when the link is active',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children: [{
             path: 'link',
             component: DummyLinkCmp,
             children: [{path: 'simple', component: SimpleCmp}, {path: '', component: BlankCmp}]
           }]
         }]);

         router.navigateByUrl('/team/22/link');
         advance(fixture);
         advance(fixture);
         expect(location.path()).toEqual('/team/22/link');

         const native = fixture.nativeElement.querySelector('a');
         expect(native.className).toEqual('active');

         router.navigateByUrl('/team/22/link/simple');
         advance(fixture);
         expect(location.path()).toEqual('/team/22/link/simple');
         expect(native.className).toEqual('active');
       })));

    it('should expose an isActive property', fakeAsync(() => {
         @Component({
           template: `<a routerLink="/team" routerLinkActive #rla="routerLinkActive"></a>
               <p>{{rla.isActive}}</p>
               <span *ngIf="rla.isActive"></span>
               <span [ngClass]="{'highlight': rla.isActive}"></span>
               <router-outlet></router-outlet>`
         })
         class ComponentWithRouterLink {
         }

         TestBed.configureTestingModule({declarations: [ComponentWithRouterLink]});
         const router: Router = TestBed.inject(Router);

         router.resetConfig([
           {
             path: 'team',
             component: TeamCmp,
           },
           {
             path: 'otherteam',
             component: TeamCmp,
           }
         ]);

         const fixture = TestBed.createComponent(ComponentWithRouterLink);
         router.navigateByUrl('/team');
         expect(() => advance(fixture)).not.toThrow();
         advance(fixture);

         const paragraph = fixture.nativeElement.querySelector('p');
         expect(paragraph.textContent).toEqual('true');

         router.navigateByUrl('/otherteam');
         advance(fixture);
         advance(fixture);
         expect(paragraph.textContent).toEqual('false');
       }));

    it('should not trigger change detection when active state has not changed', fakeAsync(() => {
         @Component({
           template: `<div id="link" routerLinkActive="active" [routerLink]="link"></div>`,
         })
         class LinkComponent {
           link = 'notactive';
         }

         @Component({template: ''})
         class SimpleComponent {
         }

         TestBed.configureTestingModule({
           imports: [
             ...ROUTER_DIRECTIVES,
           ],
           providers: [
             provideLocationMocks(),
             provideRouter([{path: '', component: SimpleComponent}]),
           ],
           declarations: [LinkComponent, SimpleComponent]
         });

         const fixture = createRoot(TestBed.inject(Router), LinkComponent);
         fixture.componentInstance.link = 'stillnotactive';
         fixture.detectChanges(false /** checkNoChanges */);
         expect(TestBed.inject(NgZone).hasPendingMicrotasks).toBe(false);
       }));

    it('should emit on isActiveChange output when link is activated or inactivated',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children: [{
             path: 'link',
             component: DummyLinkCmp,
             children: [{path: 'simple', component: SimpleCmp}, {path: '', component: BlankCmp}]
           }]
         }]);

         router.navigateByUrl('/team/22/link;exact=true');
         advance(fixture);
         advance(fixture);
         expect(location.path()).toEqual('/team/22/link;exact=true');

         const linkComponent =
             fixture.debugElement.query(By.directive(DummyLinkCmp)).componentInstance as
             DummyLinkCmp;

         expect(linkComponent.isLinkActivated).toEqual(true);
         const nativeLink = fixture.nativeElement.querySelector('a');
         const nativeButton = fixture.nativeElement.querySelector('button');
         expect(nativeLink.className).toEqual('active');
         expect(nativeButton.className).toEqual('active');


         router.navigateByUrl('/team/22/link/simple');
         advance(fixture);
         expect(location.path()).toEqual('/team/22/link/simple');
         expect(linkComponent.isLinkActivated).toEqual(false);
         expect(nativeLink.className).toEqual('');
         expect(nativeButton.className).toEqual('');
       })));

    it('should set a provided aria-current attribute when the link is active (a tag)',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children: [{
             path: 'link',
             component: DummyLinkCmp,
             children: [{path: 'simple', component: SimpleCmp}, {path: '', component: BlankCmp}]
           }]
         }]);

         router.navigateByUrl('/team/22/link;exact=true');
         advance(fixture);
         advance(fixture);
         expect(location.path()).toEqual('/team/22/link;exact=true');

         const nativeLink = fixture.nativeElement.querySelector('a');
         const nativeButton = fixture.nativeElement.querySelector('button');
         expect(nativeLink.getAttribute('aria-current')).toEqual('page');
         expect(nativeButton.hasAttribute('aria-current')).toEqual(false);

         router.navigateByUrl('/team/22/link/simple');
         advance(fixture);
         expect(location.path()).toEqual('/team/22/link/simple');
         expect(nativeLink.hasAttribute('aria-current')).toEqual(false);
         expect(nativeButton.hasAttribute('aria-current')).toEqual(false);
       })));
  });

  describe('lazy loading', () => {
    it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         @Component(
             {selector: 'lazy', template: 'lazy-loaded-parent [<router-outlet></router-outlet>]'})
         class ParentLazyLoadedComponent {
         }

         @Component({selector: 'lazy', template: 'lazy-loaded-child'})
         class ChildLazyLoadedComponent {
         }

         @NgModule({
           declarations: [ParentLazyLoadedComponent, ChildLazyLoadedComponent],
           imports: [RouterModule.forChild([{
             path: 'loaded',
             component: ParentLazyLoadedComponent,
             children: [{path: 'child', component: ChildLazyLoadedComponent}]
           }])]
         })
         class LoadedModule {
         }

         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

         router.navigateByUrl('/lazy/loaded/child');
         advance(fixture);

         expect(location.path()).toEqual('/lazy/loaded/child');
         expect(fixture.nativeElement).toHaveText('lazy-loaded-parent [lazy-loaded-child]');
       })));

    it('should have 2 injector trees: module and element',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         @Component({
           selector: 'lazy',
           template: 'parent[<router-outlet></router-outlet>]',
           viewProviders: [
             {provide: 'shadow', useValue: 'from parent component'},
           ],
         })
         class Parent {
         }

         @Component({selector: 'lazy', template: 'child'})
         class Child {
         }

         @NgModule({
           declarations: [Parent],
           imports: [RouterModule.forChild([{
             path: 'parent',
             component: Parent,
             children: [
               {path: 'child', loadChildren: () => ChildModule},
             ]
           }])],
           providers: [
             {provide: 'moduleName', useValue: 'parent'},
             {provide: 'fromParent', useValue: 'from parent'},
           ],
         })
         class ParentModule {
         }

         @NgModule({
           declarations: [Child],
           imports: [RouterModule.forChild([{path: '', component: Child}])],
           providers: [
             {provide: 'moduleName', useValue: 'child'},
             {provide: 'fromChild', useValue: 'from child'},
             {provide: 'shadow', useValue: 'from child module'},
           ],
         })
         class ChildModule {
         }

         const fixture = createRoot(router, RootCmp);
         router.resetConfig([{path: 'lazy', loadChildren: () => ParentModule}]);
         router.navigateByUrl('/lazy/parent/child');
         advance(fixture);
         expect(location.path()).toEqual('/lazy/parent/child');
         expect(fixture.nativeElement).toHaveText('parent[child]');

         const pInj = fixture.debugElement.query(By.directive(Parent)).injector!;
         const cInj = fixture.debugElement.query(By.directive(Child)).injector!;

         expect(pInj.get('moduleName')).toEqual('parent');
         expect(pInj.get('fromParent')).toEqual('from parent');
         expect(pInj.get(Parent)).toBeAnInstanceOf(Parent);
         expect(pInj.get('fromChild', null)).toEqual(null);
         expect(pInj.get(Child, null)).toEqual(null);

         expect(cInj.get('moduleName')).toEqual('child');
         expect(cInj.get('fromParent')).toEqual('from parent');
         expect(cInj.get('fromChild')).toEqual('from child');
         expect(cInj.get(Parent)).toBeAnInstanceOf(Parent);
         expect(cInj.get(Child)).toBeAnInstanceOf(Child);
         // The child module can not shadow the parent component
         expect(cInj.get('shadow')).toEqual('from parent component');

         const pmInj = pInj.get(NgModuleRef).injector;
         const cmInj = cInj.get(NgModuleRef).injector;

         expect(pmInj.get('moduleName')).toEqual('parent');
         expect(cmInj.get('moduleName')).toEqual('child');

         expect(pmInj.get(Parent, '-')).toEqual('-');
         expect(cmInj.get(Parent, '-')).toEqual('-');
         expect(pmInj.get(Child, '-')).toEqual('-');
         expect(cmInj.get(Child, '-')).toEqual('-');
       })));

    // https://github.com/angular/angular/issues/12889
    it('should create a single instance of lazy-loaded modules',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         @Component(
             {selector: 'lazy', template: 'lazy-loaded-parent [<router-outlet></router-outlet>]'})
         class ParentLazyLoadedComponent {
         }

         @Component({selector: 'lazy', template: 'lazy-loaded-child'})
         class ChildLazyLoadedComponent {
         }

         @NgModule({
           declarations: [ParentLazyLoadedComponent, ChildLazyLoadedComponent],
           imports: [RouterModule.forChild([{
             path: 'loaded',
             component: ParentLazyLoadedComponent,
             children: [{path: 'child', component: ChildLazyLoadedComponent}]
           }])]
         })
         class LoadedModule {
           static instances = 0;
           constructor() {
             LoadedModule.instances++;
           }
         }

         const fixture = createRoot(router, RootCmp);
         router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);
         router.navigateByUrl('/lazy/loaded/child');
         advance(fixture);
         expect(fixture.nativeElement).toHaveText('lazy-loaded-parent [lazy-loaded-child]');
         expect(LoadedModule.instances).toEqual(1);
       })));

    // https://github.com/angular/angular/issues/13870
    it('should create a single instance of guards for lazy-loaded modules',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         @Injectable()
         class Service {
         }

         @Injectable()
         class Resolver {
           constructor(public service: Service) {}
           resolve() {
             return this.service;
           }
         }

         @Component({selector: 'lazy', template: 'lazy'})
         class LazyLoadedComponent {
           resolvedService: Service;
           constructor(public injectedService: Service, route: ActivatedRoute) {
             this.resolvedService = route.snapshot.data['service'];
           }
         }

         @NgModule({
           declarations: [LazyLoadedComponent],
           providers: [Service, Resolver],
           imports: [
             RouterModule.forChild([{
               path: 'loaded',
               component: LazyLoadedComponent,
               resolve: {'service': () => coreInject(Resolver).resolve()},
             }]),
           ]
         })
         class LoadedModule {
         }

         const fixture = createRoot(router, RootCmp);
         router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);
         router.navigateByUrl('/lazy/loaded');
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('lazy');
         const lzc =
             fixture.debugElement.query(By.directive(LazyLoadedComponent)).componentInstance;
         expect(lzc.injectedService).toBe(lzc.resolvedService);
       })));


    it('should emit RouteConfigLoadStart and RouteConfigLoadEnd event when route is lazy loaded',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         @Component({
           selector: 'lazy',
           template: 'lazy-loaded-parent [<router-outlet></router-outlet>]',
         })
         class ParentLazyLoadedComponent {
         }

         @Component({selector: 'lazy', template: 'lazy-loaded-child'})
         class ChildLazyLoadedComponent {
         }

         @NgModule({
           declarations: [ParentLazyLoadedComponent, ChildLazyLoadedComponent],
           imports: [RouterModule.forChild([{
             path: 'loaded',
             component: ParentLazyLoadedComponent,
             children: [{path: 'child', component: ChildLazyLoadedComponent}],
           }])]
         })
         class LoadedModule {
         }

         const events: Array<RouteConfigLoadStart|RouteConfigLoadEnd> = [];

         router.events.subscribe(e => {
           if (e instanceof RouteConfigLoadStart || e instanceof RouteConfigLoadEnd) {
             events.push(e);
           }
         });

         const fixture = createRoot(router, RootCmp);
         router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

         router.navigateByUrl('/lazy/loaded/child');
         advance(fixture);

         expect(events.length).toEqual(2);
         expect(events[0].toString()).toEqual('RouteConfigLoadStart(path: lazy)');
         expect(events[1].toString()).toEqual('RouteConfigLoadEnd(path: lazy)');
       })));

    it('throws an error when forRoot() is used in a lazy context',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         @Component({selector: 'lazy', template: 'should not show'})
         class LazyLoadedComponent {
         }

         @NgModule({
           declarations: [LazyLoadedComponent],
           imports: [RouterModule.forRoot([{path: 'loaded', component: LazyLoadedComponent}])]
         })
         class LoadedModule {
         }

         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

         let recordedError: any = null;
         router.navigateByUrl('/lazy/loaded')!.catch(err => recordedError = err);
         advance(fixture);
         expect(recordedError.message).toContain(`NG04007`);
       })));

    it('should combine routes from multiple modules into a single configuration',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         @Component({selector: 'lazy', template: 'lazy-loaded-2'})
         class LazyComponent2 {
         }

         @NgModule({
           declarations: [LazyComponent2],
           imports: [RouterModule.forChild([{path: 'loaded', component: LazyComponent2}])]
         })
         class SiblingOfLoadedModule {
         }

         @Component({selector: 'lazy', template: 'lazy-loaded-1'})
         class LazyComponent1 {
         }

         @NgModule({
           declarations: [LazyComponent1],
           imports: [
             RouterModule.forChild([{path: 'loaded', component: LazyComponent1}]),
             SiblingOfLoadedModule
           ]
         })
         class LoadedModule {
         }

         const fixture = createRoot(router, RootCmp);

         router.resetConfig([
           {path: 'lazy1', loadChildren: () => LoadedModule},
           {path: 'lazy2', loadChildren: () => SiblingOfLoadedModule}
         ]);

         router.navigateByUrl('/lazy1/loaded');
         advance(fixture);
         expect(location.path()).toEqual('/lazy1/loaded');

         router.navigateByUrl('/lazy2/loaded');
         advance(fixture);
         expect(location.path()).toEqual('/lazy2/loaded');
       })));

    it('should allow lazy loaded module in named outlet',
       fakeAsync(inject([Router], (router: Router) => {
         @Component({selector: 'lazy', template: 'lazy-loaded'})
         class LazyComponent {
         }

         @NgModule({
           declarations: [LazyComponent],
           imports: [RouterModule.forChild([{path: '', component: LazyComponent}])]
         })
         class LazyLoadedModule {
         }

         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children: [
             {path: 'user/:name', component: UserCmp},
             {path: 'lazy', loadChildren: () => LazyLoadedModule, outlet: 'right'},
           ]
         }]);


         router.navigateByUrl('/team/22/user/john');
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('team 22 [ user john, right:  ]');

         router.navigateByUrl('/team/22/(user/john//right:lazy)');
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('team 22 [ user john, right: lazy-loaded ]');
       })));

    it('should allow componentless named outlet to render children',
       fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children: [
             {path: 'user/:name', component: UserCmp},
             {path: 'simple', outlet: 'right', children: [{path: '', component: SimpleCmp}]},
           ]
         }]);


         router.navigateByUrl('/team/22/user/john');
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('team 22 [ user john, right:  ]');

         router.navigateByUrl('/team/22/(user/john//right:simple)');
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('team 22 [ user john, right: simple ]');
       })));

    it('should render loadComponent named outlet with children', fakeAsync(() => {
         const router = TestBed.inject(Router);
         const fixture = createRoot(router, RootCmp);

         @Component({
           standalone: true,
           imports: [RouterModule],
           template: '[right outlet component: <router-outlet></router-outlet>]',
         })
         class RightComponent {
           constructor(readonly route: ActivatedRoute) {}
         }

         const loadSpy = jasmine.createSpy();
         loadSpy.and.returnValue(RightComponent);

         router.resetConfig([
           {
             path: 'team/:id',
             component: TeamCmp,
             children: [
               {path: 'user/:name', component: UserCmp},
               {
                 path: 'simple',
                 loadComponent: loadSpy,
                 outlet: 'right',
                 children: [{path: '', component: SimpleCmp}]
               },
             ]
           },
           {path: '', component: SimpleCmp}
         ]);

         router.navigateByUrl('/team/22/(user/john//right:simple)');
         advance(fixture);

         expect(fixture.nativeElement)
             .toHaveText('team 22 [ user john, right: [right outlet component: simple] ]');
         const rightCmp: RightComponent =
             fixture.debugElement.query(By.directive(RightComponent)).componentInstance;
         // Ensure we don't accidentally add `EmptyOutletComponent` via `standardizeConfig`
         expect(rightCmp.route.routeConfig?.component).not.toBeDefined();

         // Ensure we can navigate away and come back
         router.navigateByUrl('/');
         advance(fixture);
         router.navigateByUrl('/team/22/(user/john//right:simple)');
         advance(fixture);
         expect(fixture.nativeElement)
             .toHaveText('team 22 [ user john, right: [right outlet component: simple] ]');
         expect(loadSpy.calls.count()).toEqual(1);
       }));

    describe('should use the injector of the lazily-loaded configuration', () => {
      class LazyLoadedServiceDefinedInModule {}

      @Component({
        selector: 'eager-parent',
        template: 'eager-parent <router-outlet></router-outlet>',
      })
      class EagerParentComponent {
      }

      @Component({
        selector: 'lazy-parent',
        template: 'lazy-parent <router-outlet></router-outlet>',
      })
      class LazyParentComponent {
      }

      @Component({
        selector: 'lazy-child',
        template: 'lazy-child',
      })
      class LazyChildComponent {
        constructor(
            lazy: LazyParentComponent,  // should be able to inject lazy/direct parent
            lazyService: LazyLoadedServiceDefinedInModule,  // should be able to inject lazy service
            eager: EagerParentComponent  // should use the injector of the location to create a
                                         // parent
        ) {}
      }

      @NgModule({
        declarations: [LazyParentComponent, LazyChildComponent],
        imports: [RouterModule.forChild([{
          path: '',
          children: [{
            path: 'lazy-parent',
            component: LazyParentComponent,
            children: [{path: 'lazy-child', component: LazyChildComponent}]
          }]
        }])],
        providers: [LazyLoadedServiceDefinedInModule]
      })
      class LoadedModule {
      }

      @NgModule({declarations: [EagerParentComponent], imports: [RouterModule.forRoot([])]})
      class TestModule {
      }

      beforeEach(() => {
        TestBed.configureTestingModule({
          imports: [TestModule],
        });
      });

      it('should use the injector of the lazily-loaded configuration',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{
             path: 'eager-parent',
             component: EagerParentComponent,
             children: [{path: 'lazy', loadChildren: () => LoadedModule}]
           }]);

           router.navigateByUrl('/eager-parent/lazy/lazy-parent/lazy-child');
           advance(fixture);

           expect(location.path()).toEqual('/eager-parent/lazy/lazy-parent/lazy-child');
           expect(fixture.nativeElement).toHaveText('eager-parent lazy-parent lazy-child');
         })));
    });

    it('works when given a callback',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         @Component({selector: 'lazy', template: 'lazy-loaded'})
         class LazyLoadedComponent {
         }

         @NgModule({
           declarations: [LazyLoadedComponent],
           imports: [RouterModule.forChild([{path: 'loaded', component: LazyLoadedComponent}])],
         })
         class LoadedModule {
         }

         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

         router.navigateByUrl('/lazy/loaded');
         advance(fixture);

         expect(location.path()).toEqual('/lazy/loaded');
         expect(fixture.nativeElement).toHaveText('lazy-loaded');
       })));

    it('error emit an error when cannot load a config',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'lazy',
           loadChildren: () => {
             throw new Error('invalid');
           }
         }]);

         const recordedEvents: Event[] = [];
         router.events.forEach(e => recordedEvents.push(e));

         router.navigateByUrl('/lazy/loaded')!.catch(s => {});
         advance(fixture);

         expect(location.path()).toEqual('/');

         expectEvents(recordedEvents, [
           [NavigationStart, '/lazy/loaded'],
           [RouteConfigLoadStart],
           [NavigationError, '/lazy/loaded'],
         ]);
       })));

    it('should emit an error when the lazily-loaded config is not valid', fakeAsync(() => {
         const router = TestBed.inject(Router);
         @NgModule({imports: [RouterModule.forChild([{path: 'loaded'}])]})
         class LoadedModule {
         }

         const fixture = createRoot(router, RootCmp);
         router.resetConfig([{path: 'lazy', loadChildren: () => LoadedModule}]);

         let recordedError: any = null;
         router.navigateByUrl('/lazy/loaded').catch(err => recordedError = err);
         advance(fixture);

         expect(recordedError.message)
             .toContain(
                 `Invalid configuration of route 'lazy/loaded'. One of the following must be provided: component, loadComponent, redirectTo, children or loadChildren`);
       }));

    it('should work with complex redirect rules',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         @Component({selector: 'lazy', template: 'lazy-loaded'})
         class LazyLoadedComponent {
         }

         @NgModule({
           declarations: [LazyLoadedComponent],
           imports: [RouterModule.forChild([{path: 'loaded', component: LazyLoadedComponent}])],
         })
         class LoadedModule {
         }

         const fixture = createRoot(router, RootCmp);

         router.resetConfig(
             [{path: 'lazy', loadChildren: () => LoadedModule}, {path: '**', redirectTo: 'lazy'}]);

         router.navigateByUrl('/lazy/loaded');
         advance(fixture);

         expect(location.path()).toEqual('/lazy/loaded');
       })));

    it('should work with wildcard route',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         @Component({selector: 'lazy', template: 'lazy-loaded'})
         class LazyLoadedComponent {
         }

         @NgModule({
           declarations: [LazyLoadedComponent],
           imports: [RouterModule.forChild([{path: '', component: LazyLoadedComponent}])],
         })
         class LazyLoadedModule {
         }

         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{path: '**', loadChildren: () => LazyLoadedModule}]);

         router.navigateByUrl('/lazy');
         advance(fixture);

         expect(location.path()).toEqual('/lazy');
         expect(fixture.nativeElement).toHaveText('lazy-loaded');
       })));

    describe('preloading', () => {
      let log: string[] = [];
      @Component({selector: 'lazy', template: 'should not show'})
      class LazyLoadedComponent {
      }

      @NgModule({
        declarations: [LazyLoadedComponent],
        imports: [RouterModule.forChild([{path: 'LoadedModule2', component: LazyLoadedComponent}])]
      })
      class LoadedModule2 {
      }

      @NgModule({
        imports:
            [RouterModule.forChild([{path: 'LoadedModule1', loadChildren: () => LoadedModule2}])]
      })
      class LoadedModule1 {
      }

      @NgModule({})
      class EmptyModule {
      }

      beforeEach(() => {
        log.length = 0;
        TestBed.configureTestingModule({
          providers: [
            {provide: PreloadingStrategy, useExisting: PreloadAllModules}, {
              provide: 'loggingReturnsTrue',
              useValue: () => {
                log.push('loggingReturnsTrue');
                return true;
              }
            }
          ]
        });
        const preloader = TestBed.inject(RouterPreloader);
        preloader.setUpPreloading();
      });

      it('should work', fakeAsync(() => {
           const router = TestBed.inject(Router);
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([
             {path: 'blank', component: BlankCmp}, {path: 'lazy', loadChildren: () => LoadedModule1}
           ]);

           router.navigateByUrl('/blank');
           advance(fixture);

           const config = router.config;
           const firstRoutes = getLoadedRoutes(config[1])!;

           expect(firstRoutes).toBeDefined();
           expect(firstRoutes[0].path).toEqual('LoadedModule1');

           const secondRoutes = getLoadedRoutes(firstRoutes[0])!;
           expect(secondRoutes).toBeDefined();
           expect(secondRoutes[0].path).toEqual('LoadedModule2');
         }));

      it('should not preload when canLoad is present and does not execute guard', fakeAsync(() => {
           const router = TestBed.inject(Router);
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([
             {path: 'blank', component: BlankCmp},
             {path: 'lazy', loadChildren: () => LoadedModule1, canLoad: ['loggingReturnsTrue']}
           ]);

           router.navigateByUrl('/blank');
           advance(fixture);

           const config = router.config;
           const firstRoutes = getLoadedRoutes(config[1])!;

           expect(firstRoutes).toBeUndefined();
           expect(log.length).toBe(0);
         }));

      it('should allow navigation to modules with no routes', fakeAsync(() => {
           const router = TestBed.inject(Router);
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{path: 'lazy', loadChildren: () => EmptyModule}]);

           router.navigateByUrl('/lazy');
           advance(fixture);
         }));
    });

    describe('custom url handling strategies', () => {
      class CustomUrlHandlingStrategy implements UrlHandlingStrategy {
        shouldProcessUrl(url: UrlTree): boolean {
          return url.toString().startsWith('/include') || url.toString() === '/';
        }

        extract(url: UrlTree): UrlTree {
          const oldRoot = url.root;
          const children: Record<string, UrlSegmentGroup> = {};
          if (oldRoot.children[PRIMARY_OUTLET]) {
            children[PRIMARY_OUTLET] = oldRoot.children[PRIMARY_OUTLET];
          }
          const root = new UrlSegmentGroup(oldRoot.segments, children);
          return new UrlTree(root, url.queryParams, url.fragment);
        }

        merge(newUrlPart: UrlTree, wholeUrl: UrlTree): UrlTree {
          const oldRoot = newUrlPart.root;

          const children: Record<string, UrlSegmentGroup> = {};
          if (oldRoot.children[PRIMARY_OUTLET]) {
            children[PRIMARY_OUTLET] = oldRoot.children[PRIMARY_OUTLET];
          }

          Object.entries(wholeUrl.root.children).forEach(([k, v]: [string, any]) => {
            if (k !== PRIMARY_OUTLET) {
              children[k] = v;
            }
            v.parent = this;
          });
          const root = new UrlSegmentGroup(oldRoot.segments, children);
          return new UrlTree(root, newUrlPart.queryParams, newUrlPart.fragment);
        }
      }

      beforeEach(() => {
        TestBed.configureTestingModule({
          providers: [
            {provide: UrlHandlingStrategy, useClass: CustomUrlHandlingStrategy},
            {provide: LocationStrategy, useClass: HashLocationStrategy}
          ]
        });
      });

      it('should work',
         fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{
             path: 'include',
             component: TeamCmp,
             children:
                 [{path: 'user/:name', component: UserCmp}, {path: 'simple', component: SimpleCmp}]
           }]);

           const events: Event[] = [];
           router.events.subscribe(e => e instanceof RouterEvent && events.push(e));

           // supported URL
           router.navigateByUrl('/include/user/kate');
           advance(fixture);

           expect(location.path()).toEqual('/include/user/kate');
           expectEvents(events, [
             [NavigationStart, '/include/user/kate'], [RoutesRecognized, '/include/user/kate'],
             [GuardsCheckStart, '/include/user/kate'], [GuardsCheckEnd, '/include/user/kate'],
             [ResolveStart, '/include/user/kate'], [ResolveEnd, '/include/user/kate'],
             [NavigationEnd, '/include/user/kate']
           ]);
           expect(fixture.nativeElement).toHaveText('team  [ user kate, right:  ]');
           events.splice(0);

           // unsupported URL
           router.navigateByUrl('/exclude/one');
           advance(fixture);

           expect(location.path()).toEqual('/exclude/one');
           expect(Object.keys(router.routerState.root.children).length).toEqual(0);
           expect(fixture.nativeElement).toHaveText('');
           expectEvents(events, [
             [NavigationStart, '/exclude/one'], [GuardsCheckStart, '/exclude/one'],
             [GuardsCheckEnd, '/exclude/one'], [NavigationEnd, '/exclude/one']
           ]);
           events.splice(0);

           // another unsupported URL
           location.simulateHashChange('/exclude/two');
           advance(fixture);

           expect(location.path()).toEqual('/exclude/two');
           expectEvents(events, [[NavigationSkipped, '/exclude/two']]);
           events.splice(0);

           // back to a supported URL
           location.simulateHashChange('/include/simple');
           advance(fixture);

           expect(location.path()).toEqual('/include/simple');
           expect(fixture.nativeElement).toHaveText('team  [ simple, right:  ]');

           expectEvents(events, [
             [NavigationStart, '/include/simple'], [RoutesRecognized, '/include/simple'],
             [GuardsCheckStart, '/include/simple'], [GuardsCheckEnd, '/include/simple'],
             [ResolveStart, '/include/simple'], [ResolveEnd, '/include/simple'],
             [NavigationEnd, '/include/simple']
           ]);
         })));

      it('should handle the case when the router takes only the primary url',
         fakeAsync(inject([Router, Location], (router: Router, location: SpyLocation) => {
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{
             path: 'include',
             component: TeamCmp,
             children:
                 [{path: 'user/:name', component: UserCmp}, {path: 'simple', component: SimpleCmp}]
           }]);

           const events: Event[] = [];
           router.events.subscribe(e => e instanceof RouterEvent && events.push(e));

           location.simulateHashChange('/include/user/kate(aux:excluded)');
           advance(fixture);

           expect(location.path()).toEqual('/include/user/kate(aux:excluded)');
           expectEvents(events, [
             [NavigationStart, '/include/user/kate'], [RoutesRecognized, '/include/user/kate'],
             [GuardsCheckStart, '/include/user/kate'], [GuardsCheckEnd, '/include/user/kate'],
             [ResolveStart, '/include/user/kate'], [ResolveEnd, '/include/user/kate'],
             [NavigationEnd, '/include/user/kate']
           ]);
           events.splice(0);

           location.simulateHashChange('/include/user/kate(aux:excluded2)');
           advance(fixture);
           expectEvents(events, [[NavigationSkipped, '/include/user/kate(aux:excluded2)']]);
           events.splice(0);

           router.navigateByUrl('/include/simple');
           advance(fixture);

           expect(location.path()).toEqual('/include/simple(aux:excluded2)');
           expectEvents(events, [
             [NavigationStart, '/include/simple'], [RoutesRecognized, '/include/simple'],
             [GuardsCheckStart, '/include/simple'], [GuardsCheckEnd, '/include/simple'],
             [ResolveStart, '/include/simple'], [ResolveEnd, '/include/simple'],
             [NavigationEnd, '/include/simple']
           ]);
         })));

      it('should not remove parts of the URL that are not handled by the router when "eager"',
         fakeAsync(() => {
           const router = TestBed.inject(Router);
           router.urlUpdateStrategy = 'eager';
           const location = TestBed.inject(Location) as SpyLocation;
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{
             path: 'include',
             component: TeamCmp,
             children: [{path: 'user/:name', component: UserCmp}]
           }]);

           location.simulateHashChange('/include/user/kate(aux:excluded)');
           advance(fixture);

           expect(location.path()).toEqual('/include/user/kate(aux:excluded)');
         }));
    });

    it('can use `relativeTo` `route.parent` in `routerLink` to close secondary outlet',
       fakeAsync(() => {
         // Given
         @Component({template: '<router-outlet name="secondary"></router-outlet>'})
         class ChildRootCmp {
         }

         @Component({
           selector: 'link-cmp',
           template:
               `<a [relativeTo]="route.parent" [routerLink]="[{outlets: {'secondary': null}}]">link</a>
            <button [relativeTo]="route.parent" [routerLink]="[{outlets: {'secondary': null}}]">link</button>
            `
         })
         class RelativeLinkCmp {
           @ViewChildren(RouterLink) links!: QueryList<RouterLink>;

           constructor(readonly route: ActivatedRoute) {}
         }
         @NgModule({
           declarations: [RelativeLinkCmp, ChildRootCmp],
           imports: [RouterModule.forChild([{
             path: 'childRoot',
             component: ChildRootCmp,
             children: [
               {path: 'popup', outlet: 'secondary', component: RelativeLinkCmp},
             ]
           }])]
         })
         class LazyLoadedModule {
         }
         const router = TestBed.inject(Router);
         router.resetConfig([{path: 'root', loadChildren: () => LazyLoadedModule}]);

         // When
         router.navigateByUrl('/root/childRoot/(secondary:popup)');
         const fixture = createRoot(router, RootCmp);
         advance(fixture);

         // Then
         const relativeLinkCmp =
             fixture.debugElement.query(By.directive(RelativeLinkCmp)).componentInstance;
         expect(relativeLinkCmp.links.first.urlTree.toString()).toEqual('/root/childRoot');
         expect(relativeLinkCmp.links.last.urlTree.toString()).toEqual('/root/childRoot');
       }));

    it('should ignore empty path for relative links',
       fakeAsync(inject([Router], (router: Router) => {
         @Component({selector: 'link-cmp', template: `<a [routerLink]="['../simple']">link</a>`})
         class RelativeLinkCmp {
         }

         @NgModule({
           declarations: [RelativeLinkCmp],
           imports: [RouterModule.forChild([
             {path: 'foo/bar', children: [{path: '', component: RelativeLinkCmp}]},
           ])]
         })
         class LazyLoadedModule {
         }

         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{path: 'lazy', loadChildren: () => LazyLoadedModule}]);

         router.navigateByUrl('/lazy/foo/bar');
         advance(fixture);

         const link = fixture.nativeElement.querySelector('a');
         expect(link.getAttribute('href')).toEqual('/lazy/foo/simple');
       })));
  });

  describe('Custom Route Reuse Strategy', () => {
    class AttachDetachReuseStrategy implements RouteReuseStrategy {
      stored: {[k: string]: DetachedRouteHandle} = {};
      pathsToDetach = ['a'];

      shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return typeof route.routeConfig!.path !== 'undefined' &&
            this.pathsToDetach.includes(route.routeConfig!.path);
      }

      store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
        this.stored[route.routeConfig!.path!] = detachedTree;
      }

      shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return !!this.stored[route.routeConfig!.path!];
      }

      retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        return this.stored[route.routeConfig!.path!];
      }

      shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig;
      }
    }

    class ShortLifecycle implements RouteReuseStrategy {
      shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return false;
      }
      store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {}
      shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return false;
      }
      retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle|null {
        return null;
      }
      shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        if (future.routeConfig !== curr.routeConfig) {
          return false;
        }

        if (Object.keys(future.params).length !== Object.keys(curr.params).length) {
          return false;
        }

        return Object.keys(future.params).every(k => future.params[k] === curr.params[k]);
      }
    }

    it('should be injectable', () => {
      TestBed.configureTestingModule({
        providers: [
          {provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy},
          provideLocationMocks(),
          provideRouter([]),
        ]
      });

      const router = TestBed.inject(Router);

      expect(router.routeReuseStrategy).toBeInstanceOf(AttachDetachReuseStrategy);
    });

    it('should emit an event when an outlet gets attached/detached', fakeAsync(() => {
         @Component({
           selector: 'container',
           template:
               `<router-outlet (attach)="recordAttached($event)" (detach)="recordDetached($event)"></router-outlet>`
         })
         class Container {
           attachedComponents: unknown[] = [];
           detachedComponents: unknown[] = [];

           recordAttached(component: unknown): void {
             this.attachedComponents.push(component);
           }

           recordDetached(component: unknown): void {
             this.detachedComponents.push(component);
           }
         }

         TestBed.configureTestingModule({
           declarations: [Container],
           providers: [{provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy}]
         });

         const router = TestBed.inject(Router);
         const fixture = createRoot(router, Container);
         const cmp = fixture.componentInstance;

         router.resetConfig([{path: 'a', component: BlankCmp}, {path: 'b', component: SimpleCmp}]);

         cmp.attachedComponents = [];
         cmp.detachedComponents = [];

         router.navigateByUrl('/a');
         advance(fixture);
         expect(cmp.attachedComponents.length).toEqual(0);
         expect(cmp.detachedComponents.length).toEqual(0);

         router.navigateByUrl('/b');
         advance(fixture);
         expect(cmp.attachedComponents.length).toEqual(0);
         expect(cmp.detachedComponents.length).toEqual(1);
         expect(cmp.detachedComponents[0] instanceof BlankCmp).toBe(true);

         // the route will be reused by the `RouteReuseStrategy`
         router.navigateByUrl('/a');
         advance(fixture);
         expect(cmp.attachedComponents.length).toEqual(1);
         expect(cmp.attachedComponents[0] instanceof BlankCmp).toBe(true);
         expect(cmp.detachedComponents.length).toEqual(1);
         expect(cmp.detachedComponents[0] instanceof BlankCmp).toBe(true);
       }));

    it('should support attaching & detaching fragments',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);

         router.routeReuseStrategy = new AttachDetachReuseStrategy();
         (router.routeReuseStrategy as AttachDetachReuseStrategy).pathsToDetach = ['a', 'b'];
         spyOn(router.routeReuseStrategy, 'retrieve').and.callThrough();

         router.resetConfig([
           {
             path: 'a',
             component: TeamCmp,
             children: [{path: 'b', component: SimpleCmp}],
           },
           {path: 'c', component: UserCmp},
         ]);

         router.navigateByUrl('/a/b');
         advance(fixture);
         const teamCmp = fixture.debugElement.children[1].componentInstance;
         const simpleCmp = fixture.debugElement.children[1].children[1].componentInstance;
         expect(location.path()).toEqual('/a/b');
         expect(teamCmp).toBeDefined();
         expect(simpleCmp).toBeDefined();
         expect(router.routeReuseStrategy.retrieve).not.toHaveBeenCalled();

         router.navigateByUrl('/c');
         advance(fixture);
         expect(location.path()).toEqual('/c');
         expect(fixture.debugElement.children[1].componentInstance).toBeAnInstanceOf(UserCmp);
         // We have still not encountered a route that should be reattached
         expect(router.routeReuseStrategy.retrieve).not.toHaveBeenCalled();

         router.navigateByUrl('/a;p=1/b;p=2');
         advance(fixture);
         // We retrieve both the stored route snapshots
         expect(router.routeReuseStrategy.retrieve).toHaveBeenCalledTimes(4);
         const teamCmp2 = fixture.debugElement.children[1].componentInstance;
         const simpleCmp2 = fixture.debugElement.children[1].children[1].componentInstance;
         expect(location.path()).toEqual('/a;p=1/b;p=2');
         expect(teamCmp2).toBe(teamCmp);
         expect(simpleCmp2).toBe(simpleCmp);

         expect(teamCmp.route).toBe(router.routerState.root.firstChild);
         expect(teamCmp.route.snapshot).toBe(router.routerState.snapshot.root.firstChild);
         expect(teamCmp.route.snapshot.params).toEqual({p: '1'});
         expect(teamCmp.route.firstChild.snapshot.params).toEqual({p: '2'});
         expect(teamCmp.recordedParams).toEqual([{}, {p: '1'}]);
       })));

    it('should support shorter lifecycles',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);
         router.routeReuseStrategy = new ShortLifecycle();

         router.resetConfig([{path: 'a', component: SimpleCmp}]);

         router.navigateByUrl('/a');
         advance(fixture);
         const simpleCmp1 = fixture.debugElement.children[1].componentInstance;
         expect(location.path()).toEqual('/a');

         router.navigateByUrl('/a;p=1');
         advance(fixture);
         expect(location.path()).toEqual('/a;p=1');
         const simpleCmp2 = fixture.debugElement.children[1].componentInstance;
         expect(simpleCmp1).not.toBe(simpleCmp2);
       })));

    it('should not mount the component of the previously reused route when the outlet was not instantiated at the time of route activation',
       fakeAsync(() => {
         @Component({
           selector: 'root-cmp',
           template:
               '<div *ngIf="isToolpanelShowing"><router-outlet name="toolpanel"></router-outlet></div>'
         })
         class RootCmpWithCondOutlet implements OnDestroy {
           private subscription: Subscription;
           public isToolpanelShowing: boolean = false;

           constructor(router: Router) {
             this.subscription =
                 router.events.pipe(filter(event => event instanceof NavigationEnd))
                     .subscribe(
                         () => this.isToolpanelShowing =
                             !!router.parseUrl(router.url).root.children['toolpanel']);
           }

           public ngOnDestroy(): void {
             this.subscription.unsubscribe();
           }
         }

         @Component({selector: 'tool-1-cmp', template: 'Tool 1 showing'})
         class Tool1Component {
         }

         @Component({selector: 'tool-2-cmp', template: 'Tool 2 showing'})
         class Tool2Component {
         }

         @NgModule({
           declarations: [RootCmpWithCondOutlet, Tool1Component, Tool2Component],
           imports: [CommonModule, ...ROUTER_DIRECTIVES],
           providers: [
             provideLocationMocks(),
             provideRouter([
               {path: 'a', outlet: 'toolpanel', component: Tool1Component},
               {path: 'b', outlet: 'toolpanel', component: Tool2Component},
             ]),
           ]
         })
         class TestModule {
         }

         TestBed.configureTestingModule({imports: [TestModule]});

         const router: Router = TestBed.inject(Router);
         router.routeReuseStrategy = new AttachDetachReuseStrategy();

         const fixture = createRoot(router, RootCmpWithCondOutlet);

         // Activate 'tool-1'
         router.navigate([{outlets: {toolpanel: 'a'}}]);
         advance(fixture);
         expect(fixture).toContainComponent(Tool1Component, '(a)');

         // Deactivate 'tool-1'
         router.navigate([{outlets: {toolpanel: null}}]);
         advance(fixture);
         expect(fixture).not.toContainComponent(Tool1Component, '(b)');

         // Activate 'tool-1'
         router.navigate([{outlets: {toolpanel: 'a'}}]);
         advance(fixture);
         expect(fixture).toContainComponent(Tool1Component, '(c)');

         // Deactivate 'tool-1'
         router.navigate([{outlets: {toolpanel: null}}]);
         advance(fixture);
         expect(fixture).not.toContainComponent(Tool1Component, '(d)');

         // Activate 'tool-2'
         router.navigate([{outlets: {toolpanel: 'b'}}]);
         advance(fixture);
         expect(fixture).toContainComponent(Tool2Component, '(e)');
       }));

    it('should not remount a destroyed component', fakeAsync(() => {
         @Component({
           selector: 'root-cmp',
           template: '<div *ngIf="showRouterOutlet"><router-outlet></router-outlet></div>'
         })
         class RootCmpWithCondOutlet {
           public showRouterOutlet: boolean = true;
         }

         @NgModule({
           declarations: [RootCmpWithCondOutlet],
           imports: [
             CommonModule,
             ...ROUTER_DIRECTIVES,
           ],
           providers: [
             {provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy},
             provideLocationMocks(),
             provideRouter([
               {path: 'a', component: SimpleCmp},
               {path: 'b', component: BlankCmp},
             ]),
           ]
         })
         class TestModule {
         }
         TestBed.configureTestingModule({imports: [TestModule]});

         const router: Router = TestBed.inject(Router);
         const fixture = createRoot(router, RootCmpWithCondOutlet);

         // Activate 'a'
         router.navigate(['a']);
         advance(fixture);
         expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeTruthy();

         // Deactivate 'a' and detach the route
         router.navigate(['b']);
         advance(fixture);
         expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeNull();

         // Activate 'a' again, the route should be re-attached
         router.navigate(['a']);
         advance(fixture);
         expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeTruthy();

         // Hide the router-outlet, SimpleCmp should be destroyed
         fixture.componentInstance.showRouterOutlet = false;
         advance(fixture);
         expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeNull();

         // Show the router-outlet, SimpleCmp should be re-created
         fixture.componentInstance.showRouterOutlet = true;
         advance(fixture);
         expect(fixture.debugElement.query(By.directive(SimpleCmp))).toBeTruthy();
       }));

    it('should allow to attach parent route with fresh child route', fakeAsync(() => {
         const CREATED_COMPS = new InjectionToken<string[]>('CREATED_COMPS');

         @Component({selector: 'root', template: `<router-outlet></router-outlet>`})
         class Root {
         }

         @Component({selector: 'parent', template: `<router-outlet></router-outlet>`})
         class Parent {
           constructor(@Inject(CREATED_COMPS) createdComps: string[]) {
             createdComps.push('parent');
           }
         }

         @Component({selector: 'child', template: `child`})
         class Child {
           constructor(@Inject(CREATED_COMPS) createdComps: string[]) {
             createdComps.push('child');
           }
         }

         @NgModule({
           declarations: [Root, Parent, Child],
           imports: [
             CommonModule,
             ...ROUTER_DIRECTIVES,
           ],
           providers: [
             {provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy},
             {provide: CREATED_COMPS, useValue: []},
             provideLocationMocks(),
             provideRouter([
               {path: 'a', component: Parent, children: [{path: 'b', component: Child}]},
               {path: 'c', component: SimpleCmp}
             ]),
           ]
         })
         class TestModule {
         }
         TestBed.configureTestingModule({imports: [TestModule]});

         const router = TestBed.inject(Router);
         const fixture = createRoot(router, Root);
         const createdComps = TestBed.inject(CREATED_COMPS);

         expect(createdComps).toEqual([]);

         router.navigateByUrl('/a/b');
         advance(fixture);
         expect(createdComps).toEqual(['parent', 'child']);

         router.navigateByUrl('/c');
         advance(fixture);
         expect(createdComps).toEqual(['parent', 'child']);

         // 'a' parent route will be reused by the `RouteReuseStrategy`, child 'b' should be
         // recreated
         router.navigateByUrl('/a/b');
         advance(fixture);
         expect(createdComps).toEqual(['parent', 'child', 'child']);
       }));

    it('should not try to detach the outlet of a route that does not get to attach a component',
       fakeAsync(() => {
         @Component({selector: 'root', template: `<router-outlet></router-outlet>`})
         class Root {
         }

         @Component({selector: 'component-a', template: 'Component A'})
         class ComponentA {
         }

         @Component({selector: 'component-b', template: 'Component B'})
         class ComponentB {
         }

         @NgModule({
           declarations: [ComponentA],
           imports: [RouterModule.forChild([{path: '', component: ComponentA}])],
         })
         class LoadedModule {
         }

         @NgModule({
           declarations: [Root, ComponentB],
           imports: [ROUTER_DIRECTIVES],
           providers: [
             {provide: RouteReuseStrategy, useClass: AttachDetachReuseStrategy},
             provideLocationMocks(),
             provideRouter([
               {path: 'a', loadChildren: () => LoadedModule}, {path: 'b', component: ComponentB}
             ]),
           ]
         })
         class TestModule {
         }

         TestBed.configureTestingModule({imports: [TestModule]});

         const router = TestBed.inject(Router);
         const strategy = TestBed.inject(RouteReuseStrategy);
         const fixture = createRoot(router, Root);

         spyOn(strategy, 'shouldDetach').and.callThrough();

         router.navigateByUrl('/a');
         advance(fixture);

         // Deactivate 'a'
         // 'shouldDetach' should not be called for the componentless route
         router.navigateByUrl('/b');
         advance(fixture);
         expect(strategy.shouldDetach).toHaveBeenCalledTimes(1);
       }));
  });
});

describe('Testing router options', () => {
  describe('should configure the router', () => {
    it('assigns onSameUrlNavigation', () => {
      TestBed.configureTestingModule({
        providers: [
          provideLocationMocks(),
          provideRouter([], withRouterConfig({onSameUrlNavigation: 'reload'})),
        ]
      });
      const router: Router = TestBed.inject(Router);
      expect(router.onSameUrlNavigation).toBe('reload');
    });

    it('assigns paramsInheritanceStrategy', () => {
      TestBed.configureTestingModule({
        providers: [
          provideLocationMocks(),
          provideRouter([], withRouterConfig({paramsInheritanceStrategy: 'always'})),
        ]
      });
      const router: Router = TestBed.inject(Router);
      expect(router.paramsInheritanceStrategy).toBe('always');
    });

    it('assigns urlUpdateStrategy', () => {
      TestBed.configureTestingModule({
        providers: [
          provideLocationMocks(),
          provideRouter([], withRouterConfig({urlUpdateStrategy: 'eager'})),
        ]
      });
      const router: Router = TestBed.inject(Router);
      expect(router.urlUpdateStrategy).toBe('eager');
    });
  });
});

function expectEvents(events: Event[], pairs: any[]) {
  expect(events.length).toEqual(pairs.length);
  for (let i = 0; i < events.length; ++i) {
    expect((events[i].constructor).name).toBe(pairs[i][0].name);
    expect((<any>events[i]).url).toBe(pairs[i][1]);
  }
}

function onlyNavigationStartAndEnd(e: Event): e is NavigationStart|NavigationEnd {
  return e instanceof NavigationStart || e instanceof NavigationEnd;
}

@Component(
    {selector: 'link-cmp', template: `<a routerLink="/team/33/simple" [target]="'_self'">link</a>`})
class StringLinkCmp {
}

@Component({selector: 'link-cmp', template: `<button routerLink="/team/33/simple">link</button>`})
class StringLinkButtonCmp {
}

@Component({
  selector: 'link-cmp',
  template: `<router-outlet></router-outlet><a [routerLink]="['/team/33/simple']">link</a>`
})
class AbsoluteLinkCmp {
}

@Component({
  selector: 'link-cmp',
  template:
      `<router-outlet></router-outlet><a routerLinkActive="active" (isActiveChange)="this.onRouterLinkActivated($event)" [routerLinkActiveOptions]="{exact: exact}" ariaCurrentWhenActive="page" [routerLink]="['./']">link</a>
 <button routerLinkActive="active" [routerLinkActiveOptions]="{exact: exact}" [routerLink]="['./']">button</button>
 `
})
class DummyLinkCmp {
  private exact: boolean;
  public isLinkActivated?: boolean;

  constructor(route: ActivatedRoute) {
    this.exact = route.snapshot.paramMap.get('exact') === 'true';
  }

  public onRouterLinkActivated(isActive: boolean): void {
    this.isLinkActivated = isActive;
  }
}

@Component({selector: 'link-cmp', template: `<a [routerLink]="['/simple']">link</a>`})
class AbsoluteSimpleLinkCmp {
}

@Component({selector: 'link-cmp', template: `<a [routerLink]="['../simple']">link</a>`})
class RelativeLinkCmp {
}

@Component({
  selector: 'link-cmp',
  template: `<a [routerLink]="['../simple']" [queryParams]="{q: '1'}" fragment="f">link</a>`
})
class LinkWithQueryParamsAndFragment {
}

@Component({
  selector: 'link-cmp',
  template: `<a id="link" [routerLink]="['../simple']" [state]="{foo: 'bar'}">link</a>`
})
class LinkWithState {
}

@Component({
  selector: 'div-link-cmp',
  template: `<div id="link" [routerLink]="['../simple']" [state]="{foo: 'bar'}">link</div>`
})
class DivLinkWithState {
}

@Component({selector: 'simple-cmp', template: `simple`})
class SimpleCmp {
}

@Component({selector: 'collect-params-cmp', template: `collect-params`})
class CollectParamsCmp {
  private params: Params = [];
  private urls: UrlSegment[][] = [];

  constructor(public route: ActivatedRoute) {
    route.params.forEach(p => this.params.push(p));
    route.url.forEach(u => this.urls.push(u));
  }

  recordedUrls(): string[] {
    return this.urls.map((a: UrlSegment[]) => a.map((p: UrlSegment) => p.path).join('/'));
  }
}

@Component({selector: 'blank-cmp', template: ``})
class BlankCmp {
}

@NgModule({imports: [RouterModule.forChild([{path: '', component: BlankCmp}])]})
class ModuleWithBlankCmpAsRoute {
}

@Component({
  selector: 'team-cmp',
  template: `team {{id | async}} ` +
      `[ <router-outlet></router-outlet>, right: <router-outlet name="right"></router-outlet> ]` +
      `<a [routerLink]="routerLink" skipLocationChange></a>` +
      `<button [routerLink]="routerLink" skipLocationChange></button>`
})
class TeamCmp {
  id: Observable<string>;
  recordedParams: Params[] = [];
  snapshotParams: Params[] = [];
  routerLink = ['.'];

  constructor(public route: ActivatedRoute) {
    this.id = route.params.pipe(map((p: Params) => p['id']));
    route.params.forEach(p => {
      this.recordedParams.push(p);
      this.snapshotParams.push(route.snapshot.params);
    });
  }
}

@Component({
  selector: 'two-outlets-cmp',
  template: `[ <router-outlet></router-outlet>, aux: <router-outlet name="aux"></router-outlet> ]`
})
class TwoOutletsCmp {
}


@Component({selector: 'user-cmp', template: `user {{name | async}}`})
class UserCmp {
  name: Observable<string>;
  recordedParams: Params[] = [];
  snapshotParams: Params[] = [];

  constructor(route: ActivatedRoute) {
    this.name = route.params.pipe(map((p: Params) => p['name']));
    route.params.forEach(p => {
      this.recordedParams.push(p);
      this.snapshotParams.push(route.snapshot.params);
    });
  }
}

@Component({selector: 'wrapper', template: `<router-outlet></router-outlet>`})
class WrapperCmp {
}

@Component(
    {selector: 'query-cmp', template: `query: {{name | async}} fragment: {{fragment | async}}`})
class QueryParamsAndFragmentCmp {
  name: Observable<string|null>;
  fragment: Observable<string>;

  constructor(route: ActivatedRoute) {
    this.name = route.queryParamMap.pipe(map((p: ParamMap) => p.get('name')));
    this.fragment = route.fragment.pipe(map((p: string|null|undefined) => {
      if (p === undefined) {
        return 'undefined';
      } else if (p === null) {
        return 'null';
      } else {
        return p;
      }
    }));
  }
}

@Component({selector: 'empty-query-cmp', template: ``})
class EmptyQueryParamsCmp {
  recordedParams: Params[] = [];

  constructor(route: ActivatedRoute) {
    route.queryParams.forEach(_ => this.recordedParams.push(_));
  }
}

@Component({selector: 'route-cmp', template: `route`})
class RouteCmp {
  constructor(public route: ActivatedRoute) {}
}

@Component({
  selector: 'link-cmp',
  template:
      `<div *ngIf="show"><a [routerLink]="['./simple']">link</a></div> <router-outlet></router-outlet>`
})
class RelativeLinkInIfCmp {
  show: boolean = false;
}

@Component(
    {selector: 'child', template: '<div *ngIf="alwaysTrue"><router-outlet></router-outlet></div>'})
class OutletInNgIf {
  alwaysTrue = true;
}

@Component({
  selector: 'link-cmp',
  template: `<router-outlet></router-outlet>
              <div id="link-parent" routerLinkActive="active" [routerLinkActiveOptions]="{exact: exact}">
                <div ngClass="{one: 'true'}"><a [routerLink]="['./']">link</a></div>
              </div>`
})
class DummyLinkWithParentCmp {
  protected exact: boolean;
  constructor(route: ActivatedRoute) {
    this.exact = (route.snapshot.params).exact === 'true';
  }
}

@Component({selector: 'cmp', template: ''})
class ComponentRecordingRoutePathAndUrl {
  public path: ActivatedRoute[];
  public url: string;

  constructor(router: Router, route: ActivatedRoute) {
    this.path = route.pathFromRoot;
    this.url = router.url.toString();
  }
}

@Component({selector: 'root-cmp', template: `<router-outlet></router-outlet>`})
class RootCmp {
}

@Component({selector: 'root-cmp-on-init', template: `<router-outlet></router-outlet>`})
class RootCmpWithOnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.navigate(['one']);
  }
}

@Component({
  selector: 'root-cmp',
  template:
      `primary [<router-outlet></router-outlet>] right [<router-outlet name="right"></router-outlet>]`
})
class RootCmpWithTwoOutlets {
}

@Component({selector: 'root-cmp', template: `main [<router-outlet name="main"></router-outlet>]`})
class RootCmpWithNamedOutlet {
}

@Component({selector: 'throwing-cmp', template: ''})
class ThrowingCmp {
  constructor() {
    throw new Error('Throwing Cmp');
  }
}
@Component({selector: 'conditional-throwing-cmp', template: 'conditional throwing'})
class ConditionalThrowingCmp {
  static throwError = true;
  constructor() {
    if (ConditionalThrowingCmp.throwError) {
      throw new Error('Throwing Cmp');
    }
  }
}



function advance(fixture: ComponentFixture<unknown>, millis?: number): void {
  tick(millis);
  fixture.detectChanges();
}

function createRoot<T>(router: Router, type: Type<T>): ComponentFixture<T> {
  const f = TestBed.createComponent<T>(type);
  advance(f);
  router.initialNavigation();
  advance(f);
  return f;
}

@Component({selector: 'lazy', template: 'lazy-loaded'})
class LazyComponent {
}


@NgModule({
  imports: [CommonModule, ...ROUTER_DIRECTIVES],

  exports: [
    BlankCmp,
    SimpleCmp,
    TwoOutletsCmp,
    TeamCmp,
    UserCmp,
    StringLinkCmp,
    DummyLinkCmp,
    AbsoluteLinkCmp,
    AbsoluteSimpleLinkCmp,
    RelativeLinkCmp,
    DummyLinkWithParentCmp,
    LinkWithQueryParamsAndFragment,
    DivLinkWithState,
    LinkWithState,
    CollectParamsCmp,
    QueryParamsAndFragmentCmp,
    StringLinkButtonCmp,
    WrapperCmp,
    OutletInNgIf,
    ComponentRecordingRoutePathAndUrl,
    RouteCmp,
    RootCmp,
    RootCmpWithOnInit,
    RelativeLinkInIfCmp,
    RootCmpWithTwoOutlets,
    RootCmpWithNamedOutlet,
    EmptyQueryParamsCmp,
    ThrowingCmp,
    ConditionalThrowingCmp,
  ],



  declarations: [
    BlankCmp,
    SimpleCmp,
    TeamCmp,
    TwoOutletsCmp,
    UserCmp,
    StringLinkCmp,
    DummyLinkCmp,
    AbsoluteLinkCmp,
    AbsoluteSimpleLinkCmp,
    RelativeLinkCmp,
    DummyLinkWithParentCmp,
    LinkWithQueryParamsAndFragment,
    DivLinkWithState,
    LinkWithState,
    CollectParamsCmp,
    QueryParamsAndFragmentCmp,
    StringLinkButtonCmp,
    WrapperCmp,
    OutletInNgIf,
    ComponentRecordingRoutePathAndUrl,
    RouteCmp,
    RootCmp,
    RootCmpWithOnInit,
    RelativeLinkInIfCmp,
    RootCmpWithTwoOutlets,
    RootCmpWithNamedOutlet,
    EmptyQueryParamsCmp,
    ThrowingCmp,
    ConditionalThrowingCmp,
  ]
})
class TestModule {
}
