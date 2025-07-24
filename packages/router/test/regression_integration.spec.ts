/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule, HashLocationStrategy, Location, LocationStrategy} from '@angular/common';
import {provideLocationMocks, SpyLocation} from '@angular/common/testing';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injectable,
  NgModule,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
  inject,
  signal,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
  ChildrenOutletContexts,
  DefaultUrlSerializer,
  NavigationCancel,
  NavigationError,
  Router,
  RouterModule,
  RouterOutlet,
  UrlSerializer,
  UrlTree,
} from '../index';
import {of} from 'rxjs';
import {switchMap, filter, mapTo, take} from 'rxjs/operators';

import {provideRouter, withRouterConfig} from '../src/provide_router';
import {afterNextNavigation} from '../src/utils/navigations';
import {timeout} from './helpers';

describe('Integration', () => {
  describe('routerLinkActive', () => {
    it('should update when the associated routerLinks change - #18469', async () => {
      @Component({
        template: `
          <a id="first-link" [routerLink]="[firstLink]" routerLinkActive="active">{{firstLink}}</a>
          <div id="second-link" routerLinkActive="active">
            <a [routerLink]="[secondLink]">{{secondLink}}</a>
          </div>
           `,
        standalone: false,
      })
      class LinkComponent {
        firstLink = 'link-a';
        secondLink = 'link-b';
        cdr = inject(ChangeDetectorRef);

        changeLinks(): void {
          const temp = this.secondLink;
          this.secondLink = this.firstLink;
          this.firstLink = temp;
          this.cdr.markForCheck();
        }
      }

      @Component({
        template: 'simple',
        standalone: false,
      })
      class SimpleCmp {}

      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {path: 'link-a', component: SimpleCmp},
            {path: 'link-b', component: SimpleCmp},
          ]),
        ],
        declarations: [LinkComponent, SimpleCmp],
      });

      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, LinkComponent);
      const firstLink = fixture.debugElement.query((p) => p.nativeElement.id === 'first-link');
      const secondLink = fixture.debugElement.query((p) => p.nativeElement.id === 'second-link');
      router.navigateByUrl('/link-a');
      await advance(fixture);

      expect(firstLink.nativeElement.classList).toContain('active');
      expect(secondLink.nativeElement.classList).not.toContain('active');

      fixture.componentInstance.changeLinks();
      fixture.detectChanges();
      await advance(fixture);

      expect(firstLink.nativeElement.classList).not.toContain('active');
      expect(secondLink.nativeElement.classList).toContain('active');
    });

    it('should not cause infinite loops in the change detection - #15825', async () => {
      @Component({
        selector: 'simple',
        template: 'simple',
        standalone: false,
      })
      class SimpleCmp {}

      @Component({
        selector: 'some-root',
        template: `
        <div *ngIf="show">
          <ng-container *ngTemplateOutlet="tpl"></ng-container>
        </div>
        <router-outlet></router-outlet>
        <ng-template #tpl>
          <a routerLink="/simple" routerLinkActive="active"></a>
        </ng-template>`,
        standalone: false,
      })
      class MyCmp {
        show: boolean = false;
      }

      @NgModule({
        imports: [CommonModule, RouterModule.forRoot([])],
        declarations: [MyCmp, SimpleCmp],
      })
      class MyModule {}

      TestBed.configureTestingModule({imports: [MyModule]});

      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, MyCmp);
      router.resetConfig([{path: 'simple', component: SimpleCmp}]);

      router.navigateByUrl('/simple');
      await advance(fixture);

      const instance = fixture.componentInstance;
      instance.show = true;
      expect(() => advance(fixture)).not.toThrow();
    });

    it('should set isActive right after looking at its children -- #18983', async () => {
      @Component({
        template: `
          <div #rla="routerLinkActive" routerLinkActive>
            isActive: {{rla.isActive}}

            <ng-template let-data>
              <a [routerLink]="data">link</a>
            </ng-template>

            <ng-container #container></ng-container>
          </div>
        `,
        standalone: false,
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

      @Component({
        template: 'simple',
        standalone: false,
      })
      class SimpleCmp {}

      TestBed.configureTestingModule({
        imports: [RouterModule.forRoot([{path: 'simple', component: SimpleCmp}])],
        declarations: [ComponentWithRouterLink, SimpleCmp],
      });

      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, ComponentWithRouterLink);
      router.navigateByUrl('/simple');
      await advance(fixture);

      fixture.componentInstance.addLink();
      fixture.detectChanges();

      fixture.componentInstance.removeLink();
      await advance(fixture);
      await advance(fixture);

      expect(fixture.nativeElement.innerHTML).toContain('isActive: false');
    });

    it('should set isActive with OnPush change detection - #19934', async () => {
      @Component({
        template: `
             <div routerLink="/simple" #rla="routerLinkActive" routerLinkActive>
               isActive: {{rla.isActive}}
             </div>
           `,
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: false,
      })
      class OnPushComponent {}

      @Component({
        template: 'simple',
        standalone: false,
      })
      class SimpleCmp {}

      TestBed.configureTestingModule({
        imports: [RouterModule.forRoot([{path: 'simple', component: SimpleCmp}])],
        declarations: [OnPushComponent, SimpleCmp],
      });

      const router = TestBed.inject(Router);
      const fixture = await createRoot(router, OnPushComponent);
      router.navigateByUrl('/simple');
      await advance(fixture);

      expect(fixture.nativeElement.innerHTML).toContain('isActive: true');
    });
  });

  it('should not reactivate a deactivated outlet when destroyed and recreated - #41379', async () => {
    @Component({
      template: 'simple',
      standalone: false,
    })
    class SimpleComponent {}

    @Component({
      template: ` <router-outlet *ngIf="outletVisible" name="aux"></router-outlet> `,
      standalone: false,
    })
    class AppComponent {
      outletVisible = true;
    }

    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([{path: ':id', component: SimpleComponent, outlet: 'aux'}])],
      declarations: [SimpleComponent, AppComponent],
    });

    const router = TestBed.inject(Router);
    const fixture = await createRoot(router, AppComponent);
    const componentCdr = fixture.componentRef.injector.get<ChangeDetectorRef>(ChangeDetectorRef);

    router.navigate([{outlets: {aux: ['1234']}}]);
    await advance(fixture);
    expect(fixture.nativeElement.innerHTML).toContain('simple');

    router.navigate([{outlets: {aux: null}}]);
    await advance(fixture);
    expect(fixture.nativeElement.innerHTML).not.toContain('simple');

    fixture.componentInstance.outletVisible = false;
    componentCdr.detectChanges();
    expect(fixture.nativeElement.innerHTML).not.toContain('simple');
    expect(fixture.nativeElement.innerHTML).not.toContain('router-outlet');

    fixture.componentInstance.outletVisible = true;
    componentCdr.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('router-outlet');
    expect(fixture.nativeElement.innerHTML).not.toContain('simple');
  });

  describe('useHash', () => {
    it('should restore hash to match current route - #28561', async () => {
      @Component({
        selector: 'root-cmp',
        template: `<router-outlet></router-outlet>`,
        standalone: false,
      })
      class RootCmp {}

      @Component({
        template: 'simple',
        standalone: false,
      })
      class SimpleCmp {}
      @Component({
        template: 'one',
        standalone: false,
      })
      class OneCmp {}

      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {path: '', component: SimpleCmp},
            {path: 'one', component: OneCmp, canActivate: [() => inject(Router).parseUrl('/')]},
          ]),
        ],
        declarations: [SimpleCmp, RootCmp, OneCmp],
        providers: [provideLocationMocks()],
      });

      const router = TestBed.inject(Router);
      const location = TestBed.inject(Location) as SpyLocation;

      router.navigateByUrl('/');
      // Will setup location change listeners
      const fixture = await createRoot(router, RootCmp);

      location.simulateHashChange('/one');
      await advance(fixture);

      expect(location.path()).toEqual('/');
      expect(fixture.nativeElement.innerHTML).toContain('one');
    });
  });

  describe('duplicate navigation handling (#43447, #43446)', () => {
    let location: Location;
    let router: Router;
    let fixture: ComponentFixture<{}>;

    beforeEach(async () => {
      @Injectable()
      class DelayedResolve {
        resolve() {
          return of('').pipe(
            switchMap((v) => new Promise((r) => setTimeout(r, 10)).then(() => v)),
            mapTo(true),
          );
        }
      }
      @Component({
        selector: 'root-cmp',
        template: `<router-outlet></router-outlet>`,
        standalone: false,
      })
      class RootCmp {}

      @Component({
        template: 'simple',
        standalone: false,
      })
      class SimpleCmp {}
      @Component({
        template: 'one',
        standalone: false,
      })
      class OneCmp {}
      TestBed.configureTestingModule({
        declarations: [SimpleCmp, RootCmp, OneCmp],
        imports: [RouterOutlet],
        providers: [
          DelayedResolve,
          provideLocationMocks(),
          provideRouter([
            {path: '', component: SimpleCmp},
            {path: 'one', component: OneCmp, resolve: {x: DelayedResolve}},
          ]),
          {provide: LocationStrategy, useClass: HashLocationStrategy},
        ],
      });

      router = TestBed.inject(Router);
      location = TestBed.inject(Location);

      router.navigateByUrl('/');
      // Will setup location change listeners
      fixture = await createRoot(router, RootCmp);
    });

    it('duplicate navigation to same url', async () => {
      location.go('/one');
      await timeout(1);
      location.go('/one');
      await timeout(10);
      await advance(fixture);

      expect(location.path()).toEqual('/one');
      expect(fixture.nativeElement.innerHTML).toContain('one');
    });

    it('works with a duplicate popstate/hashchange navigation (as seen in firefox)', async () => {
      (location as any)._subject.next({'url': 'one', 'pop': true, 'type': 'popstate'});
      await timeout(1);
      (location as any)._subject.next({'url': 'one', 'pop': true, 'type': 'hashchange'});
      await timeout(10);
      await advance(fixture);

      expect(router.routerState.toString()).toContain(`url:'one'`);
      expect(fixture.nativeElement.innerHTML).toContain('one');
    });
  });

  it('should not unregister outlet if a different one already exists #36711, 32453', async () => {
    @Component({
      template: `
      <router-outlet *ngIf="outlet1()"></router-outlet>
      <router-outlet *ngIf="outlet2()"></router-outlet>
      `,
      standalone: false,
    })
    class TestCmp {
      outlet1 = signal(true);
      outlet2 = signal(false);
    }

    @Component({
      template: '',
      standalone: false,
    })
    class EmptyCmp {}

    TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule.forRoot([{path: '**', component: EmptyCmp}])],
      declarations: [TestCmp, EmptyCmp],
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
    fixture.componentInstance.outlet2.set(true);
    fixture.detectChanges();
    expect(contexts.getContext('primary')?.outlet).not.toBeNull();

    fixture.componentInstance.outlet1.set(false);
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
        mutableCopy.queryParams['q'] &&= SPECIAL_SERIALIZATION;
        return new DefaultUrlSerializer().serialize(mutableCopy);
      }
    }

    TestBed.configureTestingModule({
      providers: [provideRouter([]), {provide: UrlSerializer, useValue: new CustomSerializer()}],
    });

    const router = TestBed.inject(Router);
    const tree = router.createUrlTree([]);
    tree.queryParams = {q: QUERY_VALUE};
    await router.navigateByUrl(tree);

    expect(router.url).toEqual(`/?q=${SPECIAL_SERIALIZATION}`);
  });

  it('navigation works when a redirecting NavigationCancel event causes another synchronous navigation', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {path: 'a', children: []},
            {path: 'b', children: []},
            {path: 'c', children: []},
          ],
          withRouterConfig({resolveNavigationPromiseOnError: true}),
        ),
      ],
    });

    let errors: NavigationError[] = [];
    let cancellations: NavigationCancel[] = [];
    const router = TestBed.inject(Router);
    router.events
      .pipe(filter((e): e is NavigationError => e instanceof NavigationError))
      .subscribe((e) => errors.push(e));
    router.events
      .pipe(filter((e): e is NavigationCancel => e instanceof NavigationCancel))
      .subscribe((e) => cancellations.push(e));

    router.events
      .pipe(
        filter((e) => e instanceof NavigationCancel),
        take(1),
      )
      .subscribe(() => {
        router.navigateByUrl('/c');
      });
    router.navigateByUrl('/a');
    router.navigateByUrl('/b');
    await new Promise<void>((resolve) => afterNextNavigation(router, resolve));

    expect(router.url).toEqual('/c');
    expect(errors).toEqual([]);
    // navigations to a and b were both cancelled.
    expect(cancellations.length).toEqual(2);
  });
});

async function advance<T>(fixture: ComponentFixture<T>): Promise<void> {
  await timeout();
  fixture.detectChanges();
}

function createRoot<T>(router: Router, type: Type<T>): ComponentFixture<T> {
  const f = TestBed.createComponent(type);
  advance(f);
  router.initialNavigation();
  advance(f);
  return f;
}
