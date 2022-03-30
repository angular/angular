import {Component} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';

/** @title Checkboxes with reactive forms */
@Component({
  selector: 'checkbox-reactive-forms-example',
  templateUrl: 'checkbox-reactive-forms-example.html',
  styleUrls: ['checkbox-reactive-forms-example.css'],
})
export class CheckboxReactiveFormsExample {
  toppings: UntypedFormGroup;

  constructor(fb: UntypedFormBuilder) {
    this.toppings = fb.group({
      pepperoni: false,
      extracheese: false,
      mushroom: false,
    });
  }
}
