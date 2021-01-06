import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {InputClearableExample} from './input-clearable/input-clearable-example';
import {
  InputErrorStateMatcherExample
} from './input-error-state-matcher/input-error-state-matcher-example';
import {InputErrorsExample} from './input-errors/input-errors-example';
import {InputFormExample} from './input-form/input-form-example';
import {InputHintExample} from './input-hint/input-hint-example';
import {InputOverviewExample} from './input-overview/input-overview-example';
import {InputPrefixSuffixExample} from './input-prefix-suffix/input-prefix-suffix-example';
import {InputHarnessExample} from './input-harness/input-harness-example';

export {
  InputClearableExample,
  InputErrorStateMatcherExample,
  InputErrorsExample,
  InputFormExample,
  InputHarnessExample,
  InputHintExample,
  InputOverviewExample,
  InputPrefixSuffixExample,
};

const EXAMPLES = [
  InputClearableExample,
  InputErrorStateMatcherExample,
  InputErrorsExample,
  InputFormExample,
  InputHarnessExample,
  InputHintExample,
  InputOverviewExample,
  InputPrefixSuffixExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class InputExamplesModule {
}
