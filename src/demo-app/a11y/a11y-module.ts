import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ACCESSIBILITY_DEMO_ROUTES} from './routes';
import {DemoMaterialModule} from '../demo-material-module';
import {AccessibilityDemo, AccessibilityHome} from './a11y';
import {AutocompleteAccessibilityDemo} from './autocomplete/autocomplete-a11y';
import {ButtonAccessibilityDemo} from './button/button-a11y';
import {ButtonToggleAccessibilityDemo} from './button-toggle/button-toggle-a11y';
import {CheckboxAccessibilityDemo} from './checkbox/checkbox-a11y';
import {ChipsAccessibilityDemo} from './chips/chips-a11y';
import {GridListAccessibilityDemo} from './grid-list/grid-list-a11y';
import {RadioAccessibilityDemo} from './radio/radio-a11y';
import {DatepickerAccessibilityDemo} from './datepicker/datepicker-a11y';
import {IconAccessibilityDemo} from './icon/icon-a11y';
import {InputAccessibilityDemo} from './input/input-a11y';
import {ProgressSpinnerAccessibilityDemo} from './progress-spinner/progress-spinner-a11y';
import {SliderAccessibilityDemo} from './slider/slider-a11y';


@NgModule({
  imports: [
    RouterModule.forChild(ACCESSIBILITY_DEMO_ROUTES)
  ],
  exports: [
    RouterModule
  ]
})
export class AccessibilityRoutingModule {}

@NgModule({
  imports: [
    AccessibilityRoutingModule,
    CommonModule,
    DemoMaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AccessibilityDemo,
    AccessibilityHome,
    AutocompleteAccessibilityDemo,
    ButtonAccessibilityDemo,
    ButtonToggleAccessibilityDemo,
    CheckboxAccessibilityDemo,
    ChipsAccessibilityDemo,
    DatepickerAccessibilityDemo,
    GridListAccessibilityDemo,
    IconAccessibilityDemo,
    InputAccessibilityDemo,
    ProgressSpinnerAccessibilityDemo,
    RadioAccessibilityDemo,
    SliderAccessibilityDemo,
  ]
})
export class AccessibilityDemoModule {}
