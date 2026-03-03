/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  CanActivateFn,
  RouterModule,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
  Resolve,
  ResolveFn,
  UrlSegment,
} from '@angular/router';

import {
  RoutesAuxComponent,
  RoutesHomeComponent,
  RoutesOneComponent,
  RoutesTwoComponent,
  Service1,
  Service2,
  Service3,
  Service4,
} from './routes.component';

export const resolverFn: ResolveFn<any> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return {data: 'Resolved Data from resolverFn'};
};

export const activateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return true;
};

export const customMatcher = (url: UrlSegment[]) => {
  if (url.length === 1 && url[0].path === 'custom-matcher') {
    return {consumed: url};
  }
  return null;
};

export function customRerunLogic() {
  return true;
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'home',
        component: RoutesHomeComponent,
        title: 'Home',
        providers: [Service1, Service2],
        canActivate: [activateGuard],
      },
      {path: 'component-aux', component: RoutesAuxComponent, outlet: 'sidebar'},
      {path: 'route-one', component: RoutesOneComponent, providers: [Service1]},
      {path: 'route-two', component: RoutesTwoComponent, providers: [Service2]},
      {path: 'route-params/:id', component: RoutesHomeComponent, title: 'Route Parmas'},
      {path: 'route-query-params', component: RoutesHomeComponent},
      {
        path: 'route-standalone',
        providers: [Service1, Service2, Service3, Service4],
        loadComponent: () => import('./routes.component').then((x) => x.RoutesStandaloneComponent),
      },
      {
        matcher: customMatcher,
        component: RoutesHomeComponent,
      },
      {
        path: 'route-run-guards-and-resolvers',
        component: RoutesHomeComponent,
        canActivate: [activateGuard],
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'route-run-guards-and-resolvers-function',
        component: RoutesHomeComponent,
        runGuardsAndResolvers: customRerunLogic,
      },
      {
        path: 'route-data',
        component: RoutesHomeComponent,
        data: {
          message: 'Hello from route!!',
          nested: {
            foo: 'bar',
            baz: {
              qux: 42,
              quux: [3, 1, 4],
            },
          },
        },
      },
      {
        path: 'route-resolver',
        component: RoutesHomeComponent,
        resolve: {
          resolvedData: resolverFn,
        },
      },
    ]),
  ],
  declarations: [RoutesHomeComponent],
  exports: [RoutesHomeComponent],
})
export class RoutesModule {}
