import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatStepperModule} from '@angular/material/stepper';
import {StepperEditableExample} from './stepper-editable/stepper-editable-example';
import {StepperErrorsExample} from './stepper-errors/stepper-errors-example';
import {
  StepperLabelPositionBottomExample
} from './stepper-label-position-bottom/stepper-label-position-bottom-example';
import {StepperOptionalExample} from './stepper-optional/stepper-optional-example';
import {StepperOverviewExample} from './stepper-overview/stepper-overview-example';
import {StepperStatesExample} from './stepper-states/stepper-states-example';
import {StepperVerticalExample} from './stepper-vertical/stepper-vertical-example';
import {StepperHarnessExample} from './stepper-harness/stepper-harness-example';
import {StepperLazyContentExample} from './stepper-lazy-content/stepper-lazy-content-example';
import {StepperResponsiveExample} from './stepper-responsive/stepper-responsive-example';

export {
  StepperEditableExample,
  StepperErrorsExample,
  StepperHarnessExample,
  StepperLabelPositionBottomExample,
  StepperOptionalExample,
  StepperOverviewExample,
  StepperStatesExample,
  StepperVerticalExample,
  StepperLazyContentExample,
  StepperResponsiveExample,
};

const EXAMPLES = [
  StepperEditableExample,
  StepperErrorsExample,
  StepperHarnessExample,
  StepperLabelPositionBottomExample,
  StepperOptionalExample,
  StepperOverviewExample,
  StepperStatesExample,
  StepperVerticalExample,
  StepperLazyContentExample,
  StepperResponsiveExample,
];

@NgModule({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatStepperModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class StepperExamplesModule {
}
