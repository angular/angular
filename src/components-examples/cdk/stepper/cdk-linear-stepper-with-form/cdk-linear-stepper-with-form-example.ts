import {Component} from '@angular/core';
import {CdkStepper} from '@angular/cdk/stepper';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

/** @title A custom CDK linear stepper with forms */
@Component({
  selector: 'cdk-linear-stepper-with-form-example',
  templateUrl: './cdk-linear-stepper-with-form-example.html',
  styleUrls: ['./cdk-linear-stepper-with-form-example.css']
})
export class CdkLinearStepperWithFormExample {
  isLinear = true;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  constructor(private readonly _formBuilder: FormBuilder) {
      this.firstFormGroup = this._formBuilder.group({
          firstControl: ['', Validators.required]
      });
      this.secondFormGroup = this._formBuilder.group({
          secondControl: ['', Validators.required]
      });
  }

  toggleLinearity() {
      this.isLinear = !this.isLinear;
  }
}

/** Custom CDK linear stepper component */
@Component({
  selector: 'example-custom-linear-stepper',
  templateUrl: './example-custom-linear-stepper.html',
  styleUrls: ['./example-custom-linear-stepper.css'],
  providers: [{provide: CdkStepper, useExisting: CustomLinearStepper}]
})
export class CustomLinearStepper extends CdkStepper {
  selectStepByIndex(index: number): void {
    this.selectedIndex = index;
  }
}
