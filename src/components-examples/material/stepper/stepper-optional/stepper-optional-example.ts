import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';

/**
 * @title Stepper with optional steps
 */
@Component({
  selector: 'stepper-optional-example',
  templateUrl: 'stepper-optional-example.html',
  styleUrls: ['stepper-optional-example.css'],
})
export class StepperOptionalExample implements OnInit {
  firstFormGroup: UntypedFormGroup;
  secondFormGroup: UntypedFormGroup;
  isOptional = false;

  constructor(private _formBuilder: UntypedFormBuilder) {}

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: '',
    });
  }
}
