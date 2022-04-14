import {Component} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';

/**
 * @title Stepper with optional steps
 */
@Component({
  selector: 'stepper-optional-example',
  templateUrl: 'stepper-optional-example.html',
  styleUrls: ['stepper-optional-example.css'],
})
export class StepperOptionalExample {
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: '',
  });
  isOptional = false;

  constructor(private _formBuilder: FormBuilder) {}
}
