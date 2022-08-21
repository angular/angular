/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule} from '@angular/material/legacy-select';
import {MatLegacyTooltipModule} from '@angular/material/legacy-tooltip';
import {LegacyTooltipAutoHideExample} from './legacy-tooltip-auto-hide/legacy-tooltip-auto-hide-example';
import {LegacyTooltipCustomClassExample} from './legacy-tooltip-custom-class/legacy-tooltip-custom-class-example';
import {LegacyTooltipDelayExample} from './legacy-tooltip-delay/legacy-tooltip-delay-example';
import {LegacyTooltipDisabledExample} from './legacy-tooltip-disabled/legacy-tooltip-disabled-example';
import {LegacyTooltipManualExample} from './legacy-tooltip-manual/legacy-tooltip-manual-example';
import {LegacyTooltipMessageExample} from './legacy-tooltip-message/legacy-tooltip-message-example';
import {LegacyTooltipModifiedDefaultsExample} from './legacy-tooltip-modified-defaults/legacy-tooltip-modified-defaults-example';
import {LegacyTooltipOverviewExample} from './legacy-tooltip-overview/legacy-tooltip-overview-example';
import {LegacyTooltipPositionExample} from './legacy-tooltip-position/legacy-tooltip-position-example';
import {LegacyTooltipPositionAtOriginExample} from './legacy-tooltip-position-at-origin/legacy-tooltip-position-at-origin-example';

export {
  LegacyTooltipAutoHideExample,
  LegacyTooltipCustomClassExample,
  LegacyTooltipDelayExample,
  LegacyTooltipDisabledExample,
  LegacyTooltipManualExample,
  LegacyTooltipMessageExample,
  LegacyTooltipModifiedDefaultsExample,
  LegacyTooltipOverviewExample,
  LegacyTooltipPositionExample,
  LegacyTooltipPositionAtOriginExample,
};

const EXAMPLES = [
  LegacyTooltipAutoHideExample,
  LegacyTooltipCustomClassExample,
  LegacyTooltipDelayExample,
  LegacyTooltipDisabledExample,
  LegacyTooltipManualExample,
  LegacyTooltipMessageExample,
  LegacyTooltipModifiedDefaultsExample,
  LegacyTooltipOverviewExample,
  LegacyTooltipPositionExample,
  LegacyTooltipPositionAtOriginExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatLegacyButtonModule,
    MatLegacyCheckboxModule,
    MatLegacyInputModule,
    MatLegacySelectModule,
    MatLegacyTooltipModule,
    ReactiveFormsModule,
    ScrollingModule, // Required for the auto-scrolling example
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class LegacyTooltipExamplesModule {}
