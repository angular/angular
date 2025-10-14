/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { MonoTypeOperatorFunction } from 'rxjs';
import { Event } from '../events';
import type { NavigationTransition } from '../navigation_transition';
import type { RouteReuseStrategy } from '../route_reuse_strategy';
import type { ChildrenOutletContexts } from '../router_outlet_context';
import { RouterState } from '../router_state';
export declare const activateRoutes: (rootContexts: ChildrenOutletContexts, routeReuseStrategy: RouteReuseStrategy, forwardEvent: (evt: Event) => void, inputBindingEnabled: boolean) => MonoTypeOperatorFunction<NavigationTransition>;
export declare class ActivateRoutes {
    private routeReuseStrategy;
    private futureState;
    private currState;
    private forwardEvent;
    private inputBindingEnabled;
    constructor(routeReuseStrategy: RouteReuseStrategy, futureState: RouterState, currState: RouterState, forwardEvent: (evt: Event) => void, inputBindingEnabled: boolean);
    activate(parentContexts: ChildrenOutletContexts): void;
    private deactivateChildRoutes;
    private deactivateRoutes;
    private deactivateRouteAndItsChildren;
    private detachAndStoreRouteSubtree;
    private deactivateRouteAndOutlet;
    private activateChildRoutes;
    private activateRoutes;
}
