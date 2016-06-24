import 'rxjs/add/operator/map';

import {Location, LocationStrategy} from '@angular/common';
import {SpyLocation} from '@angular/common/testing';
import {MockLocationStrategy} from '@angular/common/testing/mock_location_strategy';
import {ComponentFixture, TestComponentBuilder} from '@angular/compiler/testing';
import {Component, Injector} from '@angular/core';
import {ComponentResolver} from '@angular/core';
import {beforeEach, beforeEachProviders, ddescribe, describe, fakeAsync, iit, inject, it, tick, xdescribe, xit} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/matchers';
import {Observable} from 'rxjs/Observable';
import {of } from 'rxjs/observable/of';

import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, CanDeactivate, DefaultUrlSerializer, Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Params, ROUTER_DIRECTIVES, Router, RouterConfig, RouterOutletMap, RouterStateSnapshot, RoutesRecognized, UrlSerializer} from '../index';

describe('Integration', () => {

  beforeEachProviders(() => {
    let config: RouterConfig =
        [{path: '', component: BlankCmp}, {path: 'simple', component: SimpleCmp}];

    return [
      RouterOutletMap,
      {provide: UrlSerializer, useClass: DefaultUrlSerializer},
      {provide: Location, useClass: SpyLocation},
      {provide: LocationStrategy, useClass: MockLocationStrategy},
      {
        provide: Router,
        useFactory: (resolver: ComponentResolver, urlSerializer: UrlSerializer,
                     outletMap: RouterOutletMap, location: Location, injector: Injector) => {
          const r =
              new Router(RootCmp, resolver, urlSerializer, outletMap, location, injector, config);
          r.initialNavigation();
          return r;
        },
        deps: [ComponentResolver, UrlSerializer, RouterOutletMap, Location, Injector]
      },
      {provide: ActivatedRoute, useFactory: (r: Router) => r.routerState.root, deps: [Router]},
    ];
  });

  it('should navigate with a provided config',
     fakeAsync(inject(
         [Router, TestComponentBuilder, Location],
         (router: Router, tcb: TestComponentBuilder, location: Location) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.navigateByUrl('/simple');
           advance(fixture);

           expect(location.path()).toEqual('/simple');
         })));


  it('should update location when navigating',
     fakeAsync(inject(
         [Router, TestComponentBuilder, Location],
         (router: Router, tcb: TestComponentBuilder, location: Location) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

           router.navigateByUrl('/team/22');
           advance(fixture);
           expect(location.path()).toEqual('/team/22');

           router.navigateByUrl('/team/33');
           advance(fixture);

           expect(location.path()).toEqual('/team/33');
         })));

  it('should navigate back and forward',
     fakeAsync(inject(
         [Router, TestComponentBuilder, Location],
         (router: Router, tcb: TestComponentBuilder, location: Location) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.resetConfig([{
             path: 'team/:id',
             component: TeamCmp,
             children: [
               {path: 'simple', component: SimpleCmp}, {path: 'user/:name', component: UserCmp}
             ]
           }]);


           router.navigateByUrl('/team/33/simple');
           advance(fixture);
           expect(location.path()).toEqual('/team/33/simple');

           router.navigateByUrl('/team/22/user/victor');
           advance(fixture);

           location.back();
           advance(fixture);
           expect(location.path()).toEqual('/team/33/simple');

           location.forward();
           advance(fixture);
           expect(location.path()).toEqual('/team/22/user/victor');
         })));

  it('should navigate when locations changes',
     fakeAsync(inject(
         [Router, TestComponentBuilder, Location],
         (router: Router, tcb: TestComponentBuilder, location: Location) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.resetConfig([{
             path: 'team/:id',
             component: TeamCmp,
             children: [{path: 'user/:name', component: UserCmp}]
           }]);

           router.navigateByUrl('/team/22/user/victor');
           advance(fixture);

           (<any>location).simulateHashChange('/team/22/user/fedor');
           advance(fixture);

           expect(fixture.debugElement.nativeElement).toHaveText('team 22 { user fedor, right:  }');
         })));

  it('should update the location when the matched route does not change',
     fakeAsync(inject(
         [Router, TestComponentBuilder, Location],
         (router: Router, tcb: TestComponentBuilder, location: Location) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.resetConfig([{path: '**', component: CollectParamsCmp}]);

           router.navigateByUrl('/one/two');
           advance(fixture);
           const cmp = fixture.debugElement.children[1].componentInstance;
           expect(location.path()).toEqual('/one/two');
           expect(fixture.debugElement.nativeElement).toHaveText('collect-params');

           expect(cmp.recordedUrls()).toEqual(['one/two']);

           router.navigateByUrl('/three/four');
           advance(fixture);
           expect(location.path()).toEqual('/three/four');
           expect(fixture.debugElement.nativeElement).toHaveText('collect-params');
           expect(cmp.recordedUrls()).toEqual(['one/two', 'three/four']);
         })));

  it('should support secondary routes',
     fakeAsync(
         inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

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

           expect(fixture.debugElement.nativeElement)
               .toHaveText('team 22 { user victor, right: simple }');
         })));

  it('should deactivate outlets',
     fakeAsync(
         inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

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

           expect(fixture.debugElement.nativeElement)
               .toHaveText('team 22 { user victor, right:  }');
         })));

  it('should deactivate nested outlets',
     fakeAsync(
         inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

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

           expect(fixture.debugElement.nativeElement).toHaveText('');
         })));

  it('should set query params and fragment',
     fakeAsync(
         inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.resetConfig([{path: 'query', component: QueryParamsAndFragmentCmp}]);

           router.navigateByUrl('/query?name=1#fragment1');
           advance(fixture);
           expect(fixture.debugElement.nativeElement).toHaveText('query: 1 fragment: fragment1');

           router.navigateByUrl('/query?name=2#fragment2');
           advance(fixture);
           expect(fixture.debugElement.nativeElement).toHaveText('query: 2 fragment: fragment2');
         })));

  it('should push params only when they change',
     fakeAsync(
         inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

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
           expect(user.recordedParams).toEqual([{name: 'victor'}]);

           router.navigateByUrl('/team/22/user/fedor');
           advance(fixture);

           expect(team.recordedParams).toEqual([{id: '22'}]);
           expect(user.recordedParams).toEqual([{name: 'victor'}, {name: 'fedor'}]);
         })));

  it('should work when navigating to /',
     fakeAsync(
         inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.resetConfig([
             {path: '', terminal: true, component: SimpleCmp},
             {path: 'user/:name', component: UserCmp}
           ]);

           router.navigateByUrl('/user/victor');
           advance(fixture);

           expect(fixture.debugElement.nativeElement).toHaveText('user victor');

           router.navigateByUrl('/');
           advance(fixture);

           expect(fixture.debugElement.nativeElement).toHaveText('simple');
         })));

  it('should cancel in-flight navigations',
     fakeAsync(
         inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.resetConfig([{path: 'user/:name', component: UserCmp}]);

           const recordedEvents: any = [];
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

           expect(fixture.debugElement.nativeElement).toHaveText('user fedor');
           expect(user.recordedParams).toEqual([{name: 'init'}, {name: 'fedor'}]);

           expectEvents(recordedEvents, [
             [NavigationStart, '/user/init'], [RoutesRecognized, '/user/init'],
             [NavigationEnd, '/user/init'],

             [NavigationStart, '/user/victor'], [NavigationStart, '/user/fedor'],

             [NavigationCancel, '/user/victor'], [RoutesRecognized, '/user/fedor'],
             [NavigationEnd, '/user/fedor']
           ]);
         })));

  it('should handle failed navigations gracefully',
     fakeAsync(
         inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.resetConfig([{path: 'user/:name', component: UserCmp}]);

           const recordedEvents: any = [];
           router.events.forEach(e => recordedEvents.push(e));

           let e: any;
           router.navigateByUrl('/invalid').catch(_ => e = _);
           advance(fixture);
           expect(e.message).toContain('Cannot match any routes');

           router.navigateByUrl('/user/fedor');
           advance(fixture);

           expect(fixture.debugElement.nativeElement).toHaveText('user fedor');

           expectEvents(recordedEvents, [
             [NavigationStart, '/invalid'], [NavigationError, '/invalid'],

             [NavigationStart, '/user/fedor'], [RoutesRecognized, '/user/fedor'],
             [NavigationEnd, '/user/fedor']
           ]);
         })));

  it('should replace state when path is equal to current path',
     fakeAsync(inject(
         [Router, TestComponentBuilder, Location],
         (router: Router, tcb: TestComponentBuilder, location: Location) => {
           const fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.resetConfig([{
             path: 'team/:id',
             component: TeamCmp,
             children: [
               {path: 'simple', component: SimpleCmp}, {path: 'user/:name', component: UserCmp}
             ]
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
     fakeAsync(inject(
         [Router, TestComponentBuilder, Location],
         (router: Router, tcb: TestComponentBuilder, location: Location) => {
           const fixture = tcb.createFakeAsync(RootCmpWithTwoOutlets);
           advance(fixture);

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
           expect(fixture.debugElement.nativeElement)
               .toHaveText('primary {simple} right {user victor}');

           // navigate to the same route with different params (reuse)
           router.navigateByUrl('/parent/22/(simple//right:user/fedor)');
           advance(fixture);
           expect(location.path()).toEqual('/parent/22/(simple//right:user/fedor)');
           expect(fixture.debugElement.nativeElement)
               .toHaveText('primary {simple} right {user fedor}');

           // navigate to a normal route (check deactivation)
           router.navigateByUrl('/user/victor');
           advance(fixture);
           expect(location.path()).toEqual('/user/victor');
           expect(fixture.debugElement.nativeElement).toHaveText('primary {user victor} right {}');

           // navigate back to a componentless route
           router.navigateByUrl('/parent/11/(simple//right:user/victor)');
           advance(fixture);
           expect(location.path()).toEqual('/parent/11/(simple//right:user/victor)');
           expect(fixture.debugElement.nativeElement)
               .toHaveText('primary {simple} right {user victor}');
         })));

  describe('router links', () => {
    it('should support string router links',
       fakeAsync(
           inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
             const fixture = tcb.createFakeAsync(RootCmp);
             advance(fixture);

             router.resetConfig([{
               path: 'team/:id',
               component: TeamCmp,
               children: [
                 {path: 'link', component: StringLinkCmp},
                 {path: 'simple', component: SimpleCmp}
               ]
             }]);

             router.navigateByUrl('/team/22/link');
             advance(fixture);
             expect(fixture.debugElement.nativeElement).toHaveText('team 22 { link, right:  }');

             const native = fixture.debugElement.nativeElement.querySelector('a');
             expect(native.getAttribute('href')).toEqual('/team/33/simple');
             native.click();
             advance(fixture);

             expect(fixture.debugElement.nativeElement).toHaveText('team 33 { simple, right:  }');
           })));

    it('should support absolute router links',
       fakeAsync(
           inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
             const fixture = tcb.createFakeAsync(RootCmp);
             advance(fixture);

             router.resetConfig([{
               path: 'team/:id',
               component: TeamCmp,
               children: [
                 {path: 'link', component: AbsoluteLinkCmp},
                 {path: 'simple', component: SimpleCmp}
               ]
             }]);

             router.navigateByUrl('/team/22/link');
             advance(fixture);
             expect(fixture.debugElement.nativeElement).toHaveText('team 22 { link, right:  }');

             const native = fixture.debugElement.nativeElement.querySelector('a');
             expect(native.getAttribute('href')).toEqual('/team/33/simple');
             native.click();
             advance(fixture);

             expect(fixture.debugElement.nativeElement).toHaveText('team 33 { simple, right:  }');
           })));

    it('should support relative router links',
       fakeAsync(
           inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
             const fixture = tcb.createFakeAsync(RootCmp);
             advance(fixture);

             router.resetConfig([{
               path: 'team/:id',
               component: TeamCmp,
               children: [
                 {path: 'link', component: RelativeLinkCmp},
                 {path: 'simple', component: SimpleCmp}
               ]
             }]);

             router.navigateByUrl('/team/22/link');
             advance(fixture);
             expect(fixture.debugElement.nativeElement).toHaveText('team 22 { link, right:  }');

             const native = fixture.debugElement.nativeElement.querySelector('a');
             expect(native.getAttribute('href')).toEqual('/team/22/simple');
             native.click();
             advance(fixture);

             expect(fixture.debugElement.nativeElement).toHaveText('team 22 { simple, right:  }');
           })));

    it('should support top-level link',
       fakeAsync(
           inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
             let fixture = tcb.createFakeAsync(AbsoluteLinkCmp);
             advance(fixture);

             expect(fixture.debugElement.nativeElement).toHaveText('link');
           })));

    it('should support query params and fragments',
       fakeAsync(inject(
           [Router, Location, TestComponentBuilder],
           (router: Router, location: Location, tcb: TestComponentBuilder) => {
             const fixture = tcb.createFakeAsync(RootCmp);
             advance(fixture);

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

             const native = fixture.debugElement.nativeElement.querySelector('a');
             expect(native.getAttribute('href')).toEqual('/team/22/simple?q=1#f');
             native.click();
             advance(fixture);

             expect(fixture.debugElement.nativeElement).toHaveText('team 22 { simple, right:  }');

             expect(location.path()).toEqual('/team/22/simple?q=1#f');
           })));
  });

  describe('redirects', () => {
    it('should work', fakeAsync(inject(
                          [Router, TestComponentBuilder, Location],
                          (router: Router, tcb: TestComponentBuilder, location: Location) => {
                            const fixture = tcb.createFakeAsync(RootCmp);
                            advance(fixture);

                            router.resetConfig([
                              {path: 'old/team/:id', redirectTo: 'team/:id'},
                              {path: 'team/:id', component: TeamCmp}
                            ]);

                            router.navigateByUrl('old/team/22');
                            advance(fixture);

                            expect(location.path()).toEqual('/team/22');
                          })));
  });

  describe('guards', () => {
    describe('CanActivate', () => {
      describe('should not activate a route when CanActivate returns false', () => {
        beforeEachProviders(() => [{provide: 'alwaysFalse', useValue: (a: any, b: any) => false}]);

        it('works',
           fakeAsync(inject(
               [Router, TestComponentBuilder, Location],
               (router: Router, tcb: TestComponentBuilder, location: Location) => {
                 const fixture = tcb.createFakeAsync(RootCmp);
                 advance(fixture);

                 router.resetConfig(
                     [{path: 'team/:id', component: TeamCmp, canActivate: ['alwaysFalse']}]);

                 router.navigateByUrl('/team/22');
                 advance(fixture);

                 expect(location.path()).toEqual('/');
               })));
      });

      describe(
          'should not activate a route when CanActivate returns false (componentless route)',
          () => {
            beforeEachProviders(
                () => [{provide: 'alwaysFalse', useValue: (a: any, b: any) => false}]);

            it('works', fakeAsync(inject(
                            [Router, TestComponentBuilder, Location],
                            (router: Router, tcb: TestComponentBuilder, location: Location) => {
                              const fixture = tcb.createFakeAsync(RootCmp);
                              advance(fixture);

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
        beforeEachProviders(() => [{
                              provide: 'alwaysTrue',
                              useValue: (a: ActivatedRouteSnapshot, s: RouterStateSnapshot) => true
                            }]);

        it('works',
           fakeAsync(inject(
               [Router, TestComponentBuilder, Location],
               (router: Router, tcb: TestComponentBuilder, location: Location) => {
                 const fixture = tcb.createFakeAsync(RootCmp);
                 advance(fixture);

                 router.resetConfig(
                     [{path: 'team/:id', component: TeamCmp, canActivate: ['alwaysTrue']}]);

                 router.navigateByUrl('/team/22');
                 advance(fixture);

                 expect(location.path()).toEqual('/team/22');
               })));
      });

      describe('should work when given a class', () => {
        class AlwaysTrue implements CanActivate {
          canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
            return true;
          }
        }

        beforeEachProviders(() => [AlwaysTrue]);

        it('works', fakeAsync(inject(
                        [Router, TestComponentBuilder, Location],
                        (router: Router, tcb: TestComponentBuilder, location: Location) => {
                          const fixture = tcb.createFakeAsync(RootCmp);
                          advance(fixture);

                          router.resetConfig(
                              [{path: 'team/:id', component: TeamCmp, canActivate: [AlwaysTrue]}]);

                          router.navigateByUrl('/team/22');
                          advance(fixture);

                          expect(location.path()).toEqual('/team/22');
                        })));
      });

      describe('should work when returns an observable', () => {
        beforeEachProviders(() => [{
                              provide: 'CanActivate',
                              useValue: (a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                                return of (false);
                              }
                            }]);

        it('works',
           fakeAsync(inject(
               [Router, TestComponentBuilder, Location],
               (router: Router, tcb: TestComponentBuilder, location: Location) => {
                 const fixture = tcb.createFakeAsync(RootCmp);
                 advance(fixture);

                 router.resetConfig(
                     [{path: 'team/:id', component: TeamCmp, canActivate: ['CanActivate']}]);

                 router.navigateByUrl('/team/22');
                 advance(fixture);
                 expect(location.path()).toEqual('/');
               })));
      });
    });

    describe('CanDeactivate', () => {
      describe('should not deactivate a route when CanDeactivate returns false', () => {
        beforeEachProviders(
            () =>
                [{
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
                 }]);

        it('works',
           fakeAsync(inject(
               [Router, TestComponentBuilder, Location],
               (router: Router, tcb: TestComponentBuilder, location: Location) => {
                 const fixture = tcb.createFakeAsync(RootCmp);
                 advance(fixture);

                 router.resetConfig([
                   {path: 'team/:id', component: TeamCmp, canDeactivate: ['CanDeactivateTeam']}
                 ]);

                 router.navigateByUrl('/team/22');
                 advance(fixture);
                 expect(location.path()).toEqual('/team/22');

                 router.navigateByUrl('/team/33');
                 advance(fixture);
                 expect(location.path()).toEqual('/team/33');

                 router.navigateByUrl('/team/44');
                 advance(fixture);
                 expect(location.path()).toEqual('/team/33');
               })));

        it('works (componentless route)',
           fakeAsync(inject(
               [Router, TestComponentBuilder, Location],
               (router: Router, tcb: TestComponentBuilder, location: Location) => {
                 const fixture = tcb.createFakeAsync(RootCmp);
                 advance(fixture);

                 router.resetConfig([{
                   path: 'parent/:id',
                   canDeactivate: ['CanDeactivateParent'],
                   children: [{path: 'simple', component: SimpleCmp}]
                 }]);

                 router.navigateByUrl('/parent/22/simple');
                 advance(fixture);
                 expect(location.path()).toEqual('/parent/22/simple');

                 router.navigateByUrl('/parent/33/simple');
                 advance(fixture);
                 expect(location.path()).toEqual('/parent/33/simple');

                 router.navigateByUrl('/parent/44/simple');
                 advance(fixture);
                 expect(location.path()).toEqual('/parent/33/simple');
               })));

        it('works with a nested route',
           fakeAsync(inject(
               [Router, TestComponentBuilder, Location],
               (router: Router, tcb: TestComponentBuilder, location: Location) => {
                 const fixture = tcb.createFakeAsync(RootCmp);
                 advance(fixture);

                 router.resetConfig([{
                   path: 'team/:id',
                   component: TeamCmp,
                   children: [
                     {path: '', terminal: true, component: SimpleCmp}, {
                       path: 'user/:name',
                       component: UserCmp,
                       canDeactivate: ['CanDeactivateUser']
                     }
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

      describe('should work when given a class', () => {
        class AlwaysTrue implements CanDeactivate<TeamCmp> {
          canDeactivate(
              component: TeamCmp, route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): boolean {
            return true;
          }
        }

        beforeEachProviders(() => [AlwaysTrue]);

        it('works',
           fakeAsync(inject(
               [Router, TestComponentBuilder, Location],
               (router: Router, tcb: TestComponentBuilder, location: Location) => {
                 const fixture = tcb.createFakeAsync(RootCmp);
                 advance(fixture);

                 router.resetConfig(
                     [{path: 'team/:id', component: TeamCmp, canDeactivate: [AlwaysTrue]}]);

                 router.navigateByUrl('/team/22');
                 advance(fixture);
                 expect(location.path()).toEqual('/team/22');

                 router.navigateByUrl('/team/33');
                 advance(fixture);
                 expect(location.path()).toEqual('/team/33');
               })));
      });
    });

    describe('should work when returns an observable', () => {
      beforeEachProviders(() => [{
                            provide: 'CanDeactivate',
                            useValue: (c: TeamCmp, a: ActivatedRouteSnapshot,
                                       b: RouterStateSnapshot) => { return of (false); }
                          }]);

      it('works',
         fakeAsync(inject(
             [Router, TestComponentBuilder, Location],
             (router: Router, tcb: TestComponentBuilder, location: Location) => {
               const fixture = tcb.createFakeAsync(RootCmp);
               advance(fixture);

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

  describe('routerActiveLink', () => {
    it('should set the class when the link is active',
       fakeAsync(inject(
           [Router, TestComponentBuilder, Location],
           (router: Router, tcb: TestComponentBuilder, location: Location) => {
             const fixture = tcb.createFakeAsync(RootCmp);
             advance(fixture);

             router.resetConfig([{
               path: 'team/:id',
               component: TeamCmp,
               children: [{
                 path: 'link',
                 component: DummyLinkCmp,
                 children:
                     [{path: 'simple', component: SimpleCmp}, {path: '', component: BlankCmp}]
               }]
             }]);

             router.navigateByUrl('/team/22/link;exact=true');
             advance(fixture);
             expect(location.path()).toEqual('/team/22/link;exact=true');

             const native = fixture.debugElement.nativeElement.querySelector('a');
             expect(native.className).toEqual('active');

             router.navigateByUrl('/team/22/link/simple');
             advance(fixture);
             expect(location.path()).toEqual('/team/22/link/simple');
             expect(native.className).toEqual('');
           })));

    it('should set the class on a parent element when the link is active',
       fakeAsync(inject(
           [Router, TestComponentBuilder, Location],
           (router: Router, tcb: TestComponentBuilder, location: Location) => {
             const fixture = tcb.createFakeAsync(RootCmp);
             advance(fixture);

             router.resetConfig([{
               path: 'team/:id',
               component: TeamCmp,
               children: [{
                 path: 'link',
                 component: DummyLinkWithParentCmp,
                 children:
                     [{path: 'simple', component: SimpleCmp}, {path: '', component: BlankCmp}]
               }]
             }]);

             router.navigateByUrl('/team/22/link;exact=true');
             advance(fixture);
             expect(location.path()).toEqual('/team/22/link;exact=true');

             const native = fixture.debugElement.nativeElement.querySelector('link-parent');
             expect(native.className).toEqual('active');

             router.navigateByUrl('/team/22/link/simple');
             advance(fixture);
             expect(location.path()).toEqual('/team/22/link/simple');
             expect(native.className).toEqual('');
           })));

    it('should set the class when the link is active',
       fakeAsync(inject(
           [Router, TestComponentBuilder, Location],
           (router: Router, tcb: TestComponentBuilder, location: Location) => {
             const fixture = tcb.createFakeAsync(RootCmp);
             advance(fixture);

             router.resetConfig([{
               path: 'team/:id',
               component: TeamCmp,
               children: [{
                 path: 'link',
                 component: DummyLinkCmp,
                 children:
                     [{path: 'simple', component: SimpleCmp}, {path: '', component: BlankCmp}]
               }]
             }]);

             router.navigateByUrl('/team/22/link');
             advance(fixture);
             expect(location.path()).toEqual('/team/22/link');

             const native = fixture.debugElement.nativeElement.querySelector('a');
             expect(native.className).toEqual('active');

             router.navigateByUrl('/team/22/link/simple');
             advance(fixture);
             expect(location.path()).toEqual('/team/22/link/simple');
             expect(native.className).toEqual('active');
           })));

  });
});

function expectEvents(events: Event[], pairs: any[]) {
  for (let i = 0; i < events.length; ++i) {
    expect((<any>events[i].constructor).name).toBe(pairs[i][0].name);
    expect((<any>events[i]).url).toBe(pairs[i][1]);
  }
}

@Component({
  selector: 'link-cmp',
  template: `<a routerLink="/team/33/simple">link</a>`,
  directives: ROUTER_DIRECTIVES
})
class StringLinkCmp {
}

@Component({
  selector: 'link-cmp',
  template: `<router-outlet></router-outlet><a [routerLink]="['/team/33/simple']">link</a>`,
  directives: ROUTER_DIRECTIVES
})
class AbsoluteLinkCmp {
}

@Component({
  selector: 'link-cmp',
  template:
      `<router-outlet></router-outlet><a routerLinkActive="active" [routerLinkActiveOptions]="{exact: exact}" [routerLink]="['./']">link</a>`,
  directives: ROUTER_DIRECTIVES
})
class DummyLinkCmp {
  private exact: boolean;
  constructor(route: ActivatedRoute) { this.exact = (<any>route.snapshot.params).exact === 'true'; }
}

@Component({
  selector: 'link-cmp',
  template:
      `<router-outlet></router-outlet><link-parent routerLinkActive="active" [routerLinkActiveOptions]="{exact: exact}"><a [routerLink]="['./']">link</a></link-parent>`,
  directives: ROUTER_DIRECTIVES
})
class DummyLinkWithParentCmp {
  private exact: boolean;
  constructor(route: ActivatedRoute) { this.exact = (<any>route.snapshot.params).exact === 'true'; }
}

@Component({
  selector: 'link-cmp',
  template: `<a [routerLink]="['../simple']">link</a>`,
  directives: ROUTER_DIRECTIVES
})
class RelativeLinkCmp {
}

@Component({
  selector: 'link-cmp',
  template: `<a [routerLink]="['../simple']" [queryParams]="{q: '1'}" fragment="f">link</a>`,
  directives: ROUTER_DIRECTIVES
})
class LinkWithQueryParamsAndFragment {
}

@Component({selector: 'simple-cmp', template: `simple`, directives: ROUTER_DIRECTIVES})
class SimpleCmp {
}

@Component(
    {selector: 'collect-params-cmp', template: `collect-params`, directives: ROUTER_DIRECTIVES})
class CollectParamsCmp {
  private params: any = [];
  private urls: any = [];

  constructor(a: ActivatedRoute) {
    a.params.forEach(p => this.params.push(p));
    a.url.forEach(u => this.urls.push(u));
  }

  recordedUrls(): string[] { return this.urls.map(a => a.map(p => p.path).join('/')); }
}

@Component({selector: 'blank-cmp', template: ``, directives: ROUTER_DIRECTIVES})
class BlankCmp {
}

@Component({
  selector: 'team-cmp',
  template:
      `team {{id | async}} { <router-outlet></router-outlet>, right: <router-outlet name="right"></router-outlet> }`,
  directives: ROUTER_DIRECTIVES
})
class TeamCmp {
  id: Observable<string>;
  recordedParams: Params[] = [];

  constructor(public route: ActivatedRoute) {
    this.id = route.params.map(p => p['id']);
    route.params.forEach(_ => this.recordedParams.push(_));
  }
}

@Component(
    {selector: 'user-cmp', template: `user {{name | async}}`, directives: [ROUTER_DIRECTIVES]})
class UserCmp {
  name: Observable<string>;
  recordedParams: Params[] = [];

  constructor(route: ActivatedRoute) {
    this.name = route.params.map(p => p['name']);
    route.params.forEach(_ => this.recordedParams.push(_));
  }
}

@Component({
  selector: 'query-cmp',
  template: `query: {{name | async}} fragment: {{fragment | async}}`,
  directives: [ROUTER_DIRECTIVES]
})
class QueryParamsAndFragmentCmp {
  name: Observable<string>;
  fragment: Observable<string>;

  constructor(router: Router) {
    this.name = router.routerState.queryParams.map(p => p['name']);
    this.fragment = router.routerState.fragment;
  }
}

@Component({
  selector: 'root-cmp',
  template: `<router-outlet></router-outlet>`,
  directives: [ROUTER_DIRECTIVES]
})
class RootCmp {
}

@Component({
  selector: 'root-cmp',
  template:
      `primary {<router-outlet></router-outlet>} right {<router-outlet name="right"></router-outlet>}`,
  directives: [ROUTER_DIRECTIVES]
})
class RootCmpWithTwoOutlets {
}

function advance(fixture: ComponentFixture<any>): void {
  tick();
  fixture.detectChanges();
}
