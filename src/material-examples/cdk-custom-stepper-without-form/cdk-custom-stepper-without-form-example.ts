import {Component, QueryList, ChangeDetectorRef} from '@angular/core';
import {CdkStepper, CdkStep} from '@angular/cdk/stepper';
import {Directionality} from '@angular/cdk/bidi';

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
  providers: [{ provide: CdkStepper, useExisting: CustomStepper }],
})
export class CustomStepper extends CdkStepper {
  /** Whether the validity of previous steps should be checked or not */
  linear: boolean;

  /** The index of the selected step. */
  selectedIndex: number;

  /** The list of step components that the stepper is holding. */
  steps: QueryList<CdkStep>;

  constructor(dir: Directionality, changeDetectorRef: ChangeDetectorRef) {
    super(dir, changeDetectorRef);
  }

  onClick(index: number): void {
    this.selectedIndex = index;
  }
}
