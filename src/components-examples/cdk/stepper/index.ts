import {CdkStepperModule} from '@angular/cdk/stepper';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
  CdkCustomStepperWithoutFormExample,
  CustomStepper
} from './cdk-custom-stepper-without-form/cdk-custom-stepper-without-form-example';
import {
    CdkLinearStepperWithFormExample,
    CustomLinearStepper
} from './cdk-linear-stepper-with-form/cdk-linear-stepper-with-form-example';
import {ReactiveFormsModule} from '@angular/forms';

export {
  CdkCustomStepperWithoutFormExample,
  CustomStepper,
  CdkLinearStepperWithFormExample,
  CustomLinearStepper
};

const EXAMPLES = [
  CdkCustomStepperWithoutFormExample,
  CustomStepper,
  CdkLinearStepperWithFormExample,
  CustomLinearStepper
];

@NgModule({
    imports: [
        CdkStepperModule,
        CommonModule,
        ReactiveFormsModule,
    ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CdkStepperExamplesModule {
}
