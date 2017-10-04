import {Component} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

/** @title Form field with placeholder */
@Component({
  selector: 'form-field-placeholder-example',
  templateUrl: 'form-field-placeholder-example.html',
  styleUrls: ['form-field-placeholder-example.css']
})
export class FormFieldPlaceholderExample {
  options: FormGroup;

  constructor(fb: FormBuilder) {
    this.options = fb.group({
      hideRequired: false,
      floatPlaceholder: 'auto',
    });
  }
}
