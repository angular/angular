/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';

/**
 * @title Basic tooltip
 */
@Component({
  selector: 'legacy-tooltip-position-at-origin-example',
  templateUrl: 'legacy-tooltip-position-at-origin-example.html',
  styleUrls: ['legacy-tooltip-position-at-origin-example.css'],
})
export class LegacyTooltipPositionAtOriginExample {
  enabled = new FormControl(false);
}
