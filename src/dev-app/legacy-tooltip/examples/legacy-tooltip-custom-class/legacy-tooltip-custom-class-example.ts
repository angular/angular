/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ViewEncapsulation} from '@angular/core';

/**
 * @title Tooltip that can have a custom class applied.
 */
@Component({
  selector: 'legacy-tooltip-custom-class-example',
  templateUrl: 'legacy-tooltip-custom-class-example.html',
  styleUrls: ['legacy-tooltip-custom-class-example.css'],
  // Need to remove view encapsulation so that the custom tooltip style defined in
  // `tooltip-custom-class-example.css` will not be scoped to this component's view.
  encapsulation: ViewEncapsulation.None,
})
export class LegacyTooltipCustomClassExample {}
