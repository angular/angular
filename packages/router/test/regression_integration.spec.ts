/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule, HashLocationStrategy, Location, LocationStrategy} from '@angular/common';
import {provideLocationMocks, SpyLocation} from '@angular/common/testing';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Injectable, NgModule, TemplateRef, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ChildrenOutletContexts, DefaultUrlSerializer, Router, RouterModule, RouterOutlet, UrlSerializer, UrlTree} from '@angular/router';
import {of} from 'rxjs';
import {delay, mapTo} from 'rxjs/operators';

import {provideRouter} from '../src/provide_router';

describe('Integration', () => {
  describe('routerLinkActive', () => {
    it('should update when the associated routerLinks change - #18469', fakeAsync(() => {
         @Component({
           template: `
          <a id="first-link" [routerLink]="[firstLink]" routerLinkActive="active">{{firstLink}}</a>
          <div id="second-link" routerLinkActive="active">
            <a [routerLink]="[secondLink]">{{secondLink}}</a>
          </div>
           `,
         })
         class LinkComponent {
           firstLink = 'link-a';
           secondLink = 'link-b';

           changeLinks(): void {
             const temp = this.secondLink;
             this.secondLink = this.firstLink;
             this.firstLink = temp;
           }
         }

         @Component({template: 'simple'})
         class SimpleCmp {
         }

         TestBed.configureTestingModule({
           imports: [RouterModule.forRoot(
               [{path: 'link-a', component: SimpleCmp}, {path: 'link-b', component: SimpleCmp}])],
           declarations: [LinkComponent, SimpleCmp]
         });

         const router: Router = TestBed.inject(Router);
         const fixture = createRoot(router, LinkComponent);
         const firstLink = fixture.debugElement.query(p => p.nativeElement.id === 'first-link');
         const secondLink = fixture.debugElement.query(p => p.nativeElement.id === 'second-link');
         router.navigateByUrl('/link-a');
         advance(fixture);

         expect(firstLink.nativeElement.classList).toContain('active');
         expect(secondLink.nativeElement.classList).not.toContain('active');

         fixture.componentInstance.changeLinks();
         fixture.detectChanges();
         advance(fixture);

         expect(firstLink.nativeElement.classList).not.toContain('active');
         expect(secondLink.nativeElement.classList).toContain('active');
       }));

    it('should not cause infinite loops in the change detection - #15825', fakeAsync(() => {
         @Component({selector: 'simple', template: 'simple'})
         class SimpleCmp {
         }

         @Component({
           selector: 'some-root',
           template: `
        <div *ngIf="show">
          <ng-container *ngTemplateOutlet="tpl"></ng-container>
        </div>
        <router-outlet></router-outlet>
        <ng-template #tpl>
          <a routerLink="/simple" routerLinkActive="active"></a>
        </ng-template>`
         })
         class MyCmp {
           show: boolean = false;
         }

         @NgModule({
           imports: [CommonModule, RouterModule.forRoot([])],
           declarations: [MyCmp, SimpleCmp],
         })
         class MyModule {
         }

         TestBed.configureTestingModule({imports: [MyModule]});

         const router: Router = TestBed.inject(Router);
         const fixture = createRoot(router, MyCmp);
         router.resetConfig([{path: 'simple', component: SimpleCmp}]);

         router.navigateByUrl('/simple');
         advance(fixture);

         const instance = fixture.componentInstance;
         instance.show = true;
         expect(() => advance(fixture)).not.toThrow();
       }));

    it('should set isActive right after looking at its children -- #18983', fakeAsync(() => {
         @Component({
           template: `
          <div #rla="routerLinkActive" routerLinkActive>
            isActive: {{rla.isActive}}

            <ng-template let-data>
              <a [routerLink]="data">link</a>
            </ng-template>

            <ng-container #container></ng-container>
          </div>
        `
         })
         class ComponentWithRouterLink {
           @ViewChild(TemplateRef, {static: true}) templateRef?: TemplateRef<unknown>;
           @ViewChild('container', {read: ViewContainerRef, static: true})
           container?: ViewContainerRef;

           addLink() {
             if (this.templateRef) {
               this.container?.createEmbeddedView(this.templateRef, {$implicit: '/simple'});
             }
           }

           removeLink() {
             this.container?.clear();
           }
         }

         @Component({template: 'simple'})
         class SimpleCmp {
         }

         TestBed.configureTestingModule({
           imports: [RouterModule.forRoot([{path: 'simple', component: SimpleCmp}])],
           declarations: [ComponentWithRouterLink, SimpleCmp]
         });

         const router: Router = TestBed.inject(Router);
         const fixture = createRoot(router, ComponentWithRouterLink);
         router.navigateByUrl('/simple');
         advance(fixture);

         fixture.componentInstance.addLink();
         fixture.detectChanges();

         fixture.componentInstance.removeLink();
         advance(fixture);
         advance(fixture);

         expect(fixture.nativeElement.innerHTML).toContain('isActive: false');
       }));

    it('should set isActive with OnPush change detection - #19934', fakeAsync(() => {
         @Component({
           template: `
             <div routerLink="/simple" #rla="routerLinkActive" routerLinkActive>
               isActive: {{rla.isActive}}
             </div>
           `,
           changeDetection: ChangeDetectionStrategy.OnPush
         })
         class OnPushComponent {
         }

         @Component({template: 'simple'})
         class SimpleCmp {
         }

         TestBed.configureTestingModule({
           imports: [RouterModule.forRoot([{path: 'simple', component: SimpleCmp}])],
           declarations: [OnPushComponent, SimpleCmp]
         });

         const router: Router = TestBed.get(Router);
         const fixture = createRoot(router, OnPushComponent);
         router.navigateByUrl('/simple');
         advance(fixture);

         expect(fixture.nativeElement.innerHTML).toContain('isActive: true');
       }));
  });

  it('should not reactivate a deactivated outlet when destroyed and recreated - #41379',
     fakeAsync(() => {
       @Component({template: 'simple'})
       class SimpleComponent {
       }

       @Component({template: ` <router-outlet *ngIf="outletVisible" name="aux"></router-outlet> `})
       class AppComponent {
         outletVisible = true;
       }

       TestBed.configureTestingModule({
         imports:
             [RouterModule.forRoot([{path: ':id', component: SimpleComponent, outlet: 'aux'}])],
         declarations: [SimpleComponent, AppComponent],
       });

       const router = TestBed.inject(Router);
       const fixture = createRoot(router, AppComponent);
       const componentCdr = fixture.componentRef.injector.get<ChangeDetectorRef>(ChangeDetectorRef);

       router.navigate([{outlets: {aux: ['1234']}}]);
       advance(fixture);
       expect(fixture.nativeElement.innerHTML).toContain('simple');

       router.navigate([{outlets: {aux: null}}]);
       advance(fixture);
       expect(fixture.nativeElement.innerHTML).not.toContain('simple');

       fixture.componentInstance.outletVisible = false;
       componentCdr.detectChanges();
       expect(fixture.nativeElement.innerHTML).not.toContain('simple');
       expect(fixture.nativeElement.innerHTML).not.toContain('router-outlet');

       fixture.componentInstance.outletVisible = true;
       componentCdr.detectChanges();
       expect(fixture.nativeElement.innerHTML).toContain('router-outlet');
       expect(fixture.nativeElement.innerHTML).not.toContain('simple');
     }));

  describe('useHash', () => {
    it('should restore hash to match current route - #28561', fakeAsync(() => {
         @Component({selector: 'root-cmp', template: `<router-outlet></router-outlet>`})
         class RootCmp {
         }

         @Component({template: 'simple'})
         class SimpleCmp {
         }
         @Component({template: 'one'})
         class OneCmp {
         }

         TestBed.configureTestingModule({
           imports: [RouterModule.forRoot([
             {path: '', component: SimpleCmp},
             {path: 'one', component: OneCmp, canActivate: ['returnRootUrlTree']}
           ])],
           declarations: [SimpleCmp, RootCmp, OneCmp],
           providers: [
             provideLocationMocks(),
             {
               provide: 'returnRootUrlTree',
               useFactory: (router: Router) => () => {
                 return router.parseUrl('/');
               },
               deps: [Router]
             },
           ],
         });

         const router = TestBed.inject(Router);
         const location = TestBed.inject(Location) as SpyLocation;

         router.navigateByUrl('/');
         // Will setup location change listeners
         const fixture = createRoot(router, RootCmp);

         location.simulateHashChange('/one');
         advance(fixture);

         expect(location.path()).toEqual('/');
         expect(fixture.nativeElement.innerHTML).toContain('one');
       }));
  });

  describe('duplicate navigation handling (#43447, #43446)', () => {
    let location: Location;
    let router: Router;
    let fixture: ComponentFixture<{}>;

    beforeEach(fakeAsync(() => {
      @Injectable()
      class DelayedResolve {
        resolve() {
          return of('').pipe(delay(1000), mapTo(true));
        }
      }
      @Component({selector: 'root-cmp', template: `<router-outlet></router-outlet>`})
      class RootCmp {
      }

      @Component({template: 'simple'})
      class SimpleCmp {
      }
      @Component({template: 'one'})
      class OneCmp {
      }
      TestBed.configureTestingModule({
        declarations: [SimpleCmp, RootCmp, OneCmp],
        imports: [RouterOutlet],
        providers: [
          DelayedResolve,
          provideLocationMocks(),
          provideRouter(
              [
                {path: '', component: SimpleCmp},
                {path: 'one', component: OneCmp, resolve: {x: DelayedResolve}}
              ],
              ),
          {provide: LocationStrategy, useClass: HashLocationStrategy},
        ],
      });

      router = TestBed.inject(Router);
      location = TestBed.inject(Location);

      router.navigateByUrl('/');
      // Will setup location change listeners
      fixture = createRoot(router, RootCmp);
    }));

    it('duplicate navigation to same url', fakeAsync(() => {
         location.go('/one');
         tick(100);
         location.go('/one');
         tick(1000);
         advance(fixture);

         expect(location.path()).toEqual('/one');
         expect(fixture.nativeElement.innerHTML).toContain('one');
       }));

    it('works with a duplicate popstate/hashchange navigation (as seen in firefox)',
       fakeAsync(() => {
         (location as any)._subject.emit({'url': 'one', 'pop': true, 'type': 'popstate'});
         tick(1);
         (location as any)._subject.emit({'url': 'one', 'pop': true, 'type': 'hashchange'});
         tick(1000);
         advance(fixture);

         expect(router.routerState.toString()).toContain(`url:'one'`);
         expect(fixture.nativeElement.innerHTML).toContain('one');
       }));
  });

  it('should not unregister outlet if a different one already exists #36711, 32453', async () => {
    @Component({
      template: `
      <router-outlet *ngIf="outlet1"></router-outlet>
      <router-outlet *ngIf="outlet2"></router-outlet>
      `,
    })
    class TestCmp {
      outlet1 = true;
      outlet2 = false;
    }

    @Component({template: ''})
    class EmptyCmp {
    }

    TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule.forRoot([{path: '**', component: EmptyCmp}])],
      declarations: [TestCmp, EmptyCmp]
    });
    const fixture = TestBed.createComponent(TestCmp);
    const contexts = TestBed.inject(ChildrenOutletContexts);
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();

    expect(contexts.getContext('primary')).toBeDefined();
    expect(contexts.getContext('primary')?.outlet).not.toBeNull();

    // Show the second outlet. Applications shouldn't really have more than one outlet but there can
    // be timing issues between destroying and recreating a second one in some cases:
    // https://github.com/angular/angular/issues/36711,
    // https://github.com/angular/angular/issues/32453
    fixture.componentInstance.outlet2 = true;
    fixture.detectChanges();
    expect(contexts.getContext('primary')?.outlet).not.toBeNull();

    fixture.componentInstance.outlet1 = false;
    fixture.detectChanges();
    // Destroying the first one show not clear the outlet context because the second one takes over
    // as the registered outlet.
    expect(contexts.getContext('primary')?.outlet).not.toBeNull();
  });

  it('should respect custom serializer all the way to the final url on state', async () => {
    const QUERY_VALUE = {user: 'atscott'};
    const SPECIAL_SERIALIZATION = 'special';

    class CustomSerializer extends DefaultUrlSerializer {
      override serialize(tree: UrlTree): string {
        const mutableCopy = new UrlTree(tree.root, {...tree.queryParams}, tree.fragment);
        if (mutableCopy.queryParams['q']) {
          mutableCopy.queryParams['q'] = SPECIAL_SERIALIZATION;
        }
        return new DefaultUrlSerializer().serialize(mutableCopy);
      }
    }

    TestBed.configureTestingModule({
      providers: [provideRouter([]), {provide: UrlSerializer, useValue: new CustomSerializer()}]
    });

    const router = TestBed.inject(Router);
    const tree = router.createUrlTree([]);
    tree.queryParams = {q: QUERY_VALUE};
    await router.navigateByUrl(tree);

    expect(router.url).toEqual(`/?q=${SPECIAL_SERIALIZATION}`);
  });
});

function advance<T>(fixture: ComponentFixture<T>): void {
  tick();
  fixture.detectChanges();
}

function createRoot<T>(router: Router, type: Type<T>): ComponentFixture<T> {
  const f = TestBed.createComponent(type);
  advance(f);
  router.initialNavigation();
  advance(f);
  return f;
}
