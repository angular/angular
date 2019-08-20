import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {TooltipAutoHideExample} from './tooltip-auto-hide/tooltip-auto-hide-example';
import {TooltipCustomClassExample} from './tooltip-custom-class/tooltip-custom-class-example';
import {TooltipDelayExample} from './tooltip-delay/tooltip-delay-example';
import {TooltipDisabledExample} from './tooltip-disabled/tooltip-disabled-example';
import {TooltipManualExample} from './tooltip-manual/tooltip-manual-example';
import {TooltipMessageExample} from './tooltip-message/tooltip-message-example';
import {
  TooltipModifiedDefaultsExample
} from './tooltip-modified-defaults/tooltip-modified-defaults-example';
import {TooltipOverviewExample} from './tooltip-overview/tooltip-overview-example';
import {TooltipPositionExample} from './tooltip-position/tooltip-position-example';

const EXAMPLES = [
  TooltipAutoHideExample,
  TooltipCustomClassExample,
  TooltipDelayExample,
  TooltipDisabledExample,
  TooltipManualExample,
  TooltipMessageExample,
  TooltipModifiedDefaultsExample,
  TooltipOverviewExample,
  TooltipPositionExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class TooltipExamplesModule {
}
