/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {provideLocationMocks} from '@angular/common/testing';
import {
  Compiler,
  Component,
  Injectable,
  InjectionToken,
  Injector,
  NgModule,
  NgModuleFactory,
  NgModuleRef,
  Type,
  EnvironmentInjector,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  PreloadAllModules,
  PreloadingStrategy,
  RouterPreloader,
  ROUTES,
  withPreloading,
  Route,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
  RouterModule,
} from '../index';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {catchError, filter, switchMap, take} from 'rxjs/operators';

import {provideRouter} from '../src/provide_router';
import {
  getLoadedComponent,
  getLoadedInjector,
  getLoadedRoutes,
  getProvidersInjector,
} from '../src/utils/config';
import {timeout} from './helpers';

describe('RouterPreloader', () => {
  @Component({
    template: '',
    standalone: false,
  })
  class LazyLoadedCmp {}

  describe('should properly handle', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideLocationMocks(),
          provideRouter(
            [{path: 'lazy', loadChildren: jasmine.createSpy('expected'), canLoad: [() => true]}],
            withPreloading(PreloadAllModules),
          ),
        ],
      });
    });

    it('being destroyed before expected', () => {
      const preloader = TestBed.inject(RouterPreloader);
      // Calling the RouterPreloader's ngOnDestroy method is done to simulate what would happen if
      // the containing NgModule is destroyed.
      expect(() => preloader.ngOnDestroy()).not.toThrow();
    });
  });

  describe('configurations with canLoad guard', () => {
    @NgModule({
      declarations: [LazyLoadedCmp],
      providers: [
        {
          provide: ROUTES,
          multi: true,
          useValue: [{path: 'LoadedModule1', component: LazyLoadedCmp}],
        },
      ],
    })
    class LoadedModule {}

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideLocationMocks(),
          provideRouter(
            [{path: 'lazy', loadChildren: () => LoadedModule, canLoad: [() => true]}],
            withPreloading(PreloadAllModules),
          ),
        ],
      });
    });

    it('should not load children', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      const router = TestBed.inject(Router);
      preloader.preload().subscribe(() => {});

      await timeout();

      const c = router.config;
      expect((c[0] as any)._loadedRoutes).not.toBeDefined();
    });

    it('should not call the preloading method because children will not be loaded anyways', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      const preloadingStrategy = TestBed.inject(PreloadingStrategy);
      spyOn(preloadingStrategy, 'preload').and.callThrough();
      preloader.preload().subscribe(() => {});

      await timeout();
      expect(preloadingStrategy.preload).not.toHaveBeenCalled();
    });
  });

  describe('should preload configurations', () => {
    let lazySpy: jasmine.Spy;
    beforeEach(() => {
      lazySpy = jasmine.createSpy('expected');
      TestBed.configureTestingModule({
        providers: [
          provideLocationMocks(),
          provideRouter([{path: 'lazy', loadChildren: lazySpy}], withPreloading(PreloadAllModules)),
        ],
      });
    });

    it('should work', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      const router = TestBed.inject(Router);
      const testModule = TestBed.inject(NgModuleRef) as any;
      const events: Array<RouteConfigLoadStart | RouteConfigLoadEnd> = [];
      @NgModule({
        declarations: [LazyLoadedCmp],
        imports: [RouterModule.forChild([{path: 'LoadedModule2', component: LazyLoadedCmp}])],
      })
      class LoadedModule2 {}

      @NgModule({
        imports: [
          RouterModule.forChild([{path: 'LoadedModule1', loadChildren: () => LoadedModule2}]),
        ],
      })
      class LoadedModule1 {}

      router.events.subscribe((e) => {
        if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
          events.push(e);
        }
      });

      lazySpy.and.returnValue(LoadedModule1);
      preloader.preload().subscribe(() => {});

      await timeout();

      const c = router.config;
      const injector: any = getLoadedInjector(c[0]);
      const loadedRoutes: Route[] = getLoadedRoutes(c[0])!;
      expect(loadedRoutes[0].path).toEqual('LoadedModule1');
      expect(injector.parent).toBe(testModule._r3Injector);

      const injector2: any = getLoadedInjector(loadedRoutes[0]);
      const loadedRoutes2: Route[] = getLoadedRoutes(loadedRoutes[0])!;
      expect(loadedRoutes2[0].path).toEqual('LoadedModule2');
      expect(injector2.parent).toBe(injector);

      expect(events.map((e) => e.toString())).toEqual([
        'RouteConfigLoadStart(path: lazy)',
        'RouteConfigLoadEnd(path: lazy)',
        'RouteConfigLoadStart(path: LoadedModule1)',
        'RouteConfigLoadEnd(path: LoadedModule1)',
      ]);
    });
  });

  it('should handle providers on a route', async () => {
    const TOKEN = new InjectionToken<string>('test token');
    const CHILD_TOKEN = new InjectionToken<string>('test token for child');

    @NgModule({
      imports: [RouterModule.forChild([{path: 'child', redirectTo: ''}])],
      providers: [{provide: CHILD_TOKEN, useValue: 'child'}],
    })
    class Child {}

    TestBed.configureTestingModule({
      providers: [
        provideLocationMocks(),
        provideRouter(
          [
            {
              path: 'parent',
              providers: [{provide: TOKEN, useValue: 'parent'}],
              loadChildren: () => Child,
            },
          ],
          withPreloading(PreloadAllModules),
        ),
      ],
    });

    TestBed.inject(RouterPreloader)
      .preload()
      .subscribe(() => {});

    await timeout();

    const parentConfig = TestBed.inject(Router).config[0];
    // preloading needs to create the injector
    const providersInjector = getProvidersInjector(parentConfig);
    expect(providersInjector).toBeDefined();
    // Throws error because there is no provider for CHILD_TOKEN here
    expect(() => providersInjector?.get(CHILD_TOKEN)).toThrow();

    const loadedInjector = getLoadedInjector(parentConfig)!;
    // // The loaded injector should be a child of the one created from providers
    expect(loadedInjector.get(TOKEN)).toEqual('parent');
    expect(loadedInjector.get(CHILD_TOKEN)).toEqual('child');
  });

  describe('should support modules that have already been loaded', () => {
    let lazySpy: jasmine.Spy;
    beforeEach(() => {
      lazySpy = jasmine.createSpy('expected');
      TestBed.configureTestingModule({
        providers: [
          provideLocationMocks(),
          provideRouter([{path: 'lazy', loadChildren: lazySpy}], withPreloading(PreloadAllModules)),
        ],
      });
    });

    it('should work', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      const router = TestBed.inject(Router);
      const testModule = TestBed.inject(NgModuleRef) as any;
      const compiler = TestBed.inject(Compiler);
      @NgModule()
      class LoadedModule2 {}

      const module2 = compiler.compileModuleSync(LoadedModule2).create(null);

      @NgModule({
        imports: [
          RouterModule.forChild([
            <Route>{
              path: 'LoadedModule2',
              loadChildren: jasmine.createSpy('no'),
              _loadedRoutes: [{path: 'LoadedModule3', loadChildren: () => LoadedModule3}],
              _loadedInjector: module2.injector,
            },
          ]),
        ],
      })
      class LoadedModule1 {}

      @NgModule({imports: [RouterModule.forChild([])]})
      class LoadedModule3 {}

      lazySpy.and.returnValue(LoadedModule1);
      preloader.preload().subscribe(() => {});

      await timeout();

      const c = router.config;

      const injector = getLoadedInjector(c[0]) as unknown as {parent: EnvironmentInjector};

      const loadedRoutes = getLoadedRoutes(c[0])!;
      expect(injector.parent).toBe(testModule._r3Injector);

      const loadedRoutes2: Route[] = getLoadedRoutes(loadedRoutes[0])!;
      const injector3 = getLoadedInjector(loadedRoutes2[0]) as unknown as {
        parent: EnvironmentInjector;
      };
      expect(injector3.parent).toBe(module2.injector);
    });
  });

  describe('should support preloading strategies', () => {
    let delayLoadUnPaused: BehaviorSubject<string[]>;
    let delayLoadObserver$: Observable<string[]>;
    let events: Array<RouteConfigLoadStart | RouteConfigLoadEnd>;

    const subLoadChildrenSpy = jasmine.createSpy('submodule');
    const lazyLoadChildrenSpy = jasmine.createSpy('lazymodule');

    const mockPreloaderFactory = (): PreloadingStrategy => {
      class DelayedPreLoad implements PreloadingStrategy {
        preload(route: Route, fn: () => Observable<unknown>): Observable<unknown> {
          const routeName = route.loadChildren
            ? (route.loadChildren as jasmine.Spy).and.identity
            : 'noChildren';
          return delayLoadObserver$.pipe(
            filter((unpauseList) => unpauseList.indexOf(routeName) !== -1),
            take(1),
            switchMap(() => {
              return fn().pipe(catchError(() => of(null)));
            }),
          );
        }
      }
      return new DelayedPreLoad();
    };

    @NgModule({
      declarations: [LazyLoadedCmp],
    })
    class SharedModule {}

    @NgModule({
      imports: [
        SharedModule,
        RouterModule.forChild([
          {path: 'LoadedModule1', component: LazyLoadedCmp},
          {path: 'sub', loadChildren: subLoadChildrenSpy},
        ]),
      ],
    })
    class LoadedModule1 {}

    @NgModule({
      imports: [
        SharedModule,
        RouterModule.forChild([{path: 'LoadedModule2', component: LazyLoadedCmp}]),
      ],
    })
    class LoadedModule2 {}

    beforeEach(() => {
      delayLoadUnPaused = new BehaviorSubject<string[]>([]);
      delayLoadObserver$ = delayLoadUnPaused.asObservable();
      subLoadChildrenSpy.calls.reset();
      lazyLoadChildrenSpy.calls.reset();
      TestBed.configureTestingModule({
        providers: [
          provideLocationMocks(),
          provideRouter([{path: 'lazy', loadChildren: lazyLoadChildrenSpy}]),
          {provide: PreloadingStrategy, useFactory: mockPreloaderFactory},
        ],
      });
      events = [];
    });

    it('without reloading loaded modules', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      const router = TestBed.inject(Router);
      router.events.subscribe((e) => {
        if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
          events.push(e);
        }
      });
      lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));

      // App start activation of preloader
      preloader.preload().subscribe((x) => {});
      await timeout();
      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(0);

      // Initial navigation cause route load
      router.navigateByUrl('/lazy/LoadedModule1');
      await timeout();
      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);

      // Secondary load or navigation should use same loaded object (
      //   ie this is a noop as the module should already be loaded)
      delayLoadUnPaused.next(['lazymodule']);
      await timeout();
      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
      expect(subLoadChildrenSpy).toHaveBeenCalledTimes(0);
      expect(events.map((e) => e.toString())).toEqual([
        'RouteConfigLoadStart(path: lazy)',
        'RouteConfigLoadEnd(path: lazy)',
      ]);
    });

    it('and cope with the loader throwing exceptions during module load but allow retry', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      const router = TestBed.inject(Router);
      router.events.subscribe((e) => {
        if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
          events.push(e);
        }
      });

      lazyLoadChildrenSpy.and.returnValue(
        throwError('Error: Fake module load error (expectedreload)'),
      );
      preloader.preload().subscribe((x) => {});
      await timeout();
      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(0);

      delayLoadUnPaused.next(['lazymodule']);
      await timeout();
      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);

      lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));
      router.navigateByUrl('/lazy/LoadedModule1').catch(() => {
        fail('navigation should not throw');
      });
      await timeout();
      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(2);
      expect(subLoadChildrenSpy).toHaveBeenCalledTimes(0);

      expect(events.map((e) => e.toString())).toEqual([
        'RouteConfigLoadStart(path: lazy)',
        'RouteConfigLoadStart(path: lazy)',
        'RouteConfigLoadEnd(path: lazy)',
      ]);
    });

    it('and cope with the loader throwing exceptions but allow retry', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      const router = TestBed.inject(Router);
      router.events.subscribe((e) => {
        if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
          events.push(e);
        }
      });

      lazyLoadChildrenSpy.and.returnValue(
        throwError('Error: Fake module load error (expectedreload)'),
      );
      preloader.preload().subscribe((x) => {});
      await timeout();
      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(0);

      router.navigateByUrl('/lazy/LoadedModule1').catch((reason) => {
        expect(reason).toEqual('Error: Fake module load error (expectedreload)');
      });
      await timeout();

      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
      lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));
      router.navigateByUrl('/lazy/LoadedModule1').catch(() => {
        fail('navigation should not throw');
      });
      await timeout();

      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(2);
      expect(subLoadChildrenSpy).toHaveBeenCalledTimes(0);
      expect(events.map((e) => e.toString())).toEqual([
        'RouteConfigLoadStart(path: lazy)',
        'RouteConfigLoadStart(path: lazy)',
        'RouteConfigLoadEnd(path: lazy)',
      ]);
    });

    it('without autoloading loading submodules', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      const router = TestBed.inject(Router);
      router.events.subscribe((e) => {
        if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
          events.push(e);
        }
      });

      lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));
      subLoadChildrenSpy.and.returnValue(of(LoadedModule2));

      preloader.preload().subscribe((x) => {});
      await timeout();
      router.navigateByUrl('/lazy/LoadedModule1');
      await timeout();
      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
      expect(subLoadChildrenSpy).toHaveBeenCalledTimes(0);
      expect(events.map((e) => e.toString())).toEqual([
        'RouteConfigLoadStart(path: lazy)',
        'RouteConfigLoadEnd(path: lazy)',
      ]);

      // Release submodule to check it does in fact load
      delayLoadUnPaused.next(['lazymodule', 'submodule']);
      await timeout();
      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
      expect(subLoadChildrenSpy).toHaveBeenCalledTimes(1);
      expect(events.map((e) => e.toString())).toEqual([
        'RouteConfigLoadStart(path: lazy)',
        'RouteConfigLoadEnd(path: lazy)',
        'RouteConfigLoadStart(path: sub)',
        'RouteConfigLoadEnd(path: sub)',
      ]);
    });

    it('and close the preload obsservable ', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      const router = TestBed.inject(Router);
      router.events.subscribe((e) => {
        if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
          events.push(e);
        }
      });

      lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));
      subLoadChildrenSpy.and.returnValue(of(LoadedModule2));
      const preloadSubscription = preloader.preload().subscribe((x) => {});

      router.navigateByUrl('/lazy/LoadedModule1');
      await timeout();
      delayLoadUnPaused.next(['lazymodule', 'submodule']);
      await timeout();

      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
      expect(subLoadChildrenSpy).toHaveBeenCalledTimes(1);
      expect(preloadSubscription.closed).toBeTruthy();
    });

    it('with overlapping loads from navigation and the preloader', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      const router = TestBed.inject(Router);
      router.events.subscribe((e) => {
        if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
          events.push(e);
        }
      });

      lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));
      subLoadChildrenSpy.and.returnValue(
        of(LoadedModule2).pipe(
          switchMap((v) => new Promise((r) => setTimeout(r, 5)).then(() => v)),
        ),
      );
      preloader.preload().subscribe((x) => {});
      await timeout();

      // Load the out modules at start of test and ensure it and only
      // it is loaded
      delayLoadUnPaused.next(['lazymodule']);
      await timeout();
      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
      expect(events.map((e) => e.toString())).toEqual([
        'RouteConfigLoadStart(path: lazy)',
        'RouteConfigLoadEnd(path: lazy)',
      ]);

      // Cause the load from router to start (has 5 tick delay)
      router.navigateByUrl('/lazy/sub/LoadedModule2');
      await timeout(); // T1
      // Cause the load from preloader to start
      delayLoadUnPaused.next(['lazymodule', 'submodule']);
      await timeout(); // T2

      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
      expect(subLoadChildrenSpy).toHaveBeenCalledTimes(1);
      await timeout(5); // T2 to T7 enough time for mutiple loads to finish

      expect(subLoadChildrenSpy).toHaveBeenCalledTimes(1);
      expect(events.map((e) => e.toString())).toEqual([
        'RouteConfigLoadStart(path: lazy)',
        'RouteConfigLoadEnd(path: lazy)',
        'RouteConfigLoadStart(path: sub)',
        'RouteConfigLoadEnd(path: sub)',
      ]);
    });

    it('cope with factory fail from broken modules', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      const router = TestBed.inject(Router);
      router.events.subscribe((e) => {
        if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
          events.push(e);
        }
      });

      class BrokenModuleFactory extends NgModuleFactory<unknown> {
        override moduleType: Type<unknown> = LoadedModule1;
        constructor() {
          super();
        }
        override create(_parentInjector: Injector | null): NgModuleRef<unknown> {
          throw 'Error: Broken module';
        }
      }

      lazyLoadChildrenSpy.and.returnValue(of(new BrokenModuleFactory()));
      preloader.preload().subscribe((x) => {});
      await timeout();
      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(0);

      router.navigateByUrl('/lazy/LoadedModule1').catch((reason) => {
        expect(reason).toEqual('Error: Broken module');
      });
      await timeout();

      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
      lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));
      router.navigateByUrl('/lazy/LoadedModule1').catch(() => {
        fail('navigation should not throw');
      });
      await timeout();

      expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(2);
      expect(subLoadChildrenSpy).toHaveBeenCalledTimes(0);
      expect(events.map((e) => e.toString())).toEqual([
        'RouteConfigLoadStart(path: lazy)',
        'RouteConfigLoadEnd(path: lazy)',
        'RouteConfigLoadStart(path: lazy)',
        'RouteConfigLoadEnd(path: lazy)',
      ]);
    });
  });

  describe('should ignore errors', () => {
    @NgModule({
      declarations: [LazyLoadedCmp],
      imports: [RouterModule.forChild([{path: 'LoadedModule1', component: LazyLoadedCmp}])],
    })
    class LoadedModule {}

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          {
            provide: ROUTES,
            multi: true,
            useValue: [
              {path: 'lazy1', loadChildren: jasmine.createSpy('expected1')},
              {path: 'lazy2', loadChildren: () => LoadedModule},
            ],
          },
          {provide: PreloadingStrategy, useExisting: PreloadAllModules},
        ],
      });
    });

    it('should work', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      const router = TestBed.inject(Router);
      preloader.preload().subscribe(() => {});

      await timeout();

      const c = router.config;
      expect(getLoadedRoutes(c[0])).not.toBeDefined();
      expect(getLoadedRoutes(c[1])).toBeDefined();
    });
  });

  describe('should copy loaded configs', () => {
    const configs = [{path: 'LoadedModule1', component: LazyLoadedCmp}];
    @NgModule({
      declarations: [LazyLoadedCmp],
      providers: [{provide: ROUTES, multi: true, useValue: configs}],
    })
    class LoadedModule {}

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideLocationMocks(),
          provideRouter(
            [{path: 'lazy1', loadChildren: () => LoadedModule}],
            withPreloading(PreloadAllModules),
          ),
        ],
      });
    });

    it('should work', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      const router = TestBed.inject(Router);
      preloader.preload().subscribe(() => {});

      await timeout();

      const c = router.config;
      expect(getLoadedRoutes(c[0])).toBeDefined();
      expect(getLoadedRoutes(c[0])).not.toBe(configs);
      expect(getLoadedRoutes(c[0])![0]).not.toBe(configs[0]);
      expect(getLoadedRoutes(c[0])![0].component).toBe(configs[0].component);
    });
  });

  describe("should work with lazy loaded modules that don't provide RouterModule.forChild()", () => {
    @NgModule({
      declarations: [LazyLoadedCmp],
      providers: [
        {
          provide: ROUTES,
          multi: true,
          useValue: [{path: 'LoadedModule1', component: LazyLoadedCmp}],
        },
      ],
    })
    class LoadedModule {}

    @NgModule({})
    class EmptyModule {}

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideLocationMocks(),
          provideRouter(
            [{path: 'lazyEmptyModule', loadChildren: () => EmptyModule}],
            withPreloading(PreloadAllModules),
          ),
        ],
      });
    });

    it('should work', async () => {
      const preloader = TestBed.inject(RouterPreloader);
      preloader.preload().subscribe();
    });
  });

  describe('should preload loadComponent configs', () => {
    let lazyComponentSpy: jasmine.Spy;
    beforeEach(() => {
      lazyComponentSpy = jasmine.createSpy('expected');
      TestBed.configureTestingModule({
        providers: [
          provideLocationMocks(),
          provideRouter(
            [{path: 'lazy', loadComponent: lazyComponentSpy}],
            withPreloading(PreloadAllModules),
          ),
        ],
      });
    });

    it('base case', async () => {
      @Component({template: ''})
      class LoadedComponent {}

      const preloader = TestBed.inject(RouterPreloader);
      lazyComponentSpy.and.returnValue(LoadedComponent);
      preloader.preload().subscribe(() => {});

      await timeout();

      const component = getLoadedComponent(TestBed.inject(Router).config[0]);
      expect(component).toEqual(LoadedComponent);
    });

    it('throws error when loadComponent is not standalone', async () => {
      @Component({template: '', standalone: false})
      class LoadedComponent {}
      @Injectable({providedIn: 'root'})
      class ErrorTrackingPreloadAllModules implements PreloadingStrategy {
        errors: Error[] = [];
        preload(route: Route, fn: () => Observable<unknown>): Observable<unknown> {
          return fn().pipe(
            catchError((e: Error) => {
              this.errors.push(e);
              return of(null);
            }),
          );
        }
      }

      TestBed.overrideProvider(PreloadingStrategy, {
        useFactory: () => new ErrorTrackingPreloadAllModules(),
      });
      const preloader = TestBed.inject(RouterPreloader);
      lazyComponentSpy.and.returnValue(LoadedComponent);
      preloader.preload().subscribe(() => {});

      await timeout();
      const strategy = TestBed.inject(PreloadingStrategy) as ErrorTrackingPreloadAllModules;
      expect(strategy.errors[0]?.message).toMatch(/.*lazy.*must be standalone/);
    });

    it('should recover from errors', async () => {
      @Component({template: ''})
      class LoadedComponent {}

      const preloader = TestBed.inject(RouterPreloader);
      lazyComponentSpy.and.returnValue(throwError('error loading chunk'));
      preloader.preload().subscribe(() => {});

      await timeout();

      const router = TestBed.inject(Router);
      const c = router.config;
      expect(lazyComponentSpy.calls.count()).toBe(1);
      expect(getLoadedComponent(c[0])).not.toBeDefined();

      lazyComponentSpy.and.returnValue(LoadedComponent);
      router.navigateByUrl('/lazy');
      await timeout();
      expect(lazyComponentSpy.calls.count()).toBe(2);
      expect(getLoadedComponent(c[0])).toBeDefined();
    });

    it('works when there is both loadComponent and loadChildren', async () => {
      @Component({template: ''})
      class LoadedComponent {}

      @NgModule({
        providers: [
          provideLocationMocks(),
          provideRouter([{path: 'child', component: LoadedComponent}]),
        ],
      })
      class LoadedModule {}

      const router = TestBed.inject(Router);
      router.config[0].loadChildren = () => LoadedModule;

      const preloader = TestBed.inject(RouterPreloader);
      lazyComponentSpy.and.returnValue(LoadedComponent);
      preloader.preload().subscribe(() => {});

      await timeout();

      const component = getLoadedComponent(router.config[0]);
      expect(component).toEqual(LoadedComponent);

      const childRoutes = getLoadedRoutes(router.config[0]);
      expect(childRoutes).toBeDefined();
      expect(childRoutes![0].path).toEqual('child');
    });

    it('loadComponent does not block loadChildren', async () => {
      @Component({template: ''})
      class LoadedComponent {}

      lazyComponentSpy.and.returnValue(
        of(LoadedComponent).pipe(
          switchMap((v) => new Promise((r) => setTimeout(r, 50)).then(() => v)),
        ),
      );

      @NgModule({
        providers: [
          provideLocationMocks(),
          provideRouter([
            {
              path: 'child',
              loadChildren: () =>
                of([{path: 'grandchild', children: []}]).pipe(
                  switchMap((v) => new Promise((r) => setTimeout(r, 1)).then(() => v)),
                ),
            },
          ]),
        ],
      })
      class LoadedModule {}

      const router = TestBed.inject(Router);
      const baseRoute = router.config[0];
      baseRoute.loadChildren = () =>
        of(LoadedModule).pipe(switchMap((v) => new Promise((r) => setTimeout(r, 1)).then(() => v)));

      const preloader = TestBed.inject(RouterPreloader);
      preloader.preload().subscribe(() => {});

      await timeout(1);
      // Loading should have started but not completed yet
      expect(getLoadedComponent(baseRoute)).not.toBeDefined();
      const childRoutes = getLoadedRoutes(baseRoute);
      expect(childRoutes).toBeDefined();
      // Loading should have started but not completed yet
      expect(getLoadedRoutes(childRoutes![0])).not.toBeDefined();

      await timeout(1);
      // Loading should have started but not completed yet
      expect(getLoadedComponent(baseRoute)).not.toBeDefined();
      expect(getLoadedRoutes(childRoutes![0])).toBeDefined();

      await timeout(50);
      expect(getLoadedComponent(baseRoute)).toBeDefined();
    });

    it('loads nested components', () => {
      @Component({template: ''})
      class LoadedComponent {}
      lazyComponentSpy.and.returnValue(LoadedComponent);

      TestBed.inject(Router).resetConfig([
        {
          path: 'a',
          loadComponent: lazyComponentSpy,
          children: [
            {
              path: 'b',
              loadComponent: lazyComponentSpy,
              children: [
                {
                  path: 'c',
                  loadComponent: lazyComponentSpy,
                  children: [
                    {
                      path: 'd',
                      loadComponent: lazyComponentSpy,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);

      const preloader = TestBed.inject(RouterPreloader);
      preloader.preload().subscribe(() => {});
      expect(lazyComponentSpy).toHaveBeenCalledTimes(4);
    });
  });
});
