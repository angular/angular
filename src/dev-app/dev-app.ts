/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {RouterModule} from '@angular/router';
import {DevAppLayout} from './dev-app/dev-app-layout';

/** Root component for the dev-app demos. */
@Component({
  selector: 'dev-app',
  template: '<dev-app-layout><router-outlet></router-outlet></dev-app-layout>',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [DevAppLayout, RouterModule],
})
export class DevApp {}
