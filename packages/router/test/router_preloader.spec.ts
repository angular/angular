/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, Component, NgModule, NgModuleFactoryLoader, NgModuleRef} from '@angular/core';
import {resolveComponentResources} from '@angular/core/src/metadata/resource_loading';
import {fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {PreloadAllModules, PreloadingStrategy, RouterPreloader} from '@angular/router';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {catchError, filter, finalize, switchMap, take, tap} from 'rxjs/operators';

import {Route, RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterModule} from '../index';
import {LoadedRouterConfig} from '../src/config';
import {RouterTestingModule, SpyNgModuleFactoryLoader} from '../testing';

describe('RouterPreloader', () => {
  @Component({template: ''})
  class LazyLoadedCmp {
  }

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

  describe('should support preloading stratages', () => {
    let delayLoadUnPasued: BehaviorSubject<string[]>;
    let delayLoadObserver$: Observable<string[]>;
    let logMessages: string[];
    let events: Array<RouteConfigLoadStart|RouteConfigLoadEnd>;

    const buildPreloader =
        (delayObserver$: Observable<string[]>, messages: string[]): typeof PreloadingStrategy => {
          class DelayedPreLoad implements PreloadingStrategy {
            preload(route: Route, fn: () => Observable<any>): Observable<any> {
              messages.push(`Add route loader for ${route.loadChildren}`);
              return delayObserver$.pipe(
                  tap(unpauseList => messages.push(`list changed: ${unpauseList}`)),
                  filter(unpauseList => unpauseList.indexOf(route.loadChildren as string) !== -1),
                  tap(_ => {
                    // We can look at _loadedConfig but other PreloadingStrategy cannot as this is
                    // private
                    if ((route as any)._loadedConfig) {
                      messages.push(`Route ${route.loadChildren} already loaded`);
                    }
                  }),
                  take(1), tap(_ => messages.push(`Unpausing route ${route.loadChildren}`)),
                  switchMap(() => {
                    return fn().pipe(
                        tap(() => {
                          messages.push(`PreLoad returned value for ${route.loadChildren}`);
                        }),
                        finalize(() => {
                          messages.push(`Delayed preLoad for ${route.loadChildren} finalised`);
                        }),
                        catchError(() => of(null)),
                    );
                  }));
            }
          }
          return DelayedPreLoad;
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
          {path: 'sub', loadChildren: 'submodule'}
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
      delayLoadUnPasued = new BehaviorSubject<string[]>([]);
      delayLoadObserver$ = delayLoadUnPasued.asObservable();
      logMessages = new Array<string>();
      const OurDelayedPreLoad = buildPreloader(delayLoadObserver$, logMessages);

      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes([
          {path: 'lazy', loadChildren: 'expectedreload'},
        ])],
        providers: [{provide: PreloadingStrategy, useClass: OurDelayedPreLoad}]
      });

      events = [];
    });

    const corePreLoadingTest = (preloader: RouterPreloader, router: Router) => {
      let loadedConfig: LoadedRouterConfig;
      const c = router.config;
      expect(c[0].loadChildren).toEqual('expectedreload');
      loadedConfig = (c[0] as any)._loadedConfig!;
      expect(loadedConfig).toBeUndefined();

      const preloadSubscription = preloader.preload().subscribe((x) => {});

      tick();
      loadedConfig = (c[0] as any)._loadedConfig!;
      expect(loadedConfig).toBeUndefined();
      expect(logMessages).toEqual([
        'Add route loader for expectedreload',
        'list changed: ',
      ]);

      router.navigateByUrl('/lazy/LoadedModule1');
      tick();
      loadedConfig = (c[0] as any)._loadedConfig!;
      expect(loadedConfig).toBeDefined();
      expect(logMessages).toEqual([
        'Add route loader for expectedreload',
        'list changed: ',
      ]);

      delayLoadUnPasued.next(['expectedreload']);
      tick();
      expect(logMessages).toEqual([
        'Add route loader for expectedreload', 'list changed: ', 'list changed: expectedreload',
        'Route expectedreload already loaded', 'Unpausing route expectedreload',
        'Add route loader for submodule', 'list changed: expectedreload'
      ]);

      return preloadSubscription;
    };

    it('without reloading loaded modules',
       fakeAsync(inject(
           [NgModuleFactoryLoader, RouterPreloader, Router, NgModuleRef, Compiler],
           (loader: SpyNgModuleFactoryLoader, preloader: RouterPreloader, router: Router,
            testModule: NgModuleRef<any>, compiler: Compiler) => {
             router.events.subscribe(e => {
               if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
                 events.push(e);
               }
             });

             loader.stubbedModules = {expectedreload: LoadedModule1, submodule: LoadedModule2};

             corePreLoadingTest(preloader, router);

             expect(events.map(e => e.toString())).toEqual([
               'RouteConfigLoadStart(path: lazy)', 'RouteConfigLoadEnd(path: lazy)'
             ]);
           })));

    it('and cope with the loader throwing exceptions',
       fakeAsync(inject(
           [NgModuleFactoryLoader, RouterPreloader, Router, NgModuleRef, Compiler],
           (loader: SpyNgModuleFactoryLoader, preloader: RouterPreloader, router: Router,
            testModule: NgModuleRef<any>, compiler: Compiler) => {
             router.events.subscribe(e => {
               if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
                 events.push(e);
               }
             });

             loader.stubbedModules = {
               'expectedreload#error:1:Fake module load error (expectedreload)': LoadedModule1,
               submodule: LoadedModule2
             };

             let loadedConfig: LoadedRouterConfig;
             const c = router.config;
             expect(c[0].loadChildren).toEqual('expectedreload');
             loadedConfig = (c[0] as any)._loadedConfig;
             expect(loadedConfig).toBeUndefined();

             preloader.preload().subscribe((x) => {});

             tick();
             loadedConfig = (c[0] as any)._loadedConfig;
             expect(loadedConfig).toBeUndefined();
             expect(logMessages).toEqual([
               'Add route loader for expectedreload',
               'list changed: ',
             ]);

             router.navigateByUrl('/lazy/LoadedModule1').catch((reason) => {
               expect(reason).toEqual(Error('Fake module load error (expectedreload)'));
             });
             tick();
             loadedConfig = (c[0] as any)._loadedConfig;
             expect(loadedConfig).toBeUndefined();
             expect((c[0] as any)._loader$).toBeUndefined();

             router.navigateByUrl('/lazy/LoadedModule1').catch(() => {
               expect('Not to get here').toBeUndefined('Not to throw');
             });
             tick();

             expect(events.map(e => e.toString())).toEqual([
               'RouteConfigLoadStart(path: lazy)', 'RouteConfigLoadStart(path: lazy)',
               'RouteConfigLoadEnd(path: lazy)'
             ]);
           })));


    it('without autoloading loading submodules',
       fakeAsync(inject(
           [NgModuleFactoryLoader, RouterPreloader, Router, NgModuleRef, Compiler],
           (loader: SpyNgModuleFactoryLoader, preloader: RouterPreloader, router: Router,
            testModule: NgModuleRef<any>, compiler: Compiler) => {
             router.events.subscribe(e => {
               if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
                 events.push(e);
               }
             });

             loader.stubbedModules = {expectedreload: LoadedModule1, submodule: LoadedModule2};

             corePreLoadingTest(preloader, router);

             delayLoadUnPasued.next(['expectedreload', 'submodule']);
             tick();

             expect(logMessages).toEqual([
               'Add route loader for expectedreload',
               'list changed: ', 'list changed: expectedreload',
               'Route expectedreload already loaded', 'Unpausing route expectedreload',
               'Add route loader for submodule', 'list changed: expectedreload',
               'list changed: expectedreload,submodule', 'Unpausing route submodule',
               // 'PreLoad returned value for submodule',
               // 'PreLoad returned value for expectedreload',
               'Delayed preLoad for expectedreload finalised',
               'Delayed preLoad for submodule finalised'
             ]);

             expect(events.map(e => e.toString())).toEqual([
               'RouteConfigLoadStart(path: lazy)', 'RouteConfigLoadEnd(path: lazy)',
               'RouteConfigLoadStart(path: sub)', 'RouteConfigLoadEnd(path: sub)'
             ]);
           })));

    // This test is to check for the described fault in pr#265574
    it('and close the preload obsservable ',
       fakeAsync(inject(
           [NgModuleFactoryLoader, RouterPreloader, Router, NgModuleRef, Compiler],
           (loader: SpyNgModuleFactoryLoader, preloader: RouterPreloader, router: Router,
            testModule: NgModuleRef<any>, compiler: Compiler) => {
             router.events.subscribe(e => {
               if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
                 events.push(e);
               }
             });

             loader.stubbedModules = {expectedreload: LoadedModule1, submodule: LoadedModule2};

             const preloadSubscription = corePreLoadingTest(preloader, router);
             delayLoadUnPasued.next(['expectedreload', 'submodule']);
             tick();

             expect(preloadSubscription.closed).toBeTruthy();
           })));

    it('with overlapping loads from navigation and the preloader',
       fakeAsync(inject(
           [NgModuleFactoryLoader, RouterPreloader, Router, NgModuleRef, Compiler],
           (loader: SpyNgModuleFactoryLoader, preloader: RouterPreloader, router: Router,
            testModule: NgModuleRef<any>, compiler: Compiler) => {
             router.events.subscribe(e => {
               if (e instanceof RouteConfigLoadEnd || e instanceof RouteConfigLoadStart) {
                 events.push(e);
               }
             });

             loader.stubbedModules = {
               expectedreload: LoadedModule1,
               'submodule#delay:5': LoadedModule2
             };

             corePreLoadingTest(preloader, router);

             delayLoadUnPasued.next(['expectedreload', 'submodule']);
             tick();
             router.navigateByUrl('/lazy/sub/LoadedModule2');
             tick(5);

             expect(logMessages).toEqual([
               'Add route loader for expectedreload', 'list changed: ',
               'list changed: expectedreload', 'Route expectedreload already loaded',
               'Unpausing route expectedreload', 'Add route loader for submodule',
               'list changed: expectedreload', 'list changed: expectedreload,submodule',
               'Unpausing route submodule', 'Delayed preLoad for expectedreload finalised',
               'Delayed preLoad for submodule finalised'
             ]);

             expect(events.map(e => e.toString())).toEqual([
               'RouteConfigLoadStart(path: lazy)', 'RouteConfigLoadEnd(path: lazy)',
               'RouteConfigLoadStart(path: sub)', 'RouteConfigLoadEnd(path: sub)'
             ]);
           })));
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
});
