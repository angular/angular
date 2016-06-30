import 'rxjs/add/operator/map';

import {Location} from '@angular/common';
import {AppModule, AppModuleFactoryLoader, Component} from '@angular/core';
import {ComponentFixture, TestComponentBuilder} from '@angular/core/testing';
import {addProviders, configureModule, fakeAsync, inject, tick} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/matchers';
import {Observable} from 'rxjs/Observable';
import {of } from 'rxjs/observable/of';

import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, CanDeactivate, Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Params, ROUTER_DIRECTIVES, Resolve, Router, RouterStateSnapshot, RoutesRecognized, provideRoutes} from '../index';
import {RouterTestModule, SpyAppModuleFactoryLoader} from '../testing';

describe('Integration', () => {
  beforeEach(() => {
    configureModule({
      modules: [RouterTestModule],
      providers: [provideRoutes(
          [{path: '', component: BlankCmp}, {path: 'simple', component: SimpleCmp}])]
    });
  });

  it('should navigate with a provided config',
     fakeAsync(inject(
         [Router, TestComponentBuilder, Location],
         (router: Router, tcb: TestComponentBuilder, location: Location) => {
           const fixture = createRoot(tcb, router, RootCmp);

           router.navigateByUrl('/simple');
           advance(fixture);

           expect(location.path()).toEqual('/simple');
         })));

  it('should work when an outlet is in an ngIf',
     fakeAsync(inject(
         [Router, TestComponentBuilder, Location],
         (router: Router, tcb: TestComponentBuilder, location: Location) => {
           const fixture = createRoot(tcb, router, RootCmp);

           router.resetConfig([{
             path: 'child',
             component: LinkInNgIf,
             children: [{path: 'simple', component: SimpleCmp}]
           }]);

           router.navigateByUrl('/child/simple');
           advance(fixture);

           expect(location.path()).toEqual('/child/simple');
         })));


  it('should update location when navigating',
     fakeAsync(inject(
         [Router, TestComponentBuilder, Location],
         (router: Router, tcb: TestComponentBuilder, location: Location) => {
           const fixture = createRoot(tcb, router, RootCmp);

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
           const fixture = createRoot(tcb, router, RootCmp);

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
           const fixture = createRoot(tcb, router, RootCmp);

           router.resetConfig([{
             path: 'team/:id',
             component: TeamCmp,
             children: [{path: 'user/:name', component: UserCmp}]
           }]);

           router.navigateByUrl('/team/22/user/victor');
           advance(fixture);

           (<any>location).simulateHashChange('/team/22/user/fedor');
           advance(fixture);

           expect(fixture.debugElement.nativeElement).toHaveText('team 22 [ user fedor, right:  ]');
         })));

  it('should update the location when the matched route does not change',
     fakeAsync(inject(
         [Router, TestComponentBuilder, Location],
         (router: Router, tcb: TestComponentBuilder, location: Location) => {
           const fixture = createRoot(tcb, router, RootCmp);

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
           const fixture = createRoot(tcb, router, RootCmp);

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
               .toHaveText('team 22 [ user victor, right: simple ]');
         })));

  it('should deactivate outlets',
     fakeAsync(
         inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
           const fixture = createRoot(tcb, router, RootCmp);

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
               .toHaveText('team 22 [ user victor, right:  ]');
         })));

  it('should deactivate nested outlets',
     fakeAsync(
         inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
           const fixture = createRoot(tcb, router, RootCmp);

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
           const fixture = createRoot(tcb, router, RootCmp);

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
           const fixture = createRoot(tcb, router, RootCmp);

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
           const fixture = createRoot(tcb, router, RootCmp);

           router.resetConfig([
             {path: '', pathMatch: 'full', component: SimpleCmp},
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
           const fixture = createRoot(tcb, router, RootCmp);

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
           const fixture = createRoot(tcb, router, RootCmp);

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
           const fixture = createRoot(tcb, router, RootCmp);

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
           const fixture = createRoot(tcb, router, RootCmpWithTwoOutlets);

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
               .toHaveText('primary [simple] right [user victor]');

           // navigate to the same route with different params (reuse)
           router.navigateByUrl('/parent/22/(simple//right:user/fedor)');
           advance(fixture);
           expect(location.path()).toEqual('/parent/22/(simple//right:user/fedor)');
           expect(fixture.debugElement.nativeElement)
               .toHaveText('primary [simple] right [user fedor]');

           // navigate to a normal route (check deactivation)
           router.navigateByUrl('/user/victor');
           advance(fixture);
           expect(location.path()).toEqual('/user/victor');
           expect(fixture.debugElement.nativeElement).toHaveText('primary [user victor] right []');

           // navigate back to a componentless route
           router.navigateByUrl('/parent/11/(simple//right:user/victor)');
           advance(fixture);
           expect(location.path()).toEqual('/parent/11/(simple//right:user/victor)');
           expect(fixture.debugElement.nativeElement)
               .toHaveText('primary [simple] right [user victor]');
         })));

  it('should emit an event when an outlet gets activated',
     fakeAsync(inject(
         [Router, TestComponentBuilder, Location],
         (router: Router, tcb: TestComponentBuilder, location: Location) => {
           @Component({
             selector: 'container',
             template:
                 `<router-outlet (activate)="recordActivate($event)" (deactivate)="recordDeactivate($event)"></router-outlet>`
           })
           class Container {
             activations: any[] = [];
             deactivations: any[] = [];

             recordActivate(component: any): void { this.activations.push(component); }

             recordDeactivate(component: any): void { this.deactivations.push(component); }
           }

           const fixture = createRoot(tcb, router, Container);
           const cmp = fixture.debugElement.componentInstance;

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
           expect(cmp.deactivations.length).toEqual(2);
           expect(cmp.deactivations[1] instanceof BlankCmp).toBe(true);
         })));

  describe('data', () => {
    class ResolveSix implements Resolve<TeamCmp> {
      resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): number { return 6; }
    }

    beforeEach(() => {
      addProviders([
        {provide: 'resolveTwo', useValue: (a: any, b: any) => 2},
        {provide: 'resolveFour', useValue: (a: any, b: any) => 4},
        {provide: 'resolveSix', useClass: ResolveSix}
      ]);
    });

    it('should provide resolved data',
       fakeAsync(inject(
           [Router, TestComponentBuilder, Location],
           (router: Router, tcb: TestComponentBuilder, location: Location) => {
             const fixture = createRoot(tcb, router, RootCmpWithTwoOutlets);

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
                 }
               ]
             }]);

             router.navigateByUrl('/parent/1');
             advance(fixture);

             const primaryCmp = fixture.debugElement.children[1].componentInstance;
             const rightCmp = fixture.debugElement.children[3].componentInstance;

             expect(primaryCmp.route.snapshot.data).toEqual({one: 1, two: 2, three: 3, four: 4});
             expect(rightCmp.route.snapshot.data).toEqual({one: 1, two: 2, five: 5, six: 6});

             let primaryRecorded: any[] = [];
             primaryCmp.route.data.forEach((rec: any) => primaryRecorded.push(rec));

             let rightRecorded: any[] = [];
             rightCmp.route.data.forEach((rec: any) => rightRecorded.push(rec));

             router.navigateByUrl('/parent/2');
             advance(fixture);

             expect(primaryRecorded).toEqual([
               {one: 1, three: 3, two: 2, four: 4}, {one: 1, three: 3, two: 2, four: 4}
             ]);
             expect(rightRecorded).toEqual([
               {one: 1, five: 5, two: 2, six: 6}, {one: 1, five: 5, two: 2, six: 6}
             ]);
           })));
  });

  describe('router links', () => {
    it('should support string router links',
       fakeAsync(
           inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
             const fixture = createRoot(tcb, router, RootCmp);

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
             expect(fixture.debugElement.nativeElement).toHaveText('team 22 [ link, right:  ]');

             const native = fixture.debugElement.nativeElement.querySelector('a');
             expect(native.getAttribute('href')).toEqual('/team/33/simple');
             native.click();
             advance(fixture);

             expect(fixture.debugElement.nativeElement).toHaveText('team 33 [ simple, right:  ]');
           })));

    it('should update hrefs when query params change',
       fakeAsync(
           inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {

             @Component({
               selector: 'someRoot',
               template: `<router-outlet></router-outlet><a routerLink="/home">Link</a>`,
               directives: ROUTER_DIRECTIVES
             })
             class RootCmpWithLink {
             }

             const fixture = createRoot(tcb, router, RootCmpWithLink);

             router.resetConfig([{path: 'home', component: SimpleCmp}]);

             const native = fixture.debugElement.nativeElement.querySelector('a');

             router.navigateByUrl('/home?q=123');
             advance(fixture);
             expect(native.getAttribute('href')).toEqual('/home?q=123');

             router.navigateByUrl('/home?q=456');
             advance(fixture);
             expect(native.getAttribute('href')).toEqual('/home?q=456');
           })));

    it('should support using links on non-a tags',
       fakeAsync(
           inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
             const fixture = createRoot(tcb, router, RootCmp);

             router.resetConfig([{
               path: 'team/:id',
               component: TeamCmp,
               children: [
                 {path: 'link', component: StringLinkButtonCmp},
                 {path: 'simple', component: SimpleCmp}
               ]
             }]);

             router.navigateByUrl('/team/22/link');
             advance(fixture);
             expect(fixture.debugElement.nativeElement).toHaveText('team 22 [ link, right:  ]');

             const native = fixture.debugElement.nativeElement.querySelector('button');
             native.click();
             advance(fixture);

             expect(fixture.debugElement.nativeElement).toHaveText('team 33 [ simple, right:  ]');
           })));

    it('should support absolute router links',
       fakeAsync(
           inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
             const fixture = createRoot(tcb, router, RootCmp);

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
             expect(fixture.debugElement.nativeElement).toHaveText('team 22 [ link, right:  ]');

             const native = fixture.debugElement.nativeElement.querySelector('a');
             expect(native.getAttribute('href')).toEqual('/team/33/simple');
             native.click();
             advance(fixture);

             expect(fixture.debugElement.nativeElement).toHaveText('team 33 [ simple, right:  ]');
           })));

    it('should support relative router links',
       fakeAsync(
           inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
             const fixture = createRoot(tcb, router, RootCmp);

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
             expect(fixture.debugElement.nativeElement).toHaveText('team 22 [ link, right:  ]');

             const native = fixture.debugElement.nativeElement.querySelector('a');
             expect(native.getAttribute('href')).toEqual('/team/22/simple');
             native.click();
             advance(fixture);

             expect(fixture.debugElement.nativeElement).toHaveText('team 22 [ simple, right:  ]');
           })));

    it('should support top-level link',
       fakeAsync(
           inject([Router, TestComponentBuilder], (router: Router, tcb: TestComponentBuilder) => {
             const fixture = createRoot(tcb, router, RelativeLinkInIfCmp);
             advance(fixture);

             router.resetConfig(
                 [{path: 'simple', component: SimpleCmp}, {path: '', component: BlankCmp}]);

             router.navigateByUrl('/');
             advance(fixture);
             expect(fixture.debugElement.nativeElement).toHaveText(' ');
             const cmp = fixture.debugElement.componentInstance;

             cmp.show = true;
             advance(fixture);

             expect(fixture.debugElement.nativeElement).toHaveText('link ');
             const native = fixture.debugElement.nativeElement.querySelector('a');

             expect(native.getAttribute('href')).toEqual('/simple');
             native.click();
             advance(fixture);

             expect(fixture.debugElement.nativeElement).toHaveText('link simple');
           })));

    it('should support query params and fragments',
       fakeAsync(inject(
           [Router, Location, TestComponentBuilder],
           (router: Router, location: Location, tcb: TestComponentBuilder) => {
             const fixture = createRoot(tcb, router, RootCmp);

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

             expect(fixture.debugElement.nativeElement).toHaveText('team 22 [ simple, right:  ]');

             expect(location.path()).toEqual('/team/22/simple?q=1#f');
           })));
  });

  describe('redirects', () => {
    it('should work', fakeAsync(inject(
                          [Router, TestComponentBuilder, Location],
                          (router: Router, tcb: TestComponentBuilder, location: Location) => {
                            const fixture = createRoot(tcb, router, RootCmp);

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
        beforeEach(() => {
          addProviders([{provide: 'alwaysFalse', useValue: (a: any, b: any) => false}]);
        });

        // handle errors

        it('works',
           fakeAsync(inject(
               [Router, TestComponentBuilder, Location],
               (router: Router, tcb: TestComponentBuilder, location: Location) => {
                 const fixture = createRoot(tcb, router, RootCmp);

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
            beforeEach(() => {
              addProviders([{provide: 'alwaysFalse', useValue: (a: any, b: any) => false}]);
            });

            it('works', fakeAsync(inject(
                            [Router, TestComponentBuilder, Location],
                            (router: Router, tcb: TestComponentBuilder, location: Location) => {
                              const fixture = createRoot(tcb, router, RootCmp);

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
          addProviders([{
            provide: 'alwaysTrue',
            useValue: (a: ActivatedRouteSnapshot, s: RouterStateSnapshot) => true
          }]);
        });

        it('works',
           fakeAsync(inject(
               [Router, TestComponentBuilder, Location],
               (router: Router, tcb: TestComponentBuilder, location: Location) => {
                 const fixture = createRoot(tcb, router, RootCmp);

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

        beforeEach(() => { addProviders([AlwaysTrue]); });

        it('works', fakeAsync(inject(
                        [Router, TestComponentBuilder, Location],
                        (router: Router, tcb: TestComponentBuilder, location: Location) => {
                          const fixture = createRoot(tcb, router, RootCmp);

                          router.resetConfig(
                              [{path: 'team/:id', component: TeamCmp, canActivate: [AlwaysTrue]}]);

                          router.navigateByUrl('/team/22');
                          advance(fixture);

                          expect(location.path()).toEqual('/team/22');
                        })));
      });

      describe('should work when returns an observable', () => {
        beforeEach(() => {
          addProviders([{
            provide: 'CanActivate',
            useValue: (a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => { return of (false); }
          }]);
        });


        it('works',
           fakeAsync(inject(
               [Router, TestComponentBuilder, Location],
               (router: Router, tcb: TestComponentBuilder, location: Location) => {
                 const fixture = createRoot(tcb, router, RootCmp);

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
        beforeEach(() => {
          addProviders([
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
            }
          ]);
        });

        it('works',
           fakeAsync(inject(
               [Router, TestComponentBuilder, Location],
               (router: Router, tcb: TestComponentBuilder, location: Location) => {
                 const fixture = createRoot(tcb, router, RootCmp);

                 router.resetConfig([
                   {path: 'team/:id', component: TeamCmp, canDeactivate: ['CanDeactivateTeam']}
                 ]);

                 router.navigateByUrl('/team/22');
                 advance(fixture);
                 expect(location.path()).toEqual('/team/22');

                 let successStatus: boolean;
                 router.navigateByUrl('/team/33').then(res => successStatus = res);
                 advance(fixture);
                 expect(location.path()).toEqual('/team/33');
                 expect(successStatus).toEqual(true);

                 let canceledStatus: boolean;
                 router.navigateByUrl('/team/44').then(res => canceledStatus = res);
                 advance(fixture);
                 expect(location.path()).toEqual('/team/33');
                 expect(canceledStatus).toEqual(false);
               })));

        it('works (componentless route)',
           fakeAsync(inject(
               [Router, TestComponentBuilder, Location],
               (router: Router, tcb: TestComponentBuilder, location: Location) => {
                 const fixture = createRoot(tcb, router, RootCmp);

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
                 const fixture = createRoot(tcb, router, RootCmp);

                 router.resetConfig([{
                   path: 'team/:id',
                   component: TeamCmp,
                   children: [
                     {path: '', pathMatch: 'full', component: SimpleCmp}, {
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

        beforeEach(() => { addProviders([AlwaysTrue]); });

        it('works',
           fakeAsync(inject(
               [Router, TestComponentBuilder, Location],
               (router: Router, tcb: TestComponentBuilder, location: Location) => {
                 const fixture = createRoot(tcb, router, RootCmp);

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
      beforeEach(() => {
        addProviders([{
          provide: 'CanDeactivate',
          useValue: (c: TeamCmp, a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
            return of (false);
          }
        }]);
      });

      it('works',
         fakeAsync(inject(
             [Router, TestComponentBuilder, Location],
             (router: Router, tcb: TestComponentBuilder, location: Location) => {
               const fixture = createRoot(tcb, router, RootCmp);

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
    it('should set the class when the link is active (a tag)',
       fakeAsync(inject(
           [Router, TestComponentBuilder, Location],
           (router: Router, tcb: TestComponentBuilder, location: Location) => {
             const fixture = createRoot(tcb, router, RootCmp);

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

             const nativeLink = fixture.debugElement.nativeElement.querySelector('a');
             const nativeButton = fixture.debugElement.nativeElement.querySelector('button');
             expect(nativeLink.className).toEqual('active');
             expect(nativeButton.className).toEqual('active');

             router.navigateByUrl('/team/22/link/simple');
             advance(fixture);
             expect(location.path()).toEqual('/team/22/link/simple');
             expect(nativeLink.className).toEqual('');
             expect(nativeButton.className).toEqual('');
           })));


    it('should set the class on a parent element when the link is active',
       fakeAsync(inject(
           [Router, TestComponentBuilder, Location],
           (router: Router, tcb: TestComponentBuilder, location: Location) => {
             const fixture = createRoot(tcb, router, RootCmp);

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
             const fixture = createRoot(tcb, router, RootCmp);

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

  describe('lazy loading', () => {
    it('works', fakeAsync(inject(
                    [Router, TestComponentBuilder, Location, AppModuleFactoryLoader],
                    (router: Router, tcb: TestComponentBuilder, location: Location,
                     loader: SpyAppModuleFactoryLoader) => {
                      @Component({
                        selector: 'lazy',
                        template: 'lazy-loaded-parent [<router-outlet></router-outlet>]',
                        directives: ROUTER_DIRECTIVES
                      })
                      class ParentLazyLoadedComponent {
                      }

                      @Component({selector: 'lazy', template: 'lazy-loaded-child'})
                      class ChildLazyLoadedComponent {
                      }

                      @AppModule({
                        providers: [provideRoutes([{
                          path: 'loaded',
                          component: ParentLazyLoadedComponent,
                          children: [{path: 'child', component: ChildLazyLoadedComponent}]
                        }])],
                        precompile: [ParentLazyLoadedComponent, ChildLazyLoadedComponent]
                      })
                      class LoadedModule {
                      }


                      loader.stubbedModules = {expected: LoadedModule};

                      const fixture = createRoot(tcb, router, RootCmp);

                      router.resetConfig([{path: 'lazy', loadChildren: 'expected'}]);

                      router.navigateByUrl('/lazy/loaded/child');
                      advance(fixture);

                      expect(location.path()).toEqual('/lazy/loaded/child');
                      expect(fixture.debugElement.nativeElement)
                          .toHaveText('lazy-loaded-parent [lazy-loaded-child]');
                    })));

    it('error emit an error when cannot load a config',
       fakeAsync(inject(
           [Router, TestComponentBuilder, Location, AppModuleFactoryLoader],
           (router: Router, tcb: TestComponentBuilder, location: Location,
            loader: SpyAppModuleFactoryLoader) => {
             loader.stubbedModules = {};
             const fixture = createRoot(tcb, router, RootCmp);

             router.resetConfig([{path: 'lazy', loadChildren: 'invalid'}]);

             const recordedEvents: any = [];
             router.events.forEach(e => recordedEvents.push(e));

             router.navigateByUrl('/lazy/loaded').catch(s => {})
             advance(fixture);

             expect(location.path()).toEqual('/');

             expectEvents(
                 recordedEvents,
                 [[NavigationStart, '/lazy/loaded'], [NavigationError, '/lazy/loaded']]);
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
  template: `<button routerLink
="/team/33/simple">link</button>`,
  directives: ROUTER_DIRECTIVES
})
class StringLinkButtonCmp {
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
      `<router-outlet></router-outlet><a routerLinkActive="active" [routerLinkActiveOptions]="{exact: exact}" [routerLink]="['./']">link</a>
<button routerLinkActive="active" [routerLinkActiveOptions]="{exact: exact}" [routerLink]="['./']">button</button>
`,
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

  recordedUrls(): string[] {
    return this.urls.map((a: any) => a.map((p: any) => p.path).join('/'));
  }
}

@Component({selector: 'blank-cmp', template: ``, directives: ROUTER_DIRECTIVES})
class BlankCmp {
}

@Component({
  selector: 'team-cmp',
  template:
      `team {{id | async}} [ <router-outlet></router-outlet>, right: <router-outlet name="right"></router-outlet> ]`,
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
  selector: 'wrapper',
  template: `<router-outlet></router-outlet>`,
  directives: [ROUTER_DIRECTIVES]
})
class WrapperCmp {
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

@Component({selector: 'route-cmp', template: `route`, directives: ROUTER_DIRECTIVES})
class RouteCmp {
  constructor(public route: ActivatedRoute) {}
}

@Component({
  selector: 'link-cmp',
  template:
      `<div *ngIf="show"><a [routerLink]="['./simple']">link</a></div> <router-outlet></router-outlet>`,
  directives: ROUTER_DIRECTIVES,
  precompile: [BlankCmp, SimpleCmp]
})
class RelativeLinkInIfCmp {
  show: boolean = false;
}

@Component({
  selector: 'child',
  template: '<div *ngIf="alwaysTrue"><router-outlet></router-outlet></div>',
  directives: ROUTER_DIRECTIVES
})
class LinkInNgIf {
  alwaysTrue = true;
}

@Component({
  selector: 'root-cmp',
  template: `<router-outlet></router-outlet>`,
  directives: [ROUTER_DIRECTIVES],
  precompile: [
    BlankCmp, SimpleCmp, TeamCmp, UserCmp, StringLinkCmp, DummyLinkCmp, AbsoluteLinkCmp,
    RelativeLinkCmp, DummyLinkWithParentCmp, LinkWithQueryParamsAndFragment, CollectParamsCmp,
    QueryParamsAndFragmentCmp, StringLinkButtonCmp, WrapperCmp, LinkInNgIf
  ]
})
class RootCmp {
}

@Component({
  selector: 'root-cmp',
  template:
      `primary [<router-outlet></router-outlet>] right [<router-outlet name="right"></router-outlet>]`,
  directives: [ROUTER_DIRECTIVES],
  precompile: [BlankCmp, SimpleCmp, RouteCmp, UserCmp]
})
class RootCmpWithTwoOutlets {
}

function advance(fixture: ComponentFixture<any>): void {
  tick();
  fixture.detectChanges();
}

function createRoot(tcb: TestComponentBuilder, router: Router, type: any): ComponentFixture<any> {
  const f = tcb.createFakeAsync(type);
  advance(f);
  router.initialNavigation();
  advance(f);
  return f;
}
