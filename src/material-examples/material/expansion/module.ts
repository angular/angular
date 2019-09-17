import {NgModule} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
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
    MatDatepickerModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
  ],
  declarations: EXAMPLES,
})
export class ExpansionExamplesModule {
}
