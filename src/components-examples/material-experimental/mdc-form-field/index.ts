import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {
  MdcFormFieldCustomControlExample,
  MyTelInput,
} from './mdc-form-field-custom-control/form-field-custom-control-example';

export {MdcFormFieldCustomControlExample, MyTelInput};

const EXAMPLES = [MdcFormFieldCustomControlExample];

@NgModule({
  imports: [CommonModule, MatFormFieldModule, MatIconModule, ReactiveFormsModule],
  declarations: [...EXAMPLES, MyTelInput],
  exports: [...EXAMPLES, MyTelInput],
})
export class MdcFormFieldExamplesModule {}
