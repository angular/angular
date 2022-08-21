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
 * @title Tooltip that can be disabled
 */
@Component({
  selector: 'legacy-tooltip-disabled-example',
  templateUrl: 'legacy-tooltip-disabled-example.html',
  styleUrls: ['legacy-tooltip-disabled-example.css'],
})
export class LegacyTooltipDisabledExample {
  disabled = new FormControl(false);
}
