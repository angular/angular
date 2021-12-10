/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {RouterModule} from '@angular/router';
import {initializeMessageBus} from 'ng-devtools-backend';

import {ZoneUnawareIFrameMessageBus} from '../../zone-unaware-iframe-message-bus';

import {DemoAppComponent} from './demo-app.component';
import {HeavyComponent} from './heavy.component';
import {ZippyComponent} from './zippy.component';

@NgModule({
  declarations: [DemoAppComponent, HeavyComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [DemoAppComponent],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: DemoAppComponent,
        children: [
          {
            path: '',
            loadChildren: () => import('./todo/app.module').then((m) => m.AppModule),
          },
        ],
      },
    ]),
  ],
})
export class DemoAppModule {
  constructor(injector: Injector) {
    const el = createCustomElement(ZippyComponent, {injector});
    customElements.define('app-zippy', el as any);
  }
}

initializeMessageBus(new ZoneUnawareIFrameMessageBus(
    'angular-devtools-backend', 'angular-devtools', () => window.parent));
