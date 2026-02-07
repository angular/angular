/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {APP_BASE_HREF} from '@angular/common';
import {Component} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

import {HashLocationComponent} from './hash_location_component';
import {PathLocationComponent} from './path_location_component';

@Component({
  selector: 'example-app',
  template: `<hash-location /><path-location />`,
  imports: [PathLocationComponent, HashLocationComponent],
})
export class AppComponent {}

bootstrapApplication(AppComponent, {
  providers: [{provide: APP_BASE_HREF, useValue: '/'}],
});
