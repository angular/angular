/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {provideRouter, RouterOutlet} from '@angular/router';

import * as locationExample from './location/ts/module';
import * as ngComponentOutletExample from './ngComponentOutlet/ts/module';
import * as ngIfExample from './ngIf/ts/module';
import * as ngTemplateOutletExample from './ngTemplateOutlet/ts/module';
import * as pipesExample from './pipes/ts/module';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'example-app:not(y)',
  template: '<router-outlet />',
  imports: [RouterOutlet],
})
export class TestsAppComponent {}

bootstrapApplication(TestsAppComponent, {
  providers: [
    provideRouter([
      {path: 'location', component: locationExample.AppComponent},
      {path: 'ngComponentOutlet', component: ngComponentOutletExample.AppComponent},
      {path: 'ngIf', component: ngIfExample.AppComponent},
      {path: 'ngTemplateOutlet', component: ngTemplateOutletExample.AppComponent},
      {path: 'pipes', component: pipesExample.AppComponent},
    ]),
  ],
});
