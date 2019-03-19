/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation} from '@angular/core';

/** Root component for the dev-app demos. */
@Component({
  moduleId: module.id,
  selector: 'dev-app',
  template: '<dev-app-layout><router-outlet></router-outlet></dev-app-layout>',
  encapsulation: ViewEncapsulation.None,
})
export class DevAppComponent {
}
