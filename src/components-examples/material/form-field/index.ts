import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';
import {MatSelectModule} from '@angular/material/select';
import {FormFieldAppearanceExample} from './form-field-appearance/form-field-appearance-example';
import {
  FormFieldCustomControlExample,
  MyTelInput,
} from './form-field-custom-control/form-field-custom-control-example';
import {FormFieldErrorExample} from './form-field-error/form-field-error-example';
import {FormFieldHintExample} from './form-field-hint/form-field-hint-example';
import {FormFieldLabelExample} from './form-field-label/form-field-label-example';
import {FormFieldOverviewExample} from './form-field-overview/form-field-overview-example';
import {FormFieldPrefixSuffixExample} from './form-field-prefix-suffix/form-field-prefix-suffix-example';
import {FormFieldThemingExample} from './form-field-theming/form-field-theming-example';
import {FormFieldHarnessExample} from './form-field-harness/form-field-harness-example';

export {
  FormFieldAppearanceExample,
  FormFieldCustomControlExample,
  FormFieldErrorExample,
  FormFieldHarnessExample,
  FormFieldHintExample,
  FormFieldLabelExample,
  FormFieldOverviewExample,
  FormFieldPrefixSuffixExample,
  FormFieldThemingExample,
  MyTelInput,
};

const EXAMPLES = [
  FormFieldAppearanceExample,
  FormFieldCustomControlExample,
  FormFieldErrorExample,
  FormFieldHarnessExample,
  FormFieldHintExample,
  FormFieldLabelExample,
  FormFieldOverviewExample,
  FormFieldPrefixSuffixExample,
  FormFieldThemingExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatLegacyButtonModule,
    MatLegacyCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatLegacyRadioModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  declarations: [...EXAMPLES, MyTelInput],
  exports: [...EXAMPLES, MyTelInput],
})
export class FormFieldExamplesModule {}
