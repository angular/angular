import {Component} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';

/** @title Form field theming */
@Component({
  selector: 'form-field-theming-example',
  templateUrl: 'form-field-theming-example.html',
  styleUrls: ['form-field-theming-example.css'],
})
export class FormFieldThemingExample {
  options: UntypedFormGroup;
  colorControl = new UntypedFormControl('primary');
  fontSizeControl = new UntypedFormControl(16, Validators.min(10));

  constructor(fb: UntypedFormBuilder) {
    this.options = fb.group({
      color: this.colorControl,
      fontSize: this.fontSizeControl,
    });
  }

  getFontSize() {
    return Math.max(10, this.fontSizeControl.value);
  }
}
