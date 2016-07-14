/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';

/**
 * An interface a class can implement to be a guard deciding if a route can be activated.
 *
 * ### Example
 *
 * ```
 * @Injectable()
 * class CanActivateTeam implements CanActivate {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<boolean> {
 *     return this.permissions.canActivate(this.currentUser, this.route.params.id);
 *   }
 * }
 *
 * bootstrap(AppComponent, [
 *   CanActivateTeam,
 *
 *   provideRouter([{
 *     path: 'team/:id',
 *     component: Team,
 *     canActivate: [CanActivateTeam]
 *   }])
 * ]);
 * ```
 *
 * You can also provide a function with the same signature instead of the class:
 *
 * ```
 * bootstrap(AppComponent, [
 *   {provide: 'canActivateTeam', useValue: (route: ActivatedRouteSnapshot, state:
 * RouterStateSnapshot) => true},
 *   provideRouter([{
 *     path: 'team/:id',
 *     component: Team,
 *     canActivate: ['canActivateTeam']
 *   }])
 * ]);
 * ```
 *
 * @stable
 */
export interface CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
      Observable<boolean>|Promise<boolean>|boolean;
}

/**
 * An interface a class can implement to be a guard deciding if a child route can be activated.
 *
 * ### Example
 *
 * ```
 * @Injectable()
 * class CanActivateTeam implements CanActivate {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<boolean>
 * {
 *     return this.permissions.canActivate(this.currentUser, this.route.params.id);
 *   }
 * }
 *
 * bootstrap(AppComponent, [
 *   CanActivateTeam,
 *
 *   provideRouter([
 *     {
 *       path: 'root',
 *       canActivateChild: [CanActivateTeam],
 *       children: [
 *        {
 *          path: 'team/:id',
 *          component: Team
 *        }
 *      ]
 *    }
 * ]);
 * ```
 *
 * You can also provide a function with the same signature instead of the class:
 *
 * ```
 * bootstrap(AppComponent, [
 *   {provide: 'canActivateTeam', useValue: (route: ActivatedRouteSnapshot, state:
 * RouterStateSnapshot) => true},
 *   provideRouter([
 *     {
 *       path: 'root',
 *       canActivateChild: [CanActivateTeam],
 *       children: [
 *        {
 *          path: 'team/:id',
 *          component: Team
 *        }
 *      ]
 *    }
 * ]);
 * ```
 *
 * @stable
 */

export interface CanActivateChild {
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot):
      Observable<boolean>|Promise<boolean>|boolean;
}

/**
 * An interface a class can implement to be a guard deciding if a route can be deactivated.
 *
 * ### Example
 *
 * ```
 * @Injectable()
 * class CanDeactivateTeam implements CanDeactivate {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<boolean> {
 *     return this.permissions.canDeactivate(this.currentUser, this.route.params.id);
 *   }
 * }
 *
 * bootstrap(AppComponent, [
 *   CanDeactivateTeam,
 *
 *   provideRouter([{
 *     path: 'team/:id',
 *     component: Team,
 *     canDeactivate: [CanDeactivateTeam]
 *   }])
 * ]);
 * ```
 *
 * You can also provide a function with the same signature instead of the class:
 *
 * ```
 * bootstrap(AppComponent, [
 *   {provide: 'canDeactivateTeam', useValue: (route: ActivatedRouteSnapshot, state:
 * RouterStateSnapshot) => true},
 *   provideRouter([{
 *     path: 'team/:id',
 *     component: Team,
 *     canActivate: ['canDeactivateTeam']
 *   }])
 * ]);
 * ```
 *
 * @stable
 */
export interface CanDeactivate<T> {
  canDeactivate(component: T, route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
      Observable<boolean>|Promise<boolean>|boolean;
}

/**
 * An interface a class can implement to be a data provider.
 *
 * ### Example
 *
 * ```
 * @Injectable()
 * class TeamResolver implements Resolve {
 *   constructor(private backend: Backend) {}
 *
 *   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<any> {
 *     return this.backend.fetchTeam(this.route.params.id);
 *   }
 * }
 *
 * bootstrap(AppComponent, [
 *   TeamResolver,
 *
 *   provideRouter([{
 *     path: 'team/:id',
 *     component: TeamCmp,
 *     resolve: {
 *       team: TeamResolver
 *     }
 *   }])
 * ]);
 * ```
 *
 * You can also provide a function with the same signature instead of the class.
 *
 * @experimental
 */
export interface Resolve<T> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
      Observable<any>|Promise<any>|any;
}
