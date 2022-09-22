/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({
  selector: 'progress-spinner-e2e',
  templateUrl: 'progress-spinner-e2e.html',
})
export class ProgressSpinnerE2e {
  value = 65;
  diameter = 37;
  strokeWidth = 6;
}
