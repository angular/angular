/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs';

import {Route} from './config';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';
import {UrlSegment, UrlTree} from './url_tree';


/**
 * @description
 *
 * Interface that a class can implement to be a guard deciding if a route can be activated.
 * If all guards return `true`, navigation continues. If any guard returns `false`,
 * navigation is cancelled. If any guard returns a `UrlTree`, the current navigation
 * is cancelled and a new navigation begins to the `UrlTree` returned from the guard.
 *
 * The following example implements a `CanActivate` function that checks whether the
 * current user has permission to activate the requested route.
 *
 * ```
 * class UserToken {}
 * class Permissions {
 *   canActivate(user: UserToken, id: string): boolean {
 *     return true;
 *   }
 * }
 *
 * @Injectable()
 * class CanActivateTeam implements CanActivate {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canActivate(
 *     route: ActivatedRouteSnapshot,
 *     state: RouterStateSnapshot
 *   ): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {
 *     return this.permissions.canActivate(this.currentUser, route.params.id);
 *   }
 * }
 * ```
 *
 * Here, the defined guard function is provided as part of the `Route` object
 * in the router configuration:
 *
 * ```
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamComponent,
 *         canActivate: [CanActivateTeam]
 *       }
 *     ])
 *   ],
 *   providers: [CanActivateTeam, UserToken, Permissions]
 * })
 * class AppModule {}
 * ```
 *
 * You can alternatively provide an in-line function with the `canActivate` signature:
 *
 * ```
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamComponent,
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
 * class AppModule {}
 * ```
 *
 * @publicApi
 */
export interface CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
      Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;
}

export type CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;

/**
 * @description
 *
 * Interface that a class can implement to be a guard deciding if a child route can be activated.
 * If all guards return `true`, navigation continues. If any guard returns `false`,
 * navigation is cancelled. If any guard returns a `UrlTree`, current navigation
 * is cancelled and a new navigation begins to the `UrlTree` returned from the guard.
 *
 * The following example implements a `CanActivateChild` function that checks whether the
 * current user has permission to activate the requested child route.
 *
 * ```
 * class UserToken {}
 * class Permissions {
 *   canActivate(user: UserToken, id: string): boolean {
 *     return true;
 *   }
 * }
 *
 * @Injectable()
 * class CanActivateTeam implements CanActivateChild {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canActivateChild(
 *     route: ActivatedRouteSnapshot,
 *     state: RouterStateSnapshot
 *   ): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {
 *     return this.permissions.canActivate(this.currentUser, route.params.id);
 *   }
 * }
 * ```
 *
 * Here, the defined guard function is provided as part of the `Route` object
 * in the router configuration:
 *
 * ```
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'root',
 *         canActivateChild: [CanActivateTeam],
 *         children: [
 *           {
 *              path: 'team/:id',
 *              component: TeamComponent
 *           }
 *         ]
 *       }
 *     ])
 *   ],
 *   providers: [CanActivateTeam, UserToken, Permissions]
 * })
 * class AppModule {}
 * ```
 *
 * You can alternatively provide an in-line function with the `canActivateChild` signature:
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
 *             component: TeamComponent
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
 * class AppModule {}
 * ```
 *
 * @publicApi
 */
export interface CanActivateChild {
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot):
      Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;
}

export type CanActivateChildFn = (childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;

/**
 * @description
 *
 * Interface that a class can implement to be a guard deciding if a route can be deactivated.
 * If all guards return `true`, navigation continues. If any guard returns `false`,
 * navigation is cancelled. If any guard returns a `UrlTree`, current navigation
 * is cancelled and a new navigation begins to the `UrlTree` returned from the guard.
 *
 * The following example implements a `CanDeactivate` function that checks whether the
 * current user has permission to deactivate the requested route.
 *
 * ```
 * class UserToken {}
 * class Permissions {
 *   canDeactivate(user: UserToken, id: string): boolean {
 *     return true;
 *   }
 * }
 * ```
 *
 * Here, the defined guard function is provided as part of the `Route` object
 * in the router configuration:
 *
 * ```
 *
 * @Injectable()
 * class CanDeactivateTeam implements CanDeactivate<TeamComponent> {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canDeactivate(
 *     component: TeamComponent,
 *     currentRoute: ActivatedRouteSnapshot,
 *     currentState: RouterStateSnapshot,
 *     nextState: RouterStateSnapshot
 *   ): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {
 *     return this.permissions.canDeactivate(this.currentUser, route.params.id);
 *   }
 * }
 *
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamComponent,
 *         canDeactivate: [CanDeactivateTeam]
 *       }
 *     ])
 *   ],
 *   providers: [CanDeactivateTeam, UserToken, Permissions]
 * })
 * class AppModule {}
 * ```
 *
 * You can alternatively provide an in-line function with the `canDeactivate` signature:
 *
 * ```
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamComponent,
 *         canDeactivate: ['canDeactivateTeam']
 *       }
 *     ])
 *   ],
 *   providers: [
 *     {
 *       provide: 'canDeactivateTeam',
 *       useValue: (component: TeamComponent, currentRoute: ActivatedRouteSnapshot, currentState:
 * RouterStateSnapshot, nextState: RouterStateSnapshot) => true
 *     }
 *   ]
 * })
 * class AppModule {}
 * ```
 *
 * @publicApi
 */
export interface CanDeactivate<T> {
  canDeactivate(
      component: T, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot,
      nextState?: RouterStateSnapshot): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean
      |UrlTree;
}

export type CanDeactivateFn<T> =
    (component: T, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot,
     nextState?: RouterStateSnapshot) =>
        Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;

/**
 * @description
 *
 * Interface that classes can implement to be a data provider.
 * A data provider class can be used with the router to resolve data during navigation.
 * The interface defines a `resolve()` method that is invoked when the navigation starts.
 * The router waits for the data to be resolved before the route is finally activated.
 *
 * The following example implements a `resolve()` method that retrieves the data
 * needed to activate the requested route.
 *
 * ```
 * @Injectable({ providedIn: 'root' })
 * export class HeroResolver implements Resolve<Hero> {
 *   constructor(private service: HeroService) {}
 *
 *   resolve(
 *     route: ActivatedRouteSnapshot,
 *     state: RouterStateSnapshot
 *   ): Observable<any>|Promise<any>|any {
 *     return this.service.getHero(route.paramMap.get('id'));
 *   }
 * }
 * ```
 *
 * Here, the defined `resolve()` function is provided as part of the `Route` object
 * in the router configuration:
 *
 * ```

 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'detail/:id',
 *         component: HeroDetailComponent,
 *         resolve: {
 *           hero: HeroResolver
 *         }
 *       }
 *     ])
 *   ],
 *   exports: [RouterModule]
 * })
 * export class AppRoutingModule {}
 * ```
 *
 * You can alternatively provide an in-line function with the `resolve()` signature:
 *
 * ```
 * export const myHero: Hero = {
 *   // ...
 * }
 *
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'detail/:id',
 *         component: HeroComponent,
 *         resolve: {
 *           hero: 'heroResolver'
 *         }
 *       }
 *     ])
 *   ],
 *   providers: [
 *     {
 *       provide: 'heroResolver',
 *       useValue: (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => myHero
 *     }
 *   ]
 * })
 * export class AppModule {}
 * ```
 *
 * @usageNotes
 *
 * When both guard and resolvers are specified, the resolvers are not executed until
 * all guards have run and succeeded.
 * For example, consider the following route configuration:
 *
 * ```
 * {
 *  path: 'base'
 *  canActivate: [BaseGuard],
 *  resolve: {data: BaseDataResolver}
 *  children: [
 *   {
 *     path: 'child',
 *     guards: [ChildGuard],
 *     component: ChildComponent,
 *     resolve: {childData: ChildDataResolver}
 *    }
 *  ]
 * }
 * ```
 * The order of execution is: BaseGuard, ChildGuard, BaseDataResolver, ChildDataResolver.
 *
 * @publicApi
 */
export interface Resolve<T> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<T>|Promise<T>|T;
}


/**
 * @description
 *
 * Interface that a class can implement to be a guard deciding if children can be loaded.
 * If all guards return `true`, navigation continues. If any guard returns `false`,
 * navigation is cancelled. If any guard returns a `UrlTree`, current navigation
 * is cancelled and a new navigation starts to the `UrlTree` returned from the guard.
 *
 * The following example implements a `CanLoad` function that decides whether the
 * current user has permission to load requested child routes.
 *
 *
 * ```
 * class UserToken {}
 * class Permissions {
 *   canLoadChildren(user: UserToken, id: string, segments: UrlSegment[]): boolean {
 *     return true;
 *   }
 * }
 *
 * @Injectable()
 * class CanLoadTeamSection implements CanLoad {
 *   constructor(private permissions: Permissions, private currentUser: UserToken) {}
 *
 *   canLoad(route: Route, segments: UrlSegment[]): Observable<boolean>|Promise<boolean>|boolean {
 *     return this.permissions.canLoadChildren(this.currentUser, route, segments);
 *   }
 * }
 * ```
 *
 * Here, the defined guard function is provided as part of the `Route` object
 * in the router configuration:
 *
 * ```
 *
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamComponent,
 *         loadChildren: 'team.js',
 *         canLoad: [CanLoadTeamSection]
 *       }
 *     ])
 *   ],
 *   providers: [CanLoadTeamSection, UserToken, Permissions]
 * })
 * class AppModule {}
 * ```
 *
 * You can alternatively provide an in-line function with the `canLoad` signature:
 *
 * ```
 * @NgModule({
 *   imports: [
 *     RouterModule.forRoot([
 *       {
 *         path: 'team/:id',
 *         component: TeamComponent,
 *         loadChildren: 'team.js',
 *         canLoad: ['canLoadTeamSection']
 *       }
 *     ])
 *   ],
 *   providers: [
 *     {
 *       provide: 'canLoadTeamSection',
 *       useValue: (route: Route, segments: UrlSegment[]) => true
 *     }
 *   ]
 * })
 * class AppModule {}
 * ```
 *
 * @publicApi
 */
export interface CanLoad {
  canLoad(route: Route, segments: UrlSegment[]):
      Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;
}

export type CanLoadFn = (route: Route, segments: UrlSegment[]) =>
    Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree;
