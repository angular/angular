/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Route } from '../../../protocol';
import type { Route as AngularRoute } from '@angular/router';
export type RoutePropertyType = RouteGuard | 'providers' | 'component';
export type RouteGuard = 'canActivate' | 'canActivateChild' | 'canDeactivate' | 'canMatch';
type Router = any;
export declare function parseRoutes(router: Router): Route;
/**
 *  Get the element reference by type & name from the routes array. Called recursively to search through all children.
 * @param type - type of element to search for (canActivate, canActivateChild, canDeactivate, canLoad, providers)
 * @param routes - array of routes to search through
 * @param name - name of the element to search for refers to the name of the guard or provider
 * @returns - the element reference if found, otherwise null
 */
export declare function getElementRefByName(type: RoutePropertyType, routes: AngularRoute[], name: string): any | null;
/**
 *  Get the componet reference by name from the routes array. Called recursively to search through all children.
 * @param routes - array of routes to search through
 * @param name - name of the component to search for
 * @returns - the element reference if found, otherwise null
 */
export declare function getComponentRefByName(routes: AngularRoute[], name: string): any | null;
export {};
