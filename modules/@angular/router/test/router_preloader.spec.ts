/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule, NgModuleFactoryLoader} from '@angular/core';
import {TestBed, fakeAsync, inject, tick} from '@angular/core/testing';

import {Router, RouterModule} from '../index';
import {PreloadAllModules, PreloadingStrategy, RouterPreloader} from '../src/router_preloader';
import {RouterTestingModule, SpyNgModuleFactoryLoader} from '../testing';

describe('RouterPreloader', () => {
  @Component({template: ''})
  class LazyLoadedCmp {
  }

  @Component({})
  class BlankCmp {
  }

  describe('should preload configurations', () => {
    @NgModule({
      declarations: [LazyLoadedCmp],
      imports: [RouterModule.forChild([{path: 'LoadedModule2', component: LazyLoadedCmp}])]
    })
    class LoadedModule2 {
    }

    @NgModule(
        {imports: [RouterModule.forChild([{path: 'LoadedModule1', loadChildren: 'expected2'}])]})
    class LoadedModule1 {
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes([{path: 'lazy', loadChildren: 'expected'}])],
        providers: [{provide: PreloadingStrategy, useExisting: PreloadAllModules}]
      });
    });

    it('should work',
       fakeAsync(inject(
           [NgModuleFactoryLoader, RouterPreloader, Router],
           (loader: SpyNgModuleFactoryLoader, preloader: RouterPreloader, router: Router) => {
             loader.stubbedModules = {expected: LoadedModule1, expected2: LoadedModule2};

             preloader.preload().subscribe(() => {});

             tick();

             const c = router.config;
             expect(c[0].loadChildren).toEqual('expected');

             const loaded: any = (<any>c[0])._loadedConfig.routes;
             expect(loaded[0].path).toEqual('LoadedModule1');

             const loaded2: any = (<any>loaded[0])._loadedConfig.routes;
             expect(loaded2[0].path).toEqual('LoadedModule2');
           })));
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
             expect(!!((<any>c[0])._loadedConfig)).toBe(false);
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
             expect(!!((<any>c[0])._loadedConfig)).toBe(false);
             expect(!!((<any>c[1])._loadedConfig)).toBe(true);
           })));
  });
});
