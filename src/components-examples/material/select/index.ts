import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {SelectCustomTriggerExample} from './select-custom-trigger/select-custom-trigger-example';
import {SelectDisabledExample} from './select-disabled/select-disabled-example';
import {
  SelectErrorStateMatcherExample
} from './select-error-state-matcher/select-error-state-matcher-example';
import {SelectFormExample} from './select-form/select-form-example';
import {SelectHintErrorExample} from './select-hint-error/select-hint-error-example';
import {SelectMultipleExample} from './select-multiple/select-multiple-example';
import {SelectNoRippleExample} from './select-no-ripple/select-no-ripple-example';
import {SelectOptgroupExample} from './select-optgroup/select-optgroup-example';
import {SelectOverviewExample} from './select-overview/select-overview-example';
import {SelectPanelClassExample} from './select-panel-class/select-panel-class-example';
import {SelectResetExample} from './select-reset/select-reset-example';
import {SelectValueBindingExample} from './select-value-binding/select-value-binding-example';
import {SelectReactiveFormExample} from './select-reactive-form/select-reactive-form-example';
import {SelectInitialValueExample} from './select-initial-value/select-initial-value-example';
import {SelectHarnessExample} from './select-harness/select-harness-example';
import {MatFormFieldModule} from '@angular/material/form-field';

export {
  SelectCustomTriggerExample,
  SelectDisabledExample,
  SelectErrorStateMatcherExample,
  SelectFormExample,
  SelectHarnessExample,
  SelectHintErrorExample,
  SelectInitialValueExample,
  SelectMultipleExample,
  SelectNoRippleExample,
  SelectOptgroupExample,
  SelectOverviewExample,
  SelectPanelClassExample,
  SelectReactiveFormExample,
  SelectResetExample,
  SelectValueBindingExample,
};

const EXAMPLES = [
  SelectCustomTriggerExample,
  SelectDisabledExample,
  SelectErrorStateMatcherExample,
  SelectFormExample,
  SelectHarnessExample,
  SelectHintErrorExample,
  SelectInitialValueExample,
  SelectMultipleExample,
  SelectNoRippleExample,
  SelectOptgroupExample,
  SelectOverviewExample,
  SelectPanelClassExample,
  SelectReactiveFormExample,
  SelectResetExample,
  SelectValueBindingExample,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatFormFieldModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class SelectExamplesModule {
}
