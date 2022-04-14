import {Component} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';

/**
 * @title Testing with MatFormFieldHarness
 */
@Component({
  selector: 'form-field-harness-example',
  templateUrl: 'form-field-harness-example.html',
})
export class FormFieldHarnessExample {
  requiredControl = new FormControl('Initial value', [Validators.required]);
}
