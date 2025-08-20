/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationConfig,
  provideZonelessChangeDetection,
  provideAppInitializer,
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {
  ApplicationEnvironment,
  ApplicationOperations,
  provideSettings,
} from '../../projects/ng-devtools';

import {DemoApplicationEnvironment} from '../demo-application-environment';
import {DemoApplicationOperations} from '../demo-application-operations';
import {serializeTransferState} from './transfer-state';
import {provideHttpClient, ɵwithHttpTransferCache} from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
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
    // We simulate a transfer state created by the server-side rendering.
    provideAppInitializer(async () => serializeTransferState()),
    provideSettings(),
  ],
};
