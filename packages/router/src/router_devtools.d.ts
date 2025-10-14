/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '@angular/core';
import { Router } from './router';
import { Route } from './models';
/**
 * Returns the loaded routes for a given route.
 */
export declare function getLoadedRoutes(route: Route): Route[] | undefined;
/**
 * Returns the Router instance from the given injector, or null if not available.
 */
export declare function getRouterInstance(injector: Injector): Router | null;
/**
 * Navigates the given router to the specified URL.
 * Throws if the provided router is not an Angular Router.
 */
export declare function navigateByUrl(router: Router, url: string): Promise<boolean>;
