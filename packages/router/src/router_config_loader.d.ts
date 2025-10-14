/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Compiler, EnvironmentInjector, InjectionToken, Injector, Type } from '@angular/core';
import { Observable } from 'rxjs';
import { LoadedRouterConfig, Route } from './models';
/**
 * The DI token for a router configuration.
 *
 * `ROUTES` is a low level API for router configuration via dependency injection.
 *
 * We recommend that in almost all cases to use higher level APIs such as `RouterModule.forRoot()`,
 * `provideRouter`, or `Router.resetConfig()`.
 *
 * @publicApi
 */
export declare const ROUTES: InjectionToken<Route[][]>;
export declare class RouterConfigLoader {
    private componentLoaders;
    private childrenLoaders;
    onLoadStartListener?: (r: Route) => void;
    onLoadEndListener?: (r: Route) => void;
    private readonly compiler;
    loadComponent(injector: EnvironmentInjector, route: Route): Observable<Type<unknown>>;
    loadChildren(parentInjector: Injector, route: Route): Observable<LoadedRouterConfig>;
}
/**
 * Executes a `route.loadChildren` callback and converts the result to an array of child routes and
 * an injector if that callback returned a module.
 *
 * This function is used for the route discovery during prerendering
 * in @angular-devkit/build-angular. If there are any updates to the contract here, it will require
 * an update to the extractor.
 */
export declare function loadChildren(route: Route, compiler: Compiler, parentInjector: Injector, onLoadEndListener?: (r: Route) => void): Observable<LoadedRouterConfig>;
