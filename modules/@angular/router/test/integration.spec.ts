/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, Location} from '@angular/common';
import {Component, NgModule, NgModuleFactoryLoader} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, inject, tick} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/matchers';
import {Observable} from 'rxjs/Observable';
import {of } from 'rxjs/observable/of';
import {map} from 'rxjs/operator/map';

import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, CanDeactivate, Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Params, PreloadAllModules, PreloadingStrategy, Resolve, Router, RouterModule, RouterStateSnapshot, RoutesRecognized} from '../index';
import {RouterPreloader} from '../src/router_preloader';
import {RouterTestingModule, SpyNgModuleFactoryLoader} from '../testing';



describe('Integration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(
            [{path: '', component: BlankCmp}, {path: 'simple', component: SimpleCmp}]),
        TestModule
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

  it('should work when an outlet is in an ngIf',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{
         path: 'child',
         component: LinkInNgIf,
         children: [{path: 'simple', component: SimpleCmp}]
       }]);

       router.navigateByUrl('/child/simple');
       advance(fixture);

       expect(location.path()).toEqual('/child/simple');
     })));

  it('should work when an outlet is in an ngIf (and is removed)', fakeAsync(() => {

       @Component({
         selector: 'someRoot',
         template: `<div *ngIf="cond"><router-outlet></router-outlet></div>`
       })
       class RootCmpWithLink {
         cond: boolean = true;
       }
       TestBed.configureTestingModule({declarations: [RootCmpWithLink]});

       const router: Router = TestBed.get(Router);
       const location: Location = TestBed.get(Location);

       const fixture = createRoot(router, RootCmpWithLink);

       router.resetConfig(
           [{path: 'simple', component: SimpleCmp}, {path: 'blank', component: BlankCmp}]);

       router.navigateByUrl('/simple');
       advance(fixture);
       expect(location.path()).toEqual('/simple');

       const instance = fixture.componentInstance;
       instance.cond = false;
       advance(fixture);

       let recordedError: any = null;
       router.navigateByUrl('/blank').catch(e => recordedError = e);
       advance(fixture);
       expect(recordedError.message).toEqual('Cannot find primary outlet to load \'BlankCmp\'');
     }));

  it('should update location when navigating', fakeAsync(() => {
       @Component({template: `record`})
       class RecordLocationCmp {
         private storedPath: string;
         constructor(loc: Location) { this.storedPath = loc.path(); }
       }

       @NgModule({declarations: [RecordLocationCmp], entryComponents: [RecordLocationCmp]})
       class TestModule {
       }

       TestBed.configureTestingModule({imports: [TestModule]});

       const router = TestBed.get(Router);
       const location = TestBed.get(Location);
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

  it('should navigate back and forward',
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
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{
         path: 'team/:id',
         component: TeamCmp,
         children: [{path: 'user/:name', component: UserCmp}]
       }]);

       const recordedEvents: any[] = [];
       router.events.forEach(e => recordedEvents.push(e));

       router.navigateByUrl('/team/22/user/victor');
       advance(fixture);

       (<any>location).simulateHashChange('/team/22/user/fedor');
       advance(fixture);

       (<any>location).simulateUrlPop('/team/22/user/fedor');
       advance(fixture);

       expect(fixture.nativeElement).toHaveText('team 22 [ user fedor, right:  ]');

       expectEvents(recordedEvents, [
         [NavigationStart, '/team/22/user/victor'], [RoutesRecognized, '/team/22/user/victor'],
         [NavigationEnd, '/team/22/user/victor'],

         [NavigationStart, '/team/22/user/fedor'], [RoutesRecognized, '/team/22/user/fedor'],
         [NavigationEnd, '/team/22/user/fedor']
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
       expect(user.recordedParams).toEqual([{name: 'victor'}]);

       router.navigateByUrl('/team/22/user/fedor');
       advance(fixture);

       expect(team.recordedParams).toEqual([{id: '22'}]);
       expect(user.recordedParams).toEqual([{name: 'victor'}, {name: 'fedor'}]);
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

       const recordedEvents: any[] = [];
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
         [NavigationStart, '/user/init'], [RoutesRecognized, '/user/init'],
         [NavigationEnd, '/user/init'],

         [NavigationStart, '/user/victor'], [NavigationStart, '/user/fedor'],

         [NavigationCancel, '/user/victor'], [RoutesRecognized, '/user/fedor'],
         [NavigationEnd, '/user/fedor']
       ]);
     })));

  it('should handle failed navigations gracefully', fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'user/:name', component: UserCmp}]);

       const recordedEvents: any[] = [];
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
         [NavigationEnd, '/user/fedor']
       ]);
     })));

  it('should support custom error handlers', fakeAsync(inject([Router], (router: Router) => {
       router.errorHandler = (error) => 'resolvedValue';
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'user/:name', component: UserCmp}]);

       const recordedEvents: any[] = [];
       router.events.forEach(e => recordedEvents.push(e));

       let e: any;
       router.navigateByUrl('/invalid').then(_ => e = _);
       advance(fixture);
       expect(e).toEqual('resolvedValue');

       expectEvents(recordedEvents, [[NavigationStart, '/invalid'], [NavigationError, '/invalid']]);
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

  it('should emit an event when an outlet gets activated', fakeAsync(() => {
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

       TestBed.configureTestingModule({declarations: [Container]});

       const router: Router = TestBed.get(Router);

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
       expect(cmp.deactivations.length).toEqual(2);
       expect(cmp.deactivations[1] instanceof BlankCmp).toBe(true);
     }));

  it('should update url and router state before activating components',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {

       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'cmp', component: ComponentRecordingRoutePathAndUrl}]);

       router.navigateByUrl('/cmp');
       advance(fixture);

       const cmp = fixture.debugElement.children[1].componentInstance;

       expect(cmp.url).toBe('/cmp');
       expect(cmp.path.length).toEqual(2);
     })));

  describe('data', () => {
    class ResolveSix implements Resolve<TeamCmp> {
      resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): number { return 6; }
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {provide: 'resolveTwo', useValue: (a: any, b: any) => 2},
          {provide: 'resolveFour', useValue: (a: any, b: any) => 4},
          {provide: 'resolveSix', useClass: ResolveSix}
        ]
      });
    });

    it('should provide resolved data',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmpWithTwoOutlets);

         router.resetConfig([{
           path: 'parent/:id',
           data: {one: 1},
           resolve: {two: 'resolveTwo'},
           children: [
             {path: '', data: {three: 3}, resolve: {four: 'resolveFour'}, component: RouteCmp}, {
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
    it('should support string router links', fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children: [
             {path: 'link', component: StringLinkCmp}, {path: 'simple', component: SimpleCmp}
           ]
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

    it('should not preserve query params and fragment by default', fakeAsync(() => {
         @Component({
           selector: 'someRoot',
           template: `<router-outlet></router-outlet><a routerLink="/home">Link</a>`
         })
         class RootCmpWithLink {
         }

         TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
         const router: Router = TestBed.get(Router);

         const fixture = createRoot(router, RootCmpWithLink);

         router.resetConfig([{path: 'home', component: SimpleCmp}]);

         const native = fixture.nativeElement.querySelector('a');

         router.navigateByUrl('/home?q=123#fragment');
         advance(fixture);
         expect(native.getAttribute('href')).toEqual('/home');
       }));

    it('should update hrefs when query params or fragment change', fakeAsync(() => {

         @Component({
           selector: 'someRoot',
           template:
               `<router-outlet></router-outlet><a routerLink="/home" preserveQueryParams preserveFragment>Link</a>`
         })
         class RootCmpWithLink {
         }
         TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
         const router: Router = TestBed.get(Router);
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

    it('should support using links on non-a tags', fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

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
         expect(fixture.nativeElement).toHaveText('team 22 [ link, right:  ]');

         const native = fixture.nativeElement.querySelector('button');
         native.click();
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('team 33 [ simple, right:  ]');
       })));

    it('should support absolute router links', fakeAsync(inject([Router], (router: Router) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'team/:id',
           component: TeamCmp,
           children: [
             {path: 'link', component: AbsoluteLinkCmp}, {path: 'simple', component: SimpleCmp}
           ]
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
           children: [
             {path: 'link', component: RelativeLinkCmp}, {path: 'simple', component: SimpleCmp}
           ]
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
         expect(fixture.nativeElement).toHaveText(' ');
         const cmp = fixture.componentInstance;

         cmp.show = true;
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('link ');
         const native = fixture.nativeElement.querySelector('a');

         expect(native.getAttribute('href')).toEqual('/simple');
         native.click();
         advance(fixture);

         expect(fixture.nativeElement).toHaveText('link simple');
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

    it('should not break the back button when trigger by location change',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
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
         (<any>location).go('/old/team/33');


         advance(fixture);
         expect(location.path()).toEqual('/team/33');

         location.back();
         advance(fixture);
         expect(location.path()).toEqual('/initial');
       })));

    // should not break the back button when trigger by initial navigation
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
        class AlwaysTrue implements CanActivate {
          canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
            return true;
          }
        }

        beforeEach(() => { TestBed.configureTestingModule({providers: [AlwaysTrue]}); });

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
              useValue:
                  (a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => { return of (false); }
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
                if (a.params['id'] == '22') {
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
    });

    describe('CanDeactivate', () => {
      describe('should not deactivate a route when CanDeactivate returns false', () => {
        beforeEach(() => {
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
              }
            ]
          });
        });

        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig(
                 [{path: 'team/:id', component: TeamCmp, canDeactivate: ['CanDeactivateTeam']}]);

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
           fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

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

      describe('should work when given a class', () => {
        class AlwaysTrue implements CanDeactivate<TeamCmp> {
          canDeactivate(
              component: TeamCmp, route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot): boolean {
            return true;
          }
        }

        beforeEach(() => { TestBed.configureTestingModule({providers: [AlwaysTrue]}); });

        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

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


      describe('should work when returns an observable', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [{
              provide: 'CanDeactivate',
              useValue: (c: TeamCmp, a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                return of (false);
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
              useValue: (a: any, b: any) => { return a.params.id === '22'; }
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

             router.navigateByUrl('/team/33').catch(() => {});
             advance(fixture);

             expect(location.path()).toEqual('/team/22');
           })));
      });
    });

    describe('CanLoad', () => {
      describe('should not load children when CanLoad returns false', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [
              {provide: 'alwaysFalse', useValue: (a: any) => false}, {
                provide: 'returnFalseAndNavigate',
                useFactory: (router: any) => (a: any) => {
                  router.navigate(['blank']);
                  return false;
                },
                deps: [Router]
              },
              {provide: 'alwaysTrue', useValue: (a: any) => true}
            ]
          });
        });

        it('works',
           fakeAsync(inject(
               [Router, Location, NgModuleFactoryLoader],
               (router: Router, location: Location, loader: SpyNgModuleFactoryLoader) => {

                 @Component({selector: 'lazy', template: 'lazy-loaded'})
                 class LazyLoadedComponent {
                 }

                 @NgModule({
                   declarations: [LazyLoadedComponent],
                   imports:
                       [RouterModule.forChild([{path: 'loaded', component: LazyLoadedComponent}])]
                 })
                 class LoadedModule {
                 }

                 loader.stubbedModules = {lazyFalse: LoadedModule, lazyTrue: LoadedModule};
                 const fixture = createRoot(router, RootCmp);

                 router.resetConfig([
                   {path: 'lazyFalse', canLoad: ['alwaysFalse'], loadChildren: 'lazyFalse'},
                   {path: 'lazyTrue', canLoad: ['alwaysTrue'], loadChildren: 'lazyTrue'}
                 ]);

                 const recordedEvents: any[] = [];
                 router.events.forEach(e => recordedEvents.push(e));


                 // failed navigation
                 router.navigateByUrl('/lazyFalse/loaded');
                 advance(fixture);

                 expect(location.path()).toEqual('/');

                 expectEvents(recordedEvents, [
                   [NavigationStart, '/lazyFalse/loaded'],
                   [NavigationCancel, '/lazyFalse/loaded']
                 ]);

                 recordedEvents.splice(0);

                 // successful navigation
                 router.navigateByUrl('/lazyTrue/loaded');
                 advance(fixture);

                 expect(location.path()).toEqual('/lazyTrue/loaded');

                 expectEvents(recordedEvents, [
                   [NavigationStart, '/lazyTrue/loaded'], [RoutesRecognized, '/lazyTrue/loaded'],
                   [NavigationEnd, '/lazyTrue/loaded']
                 ]);
               })));

        it('should support navigating from within the guard',
           fakeAsync(inject([Router, Location], (router: Router, location: Location) => {

             const fixture = createRoot(router, RootCmp);

             router.resetConfig([
               {path: 'lazyFalse', canLoad: ['returnFalseAndNavigate'], loadChildren: 'lazyFalse'},
               {path: 'blank', component: BlankCmp}
             ]);

             const recordedEvents: any[] = [];
             router.events.forEach(e => recordedEvents.push(e));


             router.navigateByUrl('/lazyFalse/loaded');
             advance(fixture);

             expect(location.path()).toEqual('/blank');

             expectEvents(recordedEvents, [
               [NavigationStart, '/lazyFalse/loaded'], [NavigationStart, '/blank'],
               [RoutesRecognized, '/blank'], [NavigationCancel, '/lazyFalse/loaded'],
               [NavigationEnd, '/blank']
             ]);
           })));
      });
    });

    describe('order', () => {

      class Logger {
        logs: string[] = [];
        add(thing: string) { this.logs.push(thing); }
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
    });
  });

  describe('routerActiveLink', () => {
    it('should set the class when the link is active (a tag)',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);

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
         const router: Router = TestBed.get(Router);

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
             children:
                 [{path: 'simple', component: SimpleCmp}, {path: '', component: BlankCmp}]
           }]
         }]);

         router.navigateByUrl('/team/22/link;exact=true');
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
             children:
                 [{path: 'simple', component: SimpleCmp}, {path: '', component: BlankCmp}]
           }]
         }]);

         router.navigateByUrl('/team/22/link');
         advance(fixture);
         expect(location.path()).toEqual('/team/22/link');

         const native = fixture.nativeElement.querySelector('a');
         expect(native.className).toEqual('active');

         router.navigateByUrl('/team/22/link/simple');
         advance(fixture);
         expect(location.path()).toEqual('/team/22/link/simple');
         expect(native.className).toEqual('active');
       })));

  });

  describe('lazy loading', () => {
    it('works',
       fakeAsync(inject(
           [Router, Location, NgModuleFactoryLoader],
           (router: Router, location: Location, loader: SpyNgModuleFactoryLoader) => {
             @Component({
               selector: 'lazy',
               template: 'lazy-loaded-parent [<router-outlet></router-outlet>]'
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
                 children: [{path: 'child', component: ChildLazyLoadedComponent}]
               }])]
             })
             class LoadedModule {
             }


             loader.stubbedModules = {expected: LoadedModule};

             const fixture = createRoot(router, RootCmp);

             router.resetConfig([{path: 'lazy', loadChildren: 'expected'}]);

             router.navigateByUrl('/lazy/loaded/child');
             advance(fixture);

             expect(location.path()).toEqual('/lazy/loaded/child');
             expect(fixture.nativeElement).toHaveText('lazy-loaded-parent [lazy-loaded-child]');
           })));

    it('throws an error when forRoot() is used in a lazy context',
       fakeAsync(inject(
           [Router, Location, NgModuleFactoryLoader],
           (router: Router, location: Location, loader: SpyNgModuleFactoryLoader) => {
             @Component({selector: 'lazy', template: 'should not show'})
             class LazyLoadedComponent {
             }

             @NgModule({
               declarations: [LazyLoadedComponent],
               imports: [RouterModule.forRoot([{path: 'loaded', component: LazyLoadedComponent}])]
             })
             class LoadedModule {
             }

             loader.stubbedModules = {expected: LoadedModule};

             const fixture = createRoot(router, RootCmp);

             router.resetConfig([{path: 'lazy', loadChildren: 'expected'}]);

             let recordedError: any = null;
             router.navigateByUrl('/lazy/loaded').catch(err => recordedError = err);
             advance(fixture);
             expect(recordedError.message)
                 .toEqual(
                     `RouterModule.forRoot() called twice. Lazy loaded modules should use RouterModule.forChild() instead.`);
           })));
    it('should combine routes from multiple modules into a single configuration',
       fakeAsync(inject(
           [Router, Location, NgModuleFactoryLoader],
           (router: Router, location: Location, loader: SpyNgModuleFactoryLoader) => {
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

             loader.stubbedModules = {expected1: LoadedModule, expected2: SiblingOfLoadedModule};

             const fixture = createRoot(router, RootCmp);

             router.resetConfig([
               {path: 'lazy1', loadChildren: 'expected1'},
               {path: 'lazy2', loadChildren: 'expected2'}
             ]);

             router.navigateByUrl('/lazy1/loaded');
             advance(fixture);
             expect(location.path()).toEqual('/lazy1/loaded');

             router.navigateByUrl('/lazy2/loaded');
             advance(fixture);
             expect(location.path()).toEqual('/lazy2/loaded');
           })));

    it('should use the injector of the lazily-loaded configuration',
       fakeAsync(inject(
           [Router, Location, NgModuleFactoryLoader],
           (router: Router, location: Location, loader: SpyNgModuleFactoryLoader) => {
             class LazyLoadedServiceDefinedInModule {}
             class LazyLoadedServiceDefinedInCmp {}

             @Component({selector: 'lazy', template: 'lazy-loaded'})
             class LazyLoadedChildComponent {
               constructor(service: LazyLoadedServiceDefinedInCmp) {}
             }

             @Component({
               selector: 'lazy',
               template: '<router-outlet></router-outlet>',
               providers: [LazyLoadedServiceDefinedInCmp]
             })
             class LazyLoadedParentComponent {
               constructor(service: LazyLoadedServiceDefinedInModule) {}
             }

             @NgModule({
               declarations: [LazyLoadedParentComponent, LazyLoadedChildComponent],
               imports: [RouterModule.forChild([{
                 path: '',
                 children: [{
                   path: 'loaded',
                   component: LazyLoadedParentComponent,
                   children: [{path: 'child', component: LazyLoadedChildComponent}]
                 }]
               }])],
               providers: [LazyLoadedServiceDefinedInModule]
             })
             class LoadedModule {
             }

             loader.stubbedModules = {expected: LoadedModule};

             const fixture = createRoot(router, RootCmp);

             router.resetConfig([{path: 'lazy', loadChildren: 'expected'}]);

             router.navigateByUrl('/lazy/loaded/child');
             advance(fixture);

             expect(location.path()).toEqual('/lazy/loaded/child');
             expect(fixture.nativeElement).toHaveText('lazy-loaded');
           })));

    it('works when given a callback',
       fakeAsync(inject(
           [Router, Location, NgModuleFactoryLoader], (router: Router, location: Location) => {
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
       fakeAsync(inject(
           [Router, Location, NgModuleFactoryLoader],
           (router: Router, location: Location, loader: SpyNgModuleFactoryLoader) => {
             loader.stubbedModules = {};
             const fixture = createRoot(router, RootCmp);

             router.resetConfig([{path: 'lazy', loadChildren: 'invalid'}]);

             const recordedEvents: any[] = [];
             router.events.forEach(e => recordedEvents.push(e));

             router.navigateByUrl('/lazy/loaded').catch(s => {});
             advance(fixture);

             expect(location.path()).toEqual('/');

             expectEvents(
                 recordedEvents,
                 [[NavigationStart, '/lazy/loaded'], [NavigationError, '/lazy/loaded']]);
           })));

    describe('preloading', () => {
      beforeEach(() => {
        TestBed.configureTestingModule(
            {providers: [{provide: PreloadingStrategy, useExisting: PreloadAllModules}]});
        const preloader = TestBed.get(RouterPreloader);
        preloader.setUpPreloading();
      });

      it('should work',
         fakeAsync(inject(
             [Router, Location, NgModuleFactoryLoader],
             (router: Router, location: Location, loader: SpyNgModuleFactoryLoader) => {
               @Component({selector: 'lazy', template: 'should not show'})
               class LazyLoadedComponent {
               }

               @NgModule({
                 declarations: [LazyLoadedComponent],
                 imports: [RouterModule.forChild(
                     [{path: 'LoadedModule2', component: LazyLoadedComponent}])]
               })
               class LoadedModule2 {
               }

               @NgModule({
                 imports:
                     [RouterModule.forChild([{path: 'LoadedModule1', loadChildren: 'expected2'}])]
               })
               class LoadedModule1 {
               }

               loader.stubbedModules = {expected: LoadedModule1, expected2: LoadedModule2};

               const fixture = createRoot(router, RootCmp);

               router.resetConfig([
                 {path: 'blank', component: BlankCmp}, {path: 'lazy', loadChildren: 'expected'}
               ]);

               router.navigateByUrl('/blank');
               advance(fixture);

               const config: any = router.config;
               const firstConfig = config[1]._loadedConfig;
               expect(firstConfig).toBeDefined();
               expect(firstConfig.routes[0].path).toEqual('LoadedModule1');

               const secondConfig = firstConfig.routes[0]._loadedConfig;
               expect(secondConfig).toBeDefined();
               expect(secondConfig.routes[0].path).toEqual('LoadedModule2');
             })));

    });
  });
});

function expectEvents(events: Event[], pairs: any[]) {
  for (let i = 0; i < events.length; ++i) {
    expect((<any>events[i].constructor).name).toBe(pairs[i][0].name);
    expect((<any>events[i]).url).toBe(pairs[i][1]);
  }
}

@Component({selector: 'link-cmp', template: `<a routerLink="/team/33/simple">link</a>`})
class StringLinkCmp {
}

@Component({
  selector: 'link-cmp',
  template: `<button routerLink
="/team/33/simple">link</button>`
})
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
      `<router-outlet></router-outlet><a routerLinkActive="active" [routerLinkActiveOptions]="{exact: exact}" [routerLink]="['./']">link</a>
<button routerLinkActive="active" [routerLinkActiveOptions]="{exact: exact}" [routerLink]="['./']">button</button>
`
})
class DummyLinkCmp {
  private exact: boolean;
  constructor(route: ActivatedRoute) { this.exact = (<any>route.snapshot.params).exact === 'true'; }
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

@Component({selector: 'simple-cmp', template: `simple`})
class SimpleCmp {
}

@Component({selector: 'collect-params-cmp', template: `collect-params`})
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

@Component({selector: 'blank-cmp', template: ``})
class BlankCmp {
}

@Component({
  selector: 'team-cmp',
  template:
      `team {{id | async}} [ <router-outlet></router-outlet>, right: <router-outlet name="right"></router-outlet> ]`
})
class TeamCmp {
  id: Observable<string>;
  recordedParams: Params[] = [];

  constructor(public route: ActivatedRoute) {
    this.id = map.call(route.params, (p: any) => p['id']);
    route.params.forEach(_ => this.recordedParams.push(_));
  }
}

@Component({selector: 'user-cmp', template: `user {{name | async}}`})
class UserCmp {
  name: Observable<string>;
  recordedParams: Params[] = [];

  constructor(route: ActivatedRoute) {
    this.name = map.call(route.params, (p: any) => p['name']);
    route.params.forEach(_ => this.recordedParams.push(_));
  }
}

@Component({selector: 'wrapper', template: `<router-outlet></router-outlet>`})
class WrapperCmp {
}

@Component(
    {selector: 'query-cmp', template: `query: {{name | async}} fragment: {{fragment | async}}`})
class QueryParamsAndFragmentCmp {
  name: Observable<string>;
  fragment: Observable<string>;

  constructor(route: ActivatedRoute) {
    this.name = map.call(route.queryParams, (p: any) => p['name']);
    this.fragment = route.fragment;
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
class LinkInNgIf {
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
  private exact: boolean;
  constructor(route: ActivatedRoute) { this.exact = (<any>route.snapshot.params).exact === 'true'; }
}

@Component({selector: 'cmp', template: ''})
class ComponentRecordingRoutePathAndUrl {
  private path: any;
  private url: any;

  constructor(router: Router, route: ActivatedRoute) {
    this.path = router.routerState.pathFromRoot(route);
    this.url = router.url.toString();
  }
}

@Component({selector: 'root-cmp', template: `<router-outlet></router-outlet>`})
class RootCmp {
}

@Component({
  selector: 'root-cmp',
  template:
      `primary [<router-outlet></router-outlet>] right [<router-outlet name="right"></router-outlet>]`
})
class RootCmpWithTwoOutlets {
}


function advance(fixture: ComponentFixture<any>): void {
  tick();
  fixture.detectChanges();
}

function createRoot(router: Router, type: any): ComponentFixture<any> {
  const f = TestBed.createComponent(type);
  advance(f);
  router.initialNavigation();
  advance(f);
  return f;
}


@NgModule({
  imports: [RouterTestingModule, CommonModule],
  entryComponents: [
    BlankCmp,
    SimpleCmp,
    TeamCmp,
    UserCmp,
    StringLinkCmp,
    DummyLinkCmp,
    AbsoluteLinkCmp,
    RelativeLinkCmp,
    DummyLinkWithParentCmp,
    LinkWithQueryParamsAndFragment,
    CollectParamsCmp,
    QueryParamsAndFragmentCmp,
    StringLinkButtonCmp,
    WrapperCmp,
    LinkInNgIf,
    ComponentRecordingRoutePathAndUrl,
    RouteCmp,
    RootCmp,
    RelativeLinkInIfCmp,
    RootCmpWithTwoOutlets
  ],


  exports: [
    BlankCmp,
    SimpleCmp,
    TeamCmp,
    UserCmp,
    StringLinkCmp,
    DummyLinkCmp,
    AbsoluteLinkCmp,
    RelativeLinkCmp,
    DummyLinkWithParentCmp,
    LinkWithQueryParamsAndFragment,
    CollectParamsCmp,
    QueryParamsAndFragmentCmp,
    StringLinkButtonCmp,
    WrapperCmp,
    LinkInNgIf,
    ComponentRecordingRoutePathAndUrl,
    RouteCmp,
    RootCmp,
    RelativeLinkInIfCmp,
    RootCmpWithTwoOutlets
  ],



  declarations: [
    BlankCmp,
    SimpleCmp,
    TeamCmp,
    UserCmp,
    StringLinkCmp,
    DummyLinkCmp,
    AbsoluteLinkCmp,
    RelativeLinkCmp,
    DummyLinkWithParentCmp,
    LinkWithQueryParamsAndFragment,
    CollectParamsCmp,
    QueryParamsAndFragmentCmp,
    StringLinkButtonCmp,
    WrapperCmp,
    LinkInNgIf,
    ComponentRecordingRoutePathAndUrl,
    RouteCmp,
    RootCmp,
    RelativeLinkInIfCmp,
    RootCmpWithTwoOutlets
  ]
})
class TestModule {
}