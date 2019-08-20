import {CdkStepperModule} from '@angular/cdk/stepper';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  CdkCustomStepperWithoutFormExample,
  CustomStepper
} from './cdk-custom-stepper-without-form/cdk-custom-stepper-without-form-example';

const EXAMPLES = [
  CdkCustomStepperWithoutFormExample,
  CustomStepper,
];

@NgModule({
  imports: [
    CdkStepperModule,
    CommonModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkStepperExamplesModule {
}
