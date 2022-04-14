import {Component} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';

/**
 * @title Stepper label bottom position
 */
@Component({
  selector: 'stepper-label-position-bottom-example',
  templateUrl: 'stepper-label-position-bottom-example.html',
  styleUrls: ['stepper-label-position-bottom-example.css'],
})
export class StepperLabelPositionBottomExample {
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });

  constructor(private _formBuilder: FormBuilder) {}
}
