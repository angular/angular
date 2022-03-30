import {Component} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';

interface Food {
  value: string;
  viewValue: string;
}

interface Car {
  value: string;
  viewValue: string;
}

/**
 * @title Select in a reactive form
 */
@Component({
  selector: 'select-reactive-form-example',
  templateUrl: 'select-reactive-form-example.html',
})
export class SelectReactiveFormExample {
  form: UntypedFormGroup;
  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
  ];
  cars: Car[] = [
    {value: 'volvo', viewValue: 'Volvo'},
    {value: 'saab', viewValue: 'Saab'},
    {value: 'mercedes', viewValue: 'Mercedes'},
  ];
  foodControl = new UntypedFormControl(this.foods[2].value);
  carControl = new UntypedFormControl(this.cars[1].value);

  constructor() {
    this.form = new UntypedFormGroup({
      food: this.foodControl,
      car: this.carControl,
    });
  }
}
