/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, Component, Injector, NgModule, NgModuleFactory, NgModuleFactoryLoader, NgModuleRef, Type} from '@angular/core';
import {resolveComponentResources} from '@angular/core/src/metadata/resource_loading';
import {fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {PreloadAllModules, PreloadingStrategy, RouterPreloader} from '@angular/router';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {catchError, delay, filter, switchMap, take} from 'rxjs/operators';

import {Route, RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterModule} from '../index';
import {LoadedRouterConfig} from '../src/config';
import {RouterTestingModule, SpyNgModuleFactoryLoader} from '../testing';


describe('RouterPreloader', () => {
  @Component({template: ''})
  class LazyLoadedCmp {
  }

  describe('should properly handle', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes(
            [{path: 'lazy', loadChildren: 'expected', canLoad: ['someGuard']}])],
        providers: [{provide: PreloadingStrategy, useExisting: PreloadAllModules}]
      });
    });

    it('being destroyed before expected', () => {
      const preloader: RouterPreloader = TestBed.get(RouterPreloader);
      // Calling the RouterPreloader's ngOnDestroy method is done to simulate what would happen if
      // the containing NgModule is destroyed.
      expect(() => preloader.ngOnDestroy()).not.toThrow();
    });
  });

  describe('should not load configurations with canLoad guard', () => {
    @NgModule({
      declarations: [LazyLoadedCmp],
      imports: [RouterModule.forChild([{path: 'LoadedModule1', component: LazyLoadedCmp}])]
    })
    class LoadedModule {
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes(
            [{path: 'lazy', loadChildren: 'expected', canLoad: ['someGuard']}])],
        providers: [{provide: PreloadingStrategy, useExisting: PreloadAllModules}]
      });
    });


    it('should work',
       fakeAsync(inject(
           [NgModuleFactoryLoader, RouterPreloader, Router],
           (loader: SpyNgModuleFactoryLoader, preloader: RouterPreloader, router: Router) => {
             loader.stubbedModules = {expected: LoadedModule};

             preloader.preload().subscribe(() => {});

             tick();

             const c = router.config;
             expect((c[0] as any)._loadedConfig).not.toBeDefined();
           })));
  });

  describe('should preload configurations', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes([{path: 'lazy', loadChildren: 'expected'}])],
        providers: [{provide: PreloadingStrategy, useExisting: PreloadAllModules}]
      });
    });

    it('should work',
       fakeAsync(inject(
           [NgModuleFactoryLoader, RouterPreloader, Router, NgModuleRef],
           (loader: SpyNgModuleFactoryLoader, preloader: RouterPreloader, router: Router,
            testModule: NgModuleRef<any>) => {
             const events: Array<RouteConfigLoadStart|RouteConfigLoadEnd> = [];
             @NgModule({
               declarations: [LazyLoadedCmp],
               imports: [RouterModule.forChild([{path: 'LoadedModule2', component: LazyLoadedCmp}])]
             })
             class LoadedModule2 {
             }

             @NgModule({
               imports:
                   [RouterModule.forChild([{path: 'LoadedModule1', loadChildren: 'expected2'}])]
             })
             class LoadedModule1 {
             }

             router.events.subscribe(e => {
               if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
                 events.push(e);
               }
             });

             loader.stubbedModules = {
               expected: LoadedModule1,
               expected2: LoadedModule2,
             };

             preloader.preload().subscribe(() => {});

             tick();

             const c = router.config;
             expect(c[0].loadChildren).toEqual('expected');

             const loadedConfig: LoadedRouterConfig = (c[0] as any)._loadedConfig!;
             const module: any = loadedConfig.module;
             expect(loadedConfig.routes[0].path).toEqual('LoadedModule1');
             expect(module._parent).toBe(testModule);

             const loadedConfig2: LoadedRouterConfig =
                 (loadedConfig.routes[0] as any)._loadedConfig!;
             const module2: any = loadedConfig2.module;
             expect(loadedConfig2.routes[0].path).toEqual('LoadedModule2');
             expect(module2._parent).toBe(module);

             expect(events.map(e => e.toString())).toEqual([
               'RouteConfigLoadStart(path: lazy)',
               'RouteConfigLoadEnd(path: lazy)',
               'RouteConfigLoadStart(path: LoadedModule1)',
               'RouteConfigLoadEnd(path: LoadedModule1)',
             ]);
           })));
  });

  describe('should support modules that have already been loaded', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes([{path: 'lazy', loadChildren: 'expected'}])],
        providers: [{provide: PreloadingStrategy, useExisting: PreloadAllModules}]
      });
    });

    it('should work',
       fakeAsync(inject(
           [NgModuleFactoryLoader, RouterPreloader, Router, NgModuleRef, Compiler],
           (loader: SpyNgModuleFactoryLoader, preloader: RouterPreloader, router: Router,
            testModule: NgModuleRef<any>, compiler: Compiler) => {
             @NgModule()
             class LoadedModule2 {
             }

             const module2 = compiler.compileModuleSync(LoadedModule2).create(null);

             @NgModule({
               imports: [RouterModule.forChild([
                 <Route>{
                   path: 'LoadedModule2',
                   loadChildren: 'no',
                   _loadedConfig: {
                     routes: [{path: 'LoadedModule3', loadChildren: 'expected3'}],
                     module: module2,
                   }
                 },
               ])]
             })
             class LoadedModule1 {
             }

             @NgModule({imports: [RouterModule.forChild([])]})
             class LoadedModule3 {
             }

             loader.stubbedModules = {
               expected: LoadedModule1,
               expected3: LoadedModule3,
             };

             preloader.preload().subscribe(() => {});

             tick();

             const c = router.config;

             const loadedConfig: LoadedRouterConfig = (c[0] as any)._loadedConfig!;
             const module: any = loadedConfig.module;
             expect(module._parent).toBe(testModule);

             const loadedConfig2: LoadedRouterConfig =
                 (loadedConfig.routes[0] as any)._loadedConfig!;
             const loadedConfig3: LoadedRouterConfig =
                 (loadedConfig2.routes[0] as any)._loadedConfig!;
             const module3: any = loadedConfig3.module;
             expect(module3._parent).toBe(module2);
           })));
  });

  describe('should support preloading strategies', () => {
    let delayLoadUnPaused: BehaviorSubject<string[]>;
    let delayLoadObserver$: Observable<string[]>;
    let events: Array<RouteConfigLoadStart|RouteConfigLoadEnd>;

    const subLoadChildrenSpy = jasmine.createSpy('submodule');
    const lazyLoadChildrenSpy = jasmine.createSpy('lazymodule');

    const mockPreloaderFactory = (): PreloadingStrategy => {
      class DelayedPreLoad implements PreloadingStrategy {
        preload(route: Route, fn: () => Observable<any>): Observable<any> {
          const routeName =
              route.loadChildren ? (route.loadChildren as jasmine.Spy).and.identity : 'noChildren';
          return delayLoadObserver$.pipe(
              filter(unpauseList => unpauseList.indexOf(routeName) !== -1),
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
    class SharedModule {
    }

    @NgModule({
      imports: [
        SharedModule, RouterModule.forChild([
          {path: 'LoadedModule1', component: LazyLoadedCmp},
          {path: 'sub', loadChildren: subLoadChildrenSpy}
        ])
      ]
    })
    class LoadedModule1 {
    }

    @NgModule({
      imports:
          [SharedModule, RouterModule.forChild([{path: 'LoadedModule2', component: LazyLoadedCmp}])]
    })
    class LoadedModule2 {
    }

    beforeEach(() => {
      delayLoadUnPaused = new BehaviorSubject<string[]>([]);
      delayLoadObserver$ = delayLoadUnPaused.asObservable();
      subLoadChildrenSpy.calls.reset();
      lazyLoadChildrenSpy.calls.reset();
      TestBed.configureTestingModule({
        imports:
            [RouterTestingModule.withRoutes([{path: 'lazy', loadChildren: lazyLoadChildrenSpy}])],
        providers: [{provide: PreloadingStrategy, useFactory: mockPreloaderFactory}]
      });
      events = [];
    });

    it('without reloading loaded modules', fakeAsync(() => {
         const preloader = TestBed.inject(RouterPreloader);
         const router = TestBed.inject(Router);
         router.events.subscribe(e => {
           if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
             events.push(e);
           }
         });
         lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));

         // App start activation of preloader
         preloader.preload().subscribe((x) => {});
         tick();
         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(0);

         // Initial navigation cause route load
         router.navigateByUrl('/lazy/LoadedModule1');
         tick();
         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);

         // Secondary load or navigation should use same loaded object (
         //   ie this is a noop as the module should already be loaded)
         delayLoadUnPaused.next(['lazymodule']);
         tick();
         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
         expect(subLoadChildrenSpy).toHaveBeenCalledTimes(0);
         expect(events.map(e => e.toString())).toEqual([
           'RouteConfigLoadStart(path: lazy)', 'RouteConfigLoadEnd(path: lazy)'
         ]);
       }));

    it('and cope with the loader throwing exceptions during module load but allow retry',
       fakeAsync(() => {
         const preloader = TestBed.inject(RouterPreloader);
         const router = TestBed.inject(Router);
         router.events.subscribe(e => {
           if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
             events.push(e);
           }
         });

         lazyLoadChildrenSpy.and.returnValue(
             throwError('Error: Fake module load error (expectedreload)'));
         preloader.preload().subscribe((x) => {});
         tick();
         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(0);

         delayLoadUnPaused.next(['lazymodule']);
         tick();
         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);

         lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));
         router.navigateByUrl('/lazy/LoadedModule1').catch(() => {
           fail('navigation should not throw');
         });
         tick();
         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(2);
         expect(subLoadChildrenSpy).toHaveBeenCalledTimes(0);

         expect(events.map(e => e.toString())).toEqual([
           'RouteConfigLoadStart(path: lazy)', 'RouteConfigLoadStart(path: lazy)',
           'RouteConfigLoadEnd(path: lazy)'
         ]);
       }));

    it('and cope with the loader throwing exceptions but allow retry', fakeAsync(() => {
         const preloader = TestBed.inject(RouterPreloader);
         const router = TestBed.inject(Router);
         router.events.subscribe(e => {
           if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
             events.push(e);
           }
         });

         lazyLoadChildrenSpy.and.returnValue(
             throwError('Error: Fake module load error (expectedreload)'));
         preloader.preload().subscribe((x) => {});
         tick();
         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(0);

         router.navigateByUrl('/lazy/LoadedModule1').catch((reason) => {
           expect(reason).toEqual('Error: Fake module load error (expectedreload)');
         });
         tick();

         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
         lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));
         router.navigateByUrl('/lazy/LoadedModule1').catch(() => {
           fail('navigation should not throw');
         });
         tick();

         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(2);
         expect(subLoadChildrenSpy).toHaveBeenCalledTimes(0);
         expect(events.map(e => e.toString())).toEqual([
           'RouteConfigLoadStart(path: lazy)', 'RouteConfigLoadStart(path: lazy)',
           'RouteConfigLoadEnd(path: lazy)'
         ]);
       }));

    it('without autoloading loading submodules', fakeAsync(() => {
         const preloader = TestBed.inject(RouterPreloader);
         const router = TestBed.inject(Router);
         router.events.subscribe(e => {
           if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
             events.push(e);
           }
         });

         lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));
         subLoadChildrenSpy.and.returnValue(of(LoadedModule2));

         preloader.preload().subscribe((x) => {});
         tick();
         router.navigateByUrl('/lazy/LoadedModule1');
         tick();
         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
         expect(subLoadChildrenSpy).toHaveBeenCalledTimes(0);
         expect(events.map(e => e.toString())).toEqual([
           'RouteConfigLoadStart(path: lazy)', 'RouteConfigLoadEnd(path: lazy)'
         ]);

         // Release submodule to check it does in fact load
         delayLoadUnPaused.next(['lazymodule', 'submodule']);
         tick();
         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
         expect(subLoadChildrenSpy).toHaveBeenCalledTimes(1);
         expect(events.map(e => e.toString())).toEqual([
           'RouteConfigLoadStart(path: lazy)', 'RouteConfigLoadEnd(path: lazy)',
           'RouteConfigLoadStart(path: sub)', 'RouteConfigLoadEnd(path: sub)'
         ]);
       }));

    it('and close the preload obsservable ', fakeAsync(() => {
         const preloader = TestBed.inject(RouterPreloader);
         const router = TestBed.inject(Router);
         router.events.subscribe(e => {
           if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
             events.push(e);
           }
         });

         lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));
         subLoadChildrenSpy.and.returnValue(of(LoadedModule2));
         const preloadSubscription = preloader.preload().subscribe((x) => {});

         router.navigateByUrl('/lazy/LoadedModule1');
         tick();
         delayLoadUnPaused.next(['lazymodule', 'submodule']);
         tick();

         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
         expect(subLoadChildrenSpy).toHaveBeenCalledTimes(1);
         expect(preloadSubscription.closed).toBeTruthy();
       }));

    it('with overlapping loads from navigation and the preloader', fakeAsync(() => {
         const preloader = TestBed.inject(RouterPreloader);
         const router = TestBed.inject(Router);
         router.events.subscribe(e => {
           if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
             events.push(e);
           }
         });

         lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));
         subLoadChildrenSpy.and.returnValue(of(LoadedModule2).pipe(delay(5)));
         preloader.preload().subscribe((x) => {});
         tick();

         // Load the out modules at start of test and ensure it and only
         // it is loaded
         delayLoadUnPaused.next(['lazymodule']);
         tick();
         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
         expect(events.map(e => e.toString())).toEqual([
           'RouteConfigLoadStart(path: lazy)',
           'RouteConfigLoadEnd(path: lazy)',
         ]);

         // Cause the load from router to start (has 5 tick delay)
         router.navigateByUrl('/lazy/sub/LoadedModule2');
         tick();  // T1
         // Cause the load from preloader to start
         delayLoadUnPaused.next(['lazymodule', 'submodule']);
         tick();  // T2

         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
         expect(subLoadChildrenSpy).toHaveBeenCalledTimes(1);
         tick(5);  // T2 to T7 enough time for mutiple loads to finish

         expect(subLoadChildrenSpy).toHaveBeenCalledTimes(1);
         expect(events.map(e => e.toString())).toEqual([
           'RouteConfigLoadStart(path: lazy)', 'RouteConfigLoadEnd(path: lazy)',
           'RouteConfigLoadStart(path: sub)', 'RouteConfigLoadEnd(path: sub)'
         ]);
       }));

    it('cope with factory fail from broken modules', fakeAsync(() => {
         const preloader = TestBed.inject(RouterPreloader);
         const router = TestBed.inject(Router);
         router.events.subscribe(e => {
           if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
             events.push(e);
           }
         });

         class BrokenModuleFactory extends NgModuleFactory<any> {
           override moduleType: Type<any> = LoadedModule1;
           constructor() {
             super();
           }
           override create(_parentInjector: Injector|null): NgModuleRef<any> {
             throw 'Error: Broken module';
           }
         }

         lazyLoadChildrenSpy.and.returnValue(of(new BrokenModuleFactory()));
         preloader.preload().subscribe((x) => {});
         tick();
         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(0);

         router.navigateByUrl('/lazy/LoadedModule1').catch((reason) => {
           expect(reason).toEqual('Error: Broken module');
         });
         tick();

         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(1);
         lazyLoadChildrenSpy.and.returnValue(of(LoadedModule1));
         router.navigateByUrl('/lazy/LoadedModule1').catch(() => {
           fail('navigation should not throw');
         });
         tick();

         expect(lazyLoadChildrenSpy).toHaveBeenCalledTimes(2);
         expect(subLoadChildrenSpy).toHaveBeenCalledTimes(0);
         expect(events.map(e => e.toString())).toEqual([
           'RouteConfigLoadStart(path: lazy)', 'RouteConfigLoadEnd(path: lazy)',
           'RouteConfigLoadStart(path: lazy)', 'RouteConfigLoadEnd(path: lazy)'
         ]);
       }));
  });

  describe('should ignore errors', () => {
    @NgModule({
      declarations: [LazyLoadedCmp],
      imports: [RouterModule.forChild([{path: 'LoadedModule1', component: LazyLoadedCmp}])]
    })
    class LoadedModule {
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes([
          {path: 'lazy1', loadChildren: 'expected1'}, {path: 'lazy2', loadChildren: 'expected2'}
        ])],
        providers: [{provide: PreloadingStrategy, useExisting: PreloadAllModules}]
      });
    });


    it('should work',
       fakeAsync(inject(
           [NgModuleFactoryLoader, RouterPreloader, Router],
           (loader: SpyNgModuleFactoryLoader, preloader: RouterPreloader, router: Router) => {
             loader.stubbedModules = {expected2: LoadedModule};

             preloader.preload().subscribe(() => {});

             tick();

             const c = router.config;
             expect((c[0] as any)._loadedConfig).not.toBeDefined();
             expect((c[1] as any)._loadedConfig).toBeDefined();
           })));
  });

  describe('should copy loaded configs', () => {
    const configs = [{path: 'LoadedModule1', component: LazyLoadedCmp}];
    @NgModule({declarations: [LazyLoadedCmp], imports: [RouterModule.forChild(configs)]})
    class LoadedModule {
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes([{path: 'lazy1', loadChildren: 'expected'}])],
        providers: [{provide: PreloadingStrategy, useExisting: PreloadAllModules}]
      });
    });


    it('should work',
       fakeAsync(inject(
           [NgModuleFactoryLoader, RouterPreloader, Router],
           (loader: SpyNgModuleFactoryLoader, preloader: RouterPreloader, router: Router) => {
             loader.stubbedModules = {expected: LoadedModule};

             preloader.preload().subscribe(() => {});

             tick();

             const c = router.config as {_loadedConfig: LoadedRouterConfig}[];
             expect(c[0]._loadedConfig).toBeDefined();
             expect(c[0]._loadedConfig!.routes).not.toBe(configs);
             expect(c[0]._loadedConfig!.routes[0]).not.toBe(configs[0]);
             expect(c[0]._loadedConfig!.routes[0].component).toBe(configs[0].component);
           })));
  });

  describe(
      'should work with lazy loaded modules that don\'t provide RouterModule.forChild()', () => {
        @NgModule({
          declarations: [LazyLoadedCmp],
          imports: [RouterModule.forChild([{path: 'LoadedModule1', component: LazyLoadedCmp}])]
        })
        class LoadedModule {
        }

        @NgModule({})
        class EmptyModule {
        }

        beforeEach(() => {
          TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(
                [{path: 'lazyEmptyModule', loadChildren: 'expected2'}])],
            providers: [{provide: PreloadingStrategy, useExisting: PreloadAllModules}]
          });
        });

        it('should work',
           fakeAsync(inject(
               [NgModuleFactoryLoader, RouterPreloader],
               (loader: SpyNgModuleFactoryLoader, preloader: RouterPreloader) => {
                 loader.stubbedModules = {expected2: EmptyModule};

                 preloader.preload().subscribe();
               })));
      });
});
