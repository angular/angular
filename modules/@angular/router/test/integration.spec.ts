/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, Location} from '@angular/common';
import {Component, Injector, NgModule, NgModuleFactoryLoader} from '@angular/core';
import {ComponentFixture, TestBed, async, fakeAsync, inject, tick} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/matchers';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operator/map';

import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, CanDeactivate, Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, PRIMARY_OUTLET, Params, PreloadAllModules, PreloadingStrategy, Resolve, Router, RouterModule, RouterStateSnapshot, RoutesRecognized, UrlHandlingStrategy, UrlSegmentGroup, UrlTree} from '../index';
import {RouterPreloader} from '../src/router_preloader';
import {forEach} from '../src/utils/collection';
import {RouterTestingModule, SpyNgModuleFactoryLoader} from '../testing';


describe('Integration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:
          [RouterTestingModule.withRoutes([{path: 'simple', component: SimpleCmp}]), TestModule]
    });
  });

  it('should navigate with a provided config',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = createRoot(router, RootCmp);

       router.navigateByUrl('/simple');
       advance(fixture);

       expect(location.path()).toEqual('/simple');
     })));

  describe('should execute navigations serially', () => {
    let log: any[] = [];

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
              let res: any = null;
              const p = new Promise(r => res = r);
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

    describe('should advance the parent route after deactivating its children', () => {
      let log: string[] = [];

      @Component({template: '<router-outlet></router-outlet>'})
      class Parent {
        constructor(route: ActivatedRoute) {
          route.params.subscribe((s: any) => { log.push(s); });
        }
      }

      @Component({template: 'child1'})
      class Child1 {
        ngOnDestroy() { log.push('child1 destroy'); }
      }

      @Component({template: 'child2'})
      class Child2 {
        constructor() { log.push('child2 constructor'); }
      }

      @NgModule({
        declarations: [Parent, Child1, Child2],
        entryComponents: [Parent, Child1, Child2],
        imports: [RouterModule]
      })
      class TestModule {
      }

      beforeEach(() => {
        log = [];
        TestBed.configureTestingModule({imports: [TestModule]});
      });

      it('should work',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{
             path: 'parent/:id',
             component: Parent,
             children:
                 [{path: 'child1', component: Child1}, {path: 'child2', component: Child2}]
           }]);

           router.navigateByUrl('/parent/1/child1');
           advance(fixture);

           router.navigateByUrl('/parent/2/child2');
           advance(fixture);

           expect(location.path()).toEqual('/parent/2/child2');
           expect(log).toEqual([{id: '1'}, 'child1 destroy', {id: '2'}, 'child2 constructor']);
         })));

    });

    it('should execute navigations serialy',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
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

         expect(log).toEqual(['trueRightAway', 'trueIn2Seconds-start']);

         tick(2000);  // 2200
         fixture.detectChanges();

         expect(log).toEqual([
           'trueRightAway', 'trueIn2Seconds-start', 'trueIn2Seconds-end', 'trueRightAway',
           'trueIn2Seconds-start'
         ]);

         tick(2000);  // 4200
         fixture.detectChanges();

         expect(log).toEqual([
           'trueRightAway', 'trueIn2Seconds-start', 'trueIn2Seconds-end', 'trueRightAway',
           'trueIn2Seconds-start', 'trueIn2Seconds-end'
         ]);
       })));
  });

  it('should not error when no url left and no children are matching',
     fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{
         path: 'team/:id',
         component: TeamCmp,
         children: [{path: 'simple', component: SimpleCmp}]
       }]);

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

  it('should support secondary routes in seperate commands',
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

  it('should ignore null and undefined query params',
     fakeAsync(inject([Router], (router: Router) => {
       const fixture = createRoot(router, RootCmp);

       router.resetConfig([{path: 'query', component: EmptyQueryParamsCmp}]);

       router.navigate(['query'], {queryParams: {name: 1, age: null, page: undefined}});
       advance(fixture);
       const cmp = fixture.debugElement.children[1].componentInstance;
       expect(cmp.recordedParams).toEqual([{name: '1'}]);
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

         [NavigationStart, '/user/victor'], [NavigationCancel, '/user/victor'],

         [NavigationStart, '/user/fedor'], [RoutesRecognized, '/user/fedor'],
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
     fakeAsync(inject(
         [Router, Location, NgModuleFactoryLoader],
         (router: Router, location: Location, loader: SpyNgModuleFactoryLoader) => {
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
       expect(cmp.deactivations.length).toEqual(1);
       expect(cmp.deactivations[0] instanceof BlankCmp).toBe(true);
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
          {provide: 'resolveSix', useClass: ResolveSix},
          {provide: 'resolveError', useValue: (a: any, b: any) => Promise.reject('error')},
          {provide: 'numberOfUrlSegments', useValue: (a: any, b: any) => a.url.length}
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

    it('should handle errors',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig(
             [{path: 'simple', component: SimpleCmp, resolve: {error: 'resolveError'}}]);

         let recordedEvents: any[] = [];
         router.events.subscribe(e => recordedEvents.push(e));

         let e: any = null;
         router.navigateByUrl('/simple').catch(error => e = error);
         advance(fixture);

         expectEvents(recordedEvents, [
           [NavigationStart, '/simple'], [RoutesRecognized, '/simple'],
           [NavigationError, '/simple']
         ]);

         expect(e).toEqual('error');
       })));

    it('should preserve resolved data',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: 'parent',
           resolve: {two: 'resolveTwo'},
           children: [
             {path: 'child1', component: CollectParamsCmp},
             {path: 'child2', component: CollectParamsCmp}
           ]
         }]);

         let e: any = null;
         router.navigateByUrl('/parent/child1');
         advance(fixture);

         router.navigateByUrl('/parent/child2');
         advance(fixture);

         const cmp = fixture.debugElement.children[1].componentInstance;
         expect(cmp.route.snapshot.data).toEqual({two: 2});
       })));

    it('should rerun resolvers when the urls segments of a wildcard route change',
       fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
         const fixture = createRoot(router, RootCmp);

         router.resetConfig([{
           path: '**',
           component: CollectParamsCmp,
           resolve: {numberOfUrlSegments: 'numberOfUrlSegments'}
         }]);

         let e: any = null;
         router.navigateByUrl('/one/two');
         advance(fixture);
         const cmp = fixture.debugElement.children[1].componentInstance;

         expect(cmp.route.snapshot.data).toEqual({numberOfUrlSegments: 2});

         router.navigateByUrl('/one/two/three');
         advance(fixture);

         expect(cmp.route.snapshot.data).toEqual({numberOfUrlSegments: 3});
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

             const recordedEvents: any[] = [];
             router.events.forEach(e => recordedEvents.push(e));

             router.resetConfig(
                 [{path: 'team/:id', component: TeamCmp, canActivate: ['alwaysFalse']}]);

             router.navigateByUrl('/team/22');
             advance(fixture);

             expect(location.path()).toEqual('/');
             expectEvents(recordedEvents, [
               [NavigationStart, '/team/22'], [RoutesRecognized, '/team/22'],
               [NavigationCancel, '/team/22']
             ]);
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
              useValue: (a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => {
                return Observable.create((observer: any) => { observer.next(false); });
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

      describe('should reset the location when cancleling a navigation', () => {
        beforeEach(() => {
          TestBed.configureTestingModule({
            providers: [{
              provide: 'alwaysFalse',
              useValue: (a: ActivatedRouteSnapshot, b: RouterStateSnapshot) => { return false; }
            }]
          });
        });

        it('works', fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
             const fixture = createRoot(router, RootCmp);

             router.resetConfig([
               {path: 'one', component: SimpleCmp},
               {path: 'two', component: SimpleCmp, canActivate: ['alwaysFalse']}
             ]);

             router.navigateByUrl('/one');
             advance(fixture);
             expect(location.path()).toEqual('/one');

             location.go('/two');
             advance(fixture);
             expect(location.path()).toEqual('/one');

           })));
      });
    });

    describe('CanDeactivate', () => {
      describe('should not deactivate a route when CanDeactivate returns false', () => {
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
                  log.push({path: a.routeConfig.path, component: c});
                  return true;
                }
              },
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
             expect(log.map((a: any) => a.component)).toEqual([child, null, null, null]);
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
             expect(location.path()).toEqual('/two-outlets/(a)');
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
                return Observable.create((observer: any) => { observer.next(false); });
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
              useValue: (a: any, b: any) => a.params.id === '22',
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
               [NavigationStart, '/lazyFalse/loaded'], [NavigationCancel, '/lazyFalse/loaded'],
               [NavigationStart, '/blank'], [RoutesRecognized, '/blank'],
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


    it('should expose an isActive property', fakeAsync(() => {
         @Component({
           template: `<a routerLink="/team" routerLinkActive #rla="routerLinkActive"></a>
              <p>{{rla.isActive}}</p>
              <router-outlet></router-outlet>`
         })
         class ComponentWithRouterLink {
         }

         TestBed.configureTestingModule({declarations: [ComponentWithRouterLink]});
         const router: Router = TestBed.get(Router);

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

         const f = TestBed.createComponent(ComponentWithRouterLink);
         router.navigateByUrl('/team');
         advance(f);

         const paragraph = f.nativeElement.querySelector('p');
         expect(paragraph.textContent).toEqual('true');

         router.navigateByUrl('/otherteam');
         advance(f);

         expect(paragraph.textContent).toEqual('false');
       }));

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

    it('should work with complex redirect rules',
       fakeAsync(inject(
           [Router, Location, NgModuleFactoryLoader],
           (router: Router, location: Location, loader: SpyNgModuleFactoryLoader) => {
             @Component({selector: 'lazy', template: 'lazy-loaded'})
             class LazyLoadedComponent {
             }

             @NgModule({
               declarations: [LazyLoadedComponent],
               imports: [RouterModule.forChild([{path: 'loaded', component: LazyLoadedComponent}])],
             })
             class LoadedModule {
             }

             loader.stubbedModules = {lazy: LoadedModule};
             const fixture = createRoot(router, RootCmp);

             router.resetConfig(
                 [{path: 'lazy', loadChildren: 'lazy'}, {path: '**', redirectTo: 'lazy'}]);

             router.navigateByUrl('/lazy/loaded');
             advance(fixture);

             expect(location.path()).toEqual('/lazy/loaded');
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

    describe('custom url handling strategies', () => {
      class CustomUrlHandlingStrategy implements UrlHandlingStrategy {
        shouldProcessUrl(url: UrlTree): boolean {
          return url.toString().startsWith('/include') || url.toString() === '/';
        }

        extract(url: UrlTree): UrlTree {
          const oldRoot = url.root;
          const children: any = {};
          if (oldRoot.children[PRIMARY_OUTLET]) {
            children[PRIMARY_OUTLET] = oldRoot.children[PRIMARY_OUTLET];
          }
          const root = new UrlSegmentGroup(oldRoot.segments, children);
          return new UrlTree(root, url.queryParams, url.fragment);
        }

        merge(newUrlPart: UrlTree, wholeUrl: UrlTree): UrlTree {
          const oldRoot = newUrlPart.root;

          const children: any = {};
          if (oldRoot.children[PRIMARY_OUTLET]) {
            children[PRIMARY_OUTLET] = oldRoot.children[PRIMARY_OUTLET];
          }

          forEach(wholeUrl.root.children, (v: any, k: any) => {
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
        TestBed.configureTestingModule(
            {providers: [{provide: UrlHandlingStrategy, useClass: CustomUrlHandlingStrategy}]});
      });

      it('should work',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{
             path: 'include',
             component: TeamCmp,
             children: [
               {path: 'user/:name', component: UserCmp}, {path: 'simple', component: SimpleCmp}
             ]
           }]);

           let events: any[] = [];
           router.events.subscribe(e => events.push(e));

           // supported URL
           router.navigateByUrl('/include/user/kate');
           advance(fixture);

           expect(location.path()).toEqual('/include/user/kate');
           expectEvents(events, [
             [NavigationStart, '/include/user/kate'], [RoutesRecognized, '/include/user/kate'],
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
           expectEvents(
               events, [[NavigationStart, '/exclude/one'], [NavigationEnd, '/exclude/one']]);
           events.splice(0);

           // another unsupported URL
           location.go('/exclude/two');
           advance(fixture);

           expect(location.path()).toEqual('/exclude/two');
           expectEvents(events, []);

           // back to a supported URL
           location.go('/include/simple');
           advance(fixture);

           expect(location.path()).toEqual('/include/simple');
           expect(fixture.nativeElement).toHaveText('team  [ simple, right:  ]');

           expectEvents(events, [
             [NavigationStart, '/include/simple'], [RoutesRecognized, '/include/simple'],
             [NavigationEnd, '/include/simple']
           ]);
         })));

      it('should handle the case when the router takes only the primary url',
         fakeAsync(inject([Router, Location], (router: Router, location: Location) => {
           const fixture = createRoot(router, RootCmp);

           router.resetConfig([{
             path: 'include',
             component: TeamCmp,
             children: [
               {path: 'user/:name', component: UserCmp}, {path: 'simple', component: SimpleCmp}
             ]
           }]);

           let events: any[] = [];
           router.events.subscribe(e => events.push(e));

           location.go('/include/user/kate(aux:excluded)');
           advance(fixture);

           expect(location.path()).toEqual('/include/user/kate(aux:excluded)');
           expectEvents(events, [
             [NavigationStart, '/include/user/kate'], [RoutesRecognized, '/include/user/kate'],
             [NavigationEnd, '/include/user/kate']
           ]);
           events.splice(0);

           location.go('/include/user/kate(aux:excluded2)');
           advance(fixture);
           expectEvents(events, []);

           router.navigateByUrl('/include/simple');
           advance(fixture);

           expect(location.path()).toEqual('/include/simple(aux:excluded2)');
           expectEvents(events, [
             [NavigationStart, '/include/simple'], [RoutesRecognized, '/include/simple'],
             [NavigationEnd, '/include/simple']
           ]);
         })));
    });
  });
});

function expectEvents(events: Event[], pairs: any[]) {
  expect(events.length).toEqual(pairs.length);
  for (let i = 0; i < events.length; ++i) {
    expect((<any>events[i].constructor).name).toBe(pairs[i][0].name);
    expect((<any>events[i]).url).toBe(pairs[i][1]);
  }
}

@Component({selector: 'link-cmp', template: `<a routerLink="/team/33/simple">link</a>`})
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

  constructor(private route: ActivatedRoute) {
    route.params.forEach(p => this.params.push(p));
    route.url.forEach(u => this.urls.push(u));
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
    TwoOutletsCmp,
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
    RootCmpWithTwoOutlets,
    EmptyQueryParamsCmp
  ],


  exports: [
    BlankCmp,
    SimpleCmp,
    TwoOutletsCmp,
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
    RootCmpWithTwoOutlets,
    EmptyQueryParamsCmp
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
    RootCmpWithTwoOutlets,
    EmptyQueryParamsCmp
  ]
})
class TestModule {
}
