import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {
  PizzaPartyComponent,
  SnackBarComponentExample
} from './snack-bar-component/snack-bar-component-example';
import {SnackBarOverviewExample} from './snack-bar-overview/snack-bar-overview-example';
import {SnackBarPositionExample} from './snack-bar-position/snack-bar-position-example';

export {
  SnackBarComponentExample,
  SnackBarOverviewExample,
  SnackBarPositionExample,
  PizzaPartyComponent,
};

const EXAMPLES = [
  SnackBarComponentExample,
  SnackBarOverviewExample,
  SnackBarPositionExample,
];

@NgModule({
  imports: [
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  declarations: [...EXAMPLES, PizzaPartyComponent],
  exports: EXAMPLES,
  entryComponents: [PizzaPartyComponent],
})
export class SnackBarExamplesModule {
}
