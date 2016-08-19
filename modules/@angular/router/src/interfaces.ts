/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';

import {Route} from './config';
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
 *   canActivate(
 *     route: ActivatedRouteSnapshot,
 *     state: RouterStateSnapshot
 *   ): Observable<boolean>|Promise<boolean>|boolean {
 *     return this.permissions.canActivate(this.currentUser, route.params.id);
 *   }
 * }
 *
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamCmp,
 *         canActivate: [CanActivateTeam]
 *       }
 *     ])
 *   ],
 *   providers: [CanActivateTeam]
 * })
 * ```
 *
 * You can also provide a function with the same signature instead of the class:
 *
 * ```
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamCmp,
 *         canActivate: ['canActivateTeam']
 *       }
 *     ])
 *   ],
 *   providers: [
 *     {
 *       provide: 'canActivateTeam',
 *       useValue: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => true
 *     }
 *   ]
 * })
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
 *   canActivateChild(
 *     route: ActivatedRouteSnapshot,
 *     state: RouterStateSnapshot
 *   ): Observable<boolean>|Promise<boolean>|boolean {
 *     return this.permissions.canActivate(this.currentUser, route.params.id);
 *   }
 * }
 *
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'root',
 *         canActivateChild: [CanActivateTeam],
 *         children: [
 *           {
 *              path: 'team/:id',
 *              component: Team
 *           }
 *         ]
 *       }
 *     ])
 *   ],
 *   providers: [CanActivateTeam]
 * })
 * ```
 *
 * You can also provide a function with the same signature instead of the class:
 *
 * ```
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'root',
 *         canActivateChild: ['canActivateTeam'],
 *         children: [
 *           {
 *             path: 'team/:id',
 *             component: Team
 *           }
 *         ]
 *       }
 *     ])
 *   ],
 *   providers: [
 *     {
 *       provide: 'canActivateTeam',
 *       useValue: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => true
 *     }
 *   ]
 * })
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
 * class CanDeactivateTeam implements CanDeactivate<TeamComponent> {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canDeactivate(
 *     component: TeamComponent,
 *     route: ActivatedRouteSnapshot,
 *     state: RouterStateSnapshot
 *   ): Observable<boolean>|Promise<boolean>|boolean {
 *     return this.permissions.canDeactivate(this.currentUser, route.params.id);
 *   }
 * }
 *
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamCmp,
 *         canDeactivate: [CanDeactivateTeam]
 *       }
 *     ])
 *   ],
 *   providers: [CanDeactivateTeam]
 * })
 * ```
 *
 * You can also provide a function with the same signature instead of the class:
 *
 * ```
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamCmp,
 *         canActivate: ['canDeactivateTeam']
 *       }
 *     ])
 *   ],
 *   providers: [
 *     {
 *       provide: 'canDeactivateTeam',
 *       useValue: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => true
 *     }
 *   ]
 * })
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
 * class TeamResolver implements Resolve<Team> {
 *   constructor(private backend: Backend) {}
 *
 *   resolve(
 *     route: ActivatedRouteSnapshot,
 *     state: RouterStateSnapshot
 *   ): Observable<any>|Promise<any>|any {
 *     return this.backend.fetchTeam(route.params.id);
 *   }
 * }
 *
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamCmp,
 *         resolve: {
 *           team: TeamResolver
 *         }
 *       }
 *     ])
 *   ],
 *   providers: [TeamResolver]
 * })
 * ```
 *
 * You can also provide a function with the same signature instead of the class.
 *
 * ```
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamCmp,
 *         resolve: {
 *           team: 'teamResolver'
 *         }
 *       }
 *     ])
 *   ],
 *   providers: [
 *     {
 *       provide: 'teamResolver',
 *       useValue: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => 'team'
 *     }
 *   ]
 * })
 * ```
 * @stable
 */
export interface Resolve<T> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
      Observable<any>|Promise<any>|any;
}


/**
 * An interface a class can implement to be a guard deciding if a children can be loaded.
 *
 * ### Example
 *
 * ```
 * @Injectable()
 * class CanLoadTeamSection implements CanLoad {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canLoad(route: Route(
 *     route: Route
 *   ): Observable<boolean>|Promise<boolean>|boolean {
 *     return this.permissions.canLoadChildren(this.currentUser, route);
 *   }
 * }
 *
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamCmp,
 *         loadChildren: 'team.js',
 *         canLoad: [CanLoadTeamSection]
 *       }
 *     ])
 *   ],
 *   providers: [CanLoadTeamSection]
 * })
 * ```
 *
 * You can also provide a function with the same signature instead of the class:
 *
 * ```
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamCmp,
 *         loadChildren: 'team.js',
 *         canLoad: ['canLoadTeamSection']
 *       }
 *     ])
 *   ],
 *   providers: [
 *     {
 *       provide: 'canLoadTeamSection',
 *       useValue: (route: Route) => true
 *     }
 *   ]
 * })
 * ```
 *
 * @stable
 */
export interface CanLoad { canLoad(route: Route): Observable<boolean>|Promise<boolean>|boolean; }
