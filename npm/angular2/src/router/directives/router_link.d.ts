import { Location } from 'angular2/platform/common';
import { Router } from '../router';
/**
 * The RouterLink directive lets you link to specific parts of your app.
 *
 * Consider the following route configuration:

 * ```
 * @RouteConfig([
 *   { path: '/user', component: UserCmp, as: 'User' }
 * ]);
 * class MyComp {}
 * ```
 *
 * When linking to this `User` route, you can write:
 *
 * ```
 * <a [routerLink]="['./User']">link to user component</a>
 * ```
 *
 * RouterLink expects the value to be an array of route names, followed by the params
 * for that level of routing. For instance `['/Team', {teamId: 1}, 'User', {userId: 2}]`
 * means that we want to generate a link for the `Team` route with params `{teamId: 1}`,
 * and with a child route `User` with params `{userId: 2}`.
 *
 * The first route name should be prepended with `/`, `./`, or `../`.
 * If the route begins with `/`, the router will look up the route from the root of the app.
 * If the route begins with `./`, the router will instead look in the current component's
 * children for the route. And if the route begins with `../`, the router will look at the
 * current component's parent.
 */
export declare class RouterLink {
    private _router;
    private _location;
    private _routeParams;
    visibleHref: string;
    target: string;
    private _navigationInstruction;
    constructor(_router: Router, _location: Location);
    private _updateLink();
    isRouteActive: boolean;
    routeParams: any[];
    onClick(): boolean;
}
