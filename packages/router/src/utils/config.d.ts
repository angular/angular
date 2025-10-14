/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentInjector, Type } from '@angular/core';
import { Route, Routes } from '../models';
import { ActivatedRouteSnapshot } from '../router_state';
/**
 * Creates an `EnvironmentInjector` if the `Route` has providers and one does not already exist
 * and returns the injector. Otherwise, if the `Route` does not have `providers`, returns the
 * `currentInjector`.
 *
 * @param route The route that might have providers
 * @param currentInjector The parent injector of the `Route`
 */
export declare function getOrCreateRouteInjectorIfNeeded(route: Route, currentInjector: EnvironmentInjector): EnvironmentInjector;
export declare function getLoadedRoutes(route: Route): Route[] | undefined;
export declare function getLoadedInjector(route: Route): EnvironmentInjector | undefined;
export declare function getLoadedComponent(route: Route): Type<unknown> | undefined;
export declare function getProvidersInjector(route: Route): EnvironmentInjector | undefined;
export declare function validateConfig(config: Routes, parentPath?: string, requireStandaloneComponents?: boolean): void;
export declare function assertStandalone(fullPath: string, component: Type<unknown> | undefined): void;
/** Returns the `route.outlet` or PRIMARY_OUTLET if none exists. */
export declare function getOutlet(route: Route): string;
/**
 * Sorts the `routes` such that the ones with an outlet matching `outletName` come first.
 * The order of the configs is otherwise preserved.
 */
export declare function sortByMatchingOutlets(routes: Routes, outletName: string): Routes;
/**
 * Gets the first injector in the snapshot's parent tree.
 *
 * If the `Route` has a static list of providers, the returned injector will be the one created from
 * those. If it does not exist, the returned injector may come from the parents, which may be from a
 * loaded config or their static providers.
 *
 * Returns `null` if there is neither this nor any parents have a stored injector.
 *
 * Generally used for retrieving the injector to use for getting tokens for guards/resolvers and
 * also used for getting the correct injector to use for creating components.
 */
export declare function getClosestRouteInjector(snapshot: ActivatedRouteSnapshot | undefined): EnvironmentInjector | null;
