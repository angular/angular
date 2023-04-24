/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, PlatformLocation, ɵgetDOM as getDOM} from '@angular/common';
import {BrowserPlatformLocation} from '@angular/common/src/location/platform_location';
import {NullViewportScroller, ViewportScroller} from '@angular/common/src/viewport_scroller';
import {MockPlatformLocation} from '@angular/common/testing';
import {ApplicationRef, Component, CUSTOM_ELEMENTS_SCHEMA, destroyPlatform, ENVIRONMENT_INITIALIZER, inject, Injectable, NgModule} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {NavigationEnd, provideRouter, Router, RouterModule, RouterOutlet, withEnabledBlockingInitialNavigation} from '@angular/router';

// This is needed, because all files under `packages/` are compiled together as part of the
// [legacy-unit-tests-saucelabs][1] CI job, including the `lib.webworker.d.ts` typings brought in by
// [service-worker/worker/src/service-worker.d.ts][2].
//
// [1]:
// https://github.com/angular/angular/blob/ffeea63f43e6a7fd46be4a8cd5a5d254c98dea08/.circleci/config.yml#L681
// [2]:
// https://github.com/angular/angular/blob/316dc2f12ce8931f5ff66fa5f8da21c0d251a337/packages/service-worker/worker/src/service-worker.d.ts#L9
declare var window: Window;

describe('bootstrap', () => {
  let log: any[] = [];
  let testProviders: any[] = null!;

  @Component({template: 'simple'})
  class SimpleCmp {
  }

  @Component({selector: 'test-app', template: 'root <router-outlet></router-outlet>'})
  class RootCmp {
    constructor() {
      log.push('RootCmp');
    }
  }

  @Component({selector: 'test-app2', template: 'root <router-outlet></router-outlet>'})
  class SecondRootCmp {
  }

  @Injectable({providedIn: 'root'})
  class TestResolver {
    resolve() {
      let resolve: (value: unknown) => void;
      const res = new Promise(r => resolve = r);
      setTimeout(() => resolve('test-data'), 0);
      return res;
    }
  }

  let navigationEndPromise: Promise<void>;
  beforeEach(() => {
    destroyPlatform();

    const doc = TestBed.inject(DOCUMENT);
    const oldRoots = doc.querySelectorAll('test-app,test-app2');
    for (let i = 0; i < oldRoots.length; i++) {
      getDOM().remove(oldRoots[i]);
    }
    const el1 = getDOM().createElement('test-app', doc);
    const el2 = getDOM().createElement('test-app2', doc);
    doc.body.appendChild(el1);
    doc.body.appendChild(el2);

    const {promise, resolveFn} = createPromise();
    navigationEndPromise = promise;
    log = [];
    testProviders = [
      {provide: DOCUMENT, useValue: doc},
      {provide: ViewportScroller, useClass: isNode ? NullViewportScroller : ViewportScroller},
      {provide: PlatformLocation, useClass: MockPlatformLocation},
      provideNavigationEndAction(resolveFn)
    ];
  });

  afterEach(destroyPlatform);

  it('should complete when initial navigation fails and initialNavigation = enabledBlocking',
     async () => {
       @NgModule({
         imports: [BrowserModule],
         declarations: [RootCmp],
         bootstrap: [RootCmp],
         providers: [
           ...testProviders,
           provideRouter(
               [{
                 matcher: () => {
                   throw new Error('error in matcher');
                 },
                 children: []
               }],
               withEnabledBlockingInitialNavigation())
         ],
         schemas: [CUSTOM_ELEMENTS_SCHEMA]
       })
       class TestModule {
         constructor(router: Router) {
           log.push('TestModule');
           router.events.subscribe(e => log.push(e.constructor.name));
         }
       }

       await platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
         const router = res.injector.get(Router);
         expect(router.navigated).toEqual(false);
         expect(router.getCurrentNavigation()).toBeNull();
         expect(log).toContain('TestModule');
         expect(log).toContain('NavigationError');
       });
     });

  it('should finish navigation when initial navigation is enabledBlocking and component renavigates on render',
     async () => {
       @Component({
         template: '',
         standalone: true,
       })
       class Renavigate {
         constructor(router: Router) {
           router.navigateByUrl('/other');
         }
       }
       @Component({
         template: '',
         standalone: true,
       })
       class BlankCmp {
       }

       @NgModule({
         imports: [BrowserModule, RouterOutlet],
         declarations: [RootCmp],
         bootstrap: [RootCmp],
         providers: [
           ...testProviders,
           provideRouter(
               [{path: '', component: Renavigate}, {path: 'other', component: BlankCmp}],
               withEnabledBlockingInitialNavigation())
         ],
       })
       class TestModule {
       }

       await expectAsync(Promise.all([
         platformBrowserDynamic([]).bootstrapModule(TestModule), navigationEndPromise
       ])).toBeResolved();
     });

  it('should wait for redirect when initialNavigation = enabledBlocking', async () => {
    @Injectable({providedIn: 'root'})
    class Redirect {
      constructor(private router: Router) {}
      canActivate() {
        this.router.navigateByUrl('redirectToMe');
        return false;
      }
    }
    @NgModule({
      imports: [
        BrowserModule,
        RouterModule.forRoot(
            [
              {path: 'redirectToMe', children: [], resolve: {test: TestResolver}},
              {path: '**', canActivate: [Redirect], children: []}
            ],
            {initialNavigation: 'enabledBlocking'})
      ],
      declarations: [RootCmp],
      bootstrap: [RootCmp],
      providers: [...testProviders],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class TestModule {
      constructor() {
        log.push('TestModule');
      }
    }

    const bootstrapPromise = platformBrowserDynamic([]).bootstrapModule(TestModule).then((ref) => {
      const router = ref.injector.get(Router);
      expect(router.navigated).toEqual(true);
      expect(router.url).toContain('redirectToMe');
      expect(log).toContain('TestModule');
    });

    await Promise.all([bootstrapPromise, navigationEndPromise]);
  });

  it('should wait for redirect with UrlTree when initialNavigation = enabledBlocking', async () => {
    @NgModule({
      imports: [
        BrowserModule,
        RouterModule.forRoot(
            [
              {path: 'redirectToMe', children: []}, {
                path: '**',
                canActivate: [() => inject(Router).createUrlTree(['redirectToMe'])],
                children: []
              }
            ],
            {initialNavigation: 'enabledBlocking'})
      ],
      declarations: [RootCmp],
      bootstrap: [RootCmp],
      providers: [...testProviders],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class TestModule {
      constructor() {
        log.push('TestModule');
      }
    }

    const bootstrapPromise = platformBrowserDynamic([]).bootstrapModule(TestModule).then((ref) => {
      const router = ref.injector.get(Router);
      expect(router.navigated).toEqual(true);
      expect(router.url).toContain('redirectToMe');
      expect(log).toContain('TestModule');
    });

    await Promise.all([bootstrapPromise, navigationEndPromise]);
  });

  it('should wait for resolvers to complete when initialNavigation = enabledBlocking', async () => {
    @Component({selector: 'test', template: 'test'})
    class TestCmpEnabled {
    }

    @NgModule({
      imports: [
        BrowserModule,
        RouterModule.forRoot(
            [{path: '**', component: TestCmpEnabled, resolve: {test: TestResolver}}],
            {initialNavigation: 'enabledBlocking'})
      ],
      declarations: [RootCmp, TestCmpEnabled],
      bootstrap: [RootCmp],
      providers: [...testProviders, TestResolver],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class TestModule {
      constructor(router: Router) {}
    }

    const bootstrapPromise = platformBrowserDynamic([]).bootstrapModule(TestModule).then((ref) => {
      const router = ref.injector.get(Router);
      const data = router.routerState.snapshot.root.firstChild!.data;
      expect(data['test']).toEqual('test-data');
      // Also ensure that the navigation completed. The navigation transition clears the
      // current navigation in its `finalize` operator.
      expect(router.getCurrentNavigation()).toBeNull();
    });
    await Promise.all([bootstrapPromise, navigationEndPromise]);
  });

  it('should NOT wait for resolvers to complete when initialNavigation = enabledNonBlocking',
     async () => {
       @Component({selector: 'test', template: 'test'})
       class TestCmpLegacyEnabled {
       }

       @NgModule({
         imports: [
           BrowserModule,
           RouterModule.forRoot(
               [{path: '**', component: TestCmpLegacyEnabled, resolve: {test: TestResolver}}],
               {initialNavigation: 'enabledNonBlocking'})
         ],
         declarations: [RootCmp, TestCmpLegacyEnabled],
         bootstrap: [RootCmp],
         providers: [...testProviders, TestResolver],
         schemas: [CUSTOM_ELEMENTS_SCHEMA]
       })
       class TestModule {
         constructor(router: Router) {
           log.push('TestModule');
           router.events.subscribe(e => log.push(e.constructor.name));
         }
       }

       const bootstrapPromise =
           platformBrowserDynamic([]).bootstrapModule(TestModule).then((ref) => {
             const router: Router = ref.injector.get(Router);
             expect(router.routerState.snapshot.root.firstChild).toBeNull();
             // ResolveEnd has not been emitted yet because bootstrap returned too early
             expect(log).toEqual([
               'TestModule', 'RootCmp', 'NavigationStart', 'RoutesRecognized', 'GuardsCheckStart',
               'ChildActivationStart', 'ActivationStart', 'GuardsCheckEnd', 'ResolveStart'
             ]);
           });

       await Promise.all([bootstrapPromise, navigationEndPromise]);
     });

  it('should NOT wait for resolvers to complete when initialNavigation is not set', async () => {
    @Component({selector: 'test', template: 'test'})
    class TestCmpLegacyEnabled {
    }

    @NgModule({
      imports: [
        BrowserModule,
        RouterModule.forRoot(
            [{path: '**', component: TestCmpLegacyEnabled, resolve: {test: TestResolver}}],
            )
      ],
      declarations: [RootCmp, TestCmpLegacyEnabled],
      bootstrap: [RootCmp],
      providers: [...testProviders, TestResolver],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class TestModule {
      constructor(router: Router) {
        log.push('TestModule');
        router.events.subscribe(e => log.push(e.constructor.name));
      }
    }

    const bootstrapPromise = platformBrowserDynamic([]).bootstrapModule(TestModule).then(ref => {
      const router: Router = ref.injector.get(Router);
      expect(router.routerState.snapshot.root.firstChild).toBeNull();
      // ResolveEnd has not been emitted yet because bootstrap returned too early
      expect(log).toEqual([
        'TestModule', 'RootCmp', 'NavigationStart', 'RoutesRecognized', 'GuardsCheckStart',
        'ChildActivationStart', 'ActivationStart', 'GuardsCheckEnd', 'ResolveStart'
      ]);
    });

    await Promise.all([bootstrapPromise, navigationEndPromise]);
  });

  it('should not run navigation when initialNavigation = disabled', (done) => {
    @Component({selector: 'test', template: 'test'})
    class TestCmpDiabled {
    }

    @NgModule({
      imports: [
        BrowserModule,
        RouterModule.forRoot(
            [{path: '**', component: TestCmpDiabled, resolve: {test: TestResolver}}],
            {initialNavigation: 'disabled'})
      ],
      declarations: [RootCmp, TestCmpDiabled],
      bootstrap: [RootCmp],
      providers: [...testProviders, TestResolver],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class TestModule {
      constructor(router: Router) {
        log.push('TestModule');
        router.events.subscribe(e => log.push(e.constructor.name));
      }
    }

    platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
      const router = res.injector.get(Router);
      expect(log).toEqual(['TestModule', 'RootCmp']);
      done();
    });
  });

  it('should not init router navigation listeners if a non root component is bootstrapped',
     async () => {
       @NgModule({
         imports: [
           BrowserModule,
           RouterModule.forRoot(
               [],
               )
         ],
         declarations: [SecondRootCmp, RootCmp],
         bootstrap: [RootCmp],
         providers: testProviders,
         schemas: [CUSTOM_ELEMENTS_SCHEMA]
       })
       class TestModule {
       }

       await platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
         const router = res.injector.get(Router);
         spyOn(router as any, 'resetRootComponentType').and.callThrough();

         const appRef: ApplicationRef = res.injector.get(ApplicationRef);
         appRef.bootstrap(SecondRootCmp);

         expect((router as any).resetRootComponentType).not.toHaveBeenCalled();
       });
     });

  it('should reinit router navigation listeners if a previously bootstrapped root component is destroyed',
     async () => {
       @NgModule({
         imports: [BrowserModule, RouterModule.forRoot([])],
         declarations: [SecondRootCmp, RootCmp],
         bootstrap: [RootCmp],
         providers: testProviders,
         schemas: [CUSTOM_ELEMENTS_SCHEMA]
       })
       class TestModule {
       }

       await platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
         const router = res.injector.get(Router);
         spyOn(router as any, 'resetRootComponentType').and.callThrough();

         const appRef: ApplicationRef = res.injector.get(ApplicationRef);
         const {promise, resolveFn} = createPromise();
         appRef.components[0].onDestroy(() => {
           appRef.bootstrap(SecondRootCmp);
           expect((router as any).resetRootComponentType).toHaveBeenCalled();
           resolveFn();
         });

         appRef.components[0].destroy();
         return promise;
       });
     });

  if (!isNode) {
    it('should restore the scrolling position', async () => {
      @Component({
        selector: 'component-a',
        template: `
           <div style="height: 3000px;"></div>
           <div id="marker1"></div>
           <div style="height: 3000px;"></div>
           <div id="marker2"></div>
           <div style="height: 3000px;"></div>
           <a name="marker3"></a>
           <div style="height: 3000px;"></div>
      `
      })
      class TallComponent {
      }
      @NgModule({
        imports: [
          BrowserModule,
          RouterModule.forRoot(
              [
                {path: '', pathMatch: 'full', redirectTo: '/aa'},
                {path: 'aa', component: TallComponent}, {path: 'bb', component: TallComponent},
                {path: 'cc', component: TallComponent},
                {path: 'fail', component: TallComponent, canActivate: [() => false]}
              ],
              {
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
                scrollOffset: [0, 100],
                onSameUrlNavigation: 'ignore',
              })
        ],
        declarations: [TallComponent, RootCmp],
        bootstrap: [RootCmp],
        providers: [...testProviders],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      class TestModule {
      }

      function resolveAfter(milliseconds: number) {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, milliseconds);
        });
      }

      const res = await platformBrowserDynamic([]).bootstrapModule(TestModule);
      const router = res.injector.get(Router);

      await router.navigateByUrl('/aa');
      window.scrollTo(0, 5000);

      await router.navigateByUrl('/fail');
      expect(window.pageYOffset).toEqual(5000);

      await router.navigateByUrl('/bb');
      window.scrollTo(0, 3000);

      expect(window.pageYOffset).toEqual(3000);

      await router.navigateByUrl('/cc');
      await resolveAfter(100);
      expect(window.pageYOffset).toEqual(0);

      await router.navigateByUrl('/aa#marker2');
      await resolveAfter(100);
      expect(window.scrollY).toBeGreaterThanOrEqual(5900);
      expect(window.scrollY).toBeLessThan(6000);  // offset

      // Scroll somewhere else, then navigate to the hash again. Even though the same url navigation
      // is ignored by the Router, we should still scroll.
      window.scrollTo(0, 3000);
      await router.navigateByUrl('/aa#marker2');
      await resolveAfter(100);
      expect(window.scrollY).toBeGreaterThanOrEqual(5900);
      expect(window.scrollY).toBeLessThan(6000);  // offset
    });

    it('should cleanup "popstate" and "hashchange" listeners', async () => {
      @NgModule({
        imports: [BrowserModule, RouterModule.forRoot([])],
        declarations: [RootCmp],
        bootstrap: [RootCmp],
        providers:
            [...testProviders, {provide: PlatformLocation, useClass: BrowserPlatformLocation}],
      })
      class TestModule {
      }

      spyOn(window, 'addEventListener').and.callThrough();
      spyOn(window, 'removeEventListener').and.callThrough();

      const ngModuleRef = await platformBrowserDynamic().bootstrapModule(TestModule);
      ngModuleRef.destroy();

      expect(window.addEventListener).toHaveBeenCalledTimes(2);

      expect(window.addEventListener)
          .toHaveBeenCalledWith('popstate', jasmine.any(Function), jasmine.any(Boolean));
      expect(window.addEventListener)
          .toHaveBeenCalledWith('hashchange', jasmine.any(Function), jasmine.any(Boolean));

      expect(window.removeEventListener).toHaveBeenCalledWith('popstate', jasmine.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('hashchange', jasmine.any(Function));
    });
  }

  it('can schedule a navigation from the NavigationEnd event #37460', (done) => {
    @NgModule({
      imports: [
        BrowserModule,
        RouterModule.forRoot(
            [
              {path: 'a', component: SimpleCmp},
              {path: 'b', component: SimpleCmp},
            ],
            )
      ],
      declarations: [RootCmp, SimpleCmp],
      bootstrap: [RootCmp],
      providers: [...testProviders],
    })
    class TestModule {
    }

    (async () => {
      const res = await platformBrowserDynamic([]).bootstrapModule(TestModule);
      const router = res.injector.get(Router);
      router.events.subscribe(async (e) => {
        if (e instanceof NavigationEnd && e.url === '/b') {
          await router.navigate(['a']);
          done();
        }
      });
      await router.navigateByUrl('/b');
    })();
  });
});

function onNavigationEnd(router: Router, fn: Function) {
  router.events.subscribe(e => {
    if (e instanceof NavigationEnd) {
      fn();
    }
  });
}

function provideNavigationEndAction(fn: Function) {
  return {
    provide: ENVIRONMENT_INITIALIZER,
    multi: true,
    useValue: () => {
      onNavigationEnd(inject(Router), fn);
    }
  };
}

function createPromise() {
  let resolveFn: () => void;
  const promise = new Promise<void>(r => {
    resolveFn = r;
  });
  return {resolveFn: () => resolveFn(), promise};
}
