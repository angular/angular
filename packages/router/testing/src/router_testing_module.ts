/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location, LocationStrategy} from '@angular/common';
import {MockLocationStrategy, SpyLocation} from '@angular/common/testing';
import {Compiler, Injectable, Injector, ModuleWithProviders, NgModule, NgModuleFactory, NgModuleFactoryLoader, Optional} from '@angular/core';
import {ChildrenOutletContexts, ExtraOptions, NoPreloading, PreloadingStrategy, provideRoutes, Route, Router, ROUTER_CONFIGURATION, RouterModule, ROUTES, Routes, UrlHandlingStrategy, UrlSerializer, ɵflatten as flatten, ɵROUTER_PROVIDERS as ROUTER_PROVIDERS} from '@angular/router';



/**
 * @description
 *
 * Allows to simulate the loading of ng modules in tests.
 *
 * ```
 * const loader = TestBed.inject(NgModuleFactoryLoader);
 *
 * @Component({template: 'lazy-loaded'})
 * class LazyLoadedComponent {}
 * @NgModule({
 *   declarations: [LazyLoadedComponent],
 *   imports: [RouterModule.forChild([{path: 'loaded', component: LazyLoadedComponent}])]
 * })
 *
 * class LoadedModule {}
 *
 * // sets up stubbedModules
 * loader.stubbedModules = {
 *    lazyModule: LoadedModule,
 *    'slowModule#delay:5000' LoadedModule,
 *    'brokenModule#error:1:broken load message' null,
 * };
 *
 * router.resetConfig([
 *   {path: 'lazy', loadChildren: 'lazyModule'},
 *   {path: 'slow-load', loadChildren: 'slowModule'},
 *   {path: 'fail-first-load', loadChildren: 'brokenModule'},
 * ]);
 *
 * //One of the following
 * router.navigateByUrl('/lazy/loaded'); //
 * router.navigateByUrl('/slow-load/loaded'); // This routes module would take 5s to load
 * router.navigateByUrl('/fail-first-load/loaded'); // This routes will faill the first time called
 *                                                  // with message 'broken load message';
 * ```
 *
 * @publicApi
 */
@Injectable()
export class SpyNgModuleFactoryLoader implements NgModuleFactoryLoader {
  /**
   * @docsNotRequired
   */
  private _stubbedModules:
      {[path: string]: {module: any, postFn: (m: any) => Promise<NgModuleFactory<any>>}} = {};

  /**
   * @docsNotRequired
   */
  set stubbedModules(modules: {[path: string]: any}) {
    const res: {[path: string]: any} = {};
    for (const t of Object.keys(modules)) {
      const [fn, strippedPath] = this.buildPathFunctions((_) => {
        return _;
      }, t);
      res[strippedPath] = {module: this.compiler.compileModuleAsync(modules[t]), postFn: fn};
    }
    this._stubbedModules = res;
  }

  /**
   * @docsNotRequired
   */
  get stubbedModules(): {[path: string]: any} {
    return this._stubbedModules;
  }

  constructor(private compiler: Compiler) {}


  private buildPathFunctions(fn: (m: any) => Promise<NgModuleFactory<any>>, path: string):
      [(m: any) => Promise<NgModuleFactory<any>>, string] {
    const pathParts = path.split('#');
    return pathParts.slice(1).reduce((last, pathPart, partIndex) => {
      let internediateFn = last[0];
      let internediatePath = last[1];

      if (pathPart.startsWith('error:')) {
        const fnParts = pathPart.slice(6).split(':');

        internediateFn = this.ErrorPromiseFn(
            internediateFn, parseInt(fnParts[0] || '0'), fnParts.slice(1).join(':'));

      } else if (pathPart.startsWith('delay:')) {
        internediateFn = this.delayPromiseFn(internediateFn, parseInt(pathPart.split(':')[1]));

      } else {
        internediatePath += `#${pathPart}`;
      }

      return [internediateFn, internediatePath];
    }, [fn, pathParts.splice(0, 1)[0]]);
  }

  private ErrorPromiseFn(postFn: (x: any) => any, count: number, message: string):
      (m: any) => Promise<any> {
    let delay = count || -1;

    return (m: any) => {
      const error = delay > 0 || delay < 0;
      delay > 0 ? --delay : 0;
      return error ?
          <any>Promise.reject(new Error(message || `Fake module load error : ${delay}`)) :
          postFn(m);
    };
  }

  private delayPromiseFn(postFn: (x: any) => any, ms: number): (m: any) => Promise<any> {
    return (m: any) => {
      return new Promise((_) => setTimeout(_, ms, m)).then((_) => postFn(_));
    };
  }

  load(path: string): Promise<NgModuleFactory<any>> {
    if (this._stubbedModules[path]) {
      return this._stubbedModules[path].postFn(this._stubbedModules[path].module);
    } else {
      return <any>Promise.reject(new Error(`Cannot find module ${path}`));
    }
  }
}

function isUrlHandlingStrategy(opts: ExtraOptions|
                               UrlHandlingStrategy): opts is UrlHandlingStrategy {
  // This property check is needed because UrlHandlingStrategy is an interface and doesn't exist at
  // runtime.
  return 'shouldProcessUrl' in opts;
}

/**
 * Router setup factory function used for testing.
 *
 * @publicApi
 */
export function setupTestingRouter(
    urlSerializer: UrlSerializer, contexts: ChildrenOutletContexts, location: Location,
    loader: NgModuleFactoryLoader, compiler: Compiler, injector: Injector, routes: Route[][],
    opts?: ExtraOptions, urlHandlingStrategy?: UrlHandlingStrategy): Router;

/**
 * Router setup factory function used for testing.
 *
 * @deprecated As of v5.2. The 2nd-to-last argument should be `ExtraOptions`, not
 * `UrlHandlingStrategy`
 * @publicApi
 */
export function setupTestingRouter(
    urlSerializer: UrlSerializer, contexts: ChildrenOutletContexts, location: Location,
    loader: NgModuleFactoryLoader, compiler: Compiler, injector: Injector, routes: Route[][],
    urlHandlingStrategy?: UrlHandlingStrategy): Router;

/**
 * Router setup factory function used for testing.
 *
 * @publicApi
 */
export function setupTestingRouter(
    urlSerializer: UrlSerializer, contexts: ChildrenOutletContexts, location: Location,
    loader: NgModuleFactoryLoader, compiler: Compiler, injector: Injector, routes: Route[][],
    opts?: ExtraOptions|UrlHandlingStrategy, urlHandlingStrategy?: UrlHandlingStrategy) {
  const router = new Router(
      null!, urlSerializer, contexts, location, injector, loader, compiler, flatten(routes));
  if (opts) {
    // Handle deprecated argument ordering.
    if (isUrlHandlingStrategy(opts)) {
      router.urlHandlingStrategy = opts;
    } else {
      // Handle ExtraOptions

      if (opts.malformedUriErrorHandler) {
        router.malformedUriErrorHandler = opts.malformedUriErrorHandler;
      }

      if (opts.paramsInheritanceStrategy) {
        router.paramsInheritanceStrategy = opts.paramsInheritanceStrategy;
      }
    }
  }

  if (urlHandlingStrategy) {
    router.urlHandlingStrategy = urlHandlingStrategy;
  }
  return router;
}

/**
 * @description
 *
 * Sets up the router to be used for testing.
 *
 * The modules sets up the router to be used for testing.
 * It provides spy implementations of `Location`, `LocationStrategy`, and {@link
 * NgModuleFactoryLoader}.
 *
 * @usageNotes
 * ### Example
 *
 * ```
 * beforeEach(() => {
 *   TestBed.configureTestModule({
 *     imports: [
 *       RouterTestingModule.withRoutes(
 *         [{path: '', component: BlankCmp}, {path: 'simple', component: SimpleCmp}]
 *       )
 *     ]
 *   });
 * });
 * ```
 *
 * @publicApi
 */
@NgModule({
  exports: [RouterModule],
  providers: [
    ROUTER_PROVIDERS, {provide: Location, useClass: SpyLocation},
    {provide: LocationStrategy, useClass: MockLocationStrategy},
    {provide: NgModuleFactoryLoader, useClass: SpyNgModuleFactoryLoader}, {
      provide: Router,
      useFactory: setupTestingRouter,
      deps: [
        UrlSerializer, ChildrenOutletContexts, Location, NgModuleFactoryLoader, Compiler, Injector,
        ROUTES, ROUTER_CONFIGURATION, [UrlHandlingStrategy, new Optional()]
      ]
    },
    {provide: PreloadingStrategy, useExisting: NoPreloading}, provideRoutes([])
  ]
})
export class RouterTestingModule {
  static withRoutes(routes: Routes, config?: ExtraOptions):
      ModuleWithProviders<RouterTestingModule> {
    return {
      ngModule: RouterTestingModule,
      providers: [
        provideRoutes(routes),
        {provide: ROUTER_CONFIGURATION, useValue: config ? config : {}},
      ]
    };
  }
}
