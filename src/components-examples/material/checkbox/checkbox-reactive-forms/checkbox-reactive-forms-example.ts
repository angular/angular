import {Component} from '@angular/core';
import {FormBuilder} from '@angular/forms';

/** @title Checkboxes with reactive forms */
@Component({
  selector: 'checkbox-reactive-forms-example',
  templateUrl: 'checkbox-reactive-forms-example.html',
  styleUrls: ['checkbox-reactive-forms-example.css'],
})
export class CheckboxReactiveFormsExample {
  toppings = this._formBuilder.group({
    pepperoni: false,
    extracheese: false,
    mushroom: false,
  });

  constructor(private _formBuilder: FormBuilder) {}
}
