/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import * as locationExample from './location/ts/module.js';
import * as ngComponentOutletExample from './ngComponentOutlet/ts/module.js';
import * as ngIfExample from './ngIf/ts/module.js';
import * as ngTemplateOutletExample from './ngTemplateOutlet/ts/module.js';
import * as pipesExample from './pipes/ts/module.js';

@Component({selector: 'example-app', template: '<router-outlet></router-outlet>'})
export class TestsAppComponent {
}

@NgModule({
  imports: [
    locationExample.AppModule, ngComponentOutletExample.AppModule, ngIfExample.AppModule,
    ngTemplateOutletExample.AppModule, pipesExample.AppModule,

    // Router configuration so that the individual e2e tests can load their
    // app components.
    RouterModule.forRoot([
      {path: 'location', component: locationExample.AppComponent},
      {path: 'ngComponentOutlet', component: ngComponentOutletExample.AppComponent},
      {path: 'ngIf', component: ngIfExample.AppComponent},
      {path: 'ngTemplateOutlet', component: ngTemplateOutletExample.AppComponent},
      {path: 'pipes', component: pipesExample.AppComponent},
    ])
  ],
  declarations: [TestsAppComponent],
  bootstrap: [TestsAppComponent]
})
export class TestsAppModule {
}
