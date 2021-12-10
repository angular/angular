/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {ApplicationEnvironment, ApplicationOperations} from 'ng-devtools';

import {DemoApplicationEnvironment} from '../demo-application-environment';
import {DemoApplicationOperations} from '../demo-application-operations';

import {AppComponent} from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: '',
        loadChildren: () =>
            import('./devtools-app/devtools-app.module').then((m) => m.DevToolsModule),
        pathMatch: 'full',
      },
      {
        path: 'demo-app',
        loadChildren: () => import('./demo-app/demo-app.module').then((m) => m.DemoAppModule),
      },
    ]),
  ],
  providers: [
    {
      provide: ApplicationOperations,
      useClass: DemoApplicationOperations,
    },
    {
      provide: ApplicationEnvironment,
      useClass: DemoApplicationEnvironment,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
