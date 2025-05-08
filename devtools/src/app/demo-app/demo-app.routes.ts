/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injector, provideEnvironmentInitializer} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {Routes} from '@angular/router';
import {initializeMessageBus} from '../../../projects/ng-devtools-backend';

import {ZoneUnawareIFrameMessageBus} from '../../zone-unaware-iframe-message-bus';

import {DemoAppComponent} from './demo-app.component';
import {ZippyComponent} from './zippy.component';

export const DEMO_ROUTES: Routes = [
  {
    path: '',
    component: DemoAppComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./todo/app.module').then((m) => m.AppModule),
      },
    ],
    providers: [
      provideEnvironmentInitializer(() => {
        const el = createCustomElement(ZippyComponent, {injector: inject(Injector)});
        customElements.define('app-zippy', el as any);
      }),
    ],
  },
];

initializeMessageBus(
  new ZoneUnawareIFrameMessageBus(
    'angular-devtools-backend',
    'angular-devtools',
    () => window.parent,
  ),
);
