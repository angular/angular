import {Component} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';

/** @title Form field theming */
@Component({
  selector: 'form-field-theming-example',
  templateUrl: 'form-field-theming-example.html',
  styleUrls: ['form-field-theming-example.css'],
})
export class FormFieldThemingExample {
  colorControl = new FormControl('primary');
  fontSizeControl = new FormControl(16, Validators.min(10));
  options = this._formBuilder.group({
    color: this.colorControl,
    fontSize: this.fontSizeControl,
  });

  constructor(private _formBuilder: FormBuilder) {}

  getFontSize() {
    return Math.max(10, this.fontSizeControl.value || 0);
  }
}
