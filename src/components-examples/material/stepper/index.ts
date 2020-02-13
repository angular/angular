import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
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

export {
  StepperEditableExample,
  StepperErrorsExample,
  StepperLabelPositionBottomExample,
  StepperOptionalExample,
  StepperOverviewExample,
  StepperStatesExample,
  StepperVerticalExample,
};

const EXAMPLES = [
  StepperEditableExample,
  StepperErrorsExample,
  StepperLabelPositionBottomExample,
  StepperOptionalExample,
  StepperOverviewExample,
  StepperStatesExample,
  StepperVerticalExample,
];

@NgModule({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatStepperModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class StepperExamplesModule {
}
