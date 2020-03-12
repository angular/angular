import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {
  ExpansionExpandCollapseAllExample
} from './expansion-expand-collapse-all/expansion-expand-collapse-all-example';
import {ExpansionOverviewExample} from './expansion-overview/expansion-overview-example';
import {ExpansionStepsExample} from './expansion-steps/expansion-steps-example';

export {
  ExpansionExpandCollapseAllExample,
  ExpansionOverviewExample,
  ExpansionStepsExample,
};

const EXAMPLES = [
  ExpansionExpandCollapseAllExample,
  ExpansionOverviewExample,
  ExpansionStepsExample,
];

@NgModule({
  imports: [
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class ExpansionExamplesModule {
}
