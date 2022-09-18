import {Component} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';

/**
 * @title Stepper header position
 */
@Component({
  selector: 'stepper-header-position-example',
  templateUrl: 'stepper-header-position-example.html',
})
export class StepperHeaderPositionExample {
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });

  constructor(private _formBuilder: FormBuilder) {}
}
