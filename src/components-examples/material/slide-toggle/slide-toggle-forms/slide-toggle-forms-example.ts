import {Component} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';

/**
 * @title Slide-toggle with forms
 */
@Component({
  selector: 'slide-toggle-forms-example',
  templateUrl: './slide-toggle-forms-example.html',
  styleUrls: ['./slide-toggle-forms-example.css'],
})
export class SlideToggleFormsExample {
  isChecked = true;
  formGroup: UntypedFormGroup;

  constructor(formBuilder: UntypedFormBuilder) {
    this.formGroup = formBuilder.group({
      enableWifi: '',
      acceptTerms: ['', Validators.requiredTrue],
    });
  }

  onFormSubmit() {
    alert(JSON.stringify(this.formGroup.value, null, 2));
  }
}
