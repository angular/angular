/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_BASE_HREF, DOCUMENT, HashLocationStrategy, LocationStrategy, ɵgetDOM as getDOM} from '@angular/common';
import {ApplicationRef, Component, CUSTOM_ELEMENTS_SCHEMA, destroyPlatform, Injectable, NgModule} from '@angular/core';
import {inject} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {NavigationEnd, provideRouter, Resolve, Router, RouterModule, withEnabledBlockingInitialNavigation} from '@angular/router';

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
  if (isNode) {
    // Jasmine will throw if there are no tests.
    it('should pass', () => {});
    return;
  }

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
  class TestResolver implements Resolve<any> {
    resolve() {
      let resolve: any = null;
      const res = new Promise(r => resolve = r);
      setTimeout(() => resolve('test-data'), 0);
      return res;
    }
  }

  beforeEach(inject([DOCUMENT], (doc: any) => {
    destroyPlatform();

    const el1 = getDOM().createElement('test-app', doc);
    const el2 = getDOM().createElement('test-app2', doc);
    doc.body.appendChild(el1);
    doc.body.appendChild(el2);

    log = [];
    testProviders = [{provide: APP_BASE_HREF, useValue: ''}];
  }));

  afterEach(inject([DOCUMENT], (doc: any) => {
    const oldRoots = doc.querySelectorAll('test-app,test-app2');
    for (let i = 0; i < oldRoots.length; i++) {
      getDOM().remove(oldRoots[i]);
    }
  }));

  it('should complete resolvers when initial navigation fails and initialNavigation = enabledBlocking',
     async () => {
       @NgModule({
         imports: [BrowserModule],
         declarations: [RootCmp],
         bootstrap: [RootCmp],
         providers: [
           ...testProviders, {provide: LocationStrategy, useClass: HashLocationStrategy},
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
            {useHash: true, initialNavigation: 'enabledBlocking'})
      ],
      declarations: [RootCmp],
      bootstrap: [RootCmp],
      providers: [...testProviders],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class TestModule {
      constructor(router: Router) {
        log.push('TestModule');
      }
    }

    await platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
      const router = res.injector.get(Router);
      expect(router.navigated).toEqual(true);
      expect(router.url).toContain('redirectToMe');
      expect(log).toContain('TestModule');
    });
  });

  it('should wait for redirect with UrlTree when initialNavigation = enabledBlocking', async () => {
    @Injectable({providedIn: 'root'})
    class Redirect {
      constructor(private router: Router) {}
      canActivate() {
        return this.router.createUrlTree(['/redirectToMe']);
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
            {useHash: true, initialNavigation: 'enabledBlocking'})
      ],
      declarations: [RootCmp],
      bootstrap: [RootCmp],
      providers: [...testProviders],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class TestModule {
      constructor(router: Router) {
        log.push('TestModule');
      }
    }

    await platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
      const router = res.injector.get(Router);
      expect(router.navigated).toEqual(true);
      expect(router.url).toContain('redirectToMe');
      expect(log).toContain('TestModule');
    });
  });

  it('should wait for resolvers to complete when initialNavigation = enabledBlocking', (done) => {
    @Component({selector: 'test', template: 'test'})
    class TestCmpEnabled {
    }

    @NgModule({
      imports: [
        BrowserModule,
        RouterModule.forRoot(
            [{path: '**', component: TestCmpEnabled, resolve: {test: TestResolver}}],
            {useHash: true, initialNavigation: 'enabledBlocking'})
      ],
      declarations: [RootCmp, TestCmpEnabled],
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
      const data = router.routerState.snapshot.root.firstChild!.data;
      expect(data['test']).toEqual('test-data');
      expect(log).toEqual([
        'TestModule', 'NavigationStart', 'RoutesRecognized', 'GuardsCheckStart',
        'ChildActivationStart', 'ActivationStart', 'GuardsCheckEnd', 'ResolveStart', 'ResolveEnd',
        'RootCmp', 'ActivationEnd', 'ChildActivationEnd', 'NavigationEnd', 'Scroll'
      ]);
      done();
    });
  });

  it('should NOT wait for resolvers to complete when initialNavigation = enabledNonBlocking',
     (done) => {
       @Component({selector: 'test', template: 'test'})
       class TestCmpLegacyEnabled {
       }

       @NgModule({
         imports: [
           BrowserModule,
           RouterModule.forRoot(
               [{path: '**', component: TestCmpLegacyEnabled, resolve: {test: TestResolver}}],
               {useHash: true, initialNavigation: 'enabledNonBlocking'})
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

       platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
         const router: Router = res.injector.get(Router);
         expect(router.routerState.snapshot.root.firstChild).toBeNull();
         // ResolveEnd has not been emitted yet because bootstrap returned too early
         expect(log).toEqual([
           'TestModule', 'RootCmp', 'NavigationStart', 'RoutesRecognized', 'GuardsCheckStart',
           'ChildActivationStart', 'ActivationStart', 'GuardsCheckEnd', 'ResolveStart'
         ]);

         router.events.subscribe((e) => {
           if (e instanceof NavigationEnd) {
             done();
           }
         });
       });
     });

  it('should NOT wait for resolvers to complete when initialNavigation is not set', (done) => {
    @Component({selector: 'test', template: 'test'})
    class TestCmpLegacyEnabled {
    }

    @NgModule({
      imports: [
        BrowserModule,
        RouterModule.forRoot(
            [{path: '**', component: TestCmpLegacyEnabled, resolve: {test: TestResolver}}],
            {useHash: true})
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

    platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
      const router: Router = res.injector.get(Router);
      expect(router.routerState.snapshot.root.firstChild).toBeNull();
      // ResolveEnd has not been emitted yet because bootstrap returned too early
      expect(log).toEqual([
        'TestModule', 'RootCmp', 'NavigationStart', 'RoutesRecognized', 'GuardsCheckStart',
        'ChildActivationStart', 'ActivationStart', 'GuardsCheckEnd', 'ResolveStart'
      ]);

      router.events.subscribe((e) => {
        if (e instanceof NavigationEnd) {
          done();
        }
      });
    });
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
            {useHash: true, initialNavigation: 'disabled'})
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
     (done) => {
       @NgModule({
         imports: [BrowserModule, RouterModule.forRoot([], {useHash: true})],
         declarations: [SecondRootCmp, RootCmp],
         bootstrap: [RootCmp],
         providers: testProviders,
         schemas: [CUSTOM_ELEMENTS_SCHEMA]
       })
       class TestModule {
       }

       platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
         const router = res.injector.get(Router);
         spyOn(router as any, 'resetRootComponentType').and.callThrough();

         const appRef: ApplicationRef = res.injector.get(ApplicationRef);
         appRef.bootstrap(SecondRootCmp);

         expect((router as any).resetRootComponentType).not.toHaveBeenCalled();

         done();
       });
     });

  it('should reinit router navigation listeners if a previously bootstrapped root component is destroyed',
     (done) => {
       @NgModule({
         imports: [BrowserModule, RouterModule.forRoot([], {useHash: true})],
         declarations: [SecondRootCmp, RootCmp],
         bootstrap: [RootCmp],
         providers: testProviders,
         schemas: [CUSTOM_ELEMENTS_SCHEMA]
       })
       class TestModule {
       }

       platformBrowserDynamic([]).bootstrapModule(TestModule).then(res => {
         const router = res.injector.get(Router);
         spyOn(router as any, 'resetRootComponentType').and.callThrough();

         const appRef: ApplicationRef = res.injector.get(ApplicationRef);
         appRef.components[0].onDestroy(() => {
           appRef.bootstrap(SecondRootCmp);
           expect((router as any).resetRootComponentType).toHaveBeenCalled();
           done();
         });

         appRef.components[0].destroy();
       });
     });


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
              {path: 'fail', component: TallComponent, canActivate: ['returnFalse']}
            ],
            {
              useHash: true,
              scrollPositionRestoration: 'enabled',
              anchorScrolling: 'enabled',
              scrollOffset: [0, 100],
              onSameUrlNavigation: 'reload'
            })
      ],
      declarations: [TallComponent, RootCmp],
      bootstrap: [RootCmp],
      providers: [...testProviders, {provide: 'returnFalse', useValue: () => false}],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    class TestModule {
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
    expect(window.pageYOffset).toEqual(0);

    await router.navigateByUrl('/aa#marker2');
    expect(window.pageYOffset).toBeGreaterThanOrEqual(5900);
    expect(window.pageYOffset).toBeLessThan(6000);  // offset

    await router.navigateByUrl('/aa#marker3');
    expect(window.pageYOffset).toBeGreaterThanOrEqual(8900);
    expect(window.pageYOffset).toBeLessThan(9000);
  });

  it('should cleanup "popstate" and "hashchange" listeners', async () => {
    @NgModule({
      imports: [BrowserModule, RouterModule.forRoot([])],
      declarations: [RootCmp],
      bootstrap: [RootCmp],
      providers: testProviders,
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
      router.events.subscribe(() => {
        expect(router.getCurrentNavigation()?.id).toBeDefined();
      });
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
