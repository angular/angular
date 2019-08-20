import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {CardFancyExample} from './card-fancy/card-fancy-example';
import {CardOverviewExample} from './card-overview/card-overview-example';

const EXAMPLES = [
  CardFancyExample,
  CardOverviewExample,
];

@NgModule({
  imports: [
    MatButtonModule,
    MatCardModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CardExamplesModule {
}
