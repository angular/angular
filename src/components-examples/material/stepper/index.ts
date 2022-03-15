import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatStepperModule} from '@angular/material/stepper';
import {StepperEditableExample} from './stepper-editable/stepper-editable-example';
import {StepperErrorsExample} from './stepper-errors/stepper-errors-example';
import {StepperLabelPositionBottomExample} from './stepper-label-position-bottom/stepper-label-position-bottom-example';
import {StepperOptionalExample} from './stepper-optional/stepper-optional-example';
import {StepperOverviewExample} from './stepper-overview/stepper-overview-example';
import {StepperStatesExample} from './stepper-states/stepper-states-example';
import {StepperVerticalExample} from './stepper-vertical/stepper-vertical-example';
import {StepperHarnessExample} from './stepper-harness/stepper-harness-example';
import {StepperIntlExample} from './stepper-intl/stepper-intl-example';
import {StepperLazyContentExample} from './stepper-lazy-content/stepper-lazy-content-example';
import {StepperResponsiveExample} from './stepper-responsive/stepper-responsive-example';
import {StepperHeaderPositionExample} from './stepper-header-position/stepper-header-position-example';
import {StepperAnimationsExample} from './stepper-animations/stepper-animations-example';

export {
  StepperEditableExample,
  StepperErrorsExample,
  StepperHarnessExample,
  StepperIntlExample,
  StepperLabelPositionBottomExample,
  StepperOptionalExample,
  StepperOverviewExample,
  StepperStatesExample,
  StepperVerticalExample,
  StepperLazyContentExample,
  StepperResponsiveExample,
  StepperHeaderPositionExample,
  StepperAnimationsExample,
};

const EXAMPLES = [
  StepperEditableExample,
  StepperErrorsExample,
  StepperHarnessExample,
  StepperIntlExample,
  StepperLabelPositionBottomExample,
  StepperOptionalExample,
  StepperOverviewExample,
  StepperStatesExample,
  StepperVerticalExample,
  StepperLazyContentExample,
  StepperResponsiveExample,
  StepperHeaderPositionExample,
  StepperAnimationsExample,
];

@NgModule({
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatStepperModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class StepperExamplesModule {}
