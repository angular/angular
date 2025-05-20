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
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterModule,
  RouterStateSnapshot,
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

export const activateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return true;
};

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
        path: 'route-data',
        component: RoutesHomeComponent,
        data: {
          message: 'Hello from route!!',
        },
      },
    ]),
  ],
  declarations: [RoutesHomeComponent],
  exports: [RoutesHomeComponent],
})
export class RoutesModule {}
