import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {CardFancyExample} from './card-fancy/card-fancy-example';
import {CardOverviewExample} from './card-overview/card-overview-example';
import {CardHarnessExample} from './card-harness/card-harness-example';

export {
  CardFancyExample,
  CardOverviewExample,
  CardHarnessExample,
};

const EXAMPLES = [
  CardFancyExample,
  CardOverviewExample,
  CardHarnessExample,
];

@NgModule({
  imports: [
    MatButtonModule,
    MatCardModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class CardExamplesModule {
}
