/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { RouteReuseStrategy } from './route_reuse_strategy';
import { RouterState, RouterStateSnapshot } from './router_state';
export declare function createRouterState(routeReuseStrategy: RouteReuseStrategy, curr: RouterStateSnapshot, prevState: RouterState): RouterState;
