/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {NgModule} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {provideRouter, RouterLink, RouterOutlet} from '@angular/router';
import {AppTodoComponent} from './app-todo.component';
let AppModule = class AppModule {};
AppModule = __decorate(
  [
    NgModule({
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
    }),
  ],
  AppModule,
);
export {AppModule};
//# sourceMappingURL=app.module.js.map
