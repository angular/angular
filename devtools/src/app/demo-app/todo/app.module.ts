/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injectable, NgModule, signal} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  provideRouter,
  RouterLink,
  RouterOutlet,
} from '@angular/router';

import {AppTodoComponent} from './app-todo.component';

/**
 * Service to manage the allowGuard state for testing router tree visualization.
 */
@Injectable({providedIn: 'root'})
export class AllowGuardService {
  readonly allowGuard = signal<boolean>(false);

  toggle(): void {
    this.allowGuard.update((value) => !value);
  }
}

export const canMatchGuard: CanActivateFn = () => {
  const allowGuardService = inject(AllowGuardService);
  const allowed = allowGuardService.allowGuard();
  return allowed;
};

@NgModule({
  declarations: [AppTodoComponent],
  imports: [MatDialogModule, RouterLink, RouterOutlet],
  providers: [
    provideRouter([
      {
        path: 'todos',
        component: AppTodoComponent,
        children: [
          {
            path: 'app',
            loadChildren: () => import('./home/home.routes').then((m) => m.HOME_ROUTES),
          },
          {
            path: 'about',
            loadChildren: () =>
              import('./about/about.routes').then((m) => m.PROTECTED_ABOUT_ROUTES),
            title: 'Protected About Route',
            canMatch: [canMatchGuard],
          },
          {
            path: 'about',
            loadChildren: () => import('./about/about.routes').then((m) => m.ABOUT_ROUTES),
          },
          {
            path: 'routes',
            loadChildren: () => import('./routes/routes.module').then((m) => m.RoutesModule),
          },
          {
            path: '**',
            redirectTo: 'app',
          },
        ],
      },
      {
        path: '**',
        redirectTo: 'todos',
      },
    ]),
  ],
  exports: [AppTodoComponent],
  bootstrap: [AppTodoComponent],
})
export class AppModule {}
