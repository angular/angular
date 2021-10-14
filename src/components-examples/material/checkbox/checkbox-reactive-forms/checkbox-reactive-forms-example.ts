import {Component} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

/** @title Checkboxes with reactive forms */
@Component({
  selector: 'checkbox-reactive-forms-example',
  templateUrl: 'checkbox-reactive-forms-example.html',
  styleUrls: ['checkbox-reactive-forms-example.css'],
})
export class CheckboxReactiveFormsExample {
  toppings: FormGroup;

  constructor(fb: FormBuilder) {
    this.toppings = fb.group({
      pepperoni: false,
      extracheese: false,
      mushroom: false,
    });
  }
}
