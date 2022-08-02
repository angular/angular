import {Component} from '@angular/core';
import {NonNullableFormBuilder, Validators} from '@angular/forms';
import {ThemePalette} from '@angular/material/core';

/** @title Form field theming */
@Component({
  selector: 'form-field-theming-example',
  templateUrl: 'form-field-theming-example.html',
  styleUrls: ['form-field-theming-example.css'],
})
export class FormFieldThemingExample {
  options = this._formBuilder.group({
    color: this._formBuilder.control('primary' as ThemePalette),
    fontSize: this._formBuilder.control(16, Validators.min(10)),
  });

  constructor(private _formBuilder: NonNullableFormBuilder) {}

  getFontSize() {
    return Math.max(10, this.options.value.fontSize || 0);
  }
}
