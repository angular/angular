import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {
  PizzaPartyComponent,
  SnackBarComponentExample,
} from './snack-bar-component/snack-bar-component-example';
import {
  PizzaPartyAnnotatedComponent,
  SnackBarAnnotatedComponentExample,
} from './snack-bar-annotated-component/snack-bar-annotated-component-example';
import {SnackBarOverviewExample} from './snack-bar-overview/snack-bar-overview-example';
import {SnackBarPositionExample} from './snack-bar-position/snack-bar-position-example';
import {SnackBarHarnessExample} from './snack-bar-harness/snack-bar-harness-example';

export {
  SnackBarAnnotatedComponentExample,
  SnackBarComponentExample,
  SnackBarHarnessExample,
  SnackBarOverviewExample,
  SnackBarPositionExample,
  PizzaPartyComponent,
  PizzaPartyAnnotatedComponent,
};

const EXAMPLES = [
  SnackBarComponentExample,
  SnackBarHarnessExample,
  SnackBarOverviewExample,
  SnackBarPositionExample,
  SnackBarAnnotatedComponentExample,
];

@NgModule({
  imports: [FormsModule, MatButtonModule, MatInputModule, MatSelectModule, MatSnackBarModule],
  declarations: [...EXAMPLES, PizzaPartyComponent, PizzaPartyAnnotatedComponent],
  exports: EXAMPLES,
})
export class SnackBarExamplesModule {}
