/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Compiler, Component, NgModule, NgModuleFactoryLoader, NgModuleRef} from '@angular/core';
import {TestBed, fakeAsync, inject, tick} from '@angular/core/testing';

import {Route, RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterModule} from '../index';
import {LoadedRouterConfig} from '../src/config';
import {PreloadAllModules, PreloadingStrategy, RouterPreloader} from '../src/router_preloader';
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
               imports:
                   [RouterModule.forChild([{path: 'LoadedModule2', component: LazyLoadedCmp}])]
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

             const loadedConfig: LoadedRouterConfig = (c[0] as any)._loadedConfig !;
             const module: any = loadedConfig.module;
             expect(loadedConfig.routes[0].path).toEqual('LoadedModule1');
             expect(module._parent).toBe(testModule);

             const loadedConfig2: LoadedRouterConfig =
                 (loadedConfig.routes[0] as any)._loadedConfig !;
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

    it('should work', fakeAsync(inject(
                          [NgModuleFactoryLoader, RouterPreloader, Router, NgModuleRef, Compiler],
                          (loader: SpyNgModuleFactoryLoader, preloader: RouterPreloader,
                           router: Router, testModule: NgModuleRef<any>, compiler: Compiler) => {
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

                            const loadedConfig: LoadedRouterConfig = (c[0] as any)._loadedConfig !;
                            const module: any = loadedConfig.module;
                            expect(module._parent).toBe(testModule);

                            const loadedConfig2: LoadedRouterConfig =
                                (loadedConfig.routes[0] as any)._loadedConfig !;
                            const loadedConfig3: LoadedRouterConfig =
                                (loadedConfig2.routes[0] as any)._loadedConfig !;
                            const module3: any = loadedConfig3.module;
                            expect(module3._parent).toBe(module2);
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

             const c = router.config as{_loadedConfig: LoadedRouterConfig}[];
             expect(c[0]._loadedConfig).toBeDefined();
             expect(c[0]._loadedConfig !.routes).not.toBe(configs);
             expect(c[0]._loadedConfig !.routes[0]).not.toBe(configs[0]);
             expect(c[0]._loadedConfig !.routes[0].component).toBe(configs[0].component);
           })));
  });
});
