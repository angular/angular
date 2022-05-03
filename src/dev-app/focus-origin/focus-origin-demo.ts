/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {A11yModule, FocusMonitor} from '@angular/cdk/a11y';

@Component({
  selector: 'focus-origin-demo',
  templateUrl: 'focus-origin-demo.html',
  styleUrls: ['focus-origin-demo.css'],
  standalone: true,
  imports: [A11yModule],
})
export class FocusOriginDemo {
  constructor(public fom: FocusMonitor) {}
}
