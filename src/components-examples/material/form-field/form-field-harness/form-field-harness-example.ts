import {Component} from '@angular/core';
import {UntypedFormControl, Validators} from '@angular/forms';

/**
 * @title Testing with MatFormFieldHarness
 */
@Component({
  selector: 'form-field-harness-example',
  templateUrl: 'form-field-harness-example.html',
})
export class FormFieldHarnessExample {
  requiredControl = new UntypedFormControl('Initial value', [Validators.required]);
}
