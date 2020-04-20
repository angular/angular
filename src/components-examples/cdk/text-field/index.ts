import {TextFieldModule} from '@angular/cdk/text-field';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {
  TextFieldAutofillDirectiveExample
} from './text-field-autofill-directive/text-field-autofill-directive-example';
import {
  TextFieldAutofillMonitorExample
} from './text-field-autofill-monitor/text-field-autofill-monitor-example';
import {
  TextFieldAutosizeTextareaExample
} from './text-field-autosize-textarea/text-field-autosize-textarea-example';

export {
  TextFieldAutofillDirectiveExample,
  TextFieldAutofillMonitorExample,
  TextFieldAutosizeTextareaExample,
};

const EXAMPLES = [
  TextFieldAutofillDirectiveExample,
  TextFieldAutofillMonitorExample,
  TextFieldAutosizeTextareaExample,
];

@NgModule({
  imports: [
    CommonModule,
    TextFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkTextFieldExamplesModule {
}
