/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation} from '@angular/core';

/** Root component for the e2e-app demos. */
@Component({
  moduleId: module.id,
  selector: 'e2e-app',
  template: '<e2e-app-layout><router-outlet></router-outlet></e2e-app-layout>',
  encapsulation: ViewEncapsulation.None,
})
export class E2eApp {
}
