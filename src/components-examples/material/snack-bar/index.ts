import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule} from '@angular/material/legacy-select';
import {MatLegacySnackBarModule} from '@angular/material/legacy-snack-bar';
import {
  PizzaPartyComponent,
  SnackBarComponentExample,
} from './snack-bar-component/snack-bar-component-example';
import {SnackBarOverviewExample} from './snack-bar-overview/snack-bar-overview-example';
import {SnackBarPositionExample} from './snack-bar-position/snack-bar-position-example';
import {SnackBarHarnessExample} from './snack-bar-harness/snack-bar-harness-example';

export {
  SnackBarComponentExample,
  SnackBarHarnessExample,
  SnackBarOverviewExample,
  SnackBarPositionExample,
  PizzaPartyComponent,
};

const EXAMPLES = [
  SnackBarComponentExample,
  SnackBarHarnessExample,
  SnackBarOverviewExample,
  SnackBarPositionExample,
];

@NgModule({
  imports: [
    FormsModule,
    MatLegacyButtonModule,
    MatLegacyInputModule,
    MatLegacySelectModule,
    MatLegacySnackBarModule,
  ],
  declarations: [...EXAMPLES, PizzaPartyComponent],
  exports: EXAMPLES,
})
export class SnackBarExamplesModule {}
