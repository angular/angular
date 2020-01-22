import {Component} from '@angular/core';
import {CdkStepper} from '@angular/cdk/stepper';

/** @title A custom CDK stepper without a form */
@Component({
  selector: 'cdk-custom-stepper-without-form-example',
  templateUrl: './cdk-custom-stepper-without-form-example.html',
  styleUrls: ['./cdk-custom-stepper-without-form-example.css']
})
export class CdkCustomStepperWithoutFormExample {}

/** Custom CDK stepper component */
@Component({
  selector: 'example-custom-stepper',
  templateUrl: './example-custom-stepper.html',
  styleUrls: ['./example-custom-stepper.css'],
  providers: [{ provide: CdkStepper, useExisting: CustomStepper }]
})
export class CustomStepper extends CdkStepper {
  onClick(index: number): void {
    this.selectedIndex = index;
  }
}
