/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationConfig} from '@angular/core';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';
import {ApplicationEnvironment, ApplicationOperations} from 'ng-devtools';

import {DemoApplicationEnvironment} from '../demo-application-environment';
import {DemoApplicationOperations} from '../demo-application-operations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter([
      {
        path: '',
        loadChildren: () =>
          import('./devtools-app/devtools-app.routes').then((m) => m.DEVTOOL_ROUTES),
        pathMatch: 'full',
      },
      {
        path: 'demo-app',
        loadChildren: () => import('./demo-app/demo-app.routes').then((m) => m.DEMO_ROUTES),
      },
    ]),
    {
      provide: ApplicationOperations,
      useClass: DemoApplicationOperations,
    },
    {
      provide: ApplicationEnvironment,
      useClass: DemoApplicationEnvironment,
    },
  ],
};
